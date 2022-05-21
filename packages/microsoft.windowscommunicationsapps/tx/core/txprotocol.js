
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Windows,Tx*/

Tx.Protocol = function (runner, config) {
    Tx.chkNew(this, Tx.Protocol);
    this._runner = runner;
    this._config = config;
    this._callbacks = new Tx.Callbacks().ael(Windows.UI.WebUI.WebUIApplication, "activated", this._onActivated, this);
};

Tx.Protocol.prototype = {
    dispose: function () {
        Tx.dispose(this, "_callbacks");
        this._runner = null;
    },

    _onActivated: function (ev) {
        var kind = ev.kind;

        Tx.mark("Tx.Protocol._onActivated: kind=" + kind + ",Info,Tx");

        if (kind === Windows.ApplicationModel.Activation.ActivationKind.protocol) {
            // Parse and copy any protocol arguments.
            // TODO: We might want to support more than just the single parameter in the future.
            var params = ev.uri.queryParsed;
            if (params.length > 0) {
                for (var i = 0; i < params.length; i++){
                   this._config._data.protocolArgs[params[i].name] = params[i].value;    
                }
            }

            // TODO: Validate the parameters received are recognized.

            this._runner.onProtocol();
        }
    }
};
