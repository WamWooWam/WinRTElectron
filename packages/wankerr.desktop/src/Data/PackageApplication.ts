export interface PackageApplication {    
    id: string;
    startPage: string;

    visualElements: ApplicationVisualElements;
    extensions: ApplicationExtension[];
}

export type ForegroundText = "light" | "dark";

export interface ApplicationVisualElements {
    displayName: string;
    description: string;
    square150x150Logo: string;
    square30x30Logo: string;

    foregroundText: ForegroundText;
    backgroundColor: string;

    defaultTile: ApplicationDefaultTile;
    splashScreen: ApplicationSplashScreen;
}

export interface ApplicationDefaultTile {
    shortName: string;
    square70x70Logo?: string;
    wide310x150Logo?: string;
    square310x310Logo?: string;
    showNameOnTiles?: string[];
    tileUpdateUrl?: string;
}

export interface ApplicationSplashScreen {
    image: string;
    backgroundColor: string;
}

export interface ApplicationExtension {

}