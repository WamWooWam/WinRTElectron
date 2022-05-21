
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx*/

Tx.Model = function (data, options) {
    Tx.chkNew(this, Tx.Model);

    this.initModel(data);

    options = Tx.mix({strict:true}, options);
    this._strict = Boolean(options.strict);
};

Tx.Model.prototype = {
    dispose: function () {
        this.disposeModel();
    }
};

Tx.Model.mixin = {
    initModel: function (data) {
        this.initEvents();

        var attributes = this._attributes = {};
        for (var key in data) {
            attributes[key] = data[key];
        }
    },

    disposeModel: function () {
        this._attributes = null;
        this.disposeEvents();
    },

    set: function (key, value, quiet) {
        var attributes = this._attributes;

        if (this._strict && !(key in attributes)) {
            Tx.chkFail();
            return false;
        }

        if (attributes[key] !== value) {
            attributes[key] = value;
            
            // Tx.mark(Tx.format("Tx.Model.set: key=%s value=%s quiet=%s,Info,Tx", key, value, quiet));

            if (!quiet) {
                this.dispatchEvent({ type: "change:" + key, value: value });
            }

            return true;
        }

        return false;
    },

    get: function (key) {
        return this._attributes[key];
    }
};

Tx.mix(Tx.Model.mixin, Tx.Events);
Tx.mix(Tx.Model.prototype, Tx.Model.mixin);
