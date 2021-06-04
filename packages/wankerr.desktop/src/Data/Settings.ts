
const defaultWallpaper = require("/static/wallpaper/img1.jpg")
const defaultAvatar = require("/static/account/user.png")

export class Settings {
    constructor(updated: () => void) {
        this.settingsChanged = updated;
    }

    private _accentColour: string = "#4abaf8";
    public get accentColour(): string {
        return this._accentColour;
    }
    public set accentColour(value: string) {
        this._accentColour = value;
        this.settingsChanged();
    }

    private _wallpaper: string = defaultWallpaper.default;
    public get wallpaper(): string {
        return this._wallpaper;
    }
    public set wallpaper(value: string) {
        this._wallpaper = value;
        this.settingsChanged();
    }

    private _avatar: string = defaultAvatar.default;
    public get avatar(): string {
        return this._avatar;
    }
    public set avatar(value: string) {
        this._avatar = value;
        this.settingsChanged();
    }

    settingsChanged: () => void;
}