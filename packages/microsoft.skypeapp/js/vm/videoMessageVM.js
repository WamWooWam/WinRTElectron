

(function () {
    "use strict";

    var videoMessageVM = MvvmJS.Class.define(function (vMwrapper) {
        

        this._init(vMwrapper);
    }, {
        _videoMessageWrapper: null,

        _init: function (vMwrapper) {
            this._videoMessageWrapper = vMwrapper;

            this.isIncoming = this._videoMessageWrapper ? this._videoMessageWrapper.isIncoming : 0;
            this.title = this._videoMessageWrapper ? this._videoMessageWrapper.title : "";
            if (this.title === "") {
                this.title = this.isIncoming ? "chatitem_received_videomessage".translate() : "chatitem_sent_videomessage".translate();
            }
            this.description = this._videoMessageWrapper ? this._videoMessageWrapper.description : "";
            this._handleStatusChanged();

            this.regEventListener(this._videoMessageWrapper, "propertychanged", this._handlePropertyChanged.bind(this));
        },

        _setErrorState: function () {
            this.inReceiveError = [LibWrap.VideoMessage.status_CANCELED,
                                 LibWrap.VideoMessage.status_FAILED,
                                 LibWrap.VideoMessage.status_INVALID,
                                 LibWrap.VideoMessage.status_DELETED].contains(this.status);
        },

        _handleStatusChanged: function () {
            this._setErrorState();
            this.statusCode = "";
            this.errorCode = "";

            switch (this.status) {
                case LibWrap.VideoMessage.status_RECORDED:
                    this.statusCode = "videomessage_status_waiting";
                    break;
                case LibWrap.VideoMessage.status_UPLOADING:
                    this.statusCode = "videomessage_status_sending";
                    break;
                case LibWrap.VideoMessage.status_UPLOADED:
                    this.statusCode = "";
                    roboSky.write("conversation,videomessage,finished");
                    break;
                case LibWrap.VideoMessage.status_CANCELED:
                case LibWrap.VideoMessage.status_INVALID:
                case LibWrap.VideoMessage.status_DELETED:
                    this.errorCode = "videomessage_not_available";
                    roboSky.write("conversation,videomessage,unavailable");
                    break;
                case LibWrap.VideoMessage.status_FAILED:
                    this.errorCode = "videomessage_sending_failed";
                    roboSky.write("conversation,videomessage,failed");
                    break;
                case LibWrap.VideoMessage.status_EXPIRED:
                    this.errorCode = "videomessage_expired";
                    break;
            }
        },

        _handlePropertyChanged: function (evt) {
            var propertyName = evt.detail;
            switch (propertyName) {
                case "localPath":
                case "vodPath":
                case "thumbnailUrl":
                case "vodStatus":
                case "formattedStatus":
                case "progress":
                    this.notify(propertyName);
                    break;
                case "status":
                    this.notify(propertyName);
                    this._handleStatusChanged();
                    break;
            }
        },



        localPath: {
            get: function () {
                return this._videoMessageWrapper.localPath;
            }
        },

        vodPath: {
            get: function () {
                return this._videoMessageWrapper.vodPath;
            }
        },

        thumbnailUrl: {
            get: function () {
                return this._videoMessageWrapper.thumbnailUrl;
            }
        },

        vodStatus: {
            get: function () {
                return this._videoMessageWrapper.vodStatus;
            }
        },

        status: {
            get: function () {
                return this._videoMessageWrapper.status;
            }
        },

        formattedStatus: {
            get: function () {
                return this._videoMessageWrapper.formattedStatus;
            }
        },

        progress: {
            get: function () {
                return this._videoMessageWrapper.progress;
            }
        },


        playback: function () {
            this._videoMessageWrapper.prepareForPlayback();
            Actions.invoke("playbackVideoMessage", Skype.Application.state.focusedConversation.identity, { message: this._videoMessageWrapper });
        }

    }, { 
        isIncoming: 0,
        title: "",
        description: "",

        inReceiveError: false,

        errorCode: null,
        statusCode: null,
    });

    WinJS.Namespace.define("Skype.ViewModel", {
        VideoMessageVM: WinJS.Class.mix(videoMessageVM, Skype.Class.disposableMixin)
    });

}());