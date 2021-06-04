import { GeographicRegion } from "winrt/Windows/Globalization/GeographicRegion";
import { Language } from "winrt/Windows/Globalization/Language";

export class MarketInfo {
    static defaultMarket: MarketInfo;
    static isDefaultMarket(market: MarketInfo): boolean {
        return market == MarketInfo.defaultMarket;
    }
    static parse(marketString: string) {
        return null;
    }

    displayName: string;
    geographicRegion: GeographicRegion;
    language: Language;
    valueAsString: string;
}