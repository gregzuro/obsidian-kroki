import {App, MarkdownPostProcessorContext, Plugin, PluginSettingTab, Setting, ToggleComponent} from 'obsidian';

import * as pako from 'pako';

interface KrokiSettings {
    server_url: string,
    header: string;
    diagramTypes: {
        prettyName: string;
        blockName: string;
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
        {prettyName: "BlockDiag", blockName: "blockdiag", description: "block diag !!", url: "https://github.com/blockdiag/blockdiag", enabled: true, toggle: null},
        {prettyName: "BPMN", blockName: "bpmn", description: "", url: "https://github.com/bpmn-io/bpmn-js", enabled: true, toggle: null},
        {prettyName: "Bytefield", blockName: "bytefield", description: "", url: "https://github.com/Deep-Symmetry/bytefield-svg/", enabled: true, toggle: null},
        {prettyName: "SeqDiag", blockName: "seqdiag", description: "", url: "https://github.com/blockdiag/seqdiag", enabled: true, toggle: null},
        {prettyName: "ActDiag", blockName: "actdiag", description: "", url: "https://github.com/blockdiag/actdiag", enabled: true, toggle: null},
        {prettyName: "NwDiag", blockName: "nwdiag", description: "Nw Diag !!!", url: "https://github.com/blockdiag/nwdiag", enabled: true, toggle: null},
        {prettyName: "PacketDiag", blockName: "packetdiag", description: "", url: "https://github.com/blockdiag/nwdiag", enabled: true, toggle: null},
        {prettyName: "RackDiag", blockName: "rackdiag", description: "", url: "https://github.com/blockdiag/nwdiag", enabled: true, toggle: null},
        {prettyName: "C4 with PlantUML", blockName: "c4plantuml", description: "", url: "https://github.com/RicardoNiepel/C4-PlantUML", enabled: true, toggle: null},
        {prettyName: "Ditaa", blockName: "ditaa", description: "", url: "http://ditaa.sourceforge.net/", enabled: true, toggle: null},
        {prettyName: "Erd", blockName: "erd", description: "", url: "https://github.com/BurntSushi/erd", enabled: true, toggle: null},
        {prettyName: "Excalidraw", blockName: "excalidraw", description: "", url: "https://github.com/excalidraw/excalidraw", enabled: true, toggle: null},
        {prettyName: "GraphViz", blockName: "graphviz", description: "", url: "https://www.graphviz.org/", enabled: true, toggle: null},
        {prettyName: "Mermaid", blockName: "mermaid", description: "", url: "https://github.com/knsv/mermaid", enabled: false, toggle: null},
        {prettyName: "Nomnoml", blockName: "nomnoml", description: "", url: "https://github.com/skanaar/nomnoml", enabled: true, toggle: null},
        {prettyName: "Pikchr", blockName: "pikchr", description: "", url: "https://github.com/drhsqlite/pikchr", enabled: true, toggle: null},
        {prettyName: "PlantUML", blockName: "plantuml", description: "", url: "https://github.com/plantuml/plantuml", enabled: false, toggle: null},
        {prettyName: "Svgbob", blockName: "svgbob", description: "", url: "https://github.com/ivanceras/svgbob", enabled: true, toggle: null},
        {prettyName: "UMlet", blockName: "umlet", description: "", url: "https://github.com/umlet/umlet", enabled: true, toggle: null},
        {prettyName: "Vega", blockName: "vega", description: "", url: "https://github.com/vega/vega", enabled: true, toggle: null},
        {prettyName: "Vega-Lite", blockName: "vegalite", description: "", url: "https://github.com/vega/vega-lite", enabled: true, toggle: null},
        {prettyName: "WaveDrom", blockName: "wavedrom", description: "", url: "https://github.com/wavedrom/wavedrom", enabled: true, toggle: null}
    ]

}

function textEncode(str: string) {
    var utf8 = unescape(encodeURIComponent(str));
    var result = new Uint8Array(utf8.length);
    for (var i = 0; i < utf8.length; i++) {
      result[i] = utf8.charCodeAt(i);
    }
    return result;
  }
export default class KrokiPlugin extends Plugin {
    settings: KrokiSettings;

    svgProcessor = async (diagType: string, source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
        const dest = document.createElement('img');
        const urlPrefix = this.settings.server_url + diagType + "/svg/";
        source = source.replace(/&nbsp;/gi, " ");

        // encode the source 
        // per: https://docs.kroki.io/kroki/setup/encode-diagram/#javascript '-ish'
        const data = textEncode(source);
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
                console.log("kroki is     enabling: " + diagramType.prettyName);
                this.registerMarkdownCodeBlockProcessor(diagramType.blockName,
                    (source: string, el: HTMLElement, _: MarkdownPostProcessorContext) => {
                        this.svgProcessor(diagramType.blockName, source, el, _)
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
        fragment.append("Use `");
        fragment.append(blockName);
        fragment.append("`. ");
        fragment.append("More info: ");
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

            this.containerEl.createEl("h3", {
                text: "Diagram Types (changes require a re-load)",
            });
    
        // loop through all the diagram types
        for (var i=0; i<this.plugin.settings.diagramTypes.length; i++){
            let diagramType = this.plugin.settings.diagramTypes[i];
            new Setting(containerEl)
            .setName(diagramType.prettyName)
            .setDesc(this.diagramTypeUrl(diagramType.blockName, diagramType.url))
            .addToggle((t) => {
                t.setValue(diagramType.enabled);
                t.onChange(async (v) => {
                    // figure out which one has changed
                    for (var j=0; j<this.plugin.settings.diagramTypes.length; j++){
                        let diagramType = this.plugin.settings.diagramTypes[j];
                        if (diagramType.enabled != diagramType.toggle.getValue()) {
                            if (diagramType.toggle.getValue() === true) {
                                console.log("kroki is     enabling:", diagramType.prettyName)
                            } else {
                                console.log("kroki is    disabling:", diagramType.prettyName)
                            }
                        // change the setting
                        diagramType.enabled = diagramType.toggle.getValue();
                        await this.plugin.saveSettings();
                        }
                    }
                });
                // save the control for this diagram along with the diagram's other data
                diagramType.toggle = t;
            }); 
        }
    }
}
