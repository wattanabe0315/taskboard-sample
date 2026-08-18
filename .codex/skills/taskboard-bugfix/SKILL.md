---
name: taskboard-bugfix
description: TaskBoardリポジトリでTODOアプリの不具合を調査・修正するときに使うSkill。再現条件の確認、期待する結果と実際の結果の整理、既存コード調査、原因特定、回帰テスト追加、修正、npm run verify、コミット、Pull Request作成までを、AGENTS.md、ARCHITECTURE.md、docs/product/todo-app.md、docs/engineering/coding-style.md、docs/engineering/github-workflow.mdに沿って進める。
---

# TaskBoard Bugfix

TaskBoard のバグ修正では、まず再現条件と期待する結果を明確にし、原因となる最小範囲を特定してから修正する。ユーザーから見える不具合を直す場合は、同じ問題が再発しないことを確認できる回帰テストを追加または更新し、原則として `npm run verify` を実行する。

## 作業開始

1. `git status --short --branch` で現在のブランチと未コミット変更を確認する。
2. 既存ブランチが作業内容に合わない場合は、`main` を最新化してから `fix/<内容>` のブランチを作る。
3. ユーザーの未コミット変更がある場合は、勝手に戻さず、今回のバグ修正に必要な差分だけを扱う。
4. バグ修正は原則として Issue 作成を検討する。小さく明確で1PRに収まる場合だけ省略してよい。

ブランチ作成の基本形:

```bash
git switch main
git fetch origin
git merge --ff-only origin/main
git switch -c fix/<bug-name>
```

Issueに対応する場合は、可能であれば Issue 番号を含める。

```text
fix/18-prevent-empty-todo
```

## 事象整理

修正前に、分かっている範囲で次を整理する。

- 再現手順
- 期待する結果
- 実際の結果
- 発生条件、発生しない条件
- 影響範囲
- 既存仕様と矛盾しているか

情報が不足している場合は、不明点を明示する。合理的に再現できる範囲がある場合は、仮定を置いて調査を進める。

Issueを作成する場合の本文例:

```md
## 概要
-

## 再現手順
1.
2.
3.

## 期待する結果
-

## 実際の結果
-

## 対応内容
-

## 完了条件
-
```

## 仕様確認

コード変更前に、少なくとも次を確認する。

- `AGENTS.md`: 作業ルール、検証ハーネス、PR作成時の記載事項
- `ARCHITECTURE.md`: 現在の構成、主要ファイルの責務、レイヤー分離方針
- `docs/README.md`: 参照すべきドキュメントの一覧
- `docs/product/todo-app.md`: TODOアプリのMVP機能仕様、バリデーション、テスト観点
- `docs/engineering/coding-style.md`: TypeScript、React、配置、命名、テスト方針
- `docs/engineering/github-workflow.md`: ブランチ、コミット、Issue、PRの運用ルール

Next.js 関連の実装を変更する場合は、`AGENTS.md` の Next.js agent rules に従い、`node_modules/next/dist/docs/` の該当ドキュメントも確認する。

## 既存コード調査

`rg` を優先して、不具合に関係する実装、型、テスト、ドキュメントを検索する。

```bash
rg "todo|Todo|TODO" app components domain tests docs
rg "validate|validation|completed|delete|remove|add" app components domain tests
rg "describe|it\\(" .
```

調査では次を判断する。

- 実際の挙動が仕様とずれているのか、仕様が不足しているのか
- 原因が UI、状態管理、ドメインロジック、検証ハーネス、設定のどこにあるか
- 既存の同種テストがあるか
- 修正範囲をどこまで小さくできるか
- 関連する仕様ドキュメントの更新が必要か

## 原因特定

原因を特定するときは、推測だけで修正しない。可能な限り、再現手順、既存コード、テスト、ログ、差分で確認する。

優先する進め方:

1. 再現手順をローカルで確認する。
2. 期待する結果と実際の結果の差を1つに絞る。
3. 関係するコードパスを追う。
4. 最小の failing test を追加できる場所を決める。
5. 修正前にテストが失敗することを確認する。

修正前の失敗確認を省略する場合は、理由をPR本文に書く。

## 修正方針

- 変更範囲はバグ修正に必要な最小限にする。
- 要求と無関係なリファクタリング、整形、依存追加を混ぜない。
- TODOの状態遷移、バリデーション、保存境界などのビジネスルールは、可能な限り UI から分離する。
- React コンポーネントは表示、入力、イベント通知を中心にする。
- `any` や型エラー回避目的の型アサーションは避ける。
- 依存パッケージ追加で解決しようとする前に、既存実装で直せるか確認する。

仕様側の判断が必要な場合は、実装で無理に決めず、未決事項として整理する。

## 回帰テスト

ユーザーから見える不具合を修正した場合は、同じ問題が再発しないことを確認できるテストを追加または更新する。

TODO MVPで優先して確認する観点:

- 空のTODOを追加できない
- 前後の空白を削除してTODOを追加できる
- TODOを追加すると一覧に表示される
- 追加直後のTODOは未完了である
- TODOを完了済みにできる
- 完了済みTODOを未完了に戻せる
- TODOを削除できる
- 100文字を超えるTODOを追加できない

テスト配置は、同種の既存パターンを優先する。パターンがない場合は、ドメインロジックの単体テストは `domain/` 近く、横断的なテストや fixture は `tests/` を検討する。

## 検証

コード、設定、依存関係、検証ハーネスを変更した場合は、原則として次を実行する。

```bash
npm run verify
```

`npm run verify` は `verify.sh` 経由で lint、typecheck、test をまとめて実行する。失敗した場合は、原因を確認して修正する。実行できない場合は、理由と残るリスクをPR本文と完了報告に明記する。

必要に応じて個別実行する。

```bash
npm run lint
npm run typecheck
npm run test
```

## 差分確認

PR前に次を確認する。

```bash
git status --short --branch
git diff --stat
git diff
```

確認観点:

- 要求された不具合修正以外の変更が含まれていないか
- 原因に対して修正範囲が過剰でないか
- 回帰テストが不具合の再発防止に対応しているか
- `package.json` と `package-lock.json` に意図しない差分がないか
- 仕様や運用ルールに影響する場合、関連ドキュメントを更新しているか

## コミット

コミットメッセージは Conventional Commits を参考にし、description は極力日本語で書く。

```text
fix(todo): 空のTODOを追加できないように修正
fix(todo): 完了切り替え後の表示を更新
test(todo): TODO削除の回帰テストを追加
docs: バリデーション仕様を更新
```

ユーザーの未コミット変更を勝手に含めない。コミット前に `git diff --staged` でステージ済み差分を確認する。

## Pull Request

PR本文は日本語で記載し、次の項目を含める。

```md
## 実装内容
-

## 関連Issue
- Fixes #<番号>

## 変更した主要ファイル
-

## 追加または更新したテスト
-

## 動作確認
-

## 期待する結果
-

## 実行結果
-

## 残っている問題
-
```

バグ修正PRでは、可能な限り再現手順、修正前の結果、修正後の結果が対応するように書く。Issueを自動で閉じない場合は `Related to #<番号>` を使う。関連Issueがない場合は、作成しなかった理由を簡潔に書く。

## 完了報告

作業終了時は、次を簡潔に報告する。

- 修正内容
- 原因
- 変更した主要ファイル
- 追加または更新したテスト
- 実行した検証
- 残っている問題
