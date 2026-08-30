---
name: taskboard-review
description: TaskBoardリポジトリでPull Request、ブランチ差分、コミット差分、または作業中の変更をレビューするときに使うSkill。AGENTS.md、docs/ARCHITECTURE.md、docs/product/todo-app.md、docs/engineering/coding-style.md、docs/engineering/github-workflow.mdに沿って、バグ、仕様逸脱、テスト不足、過剰な変更、PR説明と検証結果の不整合を優先して確認する。
---

# TaskBoard Review

TaskBoard のレビューでは、変更の良し悪しを広く論じるより、ユーザー影響、仕様逸脱、保守性、テスト不足、運用ルール違反を優先して確認する。指摘は、ファイルと行、理由、改善案をセットで簡潔に書く。

## このSkillの役割

このSkillは、作成済みPRまたはレビュー対象差分の確認と、必要なレビューコメントの作成までを担当する。レビュー指摘を受けた後の修正、テスト、コミット、push は `taskboard-review-fix` の対象にする。

PRレビューの基本の流れ:

1. PR差分取得
2. 仕様確認
3. コードレビュー
4. テスト確認
5. PRへレビューコメント

## 作業開始

1. `git status --short --branch` で現在のブランチと未コミット変更を確認する。
2. レビュー対象を確認する。PR番号、ブランチ名、コミット範囲、作業ツリー差分のどれかを特定する。
3. レビュー対象外のユーザー変更を勝手に戻さない。
4. レビューでは原則としてコードを編集しない。ユーザーから修正まで求められた場合だけ編集する。

PRレビューの場合の確認例:

```bash
git fetch origin
git diff --stat origin/main...HEAD
git diff origin/main...HEAD
```

作業ツリーのレビューの場合:

```bash
git status --short --branch
git diff --stat
git diff
```

## 参照ドキュメント

レビュー前に、変更内容に応じて次を確認する。

- `AGENTS.md`: 作業ルール、検証ハーネス、PR作成時の記載事項
- `docs/ARCHITECTURE.md`: 現在の構成、主要ファイルの責務、レイヤー分離方針
- `docs/README.md`: 参照すべきドキュメントの一覧
- `docs/product/todo-app.md`: TODOアプリの仕様、バリデーション、テスト観点
- `docs/engineering/coding-style.md`: TypeScript、React、配置、命名、テスト方針
- `docs/engineering/github-workflow.md`: ブランチ、コミット、Issue、PRの運用ルール

Next.js 関連の変更をレビューする場合は、`AGENTS.md` の Next.js agent rules に従い、`node_modules/next/dist/docs/` の該当ドキュメントも確認する。

## レビュー観点

優先度の高い順に確認する。

1. ユーザーから見える不具合、仕様逸脱、データ消失につながる問題
2. セキュリティ、入力検証、外部入力、秘密情報の扱い
3. テスト不足、回帰テスト不足、検証結果の不整合
4. アーキテクチャや責務分離との矛盾
5. 変更範囲の過剰さ、無関係なリファクタリング、依存追加
6. 命名、型、安全でない型アサーション、`any` の使用
7. PR本文、コミット単位、ブランチ名、Issue連携の運用ルール違反

TaskBoardで特に確認する仕様:

- 空文字、空白だけのTODOを追加できない。
- TODO本文は前後の空白を削除して追加する。
- TODO本文は100文字以内にする。
- 新規TODOは未完了で追加される。
- 新規TODOの優先度はデフォルトで `medium` になる。
- 優先度は `low` / `medium` / `high` の3段階だけを扱う。
- TODOは追加、一覧表示、完了切り替え、未完了への戻し、削除ができる。
- MVPではログイン、サーバー保存、期限、タグ、検索、並び替え、フィルタリング、編集は扱わない。

## 差分確認

`rg` を優先して、変更された実装と関連する既存パターンを確認する。

```bash
rg "todo|Todo|TODO|priority|Priority" app components domain tests docs
rg "describe|it\\(" .
```

確認すること:

- 変更ファイルがPR目的と一致しているか
- ドメインロジックが React コンポーネントに寄りすぎていないか
- `domain/` のロジックは React やブラウザAPIに依存していないか
- `components/` は表示、入力、イベント通知に集中しているか
- `docs/product/todo-app.md` と実装が矛盾していないか
- `docs/ARCHITECTURE.md` の責務説明と配置が実装に合っているか
- `package.json` と `package-lock.json` に意図しない差分がないか

## テストと検証

ユーザーから見える振る舞いが変わる場合は、テストが追加または更新されているか確認する。

確認すること:

- 仕様に対応するテストがあるか
- バグ修正では、同じ問題の再発を防ぐ回帰テストがあるか
- `npm run verify` の実行結果がPR本文と一致しているか
- 実行できない検証がある場合、理由と残るリスクが書かれているか
- `scripts/verify.sh` を変更した場合、各処理の目的が日本語コメントで書かれているか

必要に応じてレビュー側でも実行する。

```bash
npm run verify
```

レビューで検証を実行しない場合は、その前提を明示する。

## PR本文とコミット

PR本文、Issue連携、ブランチ、コミットは `docs/engineering/github-workflow.md` に沿っているか確認する。

特に、変更目的とコミット単位が対応しているか、PR本文の期待する結果と実行結果が矛盾していないか、未実行の検証理由が妥当かを確認する。

## 出力形式

レビュー結果は、重大度の高い指摘から先に書く。問題がない場合は、問題が見つからなかったことと残るリスクを明記する。

GitHub上のPRへレビューコメントを投稿する場合は、同じ内容をPR上でも確認できるようにする。指摘が修正作業を必要とする場合は、修正担当の次工程を `taskboard-review-fix` として扱う。

指摘がある場合:

```md
## 指摘

- [重大度] `path/to/file.ts:12`
  問題:
  理由:
  改善案:

## 確認したこと
- 

## 残るリスク
- 
```

指摘がない場合:

```md
指摘事項は見つかりませんでした。

確認したこと:
- 

残るリスク:
- 
```

重大度は必要に応じて `blocker`、`major`、`minor`、`nit` を使う。レビューでは称賛や要約を先に置かず、指摘または「指摘なし」を先に書く。
