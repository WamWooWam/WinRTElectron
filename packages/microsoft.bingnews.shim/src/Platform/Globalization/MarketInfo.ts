import { Windows } from "winrt-node";

export class MarketInfo {
    static defaultMarket: MarketInfo;
    static isDefaultMarket(market: MarketInfo): boolean {
        return market == MarketInfo.defaultMarket;
    }
    static parse(marketString: string) {
        return null;
    }

    displayName: string;
    geographicRegion: Windows.Globalization.GeographicRegion;
    language: Windows.Globalization.Language;
    valueAsString: string;
}