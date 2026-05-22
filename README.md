# PixelPaintWidget

Figma / FigJam 用のピクセルアートウィジェットです。  
キャンバス上に直接ピクセルを描いて、そのままウィジェットとして表示できます。

FigJamでのレベルデザイン、マップ設計を支援することを目的としています。
カラーパレットの多彩化や、ペイントツールの追加、Unityへのエクスポートなどの追加機能を検討中。

---

## 機能

- **ペイント / 消しゴム** — モードを切り替えてピクセルを塗ったり消したりできます
- **ブラシサイズ** — 1〜8 の範囲でブラシの太さを変更できます
- **カラーパレット** — 6 色のプリセットカラーから選択できます
- **グリッド表示** — グリッドのオン / オフを切り替えられます
- **キャンバスサイズ変更** — 4×4 〜 96×96 の範囲でサイズを変更できます
- **ズーム & パン** — ホイールでズーム、ミドルクリックドラッグでパンができます
- **右クリックでカラーピック** — キャンバス上の色を拾って即座にアクティブカラーにできます
- **エディタウィンドウのリサイズ** — 編集 UI 自体の大きさも変更できます

---

## 使い方

1. Figma / FigJam のキャンバスにウィジェットを配置します
2. ウィジェットをクリック、またはプロパティメニューの **Open editor** を押してエディタを開きます
3. パレットから色を選び、キャンバスに描きます
4. **Apply to Widget** ボタンを押すとウィジェットに反映されます

---

## プロジェクト構造

```
PixelPaintWidget/
├── .github/workflows/ci.yml   # GitHub Actions (CI)
├── shared/                    # Widget / UI 共通の型・ユーティリティ
│   ├── messages.ts
│   └── utils.ts
├── widget-src/                # Figma Widget 本体
│   ├── code.tsx               # エントリポイント
│   ├── constants.ts
│   ├── palette.ts
│   ├── preview.ts
│   ├── utils.ts
│   └── editor-html.ts         # ビルド時に自動生成（git 管理外）
├── ui-src/                    # エディタ UI (iframe)
│   ├── index.html
│   ├── styles.css
│   ├── main.ts
│   └── ...
├── scripts/build.mjs          # UI インライン化 + Widget バンドル
└── dist/code.js               # 最終成果物
```

---

## 開発

```bash
# 依存関係のインストール
npm install

# ビルド
npm run build

# ビルド（ウォッチモード）
npm run watch

# 型チェック
npm run typecheck

# Lint
npm run lint

# フォーマット
npm run format
```

ビルド時に `ui-src/` の TypeScript / CSS がバンドルされ、`widget-src/editor-html.ts` として Widget に埋め込まれます。  
最終成果物は `dist/code.js` に出力されます。Figma でウィジェットを読み込む際は `manifest.json` を指定してください。

---

## CI / Release

`vX.X.X` 形式のタグ（例: `v1.0.0`）を push すると、GitHub Actions で以下を自動実行します（Node.js 22）:

1. **CI** — format / lint / typecheck / build
2. **Release** — CI 成功後に GitHub Release を作成

Release には Figma 読み込み用の ZIP（`manifest.json` + `dist/code.js` を同梱）が添付されます:

- `PixelPaintWidget-vX.X.X.zip`

### リリース手順

```bash
git tag v1.0.0
git push origin v1.0.0
```

タグを push すると CI が走り、成功後に Release が自動作成されます。  
Figma では Release から ZIP をダウンロードし、展開した `manifest.json` を指定してウィジェットを読み込んでください。

---

## 技術スタック

| 項目         | 内容              |
| ------------ | ----------------- |
| 言語         | TypeScript + TSX  |
| バンドラー   | esbuild           |
| Figma API    | Widget API v1.0.0 |
| 対応エディタ | Figma, FigJam     |
