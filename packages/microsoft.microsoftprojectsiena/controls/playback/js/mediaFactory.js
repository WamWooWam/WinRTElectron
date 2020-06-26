//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var AudioMediaFactory = WinJS.Class.define(function AudioMediaFactory_ctor(){}, {
            create: function(template) {
                switch (template) {
                    case"audio":
                        return new AppMagic.Controls.AudioHtmlMedia;
                    case"null":
                        return new AppMagic.Controls.Media
                }
                return new Media
            }, createInitial: function() {
                    return new AppMagic.Controls.AudioHtmlMedia
                }, parse: function(uri) {
                    return {
                            mediaId: uri, template: "audio"
                        }
                }
        }),
        VideoMediaFactory = WinJS.Class.define(function VideoMediaFactory_ctor(){}, {
            create: function(template) {
                switch (template) {
                    case"video":
                        return new AppMagic.Controls.VideoHtmlMedia;
                    case"iframe-youtube":
                        return new AppMagic.Controls.IframeMedia(template);
                    case"null":
                        return new AppMagic.Controls.Media
                }
                return new Media
            }, createInitial: function() {
                    return new AppMagic.Controls.VideoHtmlMedia
                }, parse: function(uri) {
                    var a = document.createElement("a");
                    if (a.href = uri, /^https?:$/i.test(a.protocol) && /^(?:www\.)?youtube\.com$/i.test(a.hostname)) {
                        var query = this._parseSearchString(a.search),
                            startTime = this._parseYouTubeHashToSeconds(a.hash);
                        if (typeof query.v == "string" && query.v.length > 0 && startTime !== -1)
                            return {
                                    mediaId: query.v, template: "iframe-youtube", startTime: startTime
                                }
                    }
                    return {
                            mediaId: uri, template: "video", startTime: 0
                        }
                }, _parseSearchString: function(search) {
                    var results = {};
                    if (search.length > 0 && (search[0] === "?" || search[0] === "#")) {
                        var parameters = search.substr(1).split("&");
                        parameters.forEach(function(parameter) {
                            var parts = parameter.split("=", 2),
                                key = parts[0],
                                value = decodeURIComponent(parts.length === 2 ? parts[1] : "");
                            typeof results[key] == "undefined" && (results[key] = value)
                        })
                    }
                    return results
                }, _parseYouTubeHashToSeconds: function(hash) {
                    if (typeof hash == "string") {
                        var hashParams = this._parseSearchString(hash);
                        if (typeof hashParams.t == "string") {
                            var timeString = hashParams.t,
                                totalSeconds = 0;
                            if (timeString.length === 0)
                                return -1;
                            var split = timeString.split("h");
                            if (split.length > 2)
                                return -1;
                            else if (split.length === 2) {
                                var hours = Number(split[0]);
                                if (isNaN(hours) || hours < 0)
                                    return -1;
                                totalSeconds += hours * 60 * 60;
                                timeString = split[1]
                            }
                            if (split = timeString.split("m"), split.length > 2)
                                return -1;
                            else if (split.length === 2) {
                                var minutes = Number(split[0]);
                                if (isNaN(minutes) || minutes < 0)
                                    return -1;
                                totalSeconds += minutes * 60;
                                timeString = split[1]
                            }
                            if (split = timeString.split("s"), split.length === 1 || split.length === 2 && split[1] === "") {
                                var seconds = Number(split[0]);
                                if (isNaN(seconds) || seconds < 0)
                                    return -1;
                                totalSeconds += seconds
                            }
                            else
                                return -1;
                            return totalSeconds
                        }
                    }
                    return 0
                }
        });
    WinJS.Namespace.define("AppMagic.Controls", {
        AudioMediaFactory: AudioMediaFactory, VideoMediaFactory: VideoMediaFactory
    })
})();