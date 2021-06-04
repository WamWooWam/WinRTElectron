import { WindowsLive } from "./Enums";

export class Market {
    static get(fallback: WindowsLive.FallbackLogic) {
        switch (fallback) {
            case WindowsLive.FallbackLogic.language:
                return "en";
            case WindowsLive.FallbackLogic.countryRegion:
                return "GB";
        }
    }
}