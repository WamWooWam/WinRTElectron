
import * as MSWindowsLiveImpl from "./Microsoft.WindowsLive";
import "winrt-node"

globalThis["Microsoft"] = { WindowsLive: MSWindowsLiveImpl.WindowsLive }