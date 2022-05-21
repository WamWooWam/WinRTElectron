
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global self,document,msWriteProfilerMark,console,importScripts,Tx*/

// TODO: use JxCore when available

//
// Tx
//

(function () {
    // some UTs override setImmediate
    var orig = self.setImmediate;
    Tx.setImmediate = function (fn) {
        orig(fn);
    };
})();

Tx.dispose = function (obj) {
    Tx.chkOptNullObj(obj);
    if (obj) {
        var args = arguments;
        var len = args.length;

        if (len === 1) {
            if (obj.dispose) {
                Tx.chkFn(obj.dispose);
                obj.dispose();
            }
        } else {
            // start at 1 to skip the "obj" arg
            for (var i = 1; i < len; i++) {
                var prop = args[i];
                Tx.chkIf(prop in obj);
                var o = obj[prop];
                if (o && o.dispose) {
                    Tx.chkFn(o.dispose);
                    o.dispose();
                }
                obj[prop] = null;
            }
        }
    }
};

Tx.mix = function (dest, src) {
    Tx.assert(Tx.isObject(dest) || Tx.isFunction(dest) || Tx.isUndefined(dest), "Tx.mix: invalid dest");
    Tx.assert(Tx.isObject(src) || Tx.isFunction(src) || Tx.isUndefined(src), "Tx.mix: invalid src");

    dest = dest || {};
    src = src || {};

    // Enumerate all properties in src
    for (var i in src) {

        // Don't copy properties inherited from prototype. Object.prototype might be augmented.
        if (src.hasOwnProperty(i)) {
            dest[i] = src[i];
        }
    }

    return dest;
};

Tx.mark = function (msg) {
    Tx.chkStrNE(msg);
    msWriteProfilerMark(msg);
    if (Tx.config.useConsole && self.console) {
        console.log(msg);
    }
};

Tx.addScript = function (src) {
    Tx.chkStrNE(src);

    Tx.mark("Tx.addScript: " + src + ",StartTA,Tx");
    var script = document.createElement("script");
    script.src = src;
    document.head.appendChild(script);
    Tx.mark("Tx.addScript: " + src + ",StopTA,Tx");
};

// TODO: move it to TxWorker.js
Tx.importScripts = function (src) {
    Tx.chkStrNE(src);
    Tx.chkIf(Tx.isWorker);

    Tx.mark("Tx.importScript: " + src + ",StartTA,Tx");
    importScripts(src);
    Tx.mark("Tx.importScript: " + src + ",StopTA,Tx");
};

// TODO: use Tx.format
Tx.tmpl = function (data, s) {
    Tx.chkObj(data);
    Tx.chkStrNE(s);

    for (var prop in data) {
        s = s.replace(new RegExp('{' + prop + '}', 'g'), data[prop]);
    }
    return s;
};

Tx.format = function () {
    var args = arguments;
    if (args.length > 0) {
        var i = 0;
        return args[0].replace(/%s/g, function (m) {
            var v = args[++i];
            return Tx.isUndefined(v) ? m : String(v);
        });
    }
    return "";
};

Tx.escapeHTML = function (text) {
    var element = document.createElement("div");
    element.innerText = text;
    return element.innerHTML;
};

