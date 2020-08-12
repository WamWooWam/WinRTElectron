


var assert;

(function () {
    "use strict";

    String.prototype.format = function () {
        var values = arguments;
        var formatted = this;
        return formatted.replace(/{[0-9]+}/g, function (item) {
            var index = parseInt(item.substring(1, item.length - 1));
            return values[index];
        });
    };

    String.prototype.translate = function () {
        var formatted = this;
        var translated = WinJS.Resources.getString(formatted);
        if (translated && translated.value) {
            return String.prototype.format.apply(translated.value, arguments);
        }
        return formatted;
    };

    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (str) {
            return this.slice(0, str.length) == str;
        };
    }

    Date.prototype.toUTCDate = function () {
        var date = this;
        var utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        return utcDate;
    };

    Array.prototype.clear = function () {
        this.splice(0, this.length);
    };
    
    Array.prototype.swapItems = function (i1, i2) {
        var temp = this[i1];
        this[i1] = this[i2];
        this[i2] = temp;
    };

    Array.prototype.index = function (predicate) {
        var array = this;

        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            if (predicate(item, i)) {
                return i;
            }
        }

        return -1;
    };

    Array.prototype.removeObject = function (object) {
        var index = this.indexOf(object);
        if (index >= 0) {
            return this.splice(index, 1);
        }
        return []; 
    };

    Array.prototype.first = function (predicate) {
        var array = this;
        var index = array.index(predicate);
        if (index !== -1) {
            return array[index];
        }

        return null;
    };

    Array.prototype.last = function (predicate) {
        var array = this;
        for (var i = array.length; i--;) {
            var item = array[i];
            if (predicate(item, i)) {
                return item;
            }
        }
        return null;
    };

    Array.prototype.contains = function (searchElement, fromIndex) {
        return this.indexOf(searchElement, fromIndex) !== -1;
    };

    Array.prototype.removeAt = function (index) {
        return this.splice(index, 1);
    };

    Array.prototype.insertAt = function (index, item) {
        return this.splice(index, 0, item);
    };

    Array.prototype.shuffle = function () {
        var len = this.length;
        var i = len;
        while (i--) {
            var p = parseInt(Math.random() * len);
            var t = this[i];
            this[i] = this[p];
            this[p] = t;
        }
        return this;
    };

    Array.prototype.moveObjectTo = function(object, index) {
        if (this.removeObject(object).length > 0) {
            this.insertAt(index, object);
        }
    };

    
    WinJS.Promise.prototype.complete = function () {
        if (this._completed) {
            this._completed();
        }
    };

    
    
    
    WinJS.Promise.async = function (func, promise) {
        return function () {
            var p = promise;
            if (!p) {
                p = this.initPromise;
            } else if (typeof promise === "string") {
                p = this[promise];
            }
            var call_args = arguments;

            return p.then(function () {
                return func.apply(this, call_args);
            }.bind(this));
        };
    };

    assert = function (condition, message) {
        if (condition) {
            return;
        }

        var d = new Date(),
            timeres = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2) + "." + ("00" + d.getMilliseconds()).slice(-3);
        ///<disable>JS2043.RemoveDebugCode</disable>
        console.assert(condition, timeres + " " + message);
        ///<enable>JS2043.RemoveDebugCode</enable>
        LibWrap && LibWrap.WrSkyLib && LibWrap.WrSkyLib.log && LibWrap.WrSkyLib.log("UI", message);

        throw message;
    };
}());
