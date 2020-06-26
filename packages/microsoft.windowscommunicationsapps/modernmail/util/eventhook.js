Jx.delayDefine(Mail, "EventHook", function() {
    "use strict";

    function t(n) {
        return {
            addListener: function(t, i, r) {
                Jx.EventManager.addListener(n, t, i, r)
            },
            removeListener: function(t, i, r) {
                Jx.EventManager.removeListener(n, t, i, r)
            }
        }
    }
    var n = Mail.EventHook = function(n, t, i, r, u) {
        var f = this._onEvent;
        this._capture = !!u;
        n.addListener ? n.addListener(t, f, this) : (f = this._onEvent.bind(this),
            n.addEventListener(t, f, this._capture));
        this._src = n;
        this._ev = t;
        this._func = i;
        this._target = r;
        this._handler = f
    };
    n.prototype.dispose = function() {
        var n = this._src;
        n && (this._src = null,
            n.removeListener ? n.removeListener(this._ev, this._handler, this) : n.removeEventListener(this._ev, this._handler, this._capture))
    };
    n.prototype._onEvent = function() {
        this._src && this._func.apply(this._target, arguments)
    };
    n.getGlobalRootSource = function() {
        return t(Jx.root)
    };
    n.globalSource = t(null);
    n.createGlobalHook = function(t, i, r) {
        return new n(n.globalSource, t, i, r)
    };
    n.createEventManagerHook = function(t, i, r, u) {
        return new n({
            addListener: function(n, i, r) {
                t.on(n, i, r)
            },
            removeListener: function(n, i, r) {
                t.detach(n, i, r)
            }
        }, i, r, u)
    }
})