import esbuild from 'esbuild'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const watch = process.argv.includes('--watch')
const uiOnly = process.argv.includes('--ui-only')

async function buildUi() {
  const js = await esbuild.build({
    entryPoints: [path.join(rootDir, 'ui-src/main.ts')],
    bundle: true,
    write: false,
    target: 'es2017',
    format: 'iife',
    logLevel: 'silent',
  })

  const css = await fs.readFile(path.join(rootDir, 'ui-src/styles.css'), 'utf8')
  const htmlTemplate = await fs.readFile(
    path.join(rootDir, 'ui-src/index.html'),
    'utf8',
  )

  const html = htmlTemplate
    .replace('/* INJECT_CSS */', css)
    .replace('/* INJECT_JS */', js.outputFiles[0].text)

  await fs.writeFile(
    path.join(rootDir, 'widget-src/editor-html.ts'),
    `// AUTO-GENERATED. Do not edit.\nexport const EDITOR_HTML = ${JSON.stringify(html)}\n`,
  )
}

async function buildWidget() {
  await esbuild.build({
    entryPoints: [path.join(rootDir, 'widget-src/code.tsx')],
    bundle: true,
    outfile: path.join(rootDir, 'dist/code.js'),
    target: 'es2017',
    logLevel: 'info',
  })
}

async function buildAll() {
  await fs.mkdir(path.join(rootDir, 'dist'), { recursive: true })
  await buildUi()
  await buildWidget()
}

if (watch) {
  const ctx = await esbuild.context({
    entryPoints: [path.join(rootDir, 'widget-src/code.tsx')],
    bundle: true,
    outfile: path.join(rootDir, 'dist/code.js'),
    target: 'es2017',
    logLevel: 'info',
  })

  let building = false
  let pending = false

  async function rebuild() {
    if (building) {
      pending = true
      return
    }
    building = true
    try {
      await buildUi()
      await ctx.rebuild()
    } finally {
      building = false
      if (pending) {
        pending = false
        void rebuild()
      }
    }
  }

  await rebuild()
  await ctx.watch()

  const { watch: watchFiles } = await import('node:fs')
  for (const dir of ['ui-src', 'shared']) {
    watchFiles(
      path.join(rootDir, dir),
      { recursive: true },
      () => void rebuild(),
    )
  }

  console.log('Watching for changes...')
} else if (uiOnly) {
  await buildUi()
} else {
  await buildAll()
}
