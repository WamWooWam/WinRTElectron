(function() {
    var n = window.msWriteProfilerMark,
        i, t;
    window.getMailPlatform = function() {
        if (t) return t;
        n("getMailPlatform,StartTM,Mail");
        try {
            var r = Microsoft.WindowsLive.Platform;
            t = new r.Client("mail", r.ClientCreateOptions.delayResources | r.ClientCreateOptions.failIfNoUser);
            i = 0
        } catch (u) {
            n("Unable to make the real platform!");
            n("Name: " + u.name);
            n("Message: " + u.message);
            i = u.number

            console.error(u);
        }
        return n("getMailPlatform,StopTM,Mail"), t
    };
    window.getMailPlatformResult = function() {
        return i
    };
    i = -1;
    t = window.getMailPlatform()
})()