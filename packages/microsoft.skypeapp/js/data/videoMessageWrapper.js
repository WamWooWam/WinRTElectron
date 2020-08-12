

(function () {
    "use strict";

    var etw = new Skype.Diagnostics.ETW.Tracer("Skype.Model.VideoMessage");

    var videoMessage = MvvmJS.Class.define(function (vidMessage) {
        this._vidMessage = vidMessage;
        this.isIncoming = this._vidMessage.getStrProperty(LibWrap.PROPKEY.videomessage_AUTHOR) !== lib.myIdentity;
        this.alive();
        this.infoMsg = "";
    }, {
        alive: function () {
            this._isAlive = true;
            
            var map = {};
            map[LibWrap.PROPKEY.videomessage_VOD_PATH] = [this._refreshVodPath.bind(this)];
            map[LibWrap.PROPKEY.videomessage_VOD_STATUS] = [this._onVodStatusChanged.bind(this)];
            map[LibWrap.PROPKEY.videomessage_STATUS] = [this._onStatusChanged.bind(this)];
            map[LibWrap.PROPKEY.videomessage_PROGRESS] = [this._onProgressChanged.bind(this)];

            this._subscription = Skype.Utilities.subscribePropertyChanges(this._vidMessage, map);
            this.regEventListener(this._vidMessage, "thumbnailpath", this._refreshThumbnailUrl.bind(this));

            this._vidMessage.getThumbnailAsync();
            this._preloadVideo();

            this.title = this._getTitle();
            this.description = this._getDescription();
        },

        _getTitle: function () {
            return this._vidMessage.getStrProperty(LibWrap.PROPKEY.videomessage_TITLE);
        },

        _getDescription: function () {
            return this._vidMessage.getStrProperty(LibWrap.PROPKEY.videomessage_DESCRIPTION);
        },

        _onVodStatusChanged: function () {
            this.vodStatus = this._getVodStatus();
        },
        _getVodStatus: function () {
            return this._vidMessage.getIntProperty(LibWrap.PROPKEY.videomessage_VOD_STATUS);
        },

        _onStatusChanged: function () {
            this.status = this._getStatus();
            this.formattedStatus = this._getFormattedStatus();
        },
        _getStatus: function () {
            return this._vidMessage.getIntProperty(LibWrap.PROPKEY.videomessage_STATUS);
        },
 
        _getFormattedStatus: function () {
            return LibWrap.VideoMessage.statustoString(this.status);
        },
        
        _preloadVideo: function () {
            if (!this.isIncoming) {
                this.prepareForPlayback();
            }
        },

        prepareForPlayback: function () {
            this._vidMessage.prepareForPlay(true);
            this.vodStatus = LibWrap.VideoMessage.vod_STATUS_VOD_NOT_AVAILABLE; 
        },
        
        _onProgressChanged: function () {
            this.progress = this._getProgress();
        },
        _getProgress: function () {
            return this._vidMessage.getIntProperty(LibWrap.PROPKEY.videomessage_PROGRESS);
        },


        _getVodPath: function () {
            return this._vidMessage.getStrProperty(LibWrap.PROPKEY.videomessage_VOD_PATH);
        },
        _refreshVodPath: function (value) {
            this.vodPath = this._getVodPath();
        },
        
        _getLocalPath: function () {
            return this._vidMessage.getStrProperty(LibWrap.PROPKEY.videomessage_LOCAL_PATH);
        },
        _refreshLocalPath: function (value) {
            this.localPath = this._getLocalPath();
        },

        _getThumbnailUrl: function () {
            return "";
        },
        _refreshThumbnailUrl: function (newValue) {
            var path = Windows.Storage.ApplicationData.current.localFolder.path; 
            if (newValue.indexOf(path) === 0) {
                newValue = "ms-appdata:///local" + newValue.substr(path.length);
                newValue = newValue.replace("#", "%23");
            }
            
                log("{0}: {1}".format(this.hashCode, newValue));
                this.thumbnailUrl = newValue.replace(/\\/gi, "/");
            
        },
        
        _onDispose: function () {
            etw.write('dispose');
        }

    }, {
        localPath: Skype.Utilities.cacheableProperty("localPath"),
        vodPath: Skype.Utilities.cacheableProperty("vodPath"),
        thumbnailUrl: Skype.Utilities.cacheableProperty("thumbnailUrl"),

        vodStatus: Skype.Utilities.cacheableProperty("vodStatus"),
        status: Skype.Utilities.cacheableProperty("status"),
        formattedStatus: Skype.Utilities.cacheableProperty("formattedStatus"),
        progress: Skype.Utilities.cacheableProperty("progress"),

        title: Skype.Utilities.cacheableProperty("title"),
        description: Skype.Utilities.cacheableProperty("description"),
    });

    WinJS.Namespace.define("Skype.Model", {
        VideoMessage: WinJS.Class.mix(videoMessage, Skype.Class.disposableMixin)
    });
}());