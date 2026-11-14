# AutomataFrameworkSite

The website for AutomataFramework: one page where you press "Play the game" and play the first game made with it.

- **The game comes from [AutomataFrameworkExamples](https://github.com/mcthaydt/AutomataFrameworkExamples).** This
  repo never imports it. Its `site` workflow picks the newest commit of the game whose checks all passed, builds the
  game with the game's own `pnpm build`, and shows it on the page, in a frame.
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
pnpm build
pnpm exec wrangler pages dev dist
```

- `pnpm install` fetches what the site needs.
- `pnpm build` makes the whole site in the `dist/` folder, with a small stand-in game inside it, so it works at once.
- `pnpm exec wrangler pages dev dist` serves that folder the way Cloudflare Pages does. Open
  <http://localhost:8788>, press "Play the game", and the stand-in game plays.

To see the real game on the page instead of the stand-in:

```
git clone https://github.com/mcthaydt/AutomataFrameworkExamples ../AutomataFrameworkExamples
(cd ../AutomataFrameworkExamples && pnpm install && pnpm build)
GAME_DIR=../AutomataFrameworkExamples/dist pnpm build
pnpm exec wrangler pages dev dist
```

- The first two lines build the demo game in its own folder, next to this one.
- `GAME_DIR=… pnpm build` builds the site again, with that game inside it, in place of the stand-in.
- The last line serves it, at the same address as before.

Something went wrong? Read the last line the command printed: it says what is missing. The most common cause is an older
Node, so check `node --version` says 24 or higher.

How the work is organised is in [`CLAUDE.md`](CLAUDE.md); the plan, its audit and the progress tracker are in
[`docs/superpowers/`](docs/superpowers/).
