# MySQL + Prisma ローカル環境

## 概要

Issue #20 では、MySQL コンテナと Prisma マイグレーション基盤を追加します。

DBテーブル設計は `docs/database/todo-table.md` を基準にします。

## 前提

- Docker が起動していること
- npm 依存関係がインストール済みであること

## 環境変数

ローカルでは `.env.example` を参考に `.env` を作成します。

```bash
cp .env.example .env
```

`.env` は機密情報を含み得るため、Git管理対象外です。

```env
MYSQL_DATABASE="taskboard"
MYSQL_USER="taskboard"
MYSQL_PASSWORD="taskboard_password"
MYSQL_ROOT_PASSWORD="root_password"
DATABASE_URL="mysql://taskboard:taskboard_password@localhost:3306/taskboard"
```

## MySQL 起動

```bash
docker compose up -d mysql
```

MySQL の設定は `compose.yaml` に定義しています。各値は `.env` で上書きできます。

| 項目 | 値 |
| --- | --- |
| Database | `taskboard` |
| User | `taskboard` |
| Password | `taskboard_password` |
| Host | `localhost` |
| Port | `3306` |
| Volume | `taskboard_mysql_data` |

## Prisma schema 検証

```bash
npx prisma validate
```

Prisma Client を生成する場合は次の npm script を使います。

```bash
npm run db:generate
```

## マイグレーション

初期マイグレーションは `prisma/migrations/20260831132500_init_todos/` に配置しています。

ローカルDBへ反映する場合は次を実行します。

```bash
npm run db:migrate
```

内部では次の Prisma コマンドを実行します。

```bash
prisma migrate dev
```

## Prisma Client

Prisma Client は `@prisma/client` として生成します。

```prisma
generator client {
  provider = "prisma-client-js"
}
```
