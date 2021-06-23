import {App, MarkdownPostProcessorContext, Plugin, PluginSettingTab, Setting} from 'obsidian';

import * as pako from 'pako';

interface KrokiSettings {
    server_url: string,
    header: string;
}

const DEFAULT_SETTINGS: KrokiSettings = {
    server_url: 'https://kroki.io/',
    header: ''
}

export default class KrokiPlugin extends Plugin {
    settings: KrokiSettings;

    diagrams = [
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
    ];

    svgProcessor = async (diagType: string, source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        const dest = document.createElement('img');
        const prefix = this.settings.server_url + diagType + "/svg/";
        source = source.replace(/&nbsp;/gi, " ");

        // https://docs.kroki.io/kroki/setup/encode-diagram/#nodejs
        const data = Buffer.from(source, 'utf8');
        const compressed = pako.deflate(data, { level: 9 });
        const encoded = Buffer.from(compressed)
          .toString('base64')
          .replace(/\+/g, '-').replace(/\//g, '_');

        dest.src = prefix + encoded;
        console.log(dest.src)


        el.appendChild(dest);
    };

    blockdiagProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.svgProcessor("blockdiag", source, el, _)
    }
    bpmnProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.svgProcessor("bpmn", source, el, _)
    }
    bytefieldProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.svgProcessor("bytefield", source, el, _)
    }
    seqdiagProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.svgProcessor("seqdiag", source, el, _)
    }
    actdiagProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.svgProcessor("actdiag", source, el, _)
    }
    nwdiagProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.svgProcessor("nwdiag", source, el, _)
    }
    packetdiagProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.svgProcessor("packetdiag", source, el, _)
    }
    rackdiagProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.svgProcessor("rackdiag", source, el, _)
    }
    c4plantumlProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.svgProcessor("c4plantuml", source, el, _)
    }
    ditaaProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.svgProcessor("ditaa", source, el, _)
    }
    erdProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.svgProcessor("erd", source, el, _)
    }
    excalidrawProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.svgProcessor("excalidraw", source, el, _)
    }
    graphvizProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.svgProcessor("graphviz", source, el, _)
    }
    mermaidProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.svgProcessor("mermaid", source, el, _)
    }
    nomnomlProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.svgProcessor("nomnoml", source, el, _)
    }
    pikchrProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.svgProcessor("pikchr", source, el, _)
    }
    plantumlProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.svgProcessor("plantuml", source, el, _)
    }
    svgbobProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.svgProcessor("svgbob", source, el, _)
    }
    umletProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.svgProcessor("umlet", source, el, _)
    }
    vegaProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.svgProcessor("vega", source, el, _)
    }
    vegaliteProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.svgProcessor("vegalite", source, el, _)
    }
    wavedromProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.svgProcessor("wavedrom", source, el, _)
    }

    async onload(): Promise<void> {
        console.log('loading plugin kroki');
        await this.loadSettings();
        this.addSettingTab(new KrokiSettingsTab(this.app, this));
        this.registerMarkdownCodeBlockProcessor("blockdiag", this.blockdiagProcessor);
        this.registerMarkdownCodeBlockProcessor("bpmn", this.bpmnProcessor);
        this.registerMarkdownCodeBlockProcessor("bytefield", this.bytefieldProcessor);
        this.registerMarkdownCodeBlockProcessor("seqdiag", this.seqdiagProcessor);
        this.registerMarkdownCodeBlockProcessor("actdiag", this.actdiagProcessor);
        this.registerMarkdownCodeBlockProcessor("nwdiag", this.nwdiagProcessor);
        this.registerMarkdownCodeBlockProcessor("packetdiag", this.packetdiagProcessor);
        this.registerMarkdownCodeBlockProcessor("rackdiag", this.rackdiagProcessor);
        this.registerMarkdownCodeBlockProcessor("c4plantuml", this.c4plantumlProcessor);
        this.registerMarkdownCodeBlockProcessor("ditaa", this.ditaaProcessor);
        this.registerMarkdownCodeBlockProcessor("erd", this.erdProcessor);
        this.registerMarkdownCodeBlockProcessor("excalidraw", this.excalidrawProcessor);
        this.registerMarkdownCodeBlockProcessor("graphviz", this.graphvizProcessor);
        this.registerMarkdownCodeBlockProcessor("mermaid", this.mermaidProcessor);
        this.registerMarkdownCodeBlockProcessor("nomnoml", this.nomnomlProcessor);
        this.registerMarkdownCodeBlockProcessor("pikchr", this.pikchrProcessor);
        this.registerMarkdownCodeBlockProcessor("plantuml", this.plantumlProcessor);
        this.registerMarkdownCodeBlockProcessor("svgbob", this.svgbobProcessor);
        this.registerMarkdownCodeBlockProcessor("umlet", this.umletProcessor);
        this.registerMarkdownCodeBlockProcessor("vega", this.vegaProcessor);
        this.registerMarkdownCodeBlockProcessor("vegalite", this.vegaliteProcessor);
        this.registerMarkdownCodeBlockProcessor("wavedrom", this.wavedromProcessor);
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
