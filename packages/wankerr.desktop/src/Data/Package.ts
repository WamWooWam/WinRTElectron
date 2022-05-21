import { PackageApplication, ApplicationVisualElements, ApplicationDefaultTile, ForegroundText, ApplicationSplashScreen } from "./PackageApplication";
import { ResourceLoader } from "winrt/Windows/ApplicationModel/Resources/ResourceLoader";
import { Uri } from "winrt/Windows/Foundation/Uri";
import base32Encode from 'base32-encode'

const { createHash } = require('crypto');
const { remote } = require('electron')
const path = require("path");
const fs = require("fs");

export interface Package {
    path: string;
    identity?: PackageIdentity;
    properties?: PackageProperties;
    applications?: Map<string, PackageApplication>;
    compatibilityMode?: PackageCompatibilityMode;
}

export enum PackageCompatibilityMode {
    windows80,
    windows81,
    windows10,
}

export interface PackageIdentity {
    name: string;
    version: string;
    publisher: string;

    packageFamilyName: string;
}

export interface PackageProperties {
    displayName: string;
    description: string;
    publisherDisplayName: string;
    logo: string;
}

export class PackageReader {

    private packageName: string;
    private packagePath: string;
    private resources: ResourceLoader;
    private compatibilityMode: PackageCompatibilityMode;

    constructor(packageName: string) {
        this.packageName = packageName;
        this.resources = new ResourceLoader("", packageName);
        this.packagePath = path.join(remote.app.getAppPath(), "packages", packageName);
    }

    readPackage(): Package {
        //let pack = new Package(this.packagePath);

        let pack: Package = { path: this.packagePath, applications: new Map() };
        let manifestPath = path.join(this.packagePath, "AppxManifest.xml");
        let manifestText = fs.readFileSync(manifestPath, 'utf-8');

        let manifestDocument = new DOMParser()
            .parseFromString(manifestText, 'application/xml');
        if (manifestDocument === null) {
            throw new Error("Manifest failed to parse!");
        }

        let identityElement = manifestDocument.querySelector("Identity");
        let propertiesElement = manifestDocument.querySelector("Properties");
        let applicationsElement = manifestDocument.querySelector("Applications");
        let osMinVersion = manifestDocument.querySelector("OSMinVersion")?.textContent;

        if (!osMinVersion || osMinVersion.startsWith("6.3")) {
            pack.compatibilityMode = PackageCompatibilityMode.windows81;
        }
        else if (osMinVersion.startsWith("6.2")) {
            pack.compatibilityMode = PackageCompatibilityMode.windows80;
        }

        this.compatibilityMode = pack.compatibilityMode;

        console.log(`loading package ${this.packageName} with mode ${PackageCompatibilityMode[this.compatibilityMode]}`);

        pack.identity = this.loadTextResources(this.readIdentity(identityElement));
        pack.properties = this.loadTextResources(this.readProperties(propertiesElement));

        for (const applicationElement of applicationsElement.querySelectorAll("Application")) {
            let application = this.loadTextResources(this.readApplication(applicationElement));
            pack.applications.set(application.id, application);
        }

        return pack;
    }

    private readIdentity(element: Element): PackageIdentity {
        let name = element.getAttribute("Name");
        let publisher = element.getAttribute("Publisher");
        let version = element.getAttribute("Version");

        // compute the PackageFamilyName as base32 crockford of the first 8 bytes of the SHA256
        // hash of the Publisher field.

        const buffer = new ArrayBuffer(publisher.length * 2)
        const bufView = new Uint16Array(buffer);
        for (let i = 0; i < publisher.length; i++) {
            bufView[i] = publisher.charCodeAt(i);
        }

        const hash = createHash('sha256').update(bufView).digest();
        const base32 = base32Encode(hash.subarray(0, 8), 'Crockford');
        let packageFamilyName = name + "_" + base32.toLowerCase();

        return { name, publisher, version, packageFamilyName };
    }

    private readProperties(element: Element): PackageProperties {
        let displayName = element.querySelector("DisplayName").textContent;
        let description = element.querySelector("Description")?.textContent;
        let publisherDisplayName = element.querySelector("PublisherDisplayName").textContent;
        let logo = this.fixupUrl(element.querySelector("Logo").textContent);

        return { displayName, description, publisherDisplayName, logo };
    }

    private readApplication(element: Element): PackageApplication {
        let id = element.getAttribute("Id");
        let startPage = "//" + this.packageName + "/" + element.getAttribute("StartPage");

        let visualElementsElement = element.querySelector("VisualElements");
        let visualElements = this.loadTextResources(this.readVisualElements(visualElementsElement));

        // this will become important eventually (share targets, etc.)
        // let extensionsElement = element.querySelector("Extensions");
        // for (const extensionElement of extensionsElement.childNodes) {

        // }

        return { id, startPage, visualElements, extensions: [] };
    }

    private readVisualElements(element: Element): ApplicationVisualElements {
        let visualElements: Partial<ApplicationVisualElements> = {};
        visualElements.displayName = element.getAttribute("DisplayName");
        visualElements.description = element.getAttribute("Description");
        visualElements.foregroundText = <ForegroundText>element.getAttribute("ForegroundText");
        visualElements.backgroundColor = element.getAttribute("BackgroundColor");

        if (this.compatibilityMode === PackageCompatibilityMode.windows80) {
            visualElements.square150x150Logo = this.fixupUrl(element.getAttribute("Logo"));
            visualElements.square30x30Logo = this.fixupUrl(element.getAttribute("SmallLogo"));
        }
        else {
            visualElements.square150x150Logo = this.fixupUrl(element.getAttribute("Square150x150Logo"));
            visualElements.square30x30Logo = this.fixupUrl(element.getAttribute("Square30x30Logo"));
        }

        let defaultTileElement = element.querySelector("DefaultTile");
        if (defaultTileElement !== null) {
            visualElements.defaultTile = this.loadTextResources(this.readDefaultTile(defaultTileElement));
        }
        else {
            visualElements.defaultTile = { shortName: visualElements.displayName };
        }

        let splashScreenElement = element.querySelector("SplashScreen");
        visualElements.splashScreen = this.readSplashScreen(splashScreenElement);

        return <ApplicationVisualElements>visualElements;
    }

    private readSplashScreen(element: Element): ApplicationSplashScreen {
        //let splashScreen = new ApplicationSplashScreen();
        let backgroundColor = element.getAttribute("BackgroundColor");
        let image = this.fixupUrl(element.getAttribute("Image"));

        return { backgroundColor, image };
    }

    private readDefaultTile(element: Element): ApplicationDefaultTile {
        let defaultTile: Partial<ApplicationDefaultTile> = { showNameOnTiles: [] };
        defaultTile.shortName = element.getAttribute("ShortName");

        if (this.compatibilityMode == PackageCompatibilityMode.windows80) {
            defaultTile.wide310x150Logo = this.fixupUrl(element.getAttribute("WideLogo"));

            var showName = element.getAttribute("ShowName");
            if (showName === "allLogos") {
                defaultTile.showNameOnTiles.push("square150x150");
                defaultTile.showNameOnTiles.push("wide310x150");
            }
            else if (showName == "logoOnly") {
                defaultTile.showNameOnTiles.push("square150x150");
            }
            else if (showName == "wideLogoOnly") {
                defaultTile.showNameOnTiles.push("wide310x150");
            }
        }
        else {
            defaultTile.square70x70Logo = this.fixupUrl(element.getAttribute("Square70x70Logo"));
            defaultTile.wide310x150Logo = this.fixupUrl(element.getAttribute("Wide310x150Logo"));
            defaultTile.square310x310Logo = this.fixupUrl(element.getAttribute("Square310x310Logo"));

            for (const showOnElement of element.querySelectorAll("ShowOn")) {
                let tile = showOnElement.getAttribute("Tile");
                defaultTile.showNameOnTiles.push(tile.substring(0, tile.length - 4));
            }
        }

        let tileUpdate = element.querySelector("TileUpdate");
        if (tileUpdate) {
            defaultTile.tileUpdateUrl = tileUpdate.getAttribute("UriTemplate");
        }

        return <ApplicationDefaultTile>defaultTile;
    }

    private fixupUrl(relativeUrl: string): string {
        if (relativeUrl)
            return "//" + this.packageName + "/" + relativeUrl;
        return null;
    }

    private loadTextResources<T>(object: T): T {
        for (const key of Object.keys(object)) {
            const prop = object[key];
            if (prop && typeof prop === 'string' && prop.startsWith("ms-resource:")) {
                object[key] = this.resources.getStringForUri(new Uri(prop));
            }
        }

        return object;
    }
}