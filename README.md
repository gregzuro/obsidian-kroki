# Obsidian Kroki

Render [Kroki](https://kroki.io) Diagrams in [Obsidian](https://obsidian.md).

This plugin uses, by default, the [Kroki](https://kroki.io) server for rendering, but specifying an alternate one via this plugin's options is encouraged.

If you can't find an alternate, then you can host your own server as [described here](https://kroki.io/#install).

This plugin is a modified and slightly expanded version of the [obsidian-plantuml](https://github.com/joethei/obsidian-plantuml) plugin by Johannes Theiner.

## Supported diagram types

| Diagram type | Code-block language | Notes |
|---|---|---|
| [BlockDiag](https://github.com/blockdiag/blockdiag) | `blockdiag` |  |
| [BPMN](https://github.com/bpmn-io/bpmn-js) | `bpmn` |  |
| [Bytefield](https://github.com/Deep-Symmetry/bytefield-svg/) | `bytefield` |  |
| [SeqDiag](https://github.com/blockdiag/seqdiag) | `seqdiag` |  |
| [ActDiag](https://github.com/blockdiag/actdiag) | `actdiag` |  |
| [NwDiag](https://github.com/blockdiag/nwdiag) | `nwdiag` |  |
| [PacketDiag](https://github.com/blockdiag/nwdiag) | `packetdiag` |  |
| [RackDiag](https://github.com/blockdiag/nwdiag) | `rackdiag` |  |
| [C4 with PlantUML](https://github.com/RicardoNiepel/C4-PlantUML) | `c4plantuml` |  |
| [Ditaa](http://ditaa.sourceforge.net/) | `ditaa` |  |
| [Diagrams.net (draw.io)](https://github.com/jgraph/drawio) | `diagramsnet` | Disabled by default — needs a self-hosted Kroki with the `yuzutech/kroki-diagramsnet` companion |
| [Erd](https://github.com/BurntSushi/erd) | `erd` |  |
| [Excalidraw](https://github.com/excalidraw/excalidraw) | `excalidraw` |  |
| [GraphViz](https://www.graphviz.org/) | `graphviz` |  |
| [Mermaid](https://github.com/mermaid-js/mermaid) | `mermaid` | Disabled by default to avoid clashing with Obsidian's built-in Mermaid — enable and rename to e.g. `kroki-mermaid` |
| [Nomnoml](https://github.com/skanaar/nomnoml) | `nomnoml` |  |
| [Pikchr](https://github.com/drhsqlite/pikchr) | `pikchr` |  |
| [PlantUML](https://github.com/plantuml/plantuml) | `plantuml` | Disabled by default to avoid clashing with the PlantUML plugin — enable and rename to e.g. `kroki-plantuml` |
| [Structurizr](https://structurizr.com/) | `structurizr` |  |
| [Svgbob](https://github.com/ivanceras/svgbob) | `svgbob` |  |
| [UMlet](https://github.com/umlet/umlet) | `umlet` |  |
| [Vega](https://github.com/vega/vega) | `vega` |  |
| [Vega-Lite](https://github.com/vega/vega-lite) | `vegalite` |  |
| [D2](https://github.com/terrastruct/d2) | `d2` |  |
| [WireViz](https://github.com/formatc1702/WireViz) | `wireviz` |  |
| [WaveDrom](https://github.com/wavedrom/wavedrom) | `wavedrom` |  |
| [DBML](https://github.com/softwaretechnik-berlin/dbml-renderer) | `dbml` |  |
| [Symbolator](https://github.com/kevinpt/symbolator) | `symbolator` |  |
| [TikZ](https://github.com/pgf-tikz/pgf) | `tikz` |  |

Anything else Kroki supports server-side should work too — pick an unused diagram-type slot in settings and set its kroki block name to the new type. PRs adding first-class entries for new types are welcome.

## Usage
Create a fenced codeblock using one of the diagram types supported by kroki as the language.
See the [Kroki site](https://kroki.io) for a complete list of supported diagram types.
Specify your diagram code inside the codeblock.

On desktop the diagram is rendered as inline SVG, so links inside the diagram (e.g. GraphViz `URL=` nodes) stay clickable. On mobile, and as a fallback if the SVG can't be fetched, it is rendered as an `<img>`.

Below each diagram there are two small links: **PNG** downloads a PNG of the diagram, and **Edit** opens it in [niolesk](https://niolesk.top/). The PNG link is omitted for diagram types whose Kroki server doesn't generate PNG output (BPMN, Bytefield, D2, DBML, Excalidraw, Nomnoml, Pikchr, Svgbob, Symbolator, WaveDrom).

### Including diagram source from a file

Instead of writing the diagram inline, the codeblock body can be just:

<pre>
```structurizr
@from_file:path/to/workspace.dsl
```
</pre>

The path is relative to the vault root. The file's contents are used as the diagram source.

### Settings

- **Server URL** — the Kroki server to use (default `https://kroki.io/`). Self-hosting is encouraged.
- **White background** — render diagrams on a white background; useful because Kroki returns transparent SVGs that can be unreadable on dark themes.
- **Diagram types** — enable/disable each type and optionally change the code-block language it responds to. Changes take effect after Obsidian reloads. Types that accept a header — **PlantUML**, **C4-PlantUML**, **Structurizr**, **Mermaid** — show a full-width header textarea inside their own settings card; text typed there is prepended to every diagram of that type and is handy for shared themes, `!include`s, or Mermaid `%%{init: …}%%` directives. Each language's syntax is different, so each supported type has its own header. All other types (graphviz, d2, vega, tikz, …) have no header field — any non-empty prelude would break their parsers.

### Types disabled by default

A few diagram types are shipped disabled because they need extra setup before they'll work:

- **`mermaid`** and **`plantuml`** — disabled to avoid clashing with Obsidian's built-in `mermaid` code blocks and with the popular PlantUML plugin. To use Kroki's renderers, enable them in settings and rename the code-block language (e.g. `kroki-mermaid`, `kroki-plantuml`).
- **`diagramsnet`** (draw.io) — Kroki renders diagrams.net via a separate companion service (the `yuzutech/kroki-diagramsnet` container, by default on port 8005). The public `https://kroki.io` instance does **not** run it; pointing the plugin there will get you `Error 503: Connection refused`. To use this type, host your own Kroki + diagramsnet companion (see [Kroki install docs](https://docs.kroki.io/kroki/setup/install/#docker)) and set **Server URL** accordingly.

Some other types (e.g. Excalidraw, BPMN) also rely on companion services; the public Kroki instance includes them, but a minimal self-host won't unless you start the companion containers too.

## Examples

See [kroki-test.md](kroki-test.md) for examples of each of the currently supported diagram types.

## Installation

### Inside Obsidian

`Settings > Third-party plugins > Community Plugins > Browse` and search for `Kroki`.

### Manually installing the plugin

- Clone this repo
- `npm i` to install dependencies (or `nix develop` for a pinned toolchain, then `npm i`)
- `npm run build`
- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/obsidian-kroki/`.
