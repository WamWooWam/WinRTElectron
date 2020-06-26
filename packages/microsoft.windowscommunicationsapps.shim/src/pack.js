
import * as WindowsLiveImpl from "./Microsoft.WindowsLive";
import "winrt-node"
globalThis["Microsoft"] = { WindowsLive: WindowsLiveImpl.WindowsLive }