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
        this.pngProcessor("blockdiag", source, el, _)
    }
    bpmnProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.pngProcessor("bpmn", source, el, _)
    }
    bytefieldProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.pngProcessor("bytefield", source, el, _)
    }
    seqdiagProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.pngProcessor("seqdiag", source, el, _)
    }
    actdiagProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.pngProcessor("actdiag", source, el, _)
    }
    nwdiagProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.pngProcessor("nwdiag", source, el, _)
    }
    packetdiagProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.pngProcessor("packetdiag", source, el, _)
    }
    rackdiagProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.pngProcessor("rackdiag", source, el, _)
    }
    c4plantumlProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.pngProcessor("c4plantuml", source, el, _)
    }
    ditaaProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.pngProcessor("ditaa", source, el, _)
    }
    erdProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.pngProcessor("erd", source, el, _)
    }
    excalidrawProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.pngProcessor("excalidraw", source, el, _)
    }
    graphvizProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.pngProcessor("graphviz", source, el, _)
    }
    mermaidProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.pngProcessor("mermaid", source, el, _)
    }
    nomnomlProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.pngProcessor("nomnoml", source, el, _)
    }
    pikchrProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.pngProcessor("pikchr", source, el, _)
    }
    plantumlProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.pngProcessor("plantuml", source, el, _)
    }
    svgbobProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.pngProcessor("svgbob", source, el, _)
    }
    vegaProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.pngProcessor("vega", source, el, _)
    }
    vegaliteProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.pngProcessor("vegalite", source, el, _)
    }
    wavedromProcessor = async (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        this.pngProcessor("wavedrom", source, el, _)
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
