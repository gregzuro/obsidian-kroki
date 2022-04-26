import {App, MarkdownPostProcessorContext, Plugin, PluginSettingTab, Setting, ToggleComponent} from 'obsidian';

import * as pako from 'pako';

interface KrokiSettings {
    server_url: string,
    header: string;
    diagramTypes: {
        prettyName: string;
        krokiBlockName: string;
        obsidianBlockName: string;
        description: string;
        url: string;
        enabled: boolean;
        toggle: ToggleComponent;
    }[]
}

const DEFAULT_SETTINGS: KrokiSettings = {
    server_url: 'https://kroki.io/',
    header: '',
    diagramTypes: [
        {prettyName: "BlockDiag", krokiBlockName: "blockdiag", obsidianBlockName: "blockdiag", description: "block diag !!", url: "https://github.com/blockdiag/blockdiag", enabled: true, toggle: null},
        {prettyName: "BPMN", krokiBlockName: "bpmn", obsidianBlockName: "bpmn", description: "", url: "https://github.com/bpmn-io/bpmn-js", enabled: true, toggle: null},
        {prettyName: "Bytefield", krokiBlockName: "bytefield", obsidianBlockName: "bytefield", description: "", url: "https://github.com/Deep-Symmetry/bytefield-svg/", enabled: true, toggle: null},
        {prettyName: "SeqDiag", krokiBlockName: "seqdiag", obsidianBlockName: "seqdiag", description: "", url: "https://github.com/blockdiag/seqdiag", enabled: true, toggle: null},
        {prettyName: "ActDiag", krokiBlockName: "actdiag", obsidianBlockName: "actdiag", description: "", url: "https://github.com/blockdiag/actdiag", enabled: true, toggle: null},
        {prettyName: "NwDiag", krokiBlockName: "nwdiag", obsidianBlockName: "nwdiag", description: "Nw Diag !!!", url: "https://github.com/blockdiag/nwdiag", enabled: true, toggle: null},
        {prettyName: "PacketDiag", krokiBlockName: "packetdiag", obsidianBlockName: "packetdiag", description: "", url: "https://github.com/blockdiag/nwdiag", enabled: true, toggle: null},
        {prettyName: "RackDiag", krokiBlockName: "rackdiag", obsidianBlockName: "rackdiag", description: "", url: "https://github.com/blockdiag/nwdiag", enabled: true, toggle: null},
        {prettyName: "C4 with PlantUML", krokiBlockName: "c4plantuml", obsidianBlockName: "c4plantuml", description: "", url: "https://github.com/RicardoNiepel/C4-PlantUML", enabled: true, toggle: null},
        {prettyName: "Ditaa", krokiBlockName: "ditaa", obsidianBlockName: "ditaa", description: "", url: "http://ditaa.sourceforge.net/", enabled: true, toggle: null},
        {prettyName: "Erd", krokiBlockName: "erd", obsidianBlockName: "erd", description: "", url: "https://github.com/BurntSushi/erd", enabled: true, toggle: null},
        {prettyName: "Excalidraw", krokiBlockName: "excalidraw", obsidianBlockName: "excalidraw", description: "", url: "https://github.com/excalidraw/excalidraw", enabled: true, toggle: null},
        {prettyName: "GraphViz", krokiBlockName: "graphviz", obsidianBlockName: "graphviz", description: "", url: "https://www.graphviz.org/", enabled: true, toggle: null},
        {prettyName: "Mermaid", krokiBlockName: "mermaid", obsidianBlockName: "mermaid", description: "", url: "https://github.com/knsv/mermaid", enabled: false, toggle: null},
        {prettyName: "Nomnoml", krokiBlockName: "nomnoml", obsidianBlockName: "nomnoml", description: "", url: "https://github.com/skanaar/nomnoml", enabled: true, toggle: null},
        {prettyName: "Pikchr", krokiBlockName: "pikchr", obsidianBlockName: "pikchr", description: "", url: "https://github.com/drhsqlite/pikchr", enabled: true, toggle: null},
        {prettyName: "PlantUML", krokiBlockName: "plantuml", obsidianBlockName: "plantuml", description: "", url: "https://github.com/plantuml/plantuml", enabled: false, toggle: null},
        {prettyName: "Structurizr", krokiBlockName: "structurizr", obsidianBlockName: "/structurizr", description: "", url: "https://structurizr.com/", enabled: true, toggle: null},
        {prettyName: "Svgbob", krokiBlockName: "svgbob", obsidianBlockName: "svgbob", description: "", url: "https://github.com/ivanceras/svgbob", enabled: true, toggle: null},
        {prettyName: "UMlet", krokiBlockName: "umlet", obsidianBlockName: "umlet", description: "", url: "https://github.com/umlet/umlet", enabled: true, toggle: null},
        {prettyName: "Vega", krokiBlockName: "vega", obsidianBlockName: "vega", description: "", url: "https://github.com/vega/vega", enabled: true, toggle: null},
        {prettyName: "Vega-Lite", krokiBlockName: "vegalite", obsidianBlockName: "vegalite", description: "", url: "https://github.com/vega/vega-lite", enabled: true, toggle: null},
        {prettyName: "WaveDrom", krokiBlockName: "wavedrom", obsidianBlockName: "wavedrom", description: "", url: "https://github.com/wavedrom/wavedrom", enabled: true, toggle: null}
    ]

}

export default class KrokiPlugin extends Plugin {
    settings: KrokiSettings;

    svgProcessor = async (diagType: string, source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        const dest = document.createElement('div');
        const urlPrefix = this.settings.server_url + diagType + "/svg/";
        source = source.replace(/&nbsp;/gi, " ");

        // encode the source 
        // per: https://docs.kroki.io/kroki/setup/encode-diagram/#javascript
        const data = new TextEncoder().encode(source);
        const compressed = pako.deflate(data, { level: 9 });
        const encodedSource = Buffer.from(compressed)
          .toString('base64')
          .replace(/\+/g, '-').replace(/\//g, '_');

        const img = document.createElement("img");
        img.src = urlPrefix + encodedSource;
        img.useMap = "#" + encodedSource;

        const result = await fetch(urlPrefix + encodedSource, {
            method: "GET"
        });

        if(result.ok) {
            dest.innerHTML = await result.text();
            dest.children[0].setAttr("name", encodedSource);
        }
        el.appendChild(dest);
    };

    async onload(): Promise<void> { 
        console.log('loading plugin kroki');
        await this.loadSettings();

        this.addSettingTab(new KrokiSettingsTab(this.app, this));

        // register a processor for each of the enabled diagram types
        for (let diagramType of this.settings.diagramTypes) {
            if (diagramType.enabled === true) {
                console.log("kroki is     enabling: " + diagramType.prettyName);
                this.registerMarkdownCodeBlockProcessor(diagramType.obsidianBlockName,
                    (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
                        this.svgProcessor(diagramType.krokiBlockName, source, el, _)  // this name is used to build the url, so it must be the kroki one
                    })
            } else {
                console.log("kroki is not enabling:", diagramType.prettyName);
            }
        }

    }

    onunload() : void {
        console.log('unloading plugin kroki');
    }

    async loadSettings() : Promise<void> {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() : Promise<void> {
        await this.saveData(this.settings);
    }
}

class KrokiSettingsTab extends PluginSettingTab {
    plugin: KrokiPlugin;

    constructor(app: App, plugin: KrokiPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    diagramTypeUrl(blockName: string, url: string) {
        let fragment = document.createDocumentFragment();
        let a = document.createElement('a');
        a.textContent = url
        a.setAttribute("href", url);

        fragment.append(a);
        return fragment;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        this.containerEl.createEl("h3", {
            text: "General",
        });

        new Setting(containerEl).setName("Server URL")
            .setDesc("Kroki Server URL")
            .addText(text => text.setPlaceholder(DEFAULT_SETTINGS.server_url)
                .setValue(this.plugin.settings.server_url)
                .onChange(async (value) => {
                        this.plugin.settings.server_url = ensureTrailingSlash(value);
                        await this.plugin.saveSettings();
                    }
                )
            );
        new Setting(containerEl).setName("Header")
            .setDesc("Included at the head in every diagram. Useful for specifying a common theme (.puml file)")
            .addTextArea(text => {
                    text.setPlaceholder("!include https://raw.githubusercontent.com/....puml\n")
                        .setValue(this.plugin.settings.header)
                        .onChange(async (value) => {
                                this.plugin.settings.header = value;
                                await this.plugin.saveSettings();
                            }
                        )
                    text.inputEl.setAttr("rows", 4);
                    text.inputEl.addClass("settings_area")
                }
            );

            this.containerEl.createEl("h3", {
                text: "Diagram Type (enable and 'language')",
            });
            this.containerEl.createEl("p", {
                text: "Enable each diagram type individually. If there are multiple possible processors for a given type, then you can specify an alternate name for the diagram's 'language'",
            });
            this.containerEl.createEl("p", {
                text: "NB that any changes here will require a re-load before becoming effective.",
            });

        // loop through all the diagram types
        for (var i=0; i<this.plugin.settings.diagramTypes.length; i++){
            let diagramType = this.plugin.settings.diagramTypes[i];
            new Setting(containerEl).setName(diagramType.prettyName)
            .setDesc(this.diagramTypeUrl(diagramType.krokiBlockName, diagramType.url))

            .addToggle((t) => {
                t.setValue(diagramType.enabled);
                t.onChange(async (v) => {
                    diagramType.enabled = v;
                    await this.plugin.saveSettings();
                });
                // save the control for this diagram along with the diagram's other data
                diagramType.toggle = t;
            })

            .addText(text => {
                text.setValue(diagramType.obsidianBlockName)
                    .onChange(async (value) => {
                        diagramType.obsidianBlockName = value;
                        await this.plugin.saveSettings();
                    });
            });
        }
    }
}

function ensureTrailingSlash(url: string) : string {
    if (!url.endsWith('/')) {
        return url + '/';
    }
    return url;
}