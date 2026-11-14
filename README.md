# Automata Framework: the website

The website for Automata Framework: one page that says what the toolkit is for and what already works, where you press
"Play the first game" and play the first game made with it.

- **The game comes from [AutomataFrameworkExamples](https://github.com/mcthaydt/AutomataFrameworkExamples).** This
  repo never imports it. Its `site` workflow picks the newest commit of the game whose checks all passed, builds the
  game with the game's own `pnpm build`, and shows it on the page, in a frame.
- **Every number, name and stamp on the page is the game's own.** The build reads the game's files (`automata.toml`,
  its level, its recorded play, its licence) into `dist/facts.json`, beside `version.json`, and fills the page from
  it. A claim that is not true of the game stops the build with a sentence that says which. Nothing is typed into
  `index.html` that the game could change.
- **The site has its own look**, the spec's "Visual direction": palette No. 325 (deep green ground, yellow words,
  ocher for what can be pressed, red only as an edge or an icon) and the fonts Fraunces, Onest and JetBrains Mono. The
  colours and fonts are in `src/styles.css`, and the pictures of every run are on the `ci-screens` branch.
- **The pictures are taken by the build.** It opens the built game once in a browser and saves the picture the page
  shows before Play, the picture a shared link shows, and the touch icon.
- **The site is static files**, hosted on Cloudflare Pages at `automataframework.pages.dev`.
- **Tests run only in GitHub Actions**, never on your machine. `pnpm lint`, `pnpm typecheck`, `pnpm knip` and
  `pnpm build` are quick checks you can run before you push.

## Icons

An icon is one line, put before the words it goes with:

```html
<button type="button"><i data-icon="play"></i>Play the game</button>
```

- The name is a file name from Phosphor's regular set: look in `node_modules/@phosphor-icons/core/assets/regular/`.
- `pnpm build` writes the picture in. If there is no icon of that name, the build stops and says which name, in which
  page.
- An icon never stands without words beside it, and it takes the colour of those words.

## Try it on your machine

You need [Node](https://nodejs.org) 24 or newer and [pnpm](https://pnpm.io). Then, from this folder:

```
pnpm install
pnpm exec playwright install chromium
pnpm build
pnpm exec wrangler pages dev dist
```

- `pnpm install` fetches what the site needs.
- `pnpm exec playwright install chromium` fetches the browser the build uses once to take the game's picture, the
  picture a shared link shows, and the touch icon. It needs doing only once on a machine.
- `pnpm build` makes the whole site in the `dist/` folder, with a small stand-in game inside it, so it works at once.
- `pnpm exec wrangler pages dev dist` serves that folder the way Cloudflare Pages does. Open
  <http://localhost:8788>, press "Play the first game", and the stand-in game plays.

To see the real game on the page instead of the stand-in:

```
git clone https://github.com/mcthaydt/AutomataFrameworkExamples ../AutomataFrameworkExamples
(cd ../AutomataFrameworkExamples && pnpm install && pnpm build)
GAME_DIR=../AutomataFrameworkExamples/dist GAME_SOURCE=../AutomataFrameworkExamples pnpm build
pnpm exec wrangler pages dev dist
```

- The first two lines build the demo game in its own folder, next to this one.
- `GAME_DIR=… pnpm build` builds the site again, with that game inside it, in place of the stand-in. `GAME_SOURCE=…`
  always goes with it: it is the game's own folder, where the numbers on the page are read from (the game's name, its
  level, its recorded play and its licence). A build with `GAME_DIR` and no `GAME_SOURCE` stops and says so, because
  the page would otherwise show one game's numbers beside another game.
- The last line serves it, at the same address as before.

Something went wrong? Read the last line the command printed: it says what is missing. The most common cause is an older
Node, so check `node --version` says 24 or higher.

How the work is organised is in [`CLAUDE.md`](CLAUDE.md); the plan, its audit and the progress tracker are in
[`docs/superpowers/`](docs/superpowers/).
