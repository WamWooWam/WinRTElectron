

(function (undefined) {
    "use strict";

    WinJS.Namespace.define("MvvmJS", {
        WeakRefTable: WinJS.Class.define(function (anchorUri) {
            
            this._anchor = new Windows.Foundation.Uri(anchorUri);
        }, {
            _anchor: null,
            _nextKey: 0,
            putItem: function (item, customKey) {
                var key = customKey || ++this._nextKey;
                
                if (!item) {
                    return key;
                } else
                    if (msSetWeakWinRTProperty) {
                        msSetWeakWinRTProperty(this._anchor, key, item);
                    } else {
                        key = { key: item };
                    }
                return key;
            },
            getItem: function (key) {
                
                if (!key) {
                    return null;
                } else
                    if (msGetWeakWinRTProperty) {
                        return msGetWeakWinRTProperty(this._anchor, key);
                    }
                return key.item;
            }
        })
    });

}());
