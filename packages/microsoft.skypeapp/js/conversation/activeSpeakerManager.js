

(function () {
    "use strict";

    var activeSpeakerManager = WinJS.Class.define(function (stageCandidatesMaxLength) {
        this._propertyChangeHandle = this._propertyChangeHandle.bind(this);
        this._participants = {};
        this._stageCandidatesMaxLength = stageCandidatesMaxLength;
        this._stageCandidates = [];
        this._ping = 0;
    }, {
        _participants: null,
        _ping: null,
        _stageCandidatesMaxLength: null,
        _stageCandidates: null,

        _getDate: function () { 
            return new Date();
        },

        _arraysEqual: function (a1, a2) {
            var len = a1.length;
            if (len !== a2.length) { return false; }
            for (var i = 0; i < len; i++) {
                if (a1[i] !== a2[i]) { return false; }
            }
            return true;
        },

        _startPing: function () {
            this._ping = this.regInterval(this._onPing.bind(this), activeSpeakerManager.Config.TICK_INTERVAL);
        },

        _stopPing: function () {
            this.unregInterval(this._ping);
            this._ping = null;
        },

        _soundLevelCheck: function (elm) {
            var tresholdCondition = elm.speaking ? elm.level <= activeSpeakerManager.Config.SOUND_LEVEL_TRESHOLD :
                    elm.level > activeSpeakerManager.Config.SOUND_LEVEL_TRESHOLD;

            var ticksCondition = elm.speaking ? elm.tick < activeSpeakerManager.Config.TICKS_TO_DEMOTE :
                    elm.tick < activeSpeakerManager.Config.TICKS_TO_PROMOTE;


            if (tresholdCondition) { 
                elm.cancelTick = 1;
                if (ticksCondition) { 
                    elm.tick++;
                    return false;
                } else {
                    elm.speaking = !elm.speaking;
                    elm.timestamp = new Date();
                    elm.tick = 1;
                    return true;
                }
            } else {
                if (elm.tick > 1) {
                    if (elm.cancelTick > activeSpeakerManager.Config.TICKS_TO_CANCEL) { 
                        elm.tick = 1;
                        elm.cancelTick = 1;
                    } else {
                        elm.cancelTick++;
                    }
                }
                return false;
            }
        },

        _onPing: function () {
            var update = false, that = this;
            for (var id in this._participants) {
                update = that._soundLevelCheck(this._participants[id]) || update; 
            }

            update && this._updateScore();
        },

        _propertyChangeHandle: function (event) {
            if (event.detail[0] === LibWrap.PROPKEY.participant_SOUND_LEVEL) {
                var participant = event.target; 
                if (this._participants[participant.getObjectID()]) { 
                    this._participants[participant.getObjectID()].level = participant.getIntProperty(LibWrap.PROPKEY.participant_SOUND_LEVEL);
                }
            }
        },

        _updateScore: function () {
            var participants = this._participants;
            var speaking = [];
            var recentlySpoken = [];
            var stageCandidates = [];
            var now = this._getDate();

            for (var id in participants) {
                if (participants[id].speaking) {
                    speaking.push({ id: id, timestamp: participants[id].timestamp });
                } else {
                    if (now - participants[id].timestamp < activeSpeakerManager.Config.RECENTLY_SPOKEN_TIMEOUT) {
                        recentlySpoken.push({ id: id, timestamp: participants[id].timestamp });
                    }
                }
            }

            speaking.sort(function (a, b) {
                return a.timestamp - b.timestamp;
            });

            recentlySpoken.sort(function (a, b) {
                return b.timestamp - a.timestamp;
            });

            stageCandidates = speaking.slice(0, this._stageCandidatesMaxLength).map(function(x) {
                return Number(x.id);
            }).concat(recentlySpoken.slice(0, Math.max(0, this._stageCandidatesMaxLength - speaking.length)).map(function(x) {
                return Number(x.id);
            }));

            if (!this._arraysEqual(this._stageCandidates, stageCandidates)) {
                this._stageCandidates = stageCandidates;
                this.dispatchEvent(activeSpeakerManager.Events.Update, stageCandidates);
            }
        },

        

        addParticipant: function (participant) {
            
            
            
            
            
            
            
            

            var id = participant.getId();
            log("activeSpeakerManager, trying to add participant id=" + id);
            
            if (this._participants[id]) {
                log("activeSpeakerManager, adding failed id=" + id);
                return;
            }

            this.regEventListener(participant.libParticipant, "propertychange", this._propertyChangeHandle);
            this._participants[participant.getId()] = { level: 0, tick: 1, cancelTick: 1, speaking: false };
            var count = Object.keys(this._participants).length;

            if (!this._ping && count > 1) {
                this._startPing();
            }
        },

        removeParticipant: function (participant) {
            
            
            
            
            
            
            
            

            var id = participant.getId();
            log("activeSpeakerManager, trying to remove participant id=" + id);
            if (!this._participants[id]) {
                log("activeSpeakerManager, removing participant failed id=" + id);
                return;
            }

            this.unregEventListener(participant.libParticipant, "propertychange", this._propertyChangeHandle);
            delete this._participants[participant.getId()];
            var count = Object.keys(this._participants).length;

            if (this._ping && count < 2) {
                this._stopPing();
                this._stageCandidates = [];
            }
        },
    }, {
        Events: {
            Update: "update"
        },

        Config: {
            TICK_INTERVAL: 100,
            TICKS_TO_PROMOTE: 10,
            TICKS_TO_DEMOTE: 10, 
            TICKS_TO_CANCEL: 3,
            SOUND_LEVEL_TRESHOLD: 4,
            RECENTLY_SPOKEN_TIMEOUT: 20000
        }
    });

    WinJS.Namespace.define("Skype.Conversation", {
        ActiveSpeakerManager: WinJS.Class.mix(activeSpeakerManager, Skype.Class.disposableMixin, WinJS.Utilities.eventMixin)
    });
}());