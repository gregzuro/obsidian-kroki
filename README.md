# Obsidian Kroki

Render [Kroki](https://kroki.io) Diagrams in [Obsidian](https://obsidian.md).

This plugin uses, by default, the [Kroki](https://kroki.io) server for rendering, but specifying an alternate one via this plugin's options is encouraged.

If you can't find an alternate, then you can host your own server as [described here](https://kroki.io/#install).

This plugin is a modified and slightly expanded version of the [obsidian-plantuml](https://github.com/joethei/obsidian-plantuml) plugin by Johannes Theiner.

## Usage
Create a fenced codeblock using one of the diagram types supported by kroki as the language.
See the [Kroki site](https://kroki.io) for a complete list of supported diagram types.
Specify your diagram code inside the codeblock.

## Examples

See [kroki-test.md](kroki-test.md) for examples of each of the currently supported diagram types.

## Installation

### Inside Obsidian

`Settings > Third-party plugins > Community Plugins > Browse` and search for `Kroki`.

### Manually installing the plugin

- Clone this repo
- `npm i` or `yarn` to install dependencies
- `npm run build`  
- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/obsidian-kroki/`.
