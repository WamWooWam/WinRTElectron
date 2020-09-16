import { Application, ApplicationVisualElements, ApplicationDefaultTile, ForegroundText, ApplicationSplashScreen } from "./Application";
import { ResourceLoader, ApplicationModel } from "winrt-node/Windows";

const { remote } = require('electron')
const path = require("path");
const fs = require("fs");

export class Package {
    path: string;
    identity: PackageIdentity;
    properties: PackageProperties;
    applications: Map<string, Application>;
    compatibilityMode: PackageCompatibilityMode;

    constructor(path: string) {
        this.path = path;
        this.applications = new Map();
    }
}

export enum PackageCompatibilityMode {
    windows80,
    windows81,
    windows10,
}

export class PackageIdentity {
    name: string;
    version: string;
    publisher: string;
}

export class PackageProperties {
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
        this.resources = new ResourceLoader(packageName);
        this.packagePath = path.join(remote.app.getAppPath(), "packages", packageName);
    }

    readPackage(): Package {
        let pack = new Package(this.packagePath);
        let manifestPath = path.join(this.packagePath, "AppxManifest.xml");
        let manifestText = fs.readFileSync(manifestPath, 'utf-8');

        let manifestDocument = new DOMParser().parseFromString(manifestText, 'application/xml');
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
        let identity = new PackageIdentity();
        identity.name = element.getAttribute("Name");
        identity.publisher = element.getAttribute("Publisher");
        identity.version = element.getAttribute("Version");

        return identity;
    }

    private readProperties(element: Element): PackageProperties {
        let properties = new PackageProperties();
        properties.displayName = element.querySelector("DisplayName").textContent;
        properties.description = element.querySelector("Description")?.textContent;
        properties.publisherDisplayName = element.querySelector("PublisherDisplayName").textContent;
        properties.logo = this.fixupUrl(element.querySelector("Logo").textContent);

        return properties;
    }

    private readApplication(element: Element): Application {
        let application = new Application();
        application.id = element.getAttribute("Id");
        application.startPage = "//" + this.packageName + "/" + element.getAttribute("StartPage");

        let visualElementsElement = element.querySelector("VisualElements");
        application.visualElements = this.loadTextResources(this.readVisualElements(visualElementsElement));

        let extensionsElement = element.querySelector("Extensions");
        for (const extensionElement of extensionsElement.childNodes) {

        }

        return application;
    }

    private readVisualElements(element: Element): ApplicationVisualElements {
        let visualElements = new ApplicationVisualElements();
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
            visualElements.defaultTile = new ApplicationDefaultTile();
            visualElements.defaultTile.shortName = visualElements.displayName;
        }

        let splashScreenElement = element.querySelector("SplashScreen");
        visualElements.splashScreen = this.readSplashScreen(splashScreenElement);

        return visualElements;
    }

    private readSplashScreen(element: Element): ApplicationSplashScreen {
        let splashScreen = new ApplicationSplashScreen();
        splashScreen.backgroundColor = element.getAttribute("BackgroundColor");
        splashScreen.image = this.fixupUrl(element.getAttribute("Image"));

        return splashScreen;
    }

    private readDefaultTile(element: Element): ApplicationDefaultTile {
        let defaultTile = new ApplicationDefaultTile();
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
                defaultTile.showNameOnTiles.push(tile.substr(0, tile.length - 4));
            }
        }

        let tileUpdate = element.querySelector("TileUpdate");
        if (tileUpdate) {
            defaultTile.tileUpdateUrl = tileUpdate.getAttribute("UriTemplate");
        }

        return defaultTile;
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
                object[key] = this.resources.getString(prop.substr(12));
            }
        }

        return object;
    }
}

window["PackageReader"] = PackageReader;