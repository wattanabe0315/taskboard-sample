<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# TaskBoard リポジトリ作業ガイド

## プロジェクト概要

TaskBoard は、Next.js + TypeScript で構築された TODO 管理アプリケーションです。

## 作業開始時

コードを変更する前に、作業内容に関係するドキュメントを確認してください。

- システム構成: `docs/ARCHITECTURE.md` が存在する場合は確認する
- プロダクト仕様: `docs/product/` が存在する場合は確認する
- コーディング規約: `docs/engineering/coding-style.md` が存在する場合は確認する
- テスト方針: `docs/engineering/testing.md` が存在する場合は確認する
- Next.js 関連の変更: 上記の Next.js agent rules に従い、`node_modules/next/dist/docs/` の該当ドキュメントを確認する

既存コードも検索し、同種の実装が存在する場合は既存パターンを優先してください。

## 基本方針

- 変更範囲は可能な限り小さくする
- 要求と無関係なリファクタリングを行わない
- 新しい抽象化を導入する前に既存パターンを確認する
- 必要性がない限り依存パッケージを追加しない
- ビジネスロジックを React コンポーネントへ直接書かない
- ユーザーから見える振る舞いを変更した場合はテストを追加または更新する

## ディレクトリ

- `app/`: Next.js のルーティングとページ
- `public/`: 静的アセット
- `scripts/verify.sh`: `npm run verify` から呼び出される検証ハーネス
- `docs/`: プロジェクトの仕様と設計資料。存在する場合は参照する
- `tests/`: テスト。存在しない場合は、必要に応じて作成する

## 検証ハーネス

- 一括検証は `npm run verify` を使う
- 互換用の `npm run check` は `npm run verify` を呼び出す
- `scripts/verify.sh` には、`lint`、`typecheck`、`test` 相当の検証を含める
- `scripts/verify.sh` に検証処理を追加する場合は、各処理の目的を日本語コメントで記載する
- `scripts/verify.sh` では、各コマンドの実行前に何を実行するかログへ表示する
- 現在はテストファイルが存在しない状態でも一括検証を成功させるため、Vitest 実行時に `--passWithNoTests` を使う
- テストファイルを追加した後に `--passWithNoTests` を外す場合は、ローカル検証やCIへの影響を確認する

## 検証コマンド

- `npm run lint`: ESLint による静的解析
- `npm run typecheck`: `tsc --noEmit` による型チェック
- `npm run test`: Vitest の一括実行
- `npm run test:watch`: Vitest の watch 実行
- `npm run verify`: lint、typecheck、test をまとめて実行

## 作業フロー

### 機能追加

機能追加では、既存の UI、状態管理、ドメインロジックの配置を確認してから実装してください。
必要に応じてテストとドキュメントも追加または更新してください。

### バグ修正

バグ修正では、まず再現条件を確認し、原因となる最小範囲を特定してください。
修正後は、同じ問題が再発しないことを確認できるテストを追加または更新してください。

### 依存関係の変更

依存パッケージを追加・更新した場合は、`package.json` と `package-lock.json` の差分を確認してください。
npm の install script を許可する場合は、`allowScripts` に対象パッケージを記録し、PRに理由を記載してください。

## 完了条件

タスクは、次の条件をすべて満たした場合のみ完了です。

1. 要求された振る舞いが実装されている
2. 必要なテストが追加または更新されている
3. 関連するドキュメントが必要に応じて更新されている
4. `npm run verify` が成功する
5. 最終差分に無関係な変更が含まれていない

`npm run verify` を実行できない場合は、理由と残るリスクを明確にしてください。

## PR作成時

PR本文には、次を記載してください。

- 実装内容
- 変更した主要ファイル
- 追加または更新したテスト
- 動作確認
- 期待する結果
- 実行結果
- 残っている問題があればその内容

## 完了報告

作業終了時には次を簡潔に報告してください。

- 実装内容
- 変更した主要ファイル
- 追加または更新したテスト
- 実行した検証
- 残っている問題があればその内容
