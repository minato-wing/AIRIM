# プロジェクト概要

## キーファイル

- AGENTS.md: このファイル
- requirements.md: 要件定義
- README: リポジトリ概要

## 実装方針

- フロントエンド・バックエンドは requirements.md に記載の技術選定の通り
- モジュラーモノリスとしてこのリポジトリ内で完結させる
- ./backend にサーバーサイド、 ./frontend にフロントエンドのソースコードを実装し、
  各々 next や typescript の設定ファイルに加え Dockerfile を用意する
- サーバーサイドの処理をフロントエンドの処理は極力分離して実装する
- Github Actions でユニットテストを実行できるようにする