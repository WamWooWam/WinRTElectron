Jx.delayDefine(People, "PlatformObjectBinder", function () {
    function y(n) {
        n.forEach(function (n) {
            n()
        })
    }
    function h(item, name, binderType) {
        var u = null;
        try {
            return item && (binderType = binderType || BinderTypes[item.getPlatformObject().objectType],
                u = new binderType(item, name)),
                u;
        }
        catch (e) {
            return null;
        }
    }
    function binderForObjectType(i) {
        var r = BinderTypes[i] = function (i, u) {
            BinderBase.call(this, r, i, u)
        }
            ;
        return Jx.inherit(r, BinderBase),
            Object.defineProperty(r.prototype, "objectType", {
                value: i,
                enumerable: true
            }),
            r
    }
    function defineProp(target, name) {
        Object.defineProperty(target.prototype, name, {
            get: function () {
                return this._getValue(name)
            },
            enumerable: true
        })
    }
    function addCollectionBinder(type, collectionName, collectionType) {
        Object.defineProperty(type.prototype, collectionName, {
            get: function () {
                return this._getCollection(collectionName, collectionType)
            },
            enumerable: true
        })
    }
    function addItemBinder(type, itemName, itemType) {
        Object.defineProperty(type.prototype, itemName, {
            get: function () {
                return this._getObject(itemName, itemType)
            },
            enumerable: true
        })
    }
    function populate(binder, value) {
        if (binder.prototype._populated)
            return;
        binder.prototype._populated = true;

        // this is a clusterfuck, but it's needed in order to walk the prototype
        // chain of ES6 classes and access both inhereted properties, and non enumerable ones
        // TLDR fuck javascript
        let properties = new Map();
        let object = value.getPlatformObject()
        let keys = Object.getOwnPropertyNames(object);
        for (let obj = object; obj && obj != Object.prototype; obj = Object.getPrototypeOf(obj)) {
            let newKeys = Object.getOwnPropertyNames(obj);
            for (const newKey of newKeys) {
                if (properties.has(newKey))
                    continue;
                properties.set(newKey, Object.getOwnPropertyDescriptor(obj, newKey))
            }
            keys = keys.concat(...newKeys);
        }
        keys = [...new Set(keys)];

        for (const key of keys) {
            var prop = properties.get(key);
            var value;
            if (!(key in binder.prototype) && prop) {
                value = prop.value;
                if (Jx.isFunction(value)) {
                    binder.prototype[key] = function () {
                        var n = this._binder.getPlatformObject();
                        return n[key].apply(n, arguments)
                    }
                }
                else {
                    defineProp(binder, key);
                }
            }
        }
    }
    var People = window.People, Platform = Microsoft.WindowsLive.Platform, PlatformObjectBinder = People.PlatformObjectBinder = function (n, t) {
        this._name = (t || "") + "[" + n.objectType + " " + n.objectId + "]";
        this._bindings = {};
        this._childCollections = {};
        this._childObjects = {};
        this._object = n;
        this._listener = null;
        this._listening = false
    }
        , PlatformCollectionBinder, BinderTypes, BinderBase;
    PlatformObjectBinder.prototype.dispose = function () {
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
    PlatformObjectBinder.prototype.setObject = function (n) {
        this._object = n
    }
        ;
    PlatformObjectBinder.prototype.getPlatformObject = function () {
        return this._object
    }
        ;
    PlatformObjectBinder.prototype._addBinding = function (n, t) {
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
    PlatformObjectBinder.prototype._getProperty = function (n) {
        var t;
        try {
            t = this._object[n]
        } catch (i) {
            Jx.log.exception("Error retrieving property from platform object: " + this._name + "." + n, i)
        }
        return t
    }
        ;
    PlatformObjectBinder.prototype.getValue = function (n, t) {
        return this._addBinding(n, t),
            this._getProperty(t)
    }
        ;
    PlatformObjectBinder.prototype.getObject = function (t, i) {
        var r, u;
        return this._addBinding(t, i),
            r = this._childObjects[i],
            r || (u = this._getProperty(i),
                this._childObjects[i] = r = u ? new PlatformObjectBinder(u, this._name + "." + i) : null),
            r
    }
        ;
    PlatformObjectBinder.prototype.getCollection = function (n, t) {
        var i, r;
        return i = this._childCollections[t],
            i || (r = this._getProperty(t),
                this._childCollections[t] = i = new PlatformCollectionBinder(r, this._name + "." + t)),
            i.getItems(n)
    }
        ;
    PlatformObjectBinder.prototype._onChange = function (n) {
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
    PlatformObjectBinder.prototype.createAccessor = function (n) {
        return h(this, n)
    }
        ;
    PlatformCollectionBinder = function (collection, name) {
        if (this._name = name,
            this._collection = collection,
            this._listeners = [],
            this._items = [],
            collection) {
            for (var r = 0, u = collection.count; r < u; ++r)
                this._items.push(new PlatformObjectBinder(collection.item(r), this._name));
            collection.addEventListener("collectionchanged", this._onChangeListener = this._onChange.bind(this));
            collection.unlock()
        }
    }
        ;
    PlatformCollectionBinder.prototype.dispose = function () {
        if (this._items.forEach(function (item) {
            item.dispose()
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
    PlatformCollectionBinder.prototype.getItems = function (n) {
        return n && this._listeners.indexOf(n) === -1 && this._listeners.push(n),
            this._items.slice()
    }
        ;
    PlatformCollectionBinder.prototype._onChange = function (event) {
        var detail, binder, action, f, e;
        detail = event.detail[0];
        switch (detail.eType) {
            case Platform.CollectionChangeType.itemAdded:
                action = "add";
                binder = new PlatformObjectBinder(this._collection.item(detail.index), this._name);
                this._items.splice(detail.index, 0, binder);
                Jx.log.info("Collection change: collection=" + this._name + " type=add object=" + binder.getPlatformObject().objectId);
                break;
            case Platform.CollectionChangeType.itemRemoved:
                action = "remove";
                binder = this._items.splice(detail.index, 1)[0];
                Jx.log.info("Collection change: collection=" + this._name + " type=remove object=" + binder.getPlatformObject().objectId);
                binder.dispose();
                break;
            case Platform.CollectionChangeType.itemChanged:
                action = "move";
                binder = this._items.splice(detail.previousIndex, 1)[0];
                this._items.splice(detail.index, 0, binder);
                Jx.log.info("Collection change: collection=" + this._name + " type=move object=" + binder.getPlatformObject().objectId);
                break;
            case Platform.CollectionChangeType.reset:
                for (action = "reset",
                    this._items.forEach(function (n) {
                        n.dispose()
                    }),
                    this._items.length = 0,
                    f = 0,
                    e = this._collection.count; f < e; ++f)
                    this._items.push(new PlatformObjectBinder(this._collection.item(f), this._name));
                Jx.log.info("Collection change: collection=" + this._name + " type=reset")
        }
        y(this._listeners)
    }
        ;
    BinderTypes = {};
    BinderBase = function (t, i, r) {
        this._binder = i;
        this._callback = r;
        this._populated || populate(t, i)
    }
        ;
    Object.defineProperty(BinderBase.prototype, "objectId", {
        get: function () {
            return this._binder.getPlatformObject().objectId
        }
    });
    BinderBase.prototype.getPlatformObject = function () {
        return this._binder.getPlatformObject()
    }
        ;
    BinderBase.prototype.createAccessor = function (n) {
        return h(this._binder, n, this.constructor)
    }
        ;
    BinderBase.prototype._getValue = function (n) {
        return this._binder.getValue(this._callback, n)
    }
        ;
    BinderBase.prototype._getObject = function (n, t) {
        return h(this._binder.getObject(this._callback, n), this._callback, t)
    }
        ;
    BinderBase.prototype._getCollection = function (t, i) {
        return this._binder.getCollection(this._callback, t).map(function (t) {
            return h(t, this._callback, i)
        }, this)
    }
        ;
    var a = binderForObjectType("Person")
        , e = binderForObjectType("Contact")
        , l = binderForObjectType("ImplicitContact")
        , u = binderForObjectType("MeContact")
        , v = binderForObjectType("Account")
        , d = binderForObjectType("Recipient")
        , g = binderForObjectType("usertile")
        , p = binderForObjectType("SearchPerson");
    addCollectionBinder(a, "linkedContacts", e);
    addCollectionBinder(u, "linkedContacts", u);
    addCollectionBinder(p, "linkedContacts", e);
    addCollectionBinder(l, "linkedContacts");
    addItemBinder(e, "account", v);
    addItemBinder(e, "person", a);
    addItemBinder(u, "account", v);
    addItemBinder(u, "person", u);
    addItemBinder(d, "person");
    addItemBinder(l, "account", v);
    addItemBinder(l, "person");
    a.prototype.getUserTile =
        e.prototype.getUserTile =
        u.prototype.getUserTile =
        l.prototype.getUserTile =
        p.prototype.getUserTile = function (t, i) {
            var r;
            try {
                r = this._binder.getPlatformObject().getUserTile(t, i)
            } catch (u) {
                Jx.log.exception("Error retrieving usertile: ", u)
            }
            return r ? new PlatformObjectBinder(r) : null
        }
})
