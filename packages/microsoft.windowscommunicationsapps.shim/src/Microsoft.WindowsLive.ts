import { SuiteUpdate } from "./Microsoft/WindowsLive/Config/Shared/SuiteUpdate";
import { Bici } from "./Microsoft/WindowsLive/Instrumentation/Bici";
import { Client } from "./Microsoft/WindowsLive/Platform/Client";
import { Market } from "./Microsoft/WindowsLive/Market";
import { Jx } from "./Microsoft/WindowsLive/Jx";
import * as Enums from "./Microsoft/WindowsLive/Enums"
import * as _ from "lodash"



const WindowsLiveNS = {
    Platform: {
        Client,
    },
    Config: {
        Shared: {
            SuiteUpdate
        }
    },
    Instrumentation: {
        Bici
    },
    Jx,
    Market    
}


export const WindowsLive = _.merge(WindowsLiveNS, Enums.WindowsLive);