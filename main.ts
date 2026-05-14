import {
	App,
	Plugin,
	PluginSettingTab,
	Platform,
	Setting,
	TFile,
	request,
} from "obsidian";

import { deflate } from "pako";

interface DiagramType {
	prettyName: string;
	krokiBlockName: string;
	obsidianBlockName: string;
	description: string;
	url: string;
	enabled: boolean;
}

interface KrokiSettings {
	server_url: string;
	/**
	 * Header text prepended to each supported diagram type before sending to Kroki.
	 * Keyed by `krokiBlockName` (e.g. `headers.plantuml`). Only the types listed in
	 * `HEADER_SUPPORTED_TYPES` have a UI to populate this; the rest reject any
	 * prelude content and so are intentionally not surfaced.
	 */
	headers: Record<string, string>;
	/**
	 * Legacy field from 1.2.x (and from the upstream obsidian-plantuml plugin).
	 * Was never actually applied before 1.3.0. Migrated into `headers.plantuml`
	 * on load and then dropped. Kept here for the type so existing `data.json`
	 * files deserialise cleanly.
	 */
	header?: string;
	whiteBackground: boolean;
	diagramTypes: DiagramType[];
}

const DEFAULT_SETTINGS: KrokiSettings = {
	server_url: "https://kroki.io/",
	headers: {},
	whiteBackground: false,
	diagramTypes: [
		{ prettyName: "BlockDiag", krokiBlockName: "blockdiag", obsidianBlockName: "blockdiag", description: "", url: "https://github.com/blockdiag/blockdiag", enabled: true },
		{ prettyName: "BPMN", krokiBlockName: "bpmn", obsidianBlockName: "bpmn", description: "", url: "https://github.com/bpmn-io/bpmn-js", enabled: true },
		{ prettyName: "Bytefield", krokiBlockName: "bytefield", obsidianBlockName: "bytefield", description: "", url: "https://github.com/Deep-Symmetry/bytefield-svg/", enabled: true },
		{ prettyName: "SeqDiag", krokiBlockName: "seqdiag", obsidianBlockName: "seqdiag", description: "", url: "https://github.com/blockdiag/seqdiag", enabled: true },
		{ prettyName: "ActDiag", krokiBlockName: "actdiag", obsidianBlockName: "actdiag", description: "", url: "https://github.com/blockdiag/actdiag", enabled: true },
		{ prettyName: "NwDiag", krokiBlockName: "nwdiag", obsidianBlockName: "nwdiag", description: "", url: "https://github.com/blockdiag/nwdiag", enabled: true },
		{ prettyName: "PacketDiag", krokiBlockName: "packetdiag", obsidianBlockName: "packetdiag", description: "", url: "https://github.com/blockdiag/nwdiag", enabled: true },
		{ prettyName: "RackDiag", krokiBlockName: "rackdiag", obsidianBlockName: "rackdiag", description: "", url: "https://github.com/blockdiag/nwdiag", enabled: true },
		{ prettyName: "C4 with PlantUML", krokiBlockName: "c4plantuml", obsidianBlockName: "c4plantuml", description: "", url: "https://github.com/RicardoNiepel/C4-PlantUML", enabled: true },
		{ prettyName: "Ditaa", krokiBlockName: "ditaa", obsidianBlockName: "ditaa", description: "", url: "http://ditaa.sourceforge.net/", enabled: true },
		{ prettyName: "Diagrams.net", krokiBlockName: "diagramsnet", obsidianBlockName: "diagramsnet", description: "", url: "https://github.com/jgraph/drawio", enabled: false },
		{ prettyName: "Erd", krokiBlockName: "erd", obsidianBlockName: "erd", description: "", url: "https://github.com/BurntSushi/erd", enabled: true },
		{ prettyName: "Excalidraw", krokiBlockName: "excalidraw", obsidianBlockName: "excalidraw", description: "", url: "https://github.com/excalidraw/excalidraw", enabled: true },
		{ prettyName: "GraphViz", krokiBlockName: "graphviz", obsidianBlockName: "graphviz", description: "", url: "https://www.graphviz.org/", enabled: true },
		{ prettyName: "Mermaid", krokiBlockName: "mermaid", obsidianBlockName: "mermaid", description: "", url: "https://github.com/knsv/mermaid", enabled: false },
		{ prettyName: "Nomnoml", krokiBlockName: "nomnoml", obsidianBlockName: "nomnoml", description: "", url: "https://github.com/skanaar/nomnoml", enabled: true },
		{ prettyName: "Pikchr", krokiBlockName: "pikchr", obsidianBlockName: "pikchr", description: "", url: "https://github.com/drhsqlite/pikchr", enabled: true },
		{ prettyName: "PlantUML", krokiBlockName: "plantuml", obsidianBlockName: "plantuml", description: "", url: "https://github.com/plantuml/plantuml", enabled: false },
		{ prettyName: "Structurizr", krokiBlockName: "structurizr", obsidianBlockName: "structurizr", description: "", url: "https://structurizr.com/", enabled: true },
		{ prettyName: "Svgbob", krokiBlockName: "svgbob", obsidianBlockName: "svgbob", description: "", url: "https://github.com/ivanceras/svgbob", enabled: true },
		{ prettyName: "UMlet", krokiBlockName: "umlet", obsidianBlockName: "umlet", description: "", url: "https://github.com/umlet/umlet", enabled: true },
		{ prettyName: "Vega", krokiBlockName: "vega", obsidianBlockName: "vega", description: "", url: "https://github.com/vega/vega", enabled: true },
		{ prettyName: "Vega-Lite", krokiBlockName: "vegalite", obsidianBlockName: "vegalite", description: "", url: "https://github.com/vega/vega-lite", enabled: true },
		{ prettyName: "D2", krokiBlockName: "d2", obsidianBlockName: "d2", description: "", url: "https://github.com/terrastruct/d2", enabled: true },
		{ prettyName: "WireViz", krokiBlockName: "wireviz", obsidianBlockName: "wireviz", description: "", url: "https://github.com/formatc1702/WireViz", enabled: true },
		{ prettyName: "WaveDrom", krokiBlockName: "wavedrom", obsidianBlockName: "wavedrom", description: "", url: "https://github.com/wavedrom/wavedrom", enabled: true },
		{ prettyName: "DBML", krokiBlockName: "dbml", obsidianBlockName: "dbml", description: "", url: "https://github.com/softwaretechnik-berlin/dbml-renderer", enabled: true },
		{ prettyName: "Symbolator", krokiBlockName: "symbolator", obsidianBlockName: "symbolator", description: "", url: "https://github.com/kevinpt/symbolator", enabled: true },
		{ prettyName: "TikZ", krokiBlockName: "tikz", obsidianBlockName: "tikz", description: "", url: "https://github.com/pgf-tikz/pgf", enabled: true },
	],
};

const INCLUDE_KEYWORD = "@from_file:";

/**
 * Diagram types that accept a `header` prepended to the source.
 *
 * Each type gets its OWN header text input in settings (`settings.headers[kroki]`).
 * They cannot share one text because each language's "valid header" syntax is
 * different — a PlantUML `!include` is a syntax error in Mermaid, a Mermaid
 * `%%{init: …}%%` directive is a syntax error in PlantUML, etc.
 *
 * Every diagram type not listed here ignores the header machinery entirely:
 * JSON / XML formats (`vega`, `vegalite`, `wavedrom`, `excalidraw`,
 * `diagramsnet`, `bpmn`, `umlet`) reject anything before the root element;
 * DSL formats (`graphviz`, `d2`, `dbml`, `erd`, `pikchr`, `nomnoml`, `svgbob`,
 * `ditaa`, `wireviz`, `symbolator`, `tikz`, the `*diag` family, …) throw a
 * parse error on stray tokens above the diagram body.
 */
interface HeaderTypeSpec {
	/** Placeholder text shown in the empty textarea — also serves as an example. */
	example: string;
	/** One-line description shown under the input. */
	help: string;
}

/** Keyed by `krokiBlockName`. Only the listed types get a header input in their settings card. */
const HEADER_SUPPORTED_TYPES = new Map<string, HeaderTypeSpec>([
	[
		"plantuml",
		{
			example: "!theme cerulean\nskinparam monochrome true",
			help: "PlantUML directives prepended to every PlantUML diagram (e.g. !include, !theme, skinparam). Kroki accepts PlantUML without explicit @startuml/@enduml markers, so the header sits at the top.",
		},
	],
	[
		"c4plantuml",
		{
			example: "!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml",
			help: "Same syntax as PlantUML — typically an !include of one of the C4-PlantUML library files.",
		},
	],
	[
		"structurizr",
		{
			example: "!constant ORGANIZATION_NAME \"Acme Corp\"",
			help: "Structurizr DSL !include / !constant directives. These must appear above the workspace { … } block, which prepending naturally does.",
		},
	],
	[
		"mermaid",
		{
			example: "%%{init: { 'theme': 'dark' } }%%",
			help: "Only %%{init: { … }}%% configuration / theme directives are valid here — anything else will break the diagram. Note: the default obsidianBlockName for Mermaid clashes with Obsidian's built-in renderer; rename to e.g. `kroki-mermaid` to use this.",
		},
	],
]);

/**
 * Kroki diagram types (by `krokiBlockName`) for which the `/png/` endpoint
 * returns 404/400 — verified against the live `kroki.io` support matrix and
 * by probing each endpoint. We omit the PNG download link for these to avoid
 * pointing users at a broken URL.
 */
const PNG_UNSUPPORTED_TYPES = new Set<string>([
	"bpmn",
	"bytefield",
	"d2",
	"dbml",
	"excalidraw",
	"nomnoml",
	"pikchr",
	"svgbob",
	"symbolator",
	"wavedrom",
]);

export default class KrokiPlugin extends Plugin {
	settings: KrokiSettings;

	/** Compress + base64-url-encode diagram source per https://docs.kroki.io/kroki/setup/encode-diagram/ */
	private encodeDiagram(source: string): string {
		const compressed = deflate(new TextEncoder().encode(source), { level: 9 });
		// Build the binary string in chunks so a large diagram doesn't blow the call stack
		// (`String.fromCharCode(...hugeArray)` / `btoa(...)` would otherwise overflow).
		let binary = "";
		const chunkSize = 0x8000;
		for (let i = 0; i < compressed.length; i += chunkSize) {
			binary += String.fromCharCode(...Array.from(compressed.subarray(i, i + chunkSize)));
		}
		return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_");
	}

	/** Resolve a `@from_file:<vault-relative path>` include, or return the source unchanged. */
	private async resolveSource(source: string): Promise<string> {
		const trimmed = source.trimStart();
		if (!trimmed.startsWith(INCLUDE_KEYWORD)) {
			return source;
		}
		const path = trimmed.slice(INCLUDE_KEYWORD.length).split("\n")[0].trim();
		const file = this.app.vault.getAbstractFileByPath(path);
		if (!(file instanceof TFile)) {
			throw new Error(`Kroki: included file not found: ${path}`);
		}
		return this.app.vault.cachedRead(file);
	}

	private svgProcessor = async (krokiType: string, rawSource: string, el: HTMLElement): Promise<void> => {
		const fig = el.createDiv({ cls: "kroki-diagram" });
		if (this.settings.whiteBackground) {
			fig.addClass("kroki-bg-white");
		}

		let source: string;
		try {
			source = await this.resolveSource(rawSource);
		} catch (e) {
			fig.createDiv({ cls: "kroki-error", text: (e as Error).message });
			return;
		}

		const headerText = this.settings.headers[krokiType] ?? "";
		if (headerText.trim().length > 0) {
			source = headerText + "\n" + source;
		}
		source = source.replace(/&nbsp;/gi, " ");

		const encoded = this.encodeDiagram(source);
		const base = this.settings.server_url + krokiType;
		const svgUrl = `${base}/svg/${encoded}`;
		const pngUrl = `${base}/png/${encoded}`;

		let rendered = false;
		let krokiError: string | null = null;
		if (!Platform.isMobile) {
			try {
				const text = await request({ url: svgUrl, method: "GET" });
				const doc = new DOMParser().parseFromString(text, "image/svg+xml");
				if (!doc.querySelector("parsererror") && doc.documentElement.tagName.toLowerCase() === "svg") {
					// Inline SVG preserves clickable <a xlink:href> links / imagemaps inside the diagram.
					// `activeDocument` (Obsidian global) follows popout windows — see settings tab below.
					fig.appendChild(activeDocument.importNode(doc.documentElement, true));
					rendered = true;
				} else {
					// Non-SVG body — most often Kroki returned the syntax error as plaintext.
					krokiError = text.trim().slice(0, 4000);
				}
			} catch {
				/* network/parse failure with no usable body — fall through to <img> */
			}
		}
		if (!rendered) {
			if (krokiError !== null) {
				fig.createDiv({ cls: "kroki-error", text: krokiError });
			} else {
				fig.createEl("img", { attr: { src: svgUrl, alt: "Kroki diagram" } });
			}
		}

		const actions = el.createDiv({ cls: "kroki-actions" });
		// PNG download is only offered for types whose /png/ endpoint actually works
		// on Kroki — see PNG_UNSUPPORTED_TYPES. The Edit link uses the SVG URL since
		// niolesk decodes the source from the encoded fragment regardless of format,
		// and SVG is the one URL that's valid for every Kroki diagram type.
		if (!PNG_UNSUPPORTED_TYPES.has(krokiType)) {
			actions.createEl("a", { text: "PNG", href: pngUrl, attr: { download: "" } });
		}
		actions.createEl("a", { text: "Edit", href: `https://niolesk.top/#${svgUrl}` });
	};

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new KrokiSettingsTab(this.app, this));

		// Register a code-block processor for each enabled diagram type.
		for (const diagramType of this.settings.diagramTypes) {
			if (!diagramType.enabled) {
				continue;
			}
			this.registerMarkdownCodeBlockProcessor(diagramType.obsidianBlockName, (source, el) =>
				// the kroki block name is what the URL is built from, so pass that one
				this.svgProcessor(diagramType.krokiBlockName, source, el),
			);
		}
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		// `Object.assign` is shallow; if data.json was from a 1.2.x install it
		// won't carry a `headers` object at all, and the spread above won't fix that.
		if (!this.settings.headers || typeof this.settings.headers !== "object") {
			this.settings.headers = {};
		}
		// Migrate the legacy single `header` field (1.2.x and the upstream
		// obsidian-plantuml plugin) into `headers.plantuml`, where it was
		// almost certainly meant to land.
		const legacy = this.settings.header;
		if (typeof legacy === "string" && legacy.length > 0 && !this.settings.headers.plantuml) {
			this.settings.headers.plantuml = legacy;
		}
		// Don't keep the legacy field around — drop it so the next save is clean.
		delete this.settings.header;
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}

class KrokiSettingsTab extends PluginSettingTab {
	plugin: KrokiPlugin;

	constructor(app: App, plugin: KrokiPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	private linkFragment(url: string): DocumentFragment {
		// `activeDocument` (Obsidian-provided) tracks the currently-focused window, so the
		// fragment still works when the settings tab is hosted in a popout.
		const fragment = activeDocument.createDocumentFragment();
		fragment.createEl("a", { text: url, href: url });
		return fragment;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		// Obsidian's settings guide recommends skipping a "General" heading at the top —
		// the first rows just sit directly under the tab title.

		new Setting(containerEl)
			.setName("Server URL")
			.setDesc("Kroki server URL")
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.server_url)
					.setValue(this.plugin.settings.server_url)
					.onChange(async (value) => {
						this.plugin.settings.server_url = ensureTrailingSlash(value);
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("White background")
			.setDesc("Render diagrams on a white background — helps with transparent SVGs on dark themes.")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.whiteBackground).onChange(async (value) => {
					this.plugin.settings.whiteBackground = value;
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName("Diagram types")
			.setDesc(
				"Enable each diagram type and, if needed, change the code-block language used for it. Types that accept a header (PlantUML, C4-PlantUML, Structurizr, Mermaid) show a header input inside their card. Changes take effect after Obsidian reloads.",
			)
			.setHeading();

		for (const diagramType of this.plugin.settings.diagramTypes) {
			const card = new Setting(containerEl)
				.setName(diagramType.prettyName)
				.setDesc(this.linkFragment(diagramType.url))
				.addToggle((toggle) =>
					toggle.setValue(diagramType.enabled).onChange(async (value) => {
						diagramType.enabled = value;
						await this.plugin.saveSettings();
					}),
				)
				.addText((text) =>
					text.setValue(diagramType.obsidianBlockName).onChange(async (value) => {
						diagramType.obsidianBlockName = value;
						await this.plugin.saveSettings();
					}),
				);

			const headerSpec = HEADER_SUPPORTED_TYPES.get(diagramType.krokiBlockName);
			if (headerSpec) {
				// Mark the card so styles.css can flex-wrap and let the row below sit full-width.
				card.settingEl.addClass("kroki-with-header");
				const row = card.settingEl.createDiv({ cls: "kroki-header-row" });
				row.createDiv({ cls: "kroki-header-label", text: `Header — ${headerSpec.help}` });
				const ta = row.createEl("textarea", {
					cls: "kroki-header-textarea",
					attr: { placeholder: headerSpec.example, rows: "3", spellcheck: "false" },
				});
				ta.value = this.plugin.settings.headers[diagramType.krokiBlockName] ?? "";
				ta.addEventListener("input", () => {
					// `addEventListener` expects a `void`-returning callback. Kick the save off
					// without awaiting it so we don't hand the DOM a dangling Promise.
					void (async () => {
						this.plugin.settings.headers[diagramType.krokiBlockName] = ta.value;
						await this.plugin.saveSettings();
					})();
				});
			}
		}
	}
}

function ensureTrailingSlash(url: string): string {
	return url.endsWith("/") ? url : `${url}/`;
}
