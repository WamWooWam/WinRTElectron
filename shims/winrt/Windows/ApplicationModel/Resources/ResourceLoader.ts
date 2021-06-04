
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { Uri } from "../../Foundation/Uri";
import { Package } from "../Package";
import deepRename from "deep-rename-keys"
import { NumeralSystemIdentifiers } from "../../Globalization/NumeralSystemIdentifiers";
import { getCurrentPackageName } from "../../Foundation/Interop/Utils";

const path = require('path');
const fs = require('fs');
const { remote } = require("electron");

const supportedLanguages = ["en-gb", "en-us", "en", "scale-100", "generic"]; // this should be detected from the system. KEEP IN SYNC WITH index.ts!!

export class ResourceLoader {
    private static loader: ResourceLoader;

    private name: string;
    private packageName: string;
    private languages: Map<string, any>;

    constructor(name: string, packageName: string = null) {
        this.languages = new Map();
        this.name = name !== undefined ? name : "resources";
        this.packageName = packageName ?? getCurrentPackageName();
        this.init();
    }

    private init() {
        let basePath = path.join(remote.app.getAppPath(), "packages", this.packageName ?? Package.current.id.name, "resources");

        for (const language of supportedLanguages) {
            let filePath = path.join(basePath, language + ".json");
            if (fs.existsSync(filePath)) {
                const resourcesJson = fs.readFileSync(filePath, "utf-8");
                const parsedResource = deepRename(JSON.parse(resourcesJson), (k: string) => k.toLowerCase());
                this.languages.set(language, parsedResource);
            }
        }
    }

    getString(resource: string): string {
        let splits = resource.toLowerCase().split("/");
        let name = splits[splits.length - 1];
        let subsplits = splits.slice(0, splits.length - 1);
        let string = null;

        if(subsplits.length == 0) {
            subsplits.push(this.name ?? "resources");
        }

        for (const language of this.languages) {
            if (string != null)
                break;

            let json = language[1];
            for (const split of subsplits) {
                if (json === undefined || split == null || split == "")
                    continue;

                json = json[split];
            }

            if (json === undefined)
                continue;

            string = json[name];
        }

        console.debug(`ResourceLoader:got string ${string} for ${resource}`);
        return string;
    }

    getStringForUri(uri: Uri): string {
        if (uri.schemeName != "ms-resource:")
            return null;

        let path = uri.path;
        if (!path.startsWith("/"))
            path = "/resources/" + path;

        return this.getString(path);
    }

    static getForCurrentView(): ResourceLoader {
        if (ResourceLoader.loader === undefined) {
            ResourceLoader.loader = new ResourceLoader("Resources");
        }

        return ResourceLoader.loader;
    }

    static getForCurrentViewWithName(name: string): ResourceLoader {
        return new ResourceLoader(name);
    }

    static getForViewIndependentUse(): ResourceLoader {
        if (ResourceLoader.loader === undefined) {
            ResourceLoader.loader = new ResourceLoader("Resources");
        }

        return ResourceLoader.loader;
    }

    static getForViewIndependentUseWithName(name: string): ResourceLoader {
        return new ResourceLoader(name);
    }

    static getStringForReference(uri: Uri): string {
        throw new Error('ResourceLoader#getStringForReference not implemented')
    }
}
