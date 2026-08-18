# TaskBoard アーキテクチャ

## 概要

TaskBoard は、Next.js + TypeScript で構築する TODO 管理アプリケーションです。
現時点では create-next-app ベースの最小構成に近く、画面実装は `app/` 配下にあります。

このドキュメントでは、現在の構成と、今後機能を追加する際の配置方針を定義します。

## 技術スタック

- Runtime / framework: Next.js
- Language: TypeScript
- UI: React
- Styling: Tailwind CSS
- Lint: ESLint
- Test: Vitest
- Package manager: npm

## 現在のディレクトリ構成

```text
.
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
├── AGENTS.md
├── ARCHITECTURE.md
├── next.config.ts
├── package.json
├── tsconfig.json
└── verify.sh
```

## 主要ファイルの責務

### `app/layout.tsx`

アプリケーション全体のHTML構造、共通フォント、グローバルCSSの読み込みを担当します。
全ページに影響するため、ページ固有のUIやビジネスロジックは置かないでください。

### `app/page.tsx`

ルートページのUIを担当します。
現時点では初期テンプレートに近い内容です。
TODO管理の画面を実装する場合も、状態管理やビジネスルールが大きくなったらコンポーネントやドメイン層へ分離してください。

### `app/globals.css`

Tailwind CSS の読み込みと、アプリケーション全体のCSS変数・基本スタイルを定義します。
コンポーネント固有の複雑な見た目を無制限に集約しないでください。

### `verify.sh`

`npm run verify` から呼び出される検証ハーネスです。
現在は ESLint、TypeScript 型チェック、Vitest を順に実行します。

## 実装レイヤー方針

現時点では `src/`、`components/`、`domain/`、`tests/` は存在しません。
機能追加により責務が増えた場合は、次の方針で分離してください。

### UIレイヤー

画面表示とユーザー操作を担当します。
React コンポーネントは、表示・入力・イベント通知を中心にし、TODOの状態遷移ルールなどのビジネスロジックを直接抱え込まないでください。

想定配置:

```text
app/
components/
```

### ドメインレイヤー

TODO、タスク、ステータス、並び順など、アプリケーション固有のルールを担当します。
React やブラウザAPIに依存しない形を優先し、Vitest で単体テストしやすくしてください。

想定配置:

```text
domain/
```

### テスト

ユーザーから見える振る舞いやドメインロジックを変更した場合は、テストを追加または更新してください。
テストファイルは対象コードの近く、または `tests/` 配下に配置してください。
どちらを選ぶ場合も、同種の既存パターンがあればそれを優先してください。

想定配置:

```text
tests/
```

## データ管理方針

現時点では永続化層はありません。
TODOデータの保存先を追加する場合は、UIから直接ストレージや外部APIを呼び出さず、データアクセスの境界を分けてください。

候補:

- ローカル状態のみ: 小さな試作や一時的なUI検証向け
- ブラウザストレージ: ローカル永続化が必要な場合
- API / DB: 複数端末やユーザー間共有が必要な場合

保存先を導入する場合は、テストで差し替えられるようにインターフェースを小さく保ってください。

## 検証フロー

通常の検証は次を実行します。

```bash
npm run verify
```

`npm run verify` は `verify.sh` を通じて次を実行します。

```bash
npm run lint
npm run typecheck
npm run test -- --passWithNoTests
```

現時点ではテストファイルが存在しないため、Vitest には `--passWithNoTests` を付けています。
テストが追加され、空テスト状態を許容する必要がなくなった場合は、このオプションを外すことを検討してください。

## 依存関係の方針

依存パッケージは必要性が明確な場合のみ追加してください。
追加・更新時は、`package.json` と `package-lock.json` の差分を確認してください。

npm の install script を許可する場合は、`package.json` の `allowScripts` に対象パッケージを記録し、PRに理由を記載してください。

## 変更時の注意

- 変更範囲は要求に必要な最小限にしてください。
- 既存コードを検索し、同種の実装があれば既存パターンを優先してください。
- Next.js に関係する実装を変更する場合は、AGENTS.md の Next.js agent rules に従って該当ドキュメントを確認してください。
- ユーザーから見える振る舞いを変更した場合は、テストを追加または更新してください。
- PRには動作確認、期待する結果、実行結果を記載してください。
