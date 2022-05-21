# WinRT Electron
A collection/graveyard of Windows 8.1 Metro apps written in JavaScript, archived and modified to run under Electron

# Why?
I went digging around Windows 8.1 and noticed that many key Metro apps, including stuff like Mail, People, Calendar, Music, Videos 
and even Skype where written in JavaScript with the help of WinJS and the Windows Runtime platform, and as it turns out they're all
somewhat standard web applications, with a catch.

Almost every app uses a native binary of some kind, usually written in C++/CX and exposed to JS via a corresponding `.winmd` file,
naturally these won’t run within a browser context, and must be shimmed/reimplemented in pure JavaScript.

On top of these native binaries, there's also the Windows Runtime itself which exposes vast suedes of functionality from access to 
your webcam to processing of JSON and XML. Obviously this also needs shimming too, and as a result we're slowly amassing a relatively
complete shim of all native functionality for both app specific features, as well as the Windows Runtime itself.

# How?
Apps are copied from the `C:\Program Files\WindowsApps` directory, at which point any native binaries are removed for analysis in dnSpy
(which can handily read `.winmd`s giving a nice contract to work against), and `.winmd`s are run through the `tswinrt` tool to generate
dummy shims. At which point it's loaded up in Electron within the shim's `webview` (or the "Desktop Experience")
at which point we see what breaks, what isn't implemented, and precisely how much the app's CSS depends on proprietary features like
`display: -ms-grid/-ms-flexbox;`, and work from there.

# Components
### WinRT Shim
Arguably the most important component, the WinRT shim covers parts of the Windows Runtime, namespaces like `Windows.UI.WebUI` and 
`Windows.Foundation`. It's highly incomplete and work in progress, and is shared between all apps within their respective shims.

### Desktop Experience
The package `wankerr.desktop` contains files for the WinRT shim and the "Desktop Experience". DE provides most of the functionality that would
previously have been provided by the Windows shell, such as the code behind `CoreWindow` and `MessageDialog`, as well as the Charms bar,
Start screen, Tiles and so on.

Apps are run within `<webview>` tags and the WinRT shim communicates with the outside via Electron IPC. This means that state within the WinRT
shim can't be shared between apps, and must be kept by the DE.

# Building
It should be a case of running `yarn` then `yarn webpack` in each app's directory and the root, though your mileage may vary.

# Contributing
Probably a bad idea.

# Special Thanks
Microsoft, for being this ~~dumb~~ ahead of their time.
