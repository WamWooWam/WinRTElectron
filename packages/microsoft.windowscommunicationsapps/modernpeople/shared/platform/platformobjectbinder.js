
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//


/// <reference path="../JSUtil/Include.js"/>
/// <reference path="../JSUtil/Namespace.js"/>
/// <reference path="%_NTTREE%\drop\published\ModernContactPlatform\Microsoft.WindowsLive.Platform.js" />
/// <disable>JS2052.UsePrefixOrPostfixOperatorsConsistently</disable>
/// <disable>JS2076.IdentifierIsMiscased</disable>

// ----------------------Problem--------------------------------------------------------------
// Imagine for a moment that you need to implement some UI that shows per-network status for a person.
// You need to write:
//
//     var linkedContacts = person.linkedContacts;
//     for (var i = 0, len = linkedContacts.count; i < len; ++i)  { 
//         var contact = linkedContacts.item(i);
//         var status = contact.onlineStatus;
//         var account = contact.account;
//         var name = account.displayName;
//         // Make some UI out of those
//     }
//  Not too bad.  But it doesn't update.  You need to hook each contact for property changes on the onlineStatus property.
//  That's not quite enough, you also need to hook the linkedContact collection for adds/removes and unhook/hook each contact
//  when that happens. And if you're hardcore, you'll subscribe the displayName of the account for changes.  If you're insane,
//  you'll also listen to each contact for changes on the account property, but I don't think that can happen. Yet.
//  And of course you need a dispose mechanism to clean up all of those notifications. You now have a mess of member
//  variables, and way more code dealing with notifications than your actual feature.  It's buggy for the same reasons: 
//  writing tests that deliver dynamic updates is much harder, and we don't yet have adequate stress testing.  Even if you
//  manage to get it right, it'll be broken the first time someone updates your code.
//
// ------------------------PlatformObjectBinder--------------------------------------------------
//  The first goal of this file is to provide a mechanism where any property or collection you access is automatically
//  hooked for notifications.  Go write the code you need to write: enumerate the contacts, touch properties willy-nilly,
//  don't worry about it.  PlatformObjectBinder is watching everything you touch and will make sure you get called if any
//  of it ever changes:
//
//     var personBinder = new PlatformObjectBinder(person);
//     personBinder.getCollection(myCallback, "linkedContacts").forEach(function (contactBinder) {
//         var status = contactBinder.getValue(myCallback, "onlineStatus");
//         var accountBinder = contactBinder.getObject(myCallback, "account");
//         var name = accountBinder.getValue(myCallback, "displayName");
//     });
//
//  Works great, but it's kind of gross to look at.  You have to keep mentioning which callback is associated with which
//  property access, and everything looks like a property bag.
//
// -----------------------Platform Accessors-----------------------------------------------------------------
//  The accessors solve those problems.  They store away your callback and use it for all of your calls to the binder.
//  And then they use property getters to clear out the mess of "getProperty" calls.
//
//      var personBinder = new PlatformObjectBinder(realPlatformPerson);
//      var person = personBinder.access(myCallback);
//      person.linkedContacts.forEach(function (contact) {
//          var status = contact.status;
//          var account = contact.account;
//          var name = account.displayName;
//      });
//  

Jx.delayDefine(People, "PlatformObjectBinder", function () {

    var P = window.People;
    var Plat = Microsoft.WindowsLive.Platform;

    var PlatformObjectBinder = P.PlatformObjectBinder = /*@constructor*/function (/*@dynamic*/object, logName) {
        ///<summary>The PlatformObjectBinder wraps a platform IObject.  Its properties can be accessed usig 
        /// getValue, getObject and getCollection methods.  Passing a callback to these methods hooks notifications
        /// on the requested property.  getObject and getCollection wrap their return values in PlatformObjectBinders
        /// as well.</summary>
        ///<param name="object">The platform object to wrap</param>
        ///<param name="logName" type="String" optional="true">An optional name for logging</param>
        Debug.assert(Jx.isObject(object));

        this._name = (logName || "") + "[" + object.objectType + " " + object.objectId + "]";
        this._bindings = { };
        this._childCollections = { };
        this._childObjects = { };
        this._object = object;
        this._listener = null;
        this._listening = false;
    };

    PlatformObjectBinder.prototype.dispose = function () {
        ///<summary>Destroys this object, unhooks notifications, and disposes any nested binders</summary>
        Object.keys(this._childCollections).forEach(/*@bind(PlatformObjectBinder)*/function (prop) {
            if (this._childCollections[prop]) {
                this._childCollections[prop].dispose();
            }
        }, this);
        this._childCollections = { };

        Object.keys(this._childObjects).forEach(/*@bind(PlatformObjectBinder)*/function (prop) {
            if (this._childObjects[prop]) {
                this._childObjects[prop].dispose();
            }
        }, this);
        this._childObjects = { };

        if (this._listening) {
            try {
                this._object.removeEventListener("changed", this._listener);
            } catch (ex) {
                Jx.log.exception("Error removing event listener: " + this._name, ex);
            }
            this._listening = false;
        }

        if (this._object) {
            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            if (this._object.dispose) {
                try {
                    this._object.dispose();
                } catch (ex) {
                    Jx.log.exception("Error disposing object: " + this._name, ex);
                }
            }
            this._object = null;
        }
    };

    PlatformObjectBinder.prototype.setObject = function (object) {
        Debug.assert(this._object === null, "PlatformObjectBinder must be disposed before being reused");
        this._object = object;
    };

    PlatformObjectBinder.prototype.getPlatformObject = function () {
        /// <returns>The wrapped platform object</returns>
        return this._object;
    };

    PlatformObjectBinder.prototype._addBinding = function (callback, property) {
        /// <summary>Binds the provided callback to changes on the specified property</summary>
        /// <param name="callback" type="Function"/>
        /// <param name="property" type="String"/>
        Debug.assert(Jx.isNullOrUndefined(callback) || Jx.isFunction(callback));
        Debug.assert(Jx.isNonEmptyString(property));

        if (callback) {
            if (!this._listening) {
                if (!this._listener) {
                    this._listener = this._onChange.bind(this);
                }
                try {
                    this._object.addEventListener("changed", this._listener);
                    this._listening = true;
                } catch (ex) {
                    Jx.log.exception("Error adding event listener to platform object: " + this._name, ex);
                }
            }

            var bindings = this._bindings[property];
            if (!bindings) {
                bindings = this._bindings[property] = [];
            }
            if (bindings.indexOf(callback) === -1) {
                bindings.push(callback);
            }
        }
    };

    PlatformObjectBinder.prototype._getProperty = function (property) {
        /// <summary>Gets the specified property value from the platform object.  Protects against exceptions.</summary>
        /// <param name="property" type="String"/>
        Debug.assert(Jx.isNonEmptyString(property));

        var value;
        try {
            value = this._object[property];
            Debug.assert(!Jx.isUndefined(property), "Access to undefined property [type=" + this._object.objectType + " property=" + property + "]"); 
        } catch (ex) {
            Jx.log.exception("Error retrieving property from platform object: " + this._name + "." + property, ex);
        }
        return value;
    };

    PlatformObjectBinder.prototype.getValue = function (callback, property) {
        /// <summary>Retrieves a simple property value or struct, and binds it for notifications</summary>
        /// <param name="callback" type="Function"/>
        /// <param name="property" type="String"/>
        Debug.assert(Jx.isNullOrUndefined(callback) || Jx.isFunction(callback));
        Debug.assert(Jx.isNonEmptyString(property));

        this._addBinding(callback, property);
        return this._getProperty(property);
    };

    PlatformObjectBinder.prototype.getObject = function (callback, property) {
        /// <summary>Retrieves an IObject property, wrapped in another Binder</summary>
        /// <param name="callback" type="Function"/>
        /// <param name="property" type="String"/>
        /// <returns type="PlatformObjectBinder"/>
        Debug.assert(Jx.isNullOrUndefined(callback) || Jx.isFunction(callback));
        Debug.assert(Jx.isNonEmptyString(property));

        this._addBinding(callback, property);
        var childObject = this._childObjects[property];
        if (!childObject) {
            var value = this._getProperty(property);
            this._childObjects[property] = childObject = value ? new PlatformObjectBinder(value, this._name + "." + property) : null;
        }
        return childObject;
    };

    PlatformObjectBinder.prototype.getCollection = function (callback, property) {
        /// <summary>Retrieves an ICollection property as an array of Binders</summary>
        /// <param name="callback" type="Function"/>
        /// <param name="property" type="String"/>
        /// <returns type="Array"/>
        Debug.assert(Jx.isNullOrUndefined(callback) || Jx.isFunction(callback));
        Debug.assert(Jx.isNonEmptyString(property));

        var childCollection = this._childCollections[property];
        if (!childCollection) {
            var value = this._getProperty(property);
            this._childCollections[property] = childCollection = new PlatformCollectionBinder(value, this._name + "." + property);
        }

        return childCollection.getItems(callback);
    };

    PlatformObjectBinder.prototype._onChange = function (ev) {
        /// <summary>Event listener for IObject::change notifications</summary>
        /// <param name="ev" type="Event"/>
        Debug.assert(Jx.isObject(ev));

        // Get the list of changed properties.
        var /*@type(Array)*/changes = ev.detail && ev.detail[0];
        if (Jx.isNullOrUndefined(changes)) { // Some objects (IRecipient) don't fire granular change notifications.
            changes = Object.keys(this._bindings); // In this case, assume everything has been updated.
        }

        for (var i = 0, len = changes.length; i < len; ++i) {
            // Structures fire property changes like homeLocation.Street.  We aren't interested in the sub-property details.
            var property = changes[i].split(".")[0];
            Jx.log.info("Property change: " + this._name + "." + property);

            var childObject = /*@static_cast(PlatformObjectBinder)*/this._childObjects[property];
            if (childObject) {
                childObject.dispose();
                this._childObjects[property] = null;
            }

            var binding = this._bindings[property];
            if (binding) { 
                callEach(binding);
            }
        }
    };
    PlatformObjectBinder.prototype.createAccessor = function (callback) {
        /// <summary>Creates an accessor object (a convenient interface to the binder) associated with the specified
        /// callback</summary>
        /// <param name="callback" type="Function" optional="true"/>
        Debug.assert(Jx.isNullOrUndefined(callback) || Jx.isFunction(callback));
        return createAccessor(this, callback);
    };

    var PlatformCollectionBinder = function (collection, logName) {
        /// <summary>The PlatformCollectionBinder provides access to ICollection as an array of
        /// PlatformObjectBinders, and binds to notifications on that collection.</summary>
        /// <param name="collection" type="Plat.Collection"/>
        Debug.assert(Jx.isNullOrUndefined(collection) || Jx.isObject(collection));

        this._name = logName;
        this._collection = collection;
        this._listeners = [];
        this._items = [];

        if (collection) {
            for (var i = 0, len = collection.count; i < len; ++i) {
                 this._items.push(new PlatformObjectBinder(collection.item(i), this._name));
            }
            collection.addEventListener("collectionchanged", this._onChangeListener = this._onChange.bind(this));
            collection.unlock();
        }
    };

    PlatformCollectionBinder.prototype.dispose = function () {
        /// <summary>Disposes the array of PlatformObjectBinders, and the underlying platform collection</summary>
        this._items.forEach(function (/*@type(PlatformObjectBinder)*/item) { item.dispose(); });
        this._items = [];

        if (this._collection) {
            try {
                this._collection.removeEventListener("collectionchanged", this._onChangeListener);
                this._collection.dispose();
            } catch (ex) {
                Jx.log.exception("Error disposing collection: " + this._name, ex);
            }
            this._collection = null;
        }
    };

    PlatformCollectionBinder.prototype.getItems = function (callback) {
        /// <summary>Retrieves a copy of the items array, and binds the provided callback for notificiations.</summary>
        /// <param name="callback" type="Function"/>
        /// <returns type="Array"/>
        Debug.assert(Jx.isNullOrUndefined(callback) || Jx.isFunction(callback));

        ///<disable>JS3057.AvoidImplicitTypeCoercion</disable>
        if (callback && this._listeners.indexOf(callback) === -1) {
            this._listeners.push(callback);
        }
        return this._items.slice();
    };

    PlatformCollectionBinder.prototype._onChange = function (ev) {
        /// <summary>Event handler for ICollection::collectionchanged notifications</summary>
        /// <param name="ev" type="Event"/>
        Debug.assert(Jx.isObject(ev));

        var change = /*@static_cast(Microsoft.WindowsLive.Platform.CollectionChangedEventArgs)*/ev.detail[0];
        var item;
        var changeType;
        switch (change.eType) {
            case Plat.CollectionChangeType.itemAdded:
                changeType = "add";
                item = new PlatformObjectBinder(this._collection.item(change.index), this._name);
                this._items.splice(change.index, 0, item);
                Jx.log.info("Collection change: collection=" + this._name + " type=add object=" + item.getPlatformObject().objectId);
                break;
            case Plat.CollectionChangeType.itemRemoved:
                changeType = "remove";
                item = this._items.splice(change.index, 1)[0];
                Jx.log.info("Collection change: collection=" + this._name + " type=remove object=" + item.getPlatformObject().objectId);
                item.dispose();
                break;
            case Plat.CollectionChangeType.itemChanged:
                changeType = "move";
                item = this._items.splice(change.previousIndex, 1)[0];
                this._items.splice(change.index, 0, item);
                Jx.log.info("Collection change: collection=" + this._name + " type=move object=" + item.getPlatformObject().objectId);
                break;
            case Plat.CollectionChangeType.reset:
                changeType = "reset";
                this._items.forEach(function (/*@type(PlatformObjectBinder)*/disposeItem) { disposeItem.dispose(); });
                this._items.length = 0;
                for (var i = 0, len = this._collection.count; i < len; ++i) {
                    this._items.push(new PlatformObjectBinder(this._collection.item(i), this._name));
                }
                Jx.log.info("Collection change: collection=" + this._name + " type=reset");
                break;
        }

        callEach(this._listeners);
    };

    function callEach(functions) {
        /// <summary>Calls all of the functions in the given array</summary>
        /// <param name="functions" type="Array"/>
        Debug.assert(Jx.isArray(functions));
        functions.forEach(function (fn) { fn(); });
    }


    var Accessors = {};
    function createAccessor(binder, callback, ctor) {
        /// <summary>Creates an accessor for the given binder, firing notifications on the provided callback</summary>
        /// <param name="binder" type="PlatformObjectBinder"/>
        /// <param name="callback" type="Function"/>
        /// <param name="ctor" type="Function" optional="true">The type of accessor to create.  Detected from objectType if not specified</param>
        Debug.assert(Jx.isNullOrUndefined(binder) || binder instanceof PlatformObjectBinder);
        Debug.assert(Jx.isNullOrUndefined(callback) || Jx.isFunction(callback));
        Debug.assert(Jx.isNullOrUndefined(ctor) || Jx.isFunction(ctor));
        
        var accessor = null;
        if (binder) {
            ctor = ctor || Accessors[binder.getPlatformObject().objectType];
            Debug.assert(ctor, "No accessor for type: " + binder.getPlatformObject().objectType);
            ///<disable>JS2063.ConstructorNamesArePascalCased</disable> Unless they are stored in variables
            accessor = new ctor(binder, callback);
            ///<enable>JS2063.ConstructorNamesArePascalCased</enable>
        }
        return accessor;
    }

    ///<disable>JS3092.DeclarePropertiesBeforeUse</disable>  The Jx.inherit line below seems to confound JSCop about the prototype of BaseAccessor
    var BaseAccessor = /*@constructor*/function (ctor, binder, callback) {
        /// <summary>Base implementation for all accessors: implements _getValue, _getObject and _getCollection members that
        /// wrap child binders in child accessors.  Derived classes implement specific schemas.</summary>
        /// <param name="ctor" type="Function">Derived class constructor, for delayed population</param>
        /// <param name="binder" type="PlatformObjectBinder"/>
        /// <param name="callback" type="Function"/>
        Debug.assert(binder instanceof PlatformObjectBinder);
        Debug.assert(Jx.isNullOrUndefined(callback) || Jx.isFunction(callback));
        this._binder = binder;
        this._callback = callback;
        if (!this._populated) {
            populateProperties(ctor, binder);
        }
    };
    Object.defineProperty(BaseAccessor.prototype, "objectId", {
        get: function () {
            /// <returns type="String"/>
            return this._binder.getPlatformObject().objectId;
        }
    });
    BaseAccessor.prototype.getPlatformObject = function () {
        return this._binder.getPlatformObject();
    };
    BaseAccessor.prototype.createAccessor = function (callback) {
        /// <summary>Creates a new accessor on the same binder, with a different callback</summary>
        /// <param name="callback" type="Function" optional="true"/>
        return createAccessor(this._binder, callback, this.constructor);
    };
    BaseAccessor.prototype._getValue = function (property) {
        /// <summary>Gets a simple property from the binder</summary>
        /// <param name="property" type="String"/>
        Debug.assert(Jx.isNonEmptyString(property));
        return this._binder.getValue(this._callback, property);
    };
    BaseAccessor.prototype._getObject = function (property, childCtor) {
        /// <summary>Retrieves a child object from the binder and wraps it in another accessor</summary>
        /// <param name="property" type="String"/>
        /// <param name="childCtor" type="Function">Type of accessor to create to wrap this child object</param>
        Debug.assert(Jx.isNonEmptyString(property));
        Debug.assert(Jx.isNullOrUndefined(childCtor) || Jx.isFunction(childCtor));
        return createAccessor(this._binder.getObject(this._callback, property), this._callback, childCtor);
    };
    BaseAccessor.prototype._getCollection = function (property, childCtor) {
        /// <summary>Retrieves a child collection from the binder and wraps it in accessors</summary>
        /// <param name="property" type="String"/>
        /// <param name="childCtor" type="Function">Type of accessor to create to wrap these child objects</param>
        /// <returns type="Array"/>
        Debug.assert(Jx.isNonEmptyString(property));
        Debug.assert(Jx.isNullOrUndefined(childCtor) || Jx.isFunction(childCtor));
        return this._binder.getCollection(this._callback, property).map(/*@bind(BaseAccessor)*/function (item) {
            Debug.assert(item instanceof PlatformObjectBinder);
            return createAccessor(item, this._callback, childCtor);
        }, this);
    };

    function defineAccessor(objectType) {
        /// <summary>Creates an accessor class</summary>
        /// <returns type="Function"/>
        Debug.assert(Jx.isNonEmptyString(objectType));
        Debug.assert(!(objectType in Accessors));

        var ctor = Accessors[objectType] = /*@constructor*/function (binder, callback) {
            Debug.assert(binder instanceof PlatformObjectBinder);
            Debug.assert(Jx.isNullOrUndefined(callback) || Jx.isFunction(callback));
            BaseAccessor.call(this, ctor, binder, callback);
        };
        Jx.inherit(ctor, BaseAccessor);
        Object.defineProperty(ctor.prototype, "objectType", { value: objectType, enumerable: true });

        return ctor;
    }
    function addValue(ctor, property) {
        /// <summary>Adds a simple property getter to an accessor</summary>
        /// <param name="ctor" type="Function"/>
        /// <param name="property" type="String"/>
        Debug.assert(Jx.isFunction(ctor));
        Debug.assert(Jx.isNonEmptyString(property));
        Debug.assert(!(property in ctor.prototype));

        Object.defineProperty(ctor.prototype, property, { get: /*@bind(BaseAccessor)*/function () { return this._getValue(property); }, enumerable: true });
    }
    function addCollection(ctor, property, childCtor) {
        /// <summary>Adds a collection getter to an accessor</summary>
        /// <param name="ctor" type="Function"/>
        /// <param name="property" type="String"/>
        /// <param name="childCtor" type="Function" optional="true">Type of child object</param>
        Debug.assert(Jx.isFunction(ctor));
        Debug.assert(Jx.isNonEmptyString(property));
        Debug.assert(Jx.isNullOrUndefined(childCtor) || Jx.isFunction(childCtor));
        Debug.assert(!(property in ctor.prototype));

        Object.defineProperty(ctor.prototype, property, { get: /*@bind(BaseAccessor)*/function () { return this._getCollection(property, childCtor); }, enumerable: true });
    }
    function addObject(ctor, property, childCtor) {
        /// <summary>Adds anobject getter to an accessor</summary>
        /// <param name="ctor" type="Function"/>
        /// <param name="property" type="String"/>
        /// <param name="childCtor" type="Function" optional="true">Type of child object</param>
        Debug.assert(Jx.isFunction(ctor));
        Debug.assert(Jx.isNonEmptyString(property));
        Debug.assert(Jx.isNullOrUndefined(childCtor) || Jx.isFunction(childCtor));
        Debug.assert(!(property in ctor.prototype));

        Object.defineProperty(ctor.prototype, property, { get: /*@bind(BaseAccessor)*/function () { return this._getObject(property, childCtor); }, enumerable: true });
    }
    function populateProperties(ctor, binder) {
        ctor.prototype._populated = true;

        var prototype = /*@static_cast(Object)*/binder.getPlatformObject();
        /// <disable>JS2056.DoNotAssignInConditionalExpression</disable>
        while (prototype = Object.getPrototypeOf(prototype)) {
            var propertyNames = Object.keys(prototype);
            propertyNames.forEach(function (propertyName) {
                var descriptor = Object.getOwnPropertyDescriptor(prototype, propertyName);
                if (!(propertyName in ctor.prototype)) {
                    var value = descriptor.value;
                    if (Jx.isFunction(value)) {
                        ctor.prototype[propertyName] = function () {
                            var platformObject = this._binder.getPlatformObject();
                            return platformObject[propertyName].apply(platformObject, arguments);
                        };
                    } else {
                        addValue(ctor, propertyName);
                    }
                }
            });
        }
        /// <enable>JS2056.DoNotAssignInConditionalExpression</enable>
    };

    // Forward declare object types
    var Person = defineAccessor("Person");
    var Contact = defineAccessor("Contact");
    var ImplicitContact = defineAccessor("ImplicitContact");
    var MeContact = defineAccessor("MeContact");
    var Account = defineAccessor("Account");
    var Recipient = defineAccessor("Recipient");
    var UserTile = defineAccessor("usertile");
    var SearchPerson = defineAccessor("SearchPerson");

    // Normal properties are implicit.  Only overrides need to be specified here.

    // Add collections (transforms them into arrays of accessors)
    addCollection(Person, "linkedContacts", Contact);
    addCollection(MeContact, "linkedContacts", MeContact);
    addCollection(SearchPerson, "linkedContacts", Contact);
    addCollection(ImplicitContact, "linkedContacts");

    // Add objects (transforms them into child accessors)
    addObject(Contact, "account", Account);
    addObject(Contact, "person", Person);
    addObject(MeContact, "account", Account);
    addObject(MeContact, "person", MeContact);
    addObject(Recipient, "person" /* could be Person or MeContact or ImplicitContact*/);
    addObject(ImplicitContact, "account", Account);
    addObject(ImplicitContact, "person");

    // Override getUserTile to return a binder on the tile
    //   Doesn't return an accessor because this binder needs to be independently disposed.
    Person.prototype.getUserTile = Contact.prototype.getUserTile = MeContact.prototype.getUserTile = ImplicitContact.prototype.getUserTile = SearchPerson.prototype.getUserTile = function (size, cachedOnly) {
        var result;
        try {
            result = this._binder.getPlatformObject().getUserTile(size, cachedOnly);
        } catch (ex) {
            Jx.log.exception("Error retrieving usertile: ", ex);
        }
        return result ? new PlatformObjectBinder(result) : null;
    };
});
