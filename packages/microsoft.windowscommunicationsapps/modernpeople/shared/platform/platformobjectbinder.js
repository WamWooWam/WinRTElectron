Jx.delayDefine(People, "PlatformObjectBinder", function () {
    function y(n) {
        n.forEach(function (n) {
            n()
        })
    }
    function h(t, i, r) {
        var u = null;
        try {
            return t && (r = r || s[t.getPlatformObject().objectType],
                u = new r(t, i)),
                u;
        }
        catch (e) {
            return null;
        }
    }
    function i(i) {
        var r = s[i] = function (i, u) {
            t.call(this, r, i, u)
        }
            ;
        return Jx.inherit(r, t),
            Object.defineProperty(r.prototype, "objectType", {
                value: i,
                enumerable: true
            }),
            r
    }
    function b(n, t) {
        Object.defineProperty(n.prototype, t, {
            get: function () {
                return this._getValue(t)
            },
            enumerable: true
        })
    }
    function c(n, t, i) {
        Object.defineProperty(n.prototype, t, {
            get: function () {
                return this._getCollection(t, i)
            },
            enumerable: true
        })
    }
    function r(n, t, i) {
        Object.defineProperty(n.prototype, t, {
            get: function () {
                return this._getObject(t, i)
            },
            enumerable: true
        })
    }
    function k(n, t) {
        var i, r;
        for (n.prototype._populated = true,
            i = t.getPlatformObject(); i = Object.getPrototypeOf(i);)
            r = Object.keys(i),
                r.forEach(function (t) {
                    var u = Object.getOwnPropertyDescriptor(i, t), r;
                    t in n.prototype || (r = u.value,
                        Jx.isFunction(r) ? n.prototype[t] = function () {
                            var n = this._binder.getPlatformObject();
                            return n[t].apply(n, arguments)
                        }
                            : b(n, t))
                })
    }
    var w = window.People, o = Microsoft.WindowsLive.Platform, n = w.PlatformObjectBinder = function (n, t) {
        this._name = (t || "") + "[" + n.objectType + " " + n.objectId + "]";
        this._bindings = {};
        this._childCollections = {};
        this._childObjects = {};
        this._object = n;
        this._listener = null;
        this._listening = false
    }
        , f, s, t;
    n.prototype.dispose = function () {
        if (Object.keys(this._childCollections).forEach(function (n) {
            this._childCollections[n] && this._childCollections[n].dispose()
        }, this),
            this._childCollections = {},
            Object.keys(this._childObjects).forEach(function (n) {
                this._childObjects[n] && this._childObjects[n].dispose()
            }, this),
            this._childObjects = {},
            this._listening) {
            try {
                this._object.removeEventListener("changed", this._listener)
            } catch (n) {
                Jx.log.exception("Error removing event listener: " + this._name, n)
            }
            this._listening = false
        }
        if (this._object) {
            if (this._object.dispose)
                try {
                    this._object.dispose()
                } catch (n) {
                    Jx.log.exception("Error disposing object: " + this._name, n)
                }
            this._object = null
        }
    }
        ;
    n.prototype.setObject = function (n) {
        this._object = n
    }
        ;
    n.prototype.getPlatformObject = function () {
        return this._object
    }
        ;
    n.prototype._addBinding = function (n, t) {
        if (n) {
            if (!this._listening) {
                this._listener || (this._listener = this._onChange.bind(this));
                try {
                    this._object.addEventListener("changed", this._listener);
                    this._listening = true
                } catch (r) {
                    Jx.log.exception("Error adding event listener to platform object: " + this._name, r)
                }
            }
            var i = this._bindings[t];
            i || (i = this._bindings[t] = []);
            i.indexOf(n) === -1 && i.push(n)
        }
    }
        ;
    n.prototype._getProperty = function (n) {
        var t;
        try {
            t = this._object[n]
        } catch (i) {
            Jx.log.exception("Error retrieving property from platform object: " + this._name + "." + n, i)
        }
        return t
    }
        ;
    n.prototype.getValue = function (n, t) {
        return this._addBinding(n, t),
            this._getProperty(t)
    }
        ;
    n.prototype.getObject = function (t, i) {
        var r, u;
        return this._addBinding(t, i),
            r = this._childObjects[i],
            r || (u = this._getProperty(i),
                this._childObjects[i] = r = u ? new n(u, this._name + "." + i) : null),
            r
    }
        ;
    n.prototype.getCollection = function (n, t) {
        var i, r;
        return i = this._childCollections[t],
            i || (r = this._getProperty(t),
                this._childCollections[t] = i = new f(r, this._name + "." + t)),
            i.getItems(n)
    }
        ;
    n.prototype._onChange = function (n) {
        var t, r, e, i, u, f;
        for (t = n.detail && n.detail[0],
            Jx.isNullOrUndefined(t) && (t = Object.keys(this._bindings)),
            r = 0,
            e = t.length; r < e; ++r)
            i = t[r].split(".")[0],
                Jx.log.info("Property change: " + this._name + "." + i),
                u = this._childObjects[i],
                u && (u.dispose(),
                    this._childObjects[i] = null),
                f = this._bindings[i],
                f && y(f)
    }
        ;
    n.prototype.createAccessor = function (n) {
        return h(this, n)
    }
        ;
    f = function (t, i) {
        if (this._name = i,
            this._collection = t,
            this._listeners = [],
            this._items = [],
            t) {
            for (var r = 0, u = t.count; r < u; ++r)
                this._items.push(new n(t.item(r), this._name));
            t.addEventListener("collectionchanged", this._onChangeListener = this._onChange.bind(this));
            t.unlock()
        }
    }
        ;
    f.prototype.dispose = function () {
        if (this._items.forEach(function (n) {
            n.dispose()
        }),
            this._items = [],
            this._collection) {
            try {
                this._collection.removeEventListener("collectionchanged", this._onChangeListener);
                this._collection.dispose()
            } catch (n) {
                Jx.log.exception("Error disposing collection: " + this._name, n)
            }
            this._collection = null
        }
    }
        ;
    f.prototype.getItems = function (n) {
        return n && this._listeners.indexOf(n) === -1 && this._listeners.push(n),
            this._items.slice()
    }
        ;
    f.prototype._onChange = function (t) {
        var r, i, u, f, e;
        r = t.detail[0];
        switch (r.eType) {
            case o.CollectionChangeType.itemAdded:
                u = "add";
                i = new n(this._collection.item(r.index), this._name);
                this._items.splice(r.index, 0, i);
                Jx.log.info("Collection change: collection=" + this._name + " type=add object=" + i.getPlatformObject().objectId);
                break;
            case o.CollectionChangeType.itemRemoved:
                u = "remove";
                i = this._items.splice(r.index, 1)[0];
                Jx.log.info("Collection change: collection=" + this._name + " type=remove object=" + i.getPlatformObject().objectId);
                i.dispose();
                break;
            case o.CollectionChangeType.itemChanged:
                u = "move";
                i = this._items.splice(r.previousIndex, 1)[0];
                this._items.splice(r.index, 0, i);
                Jx.log.info("Collection change: collection=" + this._name + " type=move object=" + i.getPlatformObject().objectId);
                break;
            case o.CollectionChangeType.reset:
                for (u = "reset",
                    this._items.forEach(function (n) {
                        n.dispose()
                    }),
                    this._items.length = 0,
                    f = 0,
                    e = this._collection.count; f < e; ++f)
                    this._items.push(new n(this._collection.item(f), this._name));
                Jx.log.info("Collection change: collection=" + this._name + " type=reset")
        }
        y(this._listeners)
    }
        ;
    s = {};
    t = function (t, i, r) {
        this._binder = i;
        this._callback = r;
        this._populated || k(t, i)
    }
        ;
    Object.defineProperty(t.prototype, "objectId", {
        get: function () {
            return this._binder.getPlatformObject().objectId
        }
    });
    t.prototype.getPlatformObject = function () {
        return this._binder.getPlatformObject()
    }
        ;
    t.prototype.createAccessor = function (n) {
        return h(this._binder, n, this.constructor)
    }
        ;
    t.prototype._getValue = function (n) {
        return this._binder.getValue(this._callback, n)
    }
        ;
    t.prototype._getObject = function (n, t) {
        return h(this._binder.getObject(this._callback, n), this._callback, t)
    }
        ;
    t.prototype._getCollection = function (t, i) {
        return this._binder.getCollection(this._callback, t).map(function (t) {
            return h(t, this._callback, i)
        }, this)
    }
        ;
    var a = i("Person")
        , e = i("Contact")
        , l = i("ImplicitContact")
        , u = i("MeContact")
        , v = i("Account")
        , d = i("Recipient")
        , g = i("usertile")
        , p = i("SearchPerson");
    c(a, "linkedContacts", e);
    c(u, "linkedContacts", u);
    c(p, "linkedContacts", e);
    c(l, "linkedContacts");
    r(e, "account", v);
    r(e, "person", a);
    r(u, "account", v);
    r(u, "person", u);
    r(d, "person");
    r(l, "account", v);
    r(l, "person");
    a.prototype.getUserTile = e.prototype.getUserTile = u.prototype.getUserTile = l.prototype.getUserTile = p.prototype.getUserTile = function (t, i) {
        var r;
        try {
            r = this._binder.getPlatformObject().getUserTile(t, i)
        } catch (u) {
            Jx.log.exception("Error retrieving usertile: ", u)
        }
        return r ? new n(r) : null
    }
})
