# 1.3.1

Scorecard / hygiene polish on top of 1.3.0 — no behaviour changes for end
users beyond the settings-tab tweak below.

### Plugin

- The **PNG** action link is now hidden for diagram types whose Kroki
  server doesn't generate PNG output (BPMN, Bytefield, D2, DBML,
  Excalidraw, Nomnoml, Pikchr, Svgbob, Symbolator, WaveDrom). Previously
  the link was always rendered and 404'd for those types. The **Edit**
  link now uses the SVG URL, which works for every type.
- Settings tab no longer shows a "General" heading at the top (Obsidian's
  style guide: the first section is unheaded).
- Switched `document` → `activeDocument` inside the diagram renderer and
  the settings link helper so things keep working when Obsidian is hosted
  in a popout window.
- Internal: settings-textarea handler no longer hands the DOM a
  `Promise<void>` where a `void` callback was expected.

### Build & supply chain

- `package-lock.json` is committed; CI now uses `npm ci`.
- `pako` pinned to an exact version; the unused `builtin-modules` dev
  dependency dropped (esbuild uses `node:module`'s `builtinModules`).
- Release workflow attaches a GitHub artifact attestation
  (`actions/attest-build-provenance`) to `main.js`, `manifest.json`, and
  `styles.css`.

### Repo

- New `CONTRIBUTING.md` covering dev setup, testing in a real vault, and
  the release flow.
