
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global document,Tx*/

// TODO: improve the templates

Tx.BvtLog = function (runner) {
    Tx.chkNew(this, Tx.BvtLog);
    Tx.chkObj(runner, "Tx.BvtLog.ctor: invalid runner");

    this._eTests = null;
    this._details = []; // comments and errors
    this._testCount = 0;
    this._testsPassed = 0;
    this._testsFailed = 0;
    this._duration = 0;
    
    // hook up the events
    this._callbacks = new Tx.Callbacks()
        .ael(runner, "pageStart", this.onPageStart, this)
        .ael(runner, "pageStop", this.onPageStop, this)
        .ael(runner, "start", this.onStart, this)
        .ael(runner, "error", this.onError, this)
        .ael(runner, "log", this.onLog, this)
        .ael(runner, "done", this.onDone, this);        
};

Tx.BvtLog.prototype = {
    dispose: function () {
        this._eTests = null;
        this._details.length = 0;

        this._callbacks.dispose();
        this._callbacks = null;
    },    

    onPageStart: function (ev) {
        var e = document.getElementById("bvtConsole");
        if (e) {
            this._testCount = ev.testCount;
            this._eTests = e;
        }
    },

    onPageStop: function (/*ev*/) {
        this.addLogText("Done!");
    },

    onStart: function (ev) {
        this._details.length = 0;
        if (this._eTests) {
            var comment = "";
            if (ev.feature) {
                comment += (" Feature: " + ev.feature);
            }
            if (ev.owner) {
                comment += (" Owner: " + ev.owner);
            }
            this._details.push({ className: "tx-log", testDesc: ev.testDesc, status: "", duration: "", comment: comment });
        }
    },

    onDone: function (ev) {
        if (this._eTests) {            
            var status = ev.hasErrors ? "Fail" : "Pass";
            this._duration += ev.duration;
            if (ev.hasErrors) {
                this._testsFailed++;
            } else {
                this._testsPassed++;
            }

            var details = this._details;
                        
            for (var i = 0, len = details.length; i < len; i++) {
                this.addLogText(status + ": " + details[i].testDesc + details[i].comment);
            }

            // update test results
            var e = document.getElementById("bvtTestResults");
            if (e) {
                var completed = this._testsPassed + this._testsFailed;
                var progress = Math.floor(completed / this._testCount * 100);
                var s = 
                    ' Completed: ' + completed + '/' + this._testCount + ' (' + progress + '%) Passed: ' + this._testsPassed;

                if (this._testsFailed > 0) {
                    s += ' Failed: ' + this._testsFailed;
                }

                e.innerHTML = s;
            }
        }
    },

    onLog: function (/*ev*/) {
        // We're not interested in logging comments right now.
    },

    onError: function (ev) {
        if (this._eTests) {
            this._details.push({ className: "tx-fail", testDesc: "", status: "", duration: "", comment: ev.msg });
        }
    },

    addLogText: function(msg){
        var bvtText = document.getElementById("bvtText");
        if (bvtText){
            bvtText.innerText += "\n" + msg;
            bvtText.scrollTop = bvtText.scrollHeight;
        }
    }
};
