
import * as WindowsLiveImpl from "./WindowsLive";
import * as MicrosoftImpl from "./Microsoft";
import "winrt-node"

globalThis["WindowsLive"] = WindowsLiveImpl
globalThis["Microsoft"] = MicrosoftImpl