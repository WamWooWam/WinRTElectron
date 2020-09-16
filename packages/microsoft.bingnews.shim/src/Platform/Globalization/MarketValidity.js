export var MarketValidity;
(function (MarketValidity) {
    MarketValidity[MarketValidity["isValid"] = 0] = "isValid";
    MarketValidity[MarketValidity["invalidDueToMarketChange"] = 1] = "invalidDueToMarketChange";
    MarketValidity[MarketValidity["invalidDueToFallback"] = 2] = "invalidDueToFallback";
    MarketValidity[MarketValidity["invalidDueToRevIP"] = 3] = "invalidDueToRevIP";
    MarketValidity[MarketValidity["invalidDueToNewLangPack"] = 4] = "invalidDueToNewLangPack";
    MarketValidity[MarketValidity["invalidDueToFRE"] = 5] = "invalidDueToFRE";
})(MarketValidity || (MarketValidity = {}));
//# sourceMappingURL=MarketValidity.js.map