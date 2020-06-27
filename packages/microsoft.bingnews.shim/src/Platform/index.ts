import { InstrumentationArticleEntryPoint } from "./Instrumentaton/InstrumentationArticleEntryPoint";
import { Process } from "./Process";
import { ServicesAccessor } from "./ServicesAccessor";
import { Marketization } from "./Globalization/Marketization";
import { MarketValidity } from "./Globalization/MarketValidity";
import { MarketInfo } from "./Globalization/MarketInfo";

export const Platform = {
    Instrumentation: {
        InstrumentationArticleEntryPoint
    },
    Globalization: {
        Marketization,
        MarketValidity,
        MarketInfo
    },
    Process,
    ServicesAccessor,
    Configuration: {
        
    }
};
