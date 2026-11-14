// Lifted from AutomataFramework@ec4fddd9: tests/architecture/rules.ts
// The repo's architecture rules, as one pure function over made-up or real file maps.
// `tests/architecture.test.ts` runs it over `src/`; `rules.test.ts` proves each rule fires on a small made-up map.
// Nothing here reads the file system, so a rule can be tested without one.

/** Feature folders, lowest first. A feature may import only itself, `src/lib/` and features before it in this list. */
export const LAYERS = ['version', 'pick', 'assemble', 'play', 'page'] as const

/** Path from the repo root (with `/`) to the file's text. */
export type SourceFiles = Readonly<Record<string, string>>

export interface Violation {
  readonly file: string
  readonly rule: string
  readonly detail: string
}

const MAX_LINES = 600
/** Where a `node:` import may live: the Node side of the site, which runs in scripts and workflows, never in a page. */
const NODE_PLACES: readonly string[] = ['src/features/pick/', 'src/features/assemble/', 'src/build.ts']
/** Features that only Node uses: the page may not reach them. */
const NODE_FEATURES: ReadonlySet<string> = new Set(['pick', 'assemble'])
/** Features that only a page uses: the Node entry may not reach them. */
const PAGE_FEATURES: ReadonlySet<string> = new Set(['play', 'page'])

interface Source {
  readonly file: string
  readonly text: string
  readonly lines: number
  /** Resolved paths of relative imports; need not exist in the map. */
  readonly local: readonly string[]
  /** The part of `local` that exists at run time: `import type` and `export type` are erased and cannot cycle. */
  readonly runtime: readonly string[]
  /** Bare specifiers (packages, `node:` modules). */
  readonly packages: readonly string[]
}

/** Comments say why and may name the very things a rule forbids, so rules read the code without them. */
function withoutComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(?<![:'"`\w])\/\/.*$/gm, '')
}

const IMPORT_PATTERNS: readonly RegExp[] = [
  /\b(?:import|export)\s[^'";]*?\bfrom\s*['"]([^'"]+)['"]/g,
  /\bimport\s*['"]([^'"]+)['"]/g,
  /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
]

interface Specifier {
  readonly spec: string
  /** `import type ... from` or `export type ... from`: gone after compiling. */
  readonly typeOnly: boolean
}

function specifiers(code: string): Specifier[] {
  const found: Specifier[] = []
  for (const pattern of IMPORT_PATTERNS) {
    for (const m of code.matchAll(pattern)) {
      found.push({ spec: m[1] ?? '', typeOnly: /^(?:import|export)\s+type\b/.test(m[0]) })
    }
  }
  return found
}

/** `from` is a file path; `to` a relative specifier. Gives a normalised path from the repo root. */
function resolve(from: string, to: string): string {
  const parts = from.split('/').slice(0, -1)
  for (const part of to.split('/')) {
    if (part === '.' || part === '') continue
    if (part === '..') parts.pop()
    else parts.push(part)
  }
  return parts.join('/')
}

function read(file: string, text: string): Source {
  const code = withoutComments(text)
  const local: string[] = []
  const runtime: string[] = []
  const packages: string[] = []
  for (const { spec, typeOnly } of specifiers(code)) {
    const path = spec.startsWith('.')
      ? resolve(file, spec)
      : spec.startsWith('#src/')
        ? `src/${spec.slice(5)}`
        : undefined
    if (path === undefined) packages.push(spec)
    else {
      local.push(path)
      if (!typeOnly) runtime.push(path)
    }
  }
  const lines = text.split('\n')
  if (lines[lines.length - 1] === '') lines.pop()
  return { file, text: code, lines: lines.length, local, runtime, packages }
}

/** The feature a path is in, or undefined (`src/features/<name>/...`). */
function featureOf(path: string): string | undefined {
  return /^src\/features\/([^/]+)\//.exec(path)?.[1]
}

/** Strongly connected groups of more than one file, or one file that imports itself. */
function cycles(sources: ReadonlyMap<string, Source>): string[][] {
  // Tarjan's algorithm, iterative enough for a source tree: depth is bounded by the import chain.
  let counter = 0
  const index = new Map<string, number>()
  const low = new Map<string, number>()
  const stack: string[] = []
  const onStack = new Set<string>()
  const groups: string[][] = []
  const visit = (file: string): void => {
    index.set(file, counter)
    low.set(file, counter)
    counter++
    stack.push(file)
    onStack.add(file)
    for (const next of sources.get(file)?.runtime ?? []) {
      if (!sources.has(next)) continue
      if (!index.has(next)) {
        visit(next)
        low.set(file, Math.min(low.get(file) ?? 0, low.get(next) ?? 0))
      } else if (onStack.has(next)) {
        low.set(file, Math.min(low.get(file) ?? 0, index.get(next) ?? 0))
      }
    }
    if (low.get(file) === index.get(file)) {
      const group: string[] = []
      for (let top = stack.pop(); top !== undefined; top = stack.pop()) {
        onStack.delete(top)
        group.push(top)
        if (top === file) break
      }
      if (group.length > 1 || sources.get(file)?.runtime.includes(file)) groups.push(group.sort())
    }
  }
  for (const file of [...sources.keys()].sort()) if (!index.has(file)) visit(file)
  return groups
}

/** Every broken rule, sorted by file then rule, so two runs read the same. An empty list is a clean tree. */
export function checkArchitecture(files: SourceFiles): Violation[] {
  const out: Violation[] = []
  const add = (file: string, rule: string, detail: string): number => out.push({ file, rule, detail })
  const sources = new Map<string, Source>()
  for (const [file, text] of Object.entries(files)) sources.set(file, read(file, text))
  const layerOf = (feature: string): number => (LAYERS as readonly string[]).indexOf(feature)

  for (const source of sources.values()) {
    const { file } = source
    const feature = featureOf(file)

    if (source.lines > MAX_LINES)
      add(file, 'at-most-600-lines', `${source.lines} lines; split the file by job.`)
    if (file.startsWith('src/') && file.endsWith('.test.ts')) {
      add(file, 'no-tests-in-src', 'Tests live in tests/, mirroring src/.')
    }

    if (feature !== undefined && layerOf(feature) < 0) {
      add(file, 'unknown-feature', `"${feature}" is not one of: ${LAYERS.join(', ')}.`)
    }

    for (const target of source.local) {
      const into = featureOf(target)
      if (file.startsWith('src/lib/') && target.startsWith('src/features/')) {
        add(file, 'lib-is-below-features', `lib may not import ${target}.`)
        continue
      }
      if (into === undefined || into === feature) continue
      if (feature !== undefined && layerOf(into) > layerOf(feature)) {
        add(file, 'imports-go-down', `${feature} may not import ${into}, which is above it.`)
      }
      if (target !== `src/features/${into}/${into}.ts`) {
        add(
          file,
          'through-the-entry',
          `Import ${into} through src/features/${into}/${into}.ts, not ${target}.`,
        )
      }
    }

    for (const spec of source.packages) {
      if (spec.startsWith('node:') && !NODE_PLACES.some((place) => file.startsWith(place))) {
        add(file, 'node-stays-in-node', `${spec} is Node's, so it belongs only in ${NODE_PLACES.join(', ')}.`)
      }
    }
  }

  for (const group of cycles(sources))
    add(group[0] ?? '', 'no-cycles', `Import cycle: ${group.join(' -> ')}.`)

  // Features that have files must have their entry beside them.
  const seen = new Set<string>()
  for (const file of sources.keys()) {
    const feature = featureOf(file)
    if (feature === undefined || seen.has(feature)) continue
    seen.add(feature)
    if (!sources.has(`src/features/${feature}/${feature}.ts`)) {
      add(file, 'feature-has-entry', `src/features/${feature}/ needs ${feature}.ts, the feature's entry.`)
    }
  }

  // Walk the imports from each entry: the page must not reach Node's features, and Node's entry no page feature.
  const reach = (entry: string): string[] => {
    const reached = new Set<string>()
    const walk = (file: string): void => {
      for (const target of sources.get(file)?.local ?? []) {
        if (reached.has(target)) continue
        reached.add(target)
        walk(target)
      }
    }
    if (sources.has(entry)) walk(entry)
    return [...reached].sort()
  }
  for (const target of reach('src/index.ts')) {
    const feature = featureOf(target)
    if (feature !== undefined && NODE_FEATURES.has(feature)) {
      add('src/index.ts', 'page-and-node-stay-apart', `${target} needs Node, so the page cannot reach it.`)
    }
  }
  for (const target of reach('src/build.ts')) {
    const feature = featureOf(target)
    if (feature !== undefined && PAGE_FEATURES.has(feature)) {
      add('src/build.ts', 'page-and-node-stay-apart', `${target} needs a page, so Node cannot reach it.`)
    }
  }

  return out.sort((a, b) => (a.file === b.file ? a.rule.localeCompare(b.rule) : a.file.localeCompare(b.file)))
}
