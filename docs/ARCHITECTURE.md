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
│   ├── actions.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── TodoBoard.tsx
├── domain/
│   ├── todo.test.ts
│   └── todo.ts
├── lib/
│   └── prisma.ts
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── public/
├── repositories/
│   ├── todoRepository.test.ts
│   └── todoRepository.ts
├── scripts/
│   └── verify.sh
├── AGENTS.md
├── compose.yaml
├── docs/
│   └── ARCHITECTURE.md
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 主要ファイルの責務

### `app/layout.tsx`

アプリケーション全体のHTML構造、共通フォント、グローバルCSSの読み込みを担当します。
全ページに影響するため、ページ固有のUIやビジネスロジックは置かないでください。

### `app/page.tsx`

ルートページのUIを担当します。
TODO一覧を `repositories/todoRepository.ts` から取得し、`components/TodoBoard.tsx` へ渡します。
ページ固有のルーティング境界として扱い、TODOのバリデーションやDB更新処理は直接置かないでください。

### `app/actions.ts`

TODOの追加、完了切り替え、削除を行う Server Actions を定義します。
入力値の検証は `domain/todo.ts`、DBアクセスは `repositories/todoRepository.ts` に委譲します。

### `app/globals.css`

Tailwind CSS の読み込みと、アプリケーション全体のCSS変数・基本スタイルを定義します。
コンポーネント固有の複雑な見た目を無制限に集約しないでください。

### `scripts/verify.sh`

`npm run verify` から呼び出される検証ハーネスです。
現在は ESLint、TypeScript 型チェック、Vitest を順に実行します。

### `components/TodoBoard.tsx`

TODOの追加、優先度選択、一覧表示、完了切り替え、削除のUIを担当します。
ユーザー操作と画面表示を中心にし、TODO作成時のバリデーションやDB更新は Server Actions に委譲します。

### `domain/todo.ts`

TODOの型、優先度、作成時のバリデーション、デフォルト優先度を担当します。
React に依存しない形にし、Vitest で単体テストできる状態を保ってください。

### `domain/todo.test.ts`

TODO作成と優先度に関する単体テストを担当します。
ユーザーから見える振る舞いにつながるビジネスルールを確認します。

### `lib/prisma.ts`

アプリケーション内で共有する `PrismaClient` を初期化します。
開発時のホットリロードで接続が増えすぎないよう、非本番環境では `globalThis` にインスタンスを保持します。

### `repositories/todoRepository.ts`

TODOの取得、作成、完了切り替え、削除を Prisma 経由で行うデータアクセス層です。
DBレコードの `Date` とアプリケーション側の ISO 文字列の変換もここで扱います。

### `repositories/todoRepository.test.ts`

Prisma delegate をモックし、DBなしで TODO repository の呼び出し内容と変換処理を確認します。

### `prisma/schema.prisma`

TODO永続化用の Prisma schema を定義します。
MySQL の `todos` テーブルは `docs/database/todo-table.md` の設計を基準にします。

### `compose.yaml`

ローカル開発用の MySQL コンテナを定義します。
実際の起動手順は `docs/database/mysql-prisma-local.md` を参照してください。

## 実装レイヤー方針

現時点では `components/` と `domain/` を使用しています。
機能追加により責務が増えた場合も、次の方針で分離してください。

### UIレイヤー

画面表示とユーザー操作を担当します。
React コンポーネントは、表示・入力・イベント通知を中心にし、TODOの状態遷移ルールなどのビジネスロジックを直接抱え込まないでください。

配置:

```text
app/
components/
```

### ドメインレイヤー

TODO、タスク、ステータス、並び順など、アプリケーション固有のルールを担当します。
React やブラウザAPIに依存しない形を優先し、Vitest で単体テストしやすくしてください。

配置:

```text
domain/
```

### データアクセスレイヤー

DBアクセスと永続化データの変換を担当します。
UIや Server Actions から Prisma を直接呼ばず、repository を経由してください。

配置:

```text
lib/
repositories/
prisma/
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

TODOデータは MySQL に保存します。
UIから直接DBやPrismaを呼び出さず、Server Actions と repository を境界にしてください。

ローカル開発環境では Docker Compose の MySQL を使用します。
テストでは Prisma delegate を差し替え、DB接続なしでデータアクセス層の単体テストを行います。

## 検証フロー

通常の検証は次を実行します。

```bash
npm run verify
```

`npm run verify` は `scripts/verify.sh` を通じて次を実行します。

```bash
npm run lint
npm run typecheck
npm run test -- --passWithNoTests
```

現時点では `domain/todo.test.ts` が存在します。
Vitest には互換性維持のため `--passWithNoTests` を付けています。
テストが継続的に追加され、空テスト状態を許容する必要がなくなった場合は、このオプションを外すことを検討してください。

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
