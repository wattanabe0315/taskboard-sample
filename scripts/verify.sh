#!/bin/sh
set -eu

# ESLintでコードスタイルと静的解析の問題を検出する。
echo "Running lint: npm run lint"
npm run lint

# ファイルを出力せずにTypeScriptの型チェックを実行する。
echo "Running typecheck: npm run typecheck"
npm run typecheck

# テストファイルがまだ存在しない状態でも成功扱いでVitestを実行する。
echo "Running test: npm run test -- --passWithNoTests"
npm run test -- --passWithNoTests
