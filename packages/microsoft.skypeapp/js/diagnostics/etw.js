

(function () {
    "use strict";

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

    var APP_TRACER_ID = "SkypeUI:";

    var traceSession = WinJS.Class.define(/*@constructor*/function (tracerName, id) {
        this._sessionId = id ? (APP_TRACER_ID + tracerName + ":#" + id + ",") : (APP_TRACER_ID + tracerName + ",");
    }, {
        _sessionId: "",
        
        write: function(event) {
            ///<disable>JS2043.RemoveDebugCode</disable>
            console.info(this._sessionId + event);
            msWriteProfilerMark(this._sessionId + event);
        },
        
        start: function() {
            this.write("StartTM");
        },
        
        stop: function() {
            this.write("StopTM");
        }
    });
    
    var tracer = WinJS.Class.define(/*@constructor*/function (tracerName) {
        this._tracerName = (tracerName || this._tracerName);
    }, {
        _tracerName: "",
        _sessionsCount: 0,
        
        
        write: function (event) {
            ///<disable>JS2043.RemoveDebugCode</disable>
            console.info(APP_TRACER_ID + this._tracerName + "," + event);
            msWriteProfilerMark(APP_TRACER_ID + this._tracerName + ",RT," + event);
            var that = this;
            setImmediate(function() {
                msWriteProfilerMark(APP_TRACER_ID + that._tracerName + "," + event);
            });
        },

        
        createSession: function (sessionName, id) {
            sessionName = sessionName ? (this._tracerName + ":" + sessionName) : this._tracerName;
            return new Skype.Diagnostics.ETW.TraceSession(sessionName, id === undefined ? ++this._sessionsCount : id);
        },
        
        
        startSession: function (sessionName, id) {
            var session = this.createSession(sessionName, id);
            session.start();
            return session;
        },
    });

    WinJS.Namespace.define("Skype.Diagnostics.ETW", {
        Tracer: tracer,
        TraceSession: traceSession
    });
}());