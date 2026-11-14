# AutomataFrameworkSite

The website for AutomataFramework: one page where you press "Play the game" and play the first game made with it.

- **The game comes from [AutomataFrameworkExamples](https://github.com/mcthaydt/AutomataFrameworkExamples).** This
  repo never imports it. Its `site` workflow picks the newest commit of the game whose checks all passed, builds the
  game with the game's own `pnpm build`, and shows it on the page, in a frame.
- **The site is static files**, hosted on Cloudflare Pages at `automataframework.pages.dev`.
- **Tests run only in GitHub Actions**, never on your machine. `pnpm lint`, `pnpm typecheck`, `pnpm knip` and
  `pnpm build` are quick checks you can run before you push.

How the work is organised is in [`CLAUDE.md`](CLAUDE.md); the plan, its audit and the progress tracker are in
[`docs/superpowers/`](docs/superpowers/).
