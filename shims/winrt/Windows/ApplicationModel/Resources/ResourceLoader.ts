
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { Uri } from "../../Foundation/Uri";
import { Package } from "../Package";
import deepRename from "deep-rename-keys"
import { NumeralSystemIdentifiers } from "../../Globalization/NumeralSystemIdentifiers";
import { getCurrentPackageName } from "../../Foundation/Interop/Utils";
import { ResourceContext } from "./Core/ResourceContext";
import { ResourceMap } from "./Core/ResourceMap";

const path = require('path');
const fs = require('fs');
const { remote } = require("electron");

const supportedLanguages = ["en-gb", "en-us", "en", "scale-100", "generic"]; // this should be detected from the system. KEEP IN SYNC WITH index.ts!!

export class ResourceLoader {
    private static loader: ResourceLoader;

    private name: string;
    private packageName: string;
    private languages: Map<string, any>;

    private __resourceMap : ResourceMap;

    constructor(name: string, packageName: string = null) {
        this.languages = new Map();
        this.name = !!name ? name : "resources";
        this.packageName = packageName ?? Package.current.id.name;
        this.__resourceMap = new ResourceMap(null, this.name);
    }

    getString(resource: string): string {
        return this.__resourceMap.getValue(resource).valueAsString;
    }

    getStringForUri(uri: Uri): string {
        return this.__resourceMap.getValue(uri.toString()).valueAsString;
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
