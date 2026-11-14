# The sales site: the page that turns a visitor into someone making a game

Written 2026-11-14. Stage 1 (Spec) of the project workflow, for the Automata Framework website. It widens the site
the [2D first layer spec](https://github.com/mcthaydt/AutomataFramework/blob/main/docs/superpowers/specs/2026-11-13-2d-first-layer-design.md)
describes and the home redesign ([`audits/2026-11-14-home-design-audit.md`](../audits/2026-11-14-home-design-audit.md))
built. Those still hold; where this one differs it is newer and says so.

**When it is built.** The spec is written now so it is ready. The page is planned and built once the M2 showcase demo
game has landed, just before Release 1, because a page that sells has to rest on proof, and most of the proof arrives
with M2. Built today, every section would need rewriting as each feature ships.

**The bar** (the Owner, 2026-11-14): people should think this is a Y Combinator company, and be shocked that it isn't.
The model is the first attempt's sales-optimized site (AutomataFrameworkFailed, `site/`); this spec keeps what it got
right and leaves what it got wrong (see "What carries over from the first attempt").

**Status of this spec.** The Owner answered its four questions on 2026-11-14 (see "The Owner's answers"): the catch is
live on the page, the app's prices and a sign-up are shown, the Owner's studio is shown, and the site gains the pages
of a full framework site, not only Home and Start.

## Principles served

| Principle | How this serves it |
|---|---|
| 1. Agent-first | The page sells to the person and to their agent at once: the Start page's commands are the framework README's, read at build time; "Copy the prompt for your agent" gives an agent everything it needs; `llms.txt` describes the framework to an agent that reads the site. Every fact on the page comes from a file an agent can read. |
| 2. iPad-first editors | The page shows the editors working at iPad size the moment they work on `main`, and never before. |
| 3. Layers in order | 2D only. Nothing on the page mentions 3D until 3D is built. |
| 6. The stack carries over | No new framework for the site. It stays the static Vite build it is, with the same safety header. |

It breaks none.

## Why

Today the site's job is "watch this being built": it ends with "Want to make your own game with it? Not yet." At
Release 1 the framework can be installed and the demo game shows every built-in, so the job changes. A visitor who
makes games with a coding agent should, within one screen, see a real game made with Automata playing, read one
sentence that names the wall they have hit, and have one obvious thing to press. Further down, every section proves
one claim with the real thing, not a description of it.

## Goals

- **A visitor knows what this is in five seconds**: the claim, one line under it, and the game playing itself.
- **One action**: make a game. Everything on the page leads to it; nothing competes with it.
- **Every claim is proved on the page by the real thing**: the game, its files, its check, its built-ins. A claim that
  is not true on `main` today is not sold; it is listed honestly as "Being built".
- **It feels made with care**: fast, quiet, precise, with every detail finished (states, motion, the share card, the
  404, the icon, phone and tablet layouts). This is the "YC company" bar, made concrete in "The polish bar".
- **A visitor's agent can use the page too**: the prompt, the commands and `llms.txt`.

## Non-goals

- Pages for what does not work yet: a guide, an example or an API page appears only once what it shows is on `main`.
- Selling the editors or publishing before they work. Those claims stay "Being built" until they are true on `main`.
- A light theme. Dark is the only theme.
- A blog, a changelog page, a newsletter, a community page.
- Analytics scripts or any request to another company's server from the page.

## Anti-goals (failure even if it technically works)

- **A claim that is not true on `main` today**, anywhere on any page, in any browser. This is the site's first rule and
  this spec does not loosen it.
- **Invented proof**: a logo, quote, user count or star count that is not real. One fake thing makes every true thing
  look fake.
- **Hype words in place of the thing**: "revolutionary", "blazing", "seamless", "next-generation", "AI-powered". The page
  shows; it does not adjectivise.
- **Jargon a drunk grandma can't follow**: "deterministic", "ECS", "bit-exact", "hash" in a sentence, "no-code",
  "repo", "commit". Numbers in the number font are fine (they are the proof); the sentence around them is plain.
- **Two bright buttons on one screen.** One yellow action per screen, always the same action.
- **Restyling the game's art** or drawing over it.
- **A page that is slow** because it sells: the first screen is the site's own small files; the game loads after.

## Decided already (by the Owner)

| What | Decision |
|---|---|
| The name and mark | "Automata Framework"; the wordmark is the word `automata`, no mark. |
| The headline | "Finish the game your agent started." |
| The idea under it | Your agent can make a demo in a weekend; turning it into a game takes weeks. Automata has those weeks built in. |
| The look | Palette No. 325 (Deep Slate Green ground, Naples Yellow words, Yellow Ocher for what can be touched, Eugenia Red only as an edge or icon), Fraunces + Onest + JetBrains Mono, Phosphor regular icons, dark only. |
| Motion | Lenis smooth wheel scrolling for everyone, very subtle; small quick motion in the stylesheet, off for people who ask for less (except the game watching itself, which plays for everyone). |
| The game before Play | The recorded run plays itself (watch mode), again and again; a tap starts it. |
| Claims | All five, each with an honest stamp ("Works today" or "Being built"), held to `main` by a proof. |
| Safety | The strict safety header stays. |
| Copy | The drunk-grandma test. |
| The catch (Q1) | Live on the page: the visitor nudges a real number and the check turns red (the Owner, 2026-11-14). |
| Pricing (Q2) | The app's prices, paid once, and an email sign-up for when it is out (the Owner, 2026-11-14). |
| Proof from people (Q3) | The Owner's own studio, SNEKPRTY, shown now (the Owner, 2026-11-14). |
| Pages (Q4) | Home, Start, Pricing, Privacy, the 404 and `llms.txt`, and more: guides, examples, the API reference, a showcase and search, the shape of a full framework site (the Owner, 2026-11-14). |

## Approaches considered

1. **Widen today's static site (chosen).** Keep the Vite build, the `facts` → `claims` → `fill` pipeline, the stamps and
   their proofs, and add sections and pages to it. Every new fact gets a reader in `facts` and every new claim a proof
   in `claims`. Chosen because the honesty machinery is the site's most valuable part and already works, it adds no
   dependency, and it keeps the safety header.
2. **Port the first attempt's SvelteKit site.** It had the sections, the copy and the motion already. But it brings a
   framework, two motion libraries and a code-editor library the current site deliberately left out, and its claims
   were held to the workspace, not to a checked `main`. The words and the order carry over; the code does not.
3. **A site builder (Astro or similar).** Good for many pages, and Q4 gives the site many (guides, examples, API,
   search). Still not chosen: the pages are Markdown and a report turned into the same static files, which a small
   Markdown reader inside today's build can do, and the build's facts-and-proofs pipeline would have to be rebuilt
   inside a builder. Both a reader and a builder are new dependencies, so the plan puts the choice to the Owner, with
   this one recommended, before the reference pages are built.

## Who arrives, and what they should do

The visitor makes small games with a coding agent (Claude Code, Cursor, Codex), has a demo that was fun, and has not
finished it. They arrive from a link someone shared, a search, or their agent. In order, they should:

1. **See it** (first screen): a real game, made with Automata, playing by itself, under the claim.
2. **Recognise their problem** (the line under the claim): the demo is easy; the weeks after are not.
3. **Believe it** (the sections): each one shows the real thing that makes a claim true.
4. **Act** (the yellow button, repeated at the end): "Make a game", which goes to Start, where one command or one
   copied prompt makes a game that already has the built-ins.

What is measured, without any script on the page: visits to `/start` against visits to `/`, read from Cloudflare's own
request counts, and the sign-ups for the app. *My call:* no analytics script, because the safety header
and the "no other company's server" rule both forbid one, and the request counts answer the only question that
matters at first (does anyone go on to Start).

## The home page, top to bottom

A text sketch at desktop width; the phone stacks it, left-aligned.

```
 automata                                   What works today   GitHub   [Make a game]
 ─────────────────────────────────────────────────────────────────────────────────────
                    [ Release 1 · Out now → ]
              Finish the game your agent started.
     Your agent can make a demo in a weekend. Saves, menus, settings,
     controls and languages take the weeks after. Automata has them built in.
           [ Make a game → ]   ( Copy the prompt for your agent )
                  $ <the create command, from the README>    ⧉
   ┌───────────────────────────────────────────────────────────────────────────┐
   │ Crate Game · A game made with Automata    ← → Space to play     [Play it] │
   │                                                                           │
   │                the game, playing its recorded run by itself               │
   │                                                                           │
   └───────────────────────────────────────────────────────────────────────────┘
     Version 3f2a91c      3 levels      Plays the same in Node, Chrome, Safari, Firefox

   4 engines play it the same · 12 built in · 6 languages · MIT, free
   MADE WITH AUTOMATA   [SNEKPRTY]

   BUILT IN        The part after the demo is already done.      [grid of the built-ins]
   CHECKS          Your agent can't quietly break your game.     [the catch, Q1]
   BUILT FOR AGENTS  That whole level is one small file.         [the file + the commands]
   WHERE IT STANDS What works today, and what is still being built.  [five stamps]
   PRICING         Free in your browser · The app, paid once  [Tell me when it's out]
   ┌───────────────────── Finish your next game. ──────────────────────┐
   │  One command makes a game with saves, menus and controls done.     │
   │  [ Make a game → ]     $ <create command>  ⧉                       │
   └────────────────────────────────────────────────────────────────────┘
   footer: automata · Free and MIT licensed · Start · Pricing · Privacy · GitHub · Licences
```

Each section below says what it shows, what it proves, where its facts come from, and the direction for its words. The
words given are the direction, in the voice the page should have; the plan may sharpen them, and the drunk-grandma test
is the judge.

### 1. The top bar

The wordmark on the left. "What works today", "GitHub" and a small yellow "Make a game" on the right; on a phone, the
wordmark and the yellow button. It stays at the top as the page scrolls, with the ground colour behind it once the
first screen has gone. *Changes from today:* the bar's yellow button was "Play the game"; it becomes "Make a game",
because that is now the page's one action (Play stays on the game's own bar).

### 2. The first screen

- **The tag** above the claim: "Release 1 · Out now", linking to the framework's release notes on GitHub. Before
  Release 1 is published the tag says "Being built" and links to "What works today", as today. The tag's words come
  from the facts (the framework's newest release), never typed.
- **The claim**: "Finish the game your agent started." At up to 84 px, as today.
- **The line under it**: the idea above, in about thirty words, naming the built-ins the visitor will recognise
  (saves, menus, settings, controls, languages). It says "has them built in", which becomes true at Release 1; until
  then it keeps today's "will have".
- **The two actions**: "Make a game" (yellow, to `/start`) and "Copy the prompt for your agent" (quiet; copies the
  prompt, says "Copied" under itself without moving the row).
- **The command**: the create command on one plain line with a copy button, read from the framework's README at build
  time, so it is always the command the README's own test runs in a clean folder.
- **The game on its sheet**: the demo game, as large as the screen allows, playing its recorded run by itself (watch
  mode), with today's bar ("<name> · A game made with Automata", the keys, "Play it") and title block (version, level
  count, the last check). It is the first thing that moves on the page.

**Proves:** that a real game made with the framework exists and works, before a word is read.

### 3. The numbers

One row of four or five, each read from the game's and the framework's files when the site is built, never typed:
the engines it plays the same in, the number of built-ins (from the demo's "What's inside" file), the languages, the
licence. *My call:* the row has no number that only sounds big (no lines of code, no test counts); each number is
something a visitor gets.

### 4. "The part after the demo is already done" (claim 1)

- **Shows**: a grid of the built-ins, each a short name and one line ("Saves: players pick up where they left off."),
  and under each, where to see it in the game that is playing above ("Press pause, then Settings"). Pressing one
  scrolls up and, where the game can, takes the visitor there.
- **Facts**: the list is the demo game's own "What's inside" content file (M2's showcase), read at build time. When an
  agent adds a feature to the demo and its line to that file, the site gains its tile on the next build. A tile the
  file does not have cannot appear.
- **Proof**: claim 1's proof holds when the file lists every built-in the claim's sentence names (saves, menus,
  settings, controls, sound, languages) and the game's journeys for them passed on that commit.
- **Words direction**: "Players notice the moment these are missing. Every Automata game starts with them working, so
  your agent can spend its time on your idea."
- **Shown first** among the sections because it is the wall the visitor has hit.

### 5. "Your agent can't quietly break your game" (claim 3, the checks)

The page's centrepiece, shown as a thing that happens, not a table to read.

- **The catch, live** (the Owner, Q1): beside a small copy of the game playing its recorded run sits one
  real number from the game's files, shown as the line of the file it lives on (where the crate starts, how high the
  hero jumps). The visitor nudges it. The same recorded run plays again with the changed file, in the real game, in
  the frame, and the panel says what a check would say, in plain words: "This change broke the recorded play. Your
  agent would see this before a player did." Putting the number back turns it green again. Under it, the table of
  the four engines and the ending each must reach, as today, read from the recorded play.
  If the game cannot be loaded for a visitor, the panel shows the same thing still: a real breaking change caught by
  CI, the one-line change, the check that failed and a link to the real run, so nobody sees an empty box.
- **Facts**: the recorded play, its ending, the engines (as today); the number's file and line from the
  game's content; for the still fallback, the run's address, from a file the Examples repo keeps for it.
- **Proof**: as today (`same-in-every-engine`), plus a journey that nudges the number in three engines and sees
  the check fail, then pass again.
- **Words direction**: "Record a play once. Every time your game changes, that play runs again in four places. If a
  change breaks something that worked, the check says so, and your agent sees it before a player does."
- **What it needs from the demo game**: one more message between the page and the game (the watch-mode addendum's
  two messages are the pattern), asking it to play its recording against a changed number and say whether it ended
  the same. That is its own small Examples spec addendum, written by this cycle's plan, not built ahead of it.

### 6. "That whole level is one small file" (claim 2, built for agents)

- **Shows**: the level's real file beside the words, with drawing notes on leader lines (as today), and, beside it, a
  real run of the framework's check command on the demo game: the plain-words output an agent reads. The output is
  recorded by the Examples CI on the shown commit and read at build time, never typed.
- **Lists**, one line each: agent skills that ship with the framework; one command that checks everything; an MCP
  server so an agent can run and watch the game; nothing to pay for per use ("Your agent, your plan").
- **Proof**: claim 2's proof holds when the framework's release has the skills, the check command and the MCP server
  (read from its published package's files).
- **Words direction**: "A game is small files with plain names. Your agent finds the right one, changes it, and checks
  that it still works."

### 7. Claims 4 and 5: the editors and publishing

At Release 1 the editors (Release 2) and publishing (Release 4) are not finished. So they get **no section** of their
own and appear only in "Where it stands", stamped "Being built", with one honest line each. The editors' line may say
what is true today (for example, "You can already move things in the demo game's first level on an iPad; the rest is
being built") and link to the editor, if that is true on `main` when the page is built. Each earns a section like 4 to
6 the day its claim works, in the plan that makes it work.

### 8. "What works today, and what is still being built"

Today's five claims with their stamps, unchanged in kind. At Release 1 the expected stamps are: claim 1 works, claim 2
works, claim 3 works, claims 4 and 5 being built. The stamps are not written here: each is held to `main` by its
proof, and the build stops when a "Works today" does not hold.

### 9. Pricing

Decided (the Owner, Q2): two columns. "Free in your browser": the framework (MIT), every editor in the browser,
signing in to save into your game. "The app, paid once": the editors installed on an iPad, an Android phone or a
computer, with the prices in the private notes, confirmed with the Owner in the plan, marked "Not out yet", and one
field and button, "Tell me when it's out", that takes an email address. Under it, in plain words: what is kept (the address and the
day), why (to send one message when the app is out), and that it is never shared; a link to Privacy.

The sign-up is the site's first Pages Function. It is the only part of the site that runs code on the
server, it holds no secret beyond Cloudflare's own binding, and `deploy` still never runs the game's code. The store
is made by the Owner with one `wrangler` command (the plan gives it). A journey checks the sign-up against a pretend
store, and that a refused sign-up says so in words.

### 10. Proof from people

Decided (the Owner, Q3): a **"Made with Automata"** row under the numbers, starting with the Owner's own studio,
SNEKPRTY (its logo files are the first attempt's, `site/static/made-with/snekprty-*.webp`). Each entry is a name, a
logo or picture, and where it links, read from a content file in this repo, so adding a studio or game is one entry.
*My calls:* the row says only what is true of each entry (a studio is "a studio making games with Automata", never
"trusted by"); it has no quotes until someone real has said one; and it grows only with real entries, never padded
with placeholders. An entry links only where the Owner says.

### 11. The closing band and the footer

- **The band**: "Finish your next game." One line ("One command makes a game with saves, menus and controls already
  done. Hand it to your agent."), the yellow "Make a game", and the command with its copy button. It is the page's
  only full-width use of the ocher.
- **The footer**: the wordmark, "Free and MIT licensed", and short columns: Start, Guides, Examples, API, Showcase, Pricing, Privacy,
  What works today; the game's files, the framework's files, GitHub; Licences.

## The other pages

Decided (the Owner, Q4): Home, Start, Pricing, Privacy, the 404 and `llms.txt`, **and more**: the pages a full
framework site has. Each page below lands only once what it shows is on `main`; until then it is not in the bar, and
no link points at it.

| Page | What it is | It reads | Lands when |
|---|---|---|---|
| Start `/start/` | Make a game in three steps (below) | The framework README's first section | Release 1 |
| Guides `/guides/` | Short task pages: make a game, make it with your agent, add a level, change how it feels, add a sound, add a language, save and load, add a second player, put it on the web. Each is a few steps, each step one command or one file and what you see after it | Markdown guides in the framework's repo, at the release's commit | Each guide when its feature is on `main`; most at Release 1 |
| Examples `/examples/` | A gallery of small runnable games, one feature each, each playing live in a frame with its one source file beside it and "Copy" on the file | The one-file examples in the Examples repo | When the first examples are there; a plan in Examples writes them |
| API `/api/` | The framework's public functions and types, one page per entry point, with each doc comment | The framework's API report, at the release's commit | Release 1 |
| Showcase `/showcase/` | Games and studios made with Automata, bigger than the home row: a picture, a line, where to play | The same content file as "Made with Automata" | With the home row |
| Pricing `/pricing/` | Section 9 in full | The prices file | With the home section |
| Privacy `/privacy/` | What the site keeps | — | With the sign-up |
| Search | One box in the bar (and `/` on a keyboard) over the guides, examples and API, built at build time into a small index the page reads; no other company's service | The pages above | Once there are guides and API pages to search |
| `llms.txt` and `llms-full.txt` | The framework for an agent: the first is short, the second has every guide and the API in one file | The same sources | Release 1 |

*My calls:* the top bar becomes Start, Guides, Examples, API, Pricing, with GitHub and the yellow "Make a game" on the
right; on a phone they go behind one "Menu" button. The bar shows the framework's version, read from the facts. The
editors get no page until they are released (Release 2). The first attempt's playground (code typed into the page) is
left out, because the examples' "Copy" and the agent prompt serve the same need without running typed code under the
strict safety header. Every page has the same look, the same safety header and its own journeys.


- **Start** (`/start/`): "Make a game in three steps." Each step is one command and what you see after it, read from
  the framework README's first section (the one its test follows in a clean folder), so the page cannot drift from
  what works. Then "Or hand it to your agent": the prompt, with its copy button. Then "Stuck?": a link to open an issue
  on GitHub, said plainly.
- **Pricing** (`/pricing/`): section 9 in full.
- **Privacy** (`/privacy/`): what the site keeps (nothing, unless the visitor signs up for the app; then the address
  and the day), what Cloudflare sees, and how to be removed. Short.
- **The 404**: in the same look, with the yellow "Make a game" and a link home.
- **`llms.txt`**: what the framework is, the create and check commands, where the agent skills and the MCP server are,
  and the five claims with their stamps, built from the same facts as the page.

## The prompt for your agent

One file in this repo, the text the "Copy the prompt" buttons copy: what to run, what the game already has, the rules
the agent keeps (one file per thing, run the check after each change), and where the skills are. A test holds every
command it names to the framework README. *My call:* it stays short enough to read before pasting (about 120 words),
because a visitor who can't read what they paste won't paste it.

## The polish bar ("a YC company")

What makes a page read as a serious, funded company is mostly restraint and finish. Concretely, each of these is a
test in the plan:

- **The product first.** Within the first screen, a real game moving. No illustration stands in for it.
- **Speed.** The first screen's own files (page, sheet, fonts, picture) are small enough to show in under a second on
  a fast phone connection; the plan sets the byte budget and a test holds it. The game loads after, behind its
  picture.
- **One voice.** Short sentences, one idea each, sentence case, no exclamation marks, no hype words (a test lists the
  forbidden words, as the first attempt's did).
- **Every state finished.** Hover, pressed, focus and disabled on every control; "Copied" after copying; the game's
  loading, watching, playing and problem states; the sign-up's sending, done and refused states.
- **Small, quick motion** (140 to 200 ms), in the stylesheet, as today: the first screen arrives once; a section's
  real thing settles in as it comes into view; a stamp lands. Nothing loops but the game.
- **Every size.** Phone, tablet and desktop, upright and sideways, in Chromium, WebKit and Firefox, with no sideways
  scroll and 44 px targets (48 px for the yellow action).
- **The face outside the page.** Title, description, share picture (today's, with the new tag), icon, touch icon.
- **Accessible.** Every image has words or is marked as decoration; the page reads in order with a screen reader; the
  contrast checks in `tests/styles/` cover every new part.

## What carries over from the first attempt

| The first attempt's site | Here |
|---|---|
| The order: claim and game, numbers, built-ins, agents, checks, editors, publish, pricing, closing | Yes, with the built-ins first, then checks, then agents; the editors and publish wait until true |
| The copy in one file per page, held to the framework by tests | Yes, through `facts` and `claims` |
| "Finish the game your agent started." and its lead line | Yes (decided) |
| One bright button per screen, the closing band | Yes |
| The announcement pill above the claim | Yes, as the release tag |
| "Copy the prompt for your agent" | Yes |
| A "Made with" carousel | Yes, as a row starting with SNEKPRTY (Q3) |
| Pricing with the app's two prices | Yes (Q2) |
| Sections for the editors, publishing, 21 examples and a changelog that `main` did not back | No, the site's first rule; examples come back as real ones land |
| Near-black and lime, Geist, SvelteKit, two motion libraries, a code-editor library | No: the decided look and the current static build |
| Docs, examples, API reference, search | Yes, each when what it reads is on `main` (Q4); the playground is left out |

## What the other repos must provide first

| From | What | Why |
|---|---|---|
| Examples (M2 plan D) | The showcase demo with its "What's inside" file; watch mode working with the title screen | Sections 2, 3 and 4 |
| Examples | The check command's output recorded by CI on each passing commit | Section 6 |
| Examples | The "try a changed number" message, by its own small addendum | Section 5 |
| Examples | The one-file examples, by a plan of its own | The examples gallery |
| Framework | Its guides as Markdown and its API report at the release's commit | Guides, API, search, `llms-full.txt` |
| Framework (M2 plan K) | The README's first section and its clean-folder test; the release with skills, check and MCP | Start, the command, the prompt, claim 2's proof |
| Framework | Release 1 published | The tag, "has them built in" |

Until each has landed, its section keeps today's form and honest words; the plan builds each part only once what it
reads exists on `main`.

## Testing

Tests run only in GitHub-hosted CI. Every new part has:

- unit tests for its reader in `facts`, its proof in `claims`, and its filling in `fill`;
- a proof that stops the build when a "Works today" does not hold, and a test that the stop happens;
- journeys at phone, tablet and desktop sizes, upright and sideways, in Chromium, WebKit and Firefox: the first screen
  and both actions; copying the command and the prompt; each built-in tile; the catch, red and green again; the
  "Made with" row; the sign-up against a pretend store and its refused state; each new page and the bar's menu on a
  phone; a search that finds a guide, an example and an API entry; an example playing and its file copied; the 404;
- the copy test (forbidden words, one yellow action per screen, sentence case on titles);
- the byte budget for the first screen;
- the no-other-server test: the page makes no request to any address but its own.

## Done means

On `main`, proven by CI, and live at `automataframework.pages.dev`:

- Every section above is on the page with its real thing, filled from files, its stamp held by a proof.
- A visitor on a phone can go from arriving to a copied command or prompt in two presses.
- Every journey passes in three engines at every size; the budget and copy tests pass.
- The Owner has looked at it on a phone and a computer and said it is fine.

## The Owner's answers (2026-11-14)

Asked through the coordinator, each with a recommendation. The Owner chose **Q1 (a), Q2 (a), Q3 (b), and Q4 (a) with
more pages.** The questions are kept as asked, so the reasons stay with the answers.

1. **Q1. The catch:** (a) live on the page, the visitor nudges a real number and the check turns red (recommended), or
   (b) a real caught break from CI, shown still. *Answered (a);* (b) stays as the fallback when the game can't load.
2. **Q2. Pricing and the app sign-up:** (a) prices and "Tell me when it's out" with an email sign-up (recommended), (b)
   the sign-up without prices, or (c) no pricing until Release 2. *Answered (a).*
3. **Q3. Proof from people:** (a) no section until real, then a "Made with" row (recommended), or (b) the Owner's own
   studio shown now. *Answered (b).*
4. **Q4. The pages:** (a) Home, Start, Pricing, Privacy, the 404 and `llms.txt` (recommended), (b) Home only, or (c)
   the first attempt's full set now. *Answered (a), "but I'd add more"*: the full set of a framework site's pages, in
   "The other pages".

## Left to the builder (the plan)

- The exact words, within the directions above and the drunk-grandma test.
- The byte budget's number, and how the first screen meets it.
- How each new fact is read (which file, at which commit), within "the site does not depend on the framework".
- Which built-ins get a "take me there" press that moves the game, and which only scroll.
- The prompt's exact text.
- The order of work, so each part lands as soon as what it reads is on `main`. The pages are large enough that the
  plan may split into several plans (home, then the reference pages); if it does, it says so and each goes through
  the stages.
- How guides and API pages are turned into pages within the static build (a Markdown reader is a new dependency, so
  only with the Owner's yes; the plan asks).
