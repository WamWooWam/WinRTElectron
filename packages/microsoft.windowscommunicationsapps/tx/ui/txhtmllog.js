
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global window,document,Tx,MSApp*/

// TODO: improve the templates

Tx.HtmlLog = function (runner) {
    Tx.chkNew(this, Tx.HtmlLog);
    Tx.chkObj(runner, "Tx.HtmlLog.ctor: invalid runner");

    this._eTests = null;
    this._details = []; // comments and errors
    this._testCount = 0;
    this._testsPassed = 0;
    this._testsFailed = 0;
    this._duration = 0;

    this._toolbar = new Tx.Toolbar({
        controls: [
            // TODO: add previous
            { id: "txtbHome", text: "Home (F2)", onclick: function () { runner.commands.goHome(); } },
            { id: "txtbNextPage", text: "Next Page (F8)", onclick: function () { runner.commands.goNextPage(); } },
            { id: "txtbReload", text: "Reload (F5)", onclick: function () { runner.commands.reload(); } },
            { id: "txtbClose", text: "Close (F4)", onclick: function () { runner.commands.close(); } }
        ]
    });
    
    // hook up the events
    this._callbacks = new Tx.Callbacks()
        .ael(runner, "pageStart", this.onPageStart, this)
        .ael(runner, "pageStop", this.onPageStop, this)
        .ael(runner, "start", this.onStart, this)
        .ael(runner, "error", this.onError, this)
        .ael(runner, "log", this.onLog, this)
        .ael(runner, "done", this.onDone, this)
        .ael(window, "unload", this.onUnload, this);
};

Tx.HtmlLog.prototype = {
    dispose: function () {
        this._eTests = null;
        this._details.length = 0;

        this._callbacks.dispose();
        this._callbacks = null;

        this._toolbar.dispose();
        this._toolbar = null;
    },

    onUnload: function () {
        if (this._toolbar) {
            this._toolbar.deactivateUI();
        }
    },

    onPageStart: function (ev) {
        var e = document.getElementById("txLog");
        if (e) {
            this._testCount = ev.testCount;

            // TODO: use an event listener
            var s = this._toolbar.render() +
                '<div id="txTestResults" class="tx-results"><br/><div class="tx-header">Running...</div><br/></div>' +
                '<div id="txTests" style="border-top: 1px solid silver">' +
                    Tx.tmpl(ev, '<div class="tx-page" style="border-bottom: 1px solid silver">{src}</div>') +
                    this.htmlItem({ className: "tx-header", testDesc: "Test", status: "Result", duration: "Duration", comment: "Comment" }) +
                    // test results go here
                '</div>';
            e.insertAdjacentHTML("beforeEnd", s);

            this._eTests = document.getElementById("txTests");

            this._toolbar.activateUI();
        }
    },

    onPageStop: function (/*ev*/) {
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
            var className = ev.hasErrors ? "tx-fail" : "tx-pass";
            var status = ev.hasErrors ? "Fail" : "Pass";
            this._duration += ev.duration;
            if (ev.hasErrors) {
                this._testsFailed++;
            } else {
                this._testsPassed++;
            }

            var details = this._details;
            var detail = details.length > 0 ? details[0] : {};
            this.renderItem({ className: className, testDesc: ev.testDesc, status: status, duration: ev.duration + " ms", comment: detail.comment });
            
            for (var i = 1, len = details.length; i < len; i++) {
                this.renderItem(details[i]);
            }

            // update test results
            var e = document.getElementById("txTestResults");
            if (e) {
                var completed = this._testsPassed + this._testsFailed;
                var progress = Math.floor(completed / this._testCount * 100);
                var s = 
                    '<div class="tx-header">Completed: ' + completed + '/' + this._testCount + ' (' + progress + '%) Time: ' + this._duration + ' ms</div>' +
                    '<div class="tx-pass">Passed: ' + this._testsPassed + '</div>';

                if (this._testsFailed > 0) {
                    s += '<div class="tx-fail">Failed: ' + this._testsFailed + '</div>';
                }

                e.innerHTML = s;
            }
        }
    },

    onLog: function (ev) {
        if (this._eTests) {
            this._details.push({ className: "tx-log", testDesc: "", status: "", duration: "", comment: ev.msg });
        }
    },

    onError: function (ev) {
        if (this._eTests) {
            this._details.push({ className: "tx-fail", testDesc: "", status: "", duration: "", comment: ev.msg });
        }
    },

    htmlItem: function (data) {
        // TODO: add timestamp
        data.link = (data.className === "tx-header" ? data.status : (data.status ? '<a href="#">' + data.status + '</a>' : '')); // TODO: add link
        data.comment = Tx.escapeHTML(data.comment);

        return Tx.tmpl(data, 
            '<div class="{className}" style="display:-ms-flexbox;border-bottom: 1px solid silver">' +
                '<div style="-ms-flex:0 auto;width:20%;padding:2px 2px 2px 20px;border-left:1px solid silver">{testDesc}</div>' +
                '<div style="-ms-flex:0 auto;width:40px;padding:2px;border-left:1px solid silver">{link}</div>' +
                '<div style="-ms-flex:0 auto;width:45px;padding:2px;border-left: 1px solid silver">{duration}</div>' +
                '<div style="-ms-flex:1 auto;padding:2px;border-left: 1px solid silver;border-right: 1px solid silver">{comment}</div>' +
            '</div>');
    },

    renderItem: function (data) {
        if (Tx.isWWA) {
            var that = this;
            MSApp.execUnsafeLocalFunction(function () {
                that._eTests.insertAdjacentHTML("beforeEnd", that.htmlItem(data));
            });
        } else {
            this._eTests.insertAdjacentHTML("beforeEnd", this.htmlItem(data));
        }
    }
};
