---
name: taskboard-feature
description: TaskBoardリポジトリでTODOアプリのユーザー向け機能を追加・変更するときに使うSkill。仕様確認、既存コード調査、実装、テスト追加、npm run verify、コミット、Pull Request作成までを、AGENTS.md、docs/ARCHITECTURE.md、docs/product/todo-app.md、docs/engineering/coding-style.md、docs/engineering/github-workflow.mdに沿って進める。
---

# TaskBoard Feature

TaskBoard の機能追加では、既存ドキュメントと既存コードを確認してから、要求された振る舞いだけを小さく実装する。ユーザーから見える振る舞いを変えた場合は、テストを追加または更新し、原則として `npm run verify` を実行する。

## 作業開始

1. `git status --short --branch` で現在のブランチと未コミット変更を確認する。
2. 既存ブランチが作業内容に合わない場合は、`main` を最新化してから `feat/<内容>` のブランチを作る。
3. ユーザーの未コミット変更がある場合は、勝手に戻さず、今回の作業に必要な差分だけを扱う。
4. 機能追加が大きい、仕様検討が必要、または複数PRに分かれそうな場合は、着手前に Issue 作成を検討する。

ブランチ作成の基本形:

```bash
git switch main
git fetch origin
git merge --ff-only origin/main
git switch -c feat/<feature-name>
```

## 仕様確認

コード変更前に、少なくとも次を確認する。

- `AGENTS.md`: 作業ルール、検証ハーネス、PR作成時の記載事項
- `docs/ARCHITECTURE.md`: 現在の構成、主要ファイルの責務、レイヤー分離方針
- `docs/README.md`: 参照すべきドキュメントの一覧
- `docs/product/todo-app.md`: TODOアプリのMVP機能仕様とテスト観点
- `docs/engineering/coding-style.md`: TypeScript、React、配置、命名、テスト方針
- `docs/engineering/github-workflow.md`: ブランチ、コミット、Issue、PRの運用ルール

Next.js 関連の実装を変更する場合は、`AGENTS.md` の Next.js agent rules に従い、`node_modules/next/dist/docs/` の該当ドキュメントも確認する。

## 既存コード調査

`rg` を優先して、同種の実装、型、テスト、スタイルを検索する。

```bash
rg "todo|Todo|TODO" app components domain tests docs
rg "describe|it\\(" .
```

調査では次を判断する。

- 実装先は `app/`、`components/`、`domain/`、`tests/` のどこが適切か
- ビジネスロジックを React コンポーネントから分離すべきか
- 既存の命名、props、状態管理、Tailwind class のパターンがあるか
- 追加する振る舞いに対応するテスト観点が `docs/product/todo-app.md` にあるか

## 実装方針

- 変更範囲は要求に必要な最小限にする。
- 要求と無関係なリファクタリング、整形、依存追加を混ぜない。
- TODOの状態遷移、バリデーション、保存境界などのビジネスルールは、可能な限り UI から分離する。
- React コンポーネントは表示、入力、イベント通知を中心にする。
- `any` や型エラー回避目的の型アサーションは避ける。
- 依存パッケージは必要性が明確な場合のみ追加する。

TODO MVPの代表的な仕様:

- 空文字、空白だけのTODOは追加できない。
- 前後の空白は削除して追加する。
- TODO本文は100文字以内にする。
- 追加直後のTODOは未完了にする。
- 完了済みTODOは未完了と見た目で区別できる。
- MVPでは削除確認ダイアログ、ログイン、サーバー保存、期限、タグ、検索、編集は扱わない。

## テスト追加

ユーザーから見える振る舞いを追加または変更した場合は、Vitest のテストを追加または更新する。

優先してテストする観点:

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

`npm run verify` は `scripts/verify.sh` 経由で lint、typecheck、test をまとめて実行する。失敗した場合は、原因を確認して修正する。実行できない場合は、理由と残るリスクをPR本文と完了報告に明記する。

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

- 要求と無関係な変更が含まれていないか
- `package.json` と `package-lock.json` に意図しない差分がないか
- 依存追加がある場合、追加理由と install script の扱いを説明できるか
- ドキュメント更新が必要な仕様変更を反映しているか

## コミット

コミットメッセージは Conventional Commits を参考にし、description は極力日本語で書く。

```text
feat(todo): TODO追加フォームを追加
fix(todo): 空のTODOを追加できないように修正
test(todo): TODO追加のテストを追加
docs: TODOアプリ仕様を更新
```

ユーザーの未コミット変更を勝手に含めない。コミット前に `git diff --staged` でステージ済み差分を確認する。

## Pull Request

PR本文は日本語で記載し、次の項目を含める。

```md
## 実装内容
-

## 関連Issue
- Closes #<番号>

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

Issueを自動で閉じない場合は `Related to #<番号>` を使う。関連Issueがない場合は、作成しなかった理由を簡潔に書く。

## 完了報告

作業終了時は、次を簡潔に報告する。

- 実装内容
- 変更した主要ファイル
- 追加または更新したテスト
- 実行した検証
- 残っている問題
