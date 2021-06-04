export class PackageApplication {    
    id: string;
    startPage: string;

    visualElements: ApplicationVisualElements;
    extensions: ApplicationExtension[];
}

export type ForegroundText = "light" | "dark";

export class ApplicationVisualElements {
    displayName: string;
    description: string;
    square150x150Logo: string;
    square30x30Logo: string;

    foregroundText: ForegroundText;
    backgroundColor: string;

    defaultTile: ApplicationDefaultTile;
    splashScreen: ApplicationSplashScreen;
}

export class ApplicationDefaultTile {
    shortName: string;
    square70x70Logo: string;
    wide310x150Logo: string;
    square310x310Logo: string;
    showNameOnTiles: string[] = [];
    tileUpdateUrl: string;
}

export class ApplicationSplashScreen {
    image: string;
    backgroundColor: string;
}

export class ApplicationExtension {

}