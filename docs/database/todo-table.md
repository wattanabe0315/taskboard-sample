# TODO管理用テーブル設計

## 概要

Issue #19 では、MySQL + Prisma による永続化へ進む前段として、既存の TODO ドメインモデルを基準に `todos` テーブルを設計します。

現時点のアプリケーションでは `domain/todo.ts` の `Todo` 型が TODO データの基準です。DB化後もアプリケーション側の影響を小さくするため、既存フィールドの意味は維持します。

## 対象モデル

既存の `Todo` 型は次のフィールドを持ちます。

| フィールド | TypeScript型 | 説明 |
| --- | --- | --- |
| `id` | `string` | TODOを一意に識別するID |
| `title` | `string` | TODOの本文 |
| `completed` | `boolean` | 完了済みかどうか |
| `priority` | `"low" \| "medium" \| "high"` | TODOの優先度 |
| `createdAt` | `string` | 作成日時 |

DB化に伴う共通カラムとして、更新日時を表す `updated_at` を追加します。

## テーブル定義

テーブル名は `todos` とします。既存アプリケーションの概念名は `Todo` ですが、DB上では複数行を保持するため複数形にします。

| カラム名 | MySQL型 | NULL | デフォルト | 制約 | 対応する既存フィールド |
| --- | --- | --- | --- | --- | --- |
| `id` | `VARCHAR(191)` | 不可 | なし | PRIMARY KEY | `id` |
| `title` | `VARCHAR(100)` | 不可 | なし | なし | `title` |
| `completed` | `BOOLEAN` | 不可 | `false` | なし | `completed` |
| `priority` | `ENUM('low', 'medium', 'high')` | 不可 | `'medium'` | なし | `priority` |
| `created_at` | `DATETIME(3)` | 不可 | `CURRENT_TIMESTAMP(3)` | なし | `createdAt` |
| `updated_at` | `DATETIME(3)` | 不可 | `CURRENT_TIMESTAMP(3)` | `ON UPDATE CURRENT_TIMESTAMP(3)` | 追加 |

## DDL案

```sql
CREATE TABLE todos (
  id VARCHAR(191) NOT NULL,
  title VARCHAR(100) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
);
```

## Prismaモデル案

#20 で Prisma を導入する際は、次のモデルを基準にします。

```prisma
enum TodoPriority {
  low
  medium
  high
}

model Todo {
  id        String       @id @db.VarChar(191)
  title     String       @db.VarChar(100)
  completed Boolean      @default(false)
  priority  TodoPriority @default(medium)
  createdAt DateTime     @default(now()) @map("created_at") @db.DateTime(3)
  updatedAt DateTime     @default(now()) @updatedAt @map("updated_at") @db.DateTime(3)

  @@map("todos")
}
```

## 設計判断

### `id` は文字列を維持する

既存実装では `crypto.randomUUID()` により文字列IDを生成しています。DB化だけで数値IDへ変更すると、UI、ドメインモデル、テスト、将来のAPI境界に影響が広がるため、今回の設計では文字列IDを維持します。

`VARCHAR(191)` は MySQL のインデックス長制約に配慮した保守的な長さです。UUID文字列の保存には十分で、将来 `utf8mb4` を使う場合にも扱いやすいです。

### `title` は `VARCHAR(100)` にする

プロダクト仕様で TODO 本文の最大文字数は100文字と定義されています。DBでも同じ上限にすることで、アプリケーション境界をすり抜けたデータでも仕様外の長さを保存できないようにします。

### `completed` は `BOOLEAN` にする

MySQL の `BOOLEAN` は実体として `TINYINT(1)` ですが、Prisma の `Boolean` と自然に対応します。既存の `completed: boolean` とも一致します。

### `priority` は `ENUM` にする

優先度は現時点で `low`、`medium`、`high` の3値に固定されています。DB側でも `ENUM` にして、仕様外の値が保存されないようにします。

将来、優先度をユーザー定義にする場合は、別テーブル化または `VARCHAR` + マスタ管理への変更を検討します。

### 日時は `DATETIME(3)` にする

Prisma の `DateTime` と対応しやすく、ミリ秒精度を保持するため `DATETIME(3)` を使います。`TIMESTAMP` はタイムゾーン変換や扱える範囲の制約があるため、アプリケーション側で日時を扱う前提では `DATETIME(3)` の方が素直です。

## インデックス

MVPでは検索、並び替え、フィルタリングを扱わないため、追加インデックスは定義しません。

今後、作成順表示をDBクエリで安定させる場合は、次のインデックスを検討します。

```sql
CREATE INDEX idx_todos_created_at ON todos (created_at);
```

ただし、現時点ではデータ量と要件が小さいため、初期設計には含めません。

## 未対応範囲

この設計では、次の内容は扱いません。

- MySQLコンテナの追加
- Prismaのインストール
- `schema.prisma` の追加
- マイグレーションファイルの作成
- アプリケーションのCRUD処理のPrisma移行

これらは #20 と #21 で対応します。
