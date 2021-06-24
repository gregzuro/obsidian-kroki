import {App, MarkdownPostProcessorContext, Plugin, PluginSettingTab, Setting} from 'obsidian';

import * as pako from 'pako';

interface KrokiSettings {
    server_url: string,
    header: string;
    diagramTypes: {
        prettyName: string;
        blockName: string;
        description: string;
        enabled: boolean;
    }[]
}

const DEFAULT_SETTINGS: KrokiSettings = {
    server_url: 'https://kroki.io/',
    header: '',
    diagramTypes: [
        {prettyName: "BlockDiag", blockName: "blockdiag", description: "https://github.com/blockdiag/blockdiag", enabled: true},
        {prettyName: "BPMN", blockName: "bpmn", description: "https://github.com/bpmn-io/bpmn-js", enabled: true},
        {prettyName: "Bytefield", blockName: "bytefield", description: "https://github.com/Deep-Symmetry/bytefield-svg/", enabled: true},
        {prettyName: "SeqDiag", blockName: "seqdiag", description: "https://github.com/blockdiag/seqdiag", enabled: true},
        {prettyName: "ActDiag", blockName: "actdiag", description: "https://github.com/blockdiag/actdiag", enabled: true},
        {prettyName: "NwDiag", blockName: "nwdiag", description: "https://github.com/blockdiag/nwdiag", enabled: true},
        {prettyName: "PacketDiag", blockName: "packetdiag", description: "https://github.com/blockdiag/nwdiag", enabled: true},
        {prettyName: "RackDiag", blockName: "rackdiag", description: "https://github.com/blockdiag/nwdiag", enabled: true},
        {prettyName: "C4 with PlantUML", blockName: "c4plantuml", description: "https://github.com/RicardoNiepel/C4-PlantUML", enabled: true},
        {prettyName: "Ditaa", blockName: "ditaa", description: "http://ditaa.sourceforge.net/", enabled: true},
        {prettyName: "Erd", blockName: "erd", description: "https://github.com/BurntSushi/erd", enabled: true},
        {prettyName: "Excalidraw", blockName: "excalidraw", description: "https://github.com/excalidraw/excalidraw", enabled: true},
        {prettyName: "GraphViz", blockName: "graphviz", description: "https://www.graphviz.org/", enabled: true},
        {prettyName: "Mermaid", blockName: "mermaid", description: "https://github.com/knsv/mermaid", enabled: false},
        {prettyName: "Nomnoml", blockName: "nomnoml", description: "https://github.com/skanaar/nomnoml", enabled: true},
        {prettyName: "Pikchr", blockName: "pikchr", description: "https://github.com/drhsqlite/pikchr", enabled: true},
        {prettyName: "PlantUML", blockName: "plantuml", description: "https://github.com/plantuml/plantuml", enabled: false},
        {prettyName: "Svgbob", blockName: "svgbob", description: "https://github.com/ivanceras/svgbob", enabled: true},
        {prettyName: "UMlet", blockName: "umlet", description: "https://github.com/umlet/umlet", enabled: true},
        {prettyName: "Vega", blockName: "vega", description: "https://github.com/vega/vega", enabled: true},
        {prettyName: "Vega-Lite", blockName: "vegalite", description: "https://github.com/vega/vega-lite", enabled: true},
        {prettyName: "WaveDrom", blockName: "wavedrom", description: "https://github.com/wavedrom/wavedrom", enabled: true}
    ]

}

export default class KrokiPlugin extends Plugin {
    settings: KrokiSettings;

    svgProcessor = async (diagType: string, source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        const dest = document.createElement('img');
        const urlPrefix = this.settings.server_url + diagType + "/svg/";
        source = source.replace(/&nbsp;/gi, " ");

        // encode the source 
        // https://docs.kroki.io/kroki/setup/encode-diagram/#nodejs
        const data = Buffer.from(source, 'utf8');
        const compressed = pako.deflate(data, { level: 9 });
        const encodedSource = Buffer.from(compressed)
          .toString('base64')
          .replace(/\+/g, '-').replace(/\//g, '_');

        // create the URL
        dest.src = urlPrefix + encodedSource;

        el.appendChild(dest);
    };

    async onload(): Promise<void> { 
        console.log('loading plugin kroki');
        await this.loadSettings();

        this.addSettingTab(new KrokiSettingsTab(this.app, this));

        // register a processor for each of the enabled diagram types
        for (let diagramType of this.settings.diagramTypes) {
            if (diagramType.enabled === true) {
                console.log("kroki is     enabling: " + diagramType.blockName)
                this.registerMarkdownCodeBlockProcessor(diagramType.blockName,
                    async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
                        this.svgProcessor(diagramType.blockName, source, el, _)
                    })
            } else {
                console.log("kroki is not enabling:", diagramType.blockName)
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

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        new Setting(containerEl).setName("Server URL")
            .setDesc("Kroki Server URL")
            .addText(text => text.setPlaceholder(DEFAULT_SETTINGS.server_url)
                .setValue(this.plugin.settings.server_url)
                .onChange(async (value) => {
                        this.plugin.settings.server_url = value;
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
    }
}
