# TaskBoard

TaskBoard は、Next.js + TypeScript で構築する TODO 管理アプリケーションです。

## Getting Started

開発サーバーを起動します。

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認してください。

## Verification

一括検証は次で実行します。

```bash
npm run verify
```

個別に確認する場合は、以下を使用します。

```bash
npm run lint
npm run typecheck
npm run test
```

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md): アーキテクチャ概要
- [AGENTS.md](./AGENTS.md): 作業エージェント向けガイド
- [docs/README.md](./docs/README.md): ドキュメント一覧

## Notes

Next.js に関係する実装を変更する場合は、`AGENTS.md` の Next.js agent rules に従って、該当する `node_modules/next/dist/docs/` のドキュメントを確認してください。
