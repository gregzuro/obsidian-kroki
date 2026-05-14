# Contributing

Thanks for considering a fix or enhancement to obsidian-kroki. The plugin is a
fairly small TypeScript codebase wrapped around a [Kroki](https://kroki.io)
server, so most changes touch one or two files. This document points at the
moving parts and the workflow.

## Project layout

| Path | What's in it |
|---|---|
| `main.ts` | Plugin entry point — markdown code-block processor, settings tab, header/include handling |
| `styles.css` | Diagram container, white-background toggle, settings styling |
| `manifest.json` | Plugin metadata Obsidian reads (id, version, `minAppVersion`) |
| `versions.json` | Per-version `minAppVersion` map for older Obsidian builds |
| `esbuild.config.mjs` | Bundles `main.ts` → `main.js` |
| `kroki-test.md` | Live test cases for every supported diagram type |
| `.github/workflows/` | CI lint+build (`main.yml`) and tagged release (`publish.yml`) |

## Dev setup

Either of:

- **Nix flake** (recommended) — `nix develop` drops you into a shell with the
  pinned Node toolchain (`flake.nix`).
- **Plain npm** — Node 22 + `npm install`.

Common commands:

```
npm run lint     # eslint . --ext .ts
npm run build    # tsc -noEmit && esbuild (writes main.js)
npm run dev      # esbuild --watch (rebuilds on save)
```

The build is reproducible against the committed `package-lock.json`; CI uses
`npm ci`, so please run `npm install` (not a manual `npm i <pkg>`) before
committing dep changes so the lockfile stays in sync.

## Trying changes in a real vault

Obsidian loads plugins out of `<vault>/.obsidian/plugins/<plugin-id>/`. The
quickest setup:

1. `npm run dev` in a checkout (keeps `main.js` fresh).
2. Symlink (or copy) `main.js`, `manifest.json`, and `styles.css` into the
   vault's `.obsidian/plugins/obsidian-kroki/` directory.
3. Enable the plugin in Obsidian's community-plugins settings; reload the vault
   after each rebuild.
4. Open `kroki-test.md` to exercise every supported diagram type at once.

## Pull-request flow

- Branch off `master` (`scorecard-…`, `fix-…`, etc.).
- Keep changes small and self-contained. Mixed refactor + feature PRs are hard
  to review; split them if you can.
- `npm run lint && npm run build` must pass locally before pushing — same
  commands CI runs.
- Mention any `manifest.json` / `versions.json` / `package.json` version bumps
  in the PR body so the release path is obvious.
- When a change is user-visible (new diagram type, new setting, behaviour
  change), call it out in the README and in `RELEASE_NOTES.md` for the next
  tagged release.

## Releasing (maintainer notes)

1. Update `manifest.json`, `package.json`, and `versions.json`.
2. Write `RELEASE_NOTES.md` for the tag.
3. Tag with the bare version (`git tag 1.3.1 && git push origin 1.3.1`).
4. `.github/workflows/publish.yml` builds, attaches `main.js`/`manifest.json`/`styles.css`,
   attaches a GitHub artifact attestation, and uses the notes file as the
   release body.

## Where the rendering rules live

User-facing behaviour (`@from_file:` includes, per-diagram-type headers,
PlantUML/Mermaid block-name caveats, the white-background toggle) is
documented in [README.md](README.md). Changes there should be reflected back
in the README so users don't have to read source to discover features.
