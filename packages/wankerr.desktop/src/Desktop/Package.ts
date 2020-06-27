import { Application, ApplicationVisualElements, ApplicationDefaultTile, ForegroundText, ApplicationSplashScreen } from "./Application";
import { IpcMainEvent, App } from "electron";
import { ResourceLoader, ApplicationModel } from "winrt-node/Windows";

const { remote } = require('electron')
const path = require("path");
const fs = require("fs").promises;

export class Package {
    path: string;
    identity: PackageIdentity;
    properties: PackageProperties;
    applications: Map<string, Application>;

    constructor(path: string) {
        this.path = path;
        this.applications = new Map();
    }
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

    static async readPackage(packageName: string): Promise<Package> {

        let resources = new ResourceLoader(packageName);
        let packagePath = path.join(remote.app.getAppPath(), "packages", packageName);
        let pack = new Package(packagePath);

        let manifestPath = path.join(packagePath, "AppxManifest.xml");
        let manifestFile = await fs.open(manifestPath, 'r');
        let manifestText = await manifestFile.readFile({ encoding: "utf8" });
        await manifestFile.close();

        console.log(manifestPath);

        let manifestDocument = new DOMParser().parseFromString(manifestText, 'application/xml');
        if (manifestDocument === null) {
            throw new Error("Manifest failed to parse!");
        }

        let identityElement = manifestDocument.querySelector("Identity");
        let propertiesElement = manifestDocument.querySelector("Properties");
        let applicationsElement = manifestDocument.querySelector("Applications");

        pack.identity = PackageReader.readIdentity(identityElement);
        pack.properties = PackageReader.readProperties(packageName, propertiesElement);

        PackageReader.processText(pack.identity, resources);
        PackageReader.processText(pack.properties, resources);

        for (const applicationElement of applicationsElement.querySelectorAll("Application")) {
            let application = PackageReader.readApplication(packageName, applicationElement, resources);
            PackageReader.processText(application, resources);

            pack.applications.set(application.id, application);
        }

        return pack;
    }

    static readIdentity(element: Element): PackageIdentity {
        let identity = new PackageIdentity();
        identity.name = element.getAttribute("Name");
        identity.publisher = element.getAttribute("Publisher");
        identity.version = element.getAttribute("Version");

        return identity;
    }

    static readProperties(packageName: string, element: Element): PackageProperties {
        let properties = new PackageProperties();
        properties.displayName = element.querySelector("DisplayName").textContent;
        properties.description = element.querySelector("Description")?.textContent;
        properties.publisherDisplayName = element.querySelector("PublisherDisplayName").textContent;
        properties.logo = "//" + packageName + "/" + element.querySelector("Logo").textContent;

        return properties;
    }

    static readApplication(packageName: string, element: Element, resources: ResourceLoader): Application {
        var application = new Application();
        application.id = element.getAttribute("Id");
        application.startPage = "//" + packageName + "/" + element.getAttribute("StartPage");

        var visualElementsElement = element.querySelector("VisualElements");
        application.visualElements = PackageReader.readVisualElements(packageName, visualElementsElement, resources);
        PackageReader.processText(application.visualElements, resources);

        return application;
    }

    static readVisualElements(packageName: string, element: Element, resources: ResourceLoader): ApplicationVisualElements {
        var visualElements = new ApplicationVisualElements();
        visualElements.displayName = element.getAttribute("DisplayName");
        visualElements.description = element.getAttribute("Description");
        visualElements.foregroundText = <ForegroundText>element.getAttribute("ForegroundText");
        visualElements.backgroundColor = element.getAttribute("BackgroundColor");

        if (visualElements.square150x150Logo = element.getAttribute("Square150x150Logo"))
            visualElements.square150x150Logo = "//" + packageName + "/" + visualElements.square150x150Logo;

        if (visualElements.square30x30Logo = element.getAttribute("Square30x30Logo"))
            visualElements.square30x30Logo = "//" + packageName + "/" + visualElements.square30x30Logo;

        var defaultTileElement = element.querySelector("DefaultTile");
        if (defaultTileElement !== null) {
            visualElements.defaultTile = PackageReader.readDefaultTile(packageName, defaultTileElement);
            PackageReader.processText(visualElements.defaultTile, resources);
        }
        else {
            visualElements.defaultTile = new ApplicationDefaultTile();
            visualElements.defaultTile.shortName = visualElements.displayName;
        }

        var splashScreenElement = element.querySelector("SplashScreen");
        visualElements.splashScreen = PackageReader.readSplashScreen(packageName, splashScreenElement);

        return visualElements;
    }

    static readSplashScreen(packageName: string, element: Element): ApplicationSplashScreen {
        var splashScreen = new ApplicationSplashScreen();
        splashScreen.backgroundColor = element.getAttribute("BackgroundColor");
        splashScreen.image = element.getAttribute("Image");

        if (splashScreen.image)
            splashScreen.image = "//" + packageName + "/" + splashScreen.image;

        return splashScreen;
    }

    static readDefaultTile(packageName: string, element: Element): ApplicationDefaultTile {
        var defaultTile = new ApplicationDefaultTile();
        defaultTile.shortName = element.getAttribute("ShortName");
        defaultTile.square70x70Logo = element.getAttribute("Square70x70Logo");
        defaultTile.wide310x150Logo = element.getAttribute("Wide310x150Logo");
        defaultTile.square310x310Logo = element.getAttribute("Square310x310Logo");

        if (defaultTile.square70x70Logo)
            defaultTile.square70x70Logo = "//" + packageName + "/" + defaultTile.square70x70Logo;

        if (defaultTile.wide310x150Logo)
            defaultTile.wide310x150Logo = "//" + packageName + "/" + defaultTile.wide310x150Logo;

        if (defaultTile.square310x310Logo)
            defaultTile.square310x310Logo = "//" + packageName + "/" + defaultTile.square310x310Logo;

        for (const showOnElement of element.querySelectorAll("ShowOn")) {
            defaultTile.showNameOnTiles.push(showOnElement.getAttribute("Tile"));
        }

        return defaultTile;
    }

    static processText(object: any, resources: ResourceLoader) {
        for (const key of Object.keys(object)) {
            const prop = object[key];
            if (prop && typeof prop === 'string' && prop.startsWith("ms-resource:")) {
                object[key] = resources.getString(prop.substr(12));
            }
        }
    }
}

window["PackageReader"] = PackageReader;