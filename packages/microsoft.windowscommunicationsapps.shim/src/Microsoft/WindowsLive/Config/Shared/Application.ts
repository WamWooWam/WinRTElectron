import { WindowsLive } from "../../Enums"

export class SuiteUpdateApplication {
    lookup(id: WindowsLive.Config.Shared.AppId) {
        return {
            minVersion: "17.5.9600.22013",
            currentVersion: "17.4.9600.22013",
            moreInfoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        }
    }
}