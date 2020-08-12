

(function Contact() {
    "use strict";
    var uid = 0;

    var phoneType = defineEnum("home", "office", "mobile", "other",  "phone", "skype", "pstn");
    var phoneSlot = defineEnum("none", "identity", "mobile", "home", "office", "userDefined1", "userDefined2", "userDefined3");

    var phoneSlotsToLib = [null, LibWrap.PROPKEY.contact_PSTNNUMBER, LibWrap.PROPKEY.contact_PHONE_MOBILE, LibWrap.PROPKEY.contact_PHONE_HOME, LibWrap.PROPKEY.contact_PHONE_OFFICE, LibWrap.PROPKEY.contact_ASSIGNED_PHONE1, LibWrap.PROPKEY.contact_ASSIGNED_PHONE2, LibWrap.PROPKEY.contact_ASSIGNED_PHONE3];
    var oldAvailabilitiesMappedToAvailable = [LibWrap.Contact.availability_ONLINE, LibWrap.Contact.availability_ONLINE_FROM_MOBILE, LibWrap.Contact.availability_AWAY, LibWrap.Contact.availability_AWAY_FROM_MOBILE, LibWrap.Contact.availability_SKYPE_ME, LibWrap.Contact.availability_SKYPE_ME_FROM_MOBILE];

    var buddyStatus = defineEnum("notAuthorized", "notAuthorizedWithRequest", "authorizedWithRequest", "authorized", "blocked");
    var availabilityUnknown = LibWrap.Contact.availability_UNKNOWN;
    var availabilityPendingauth = LibWrap.Contact.availability_PENDINGAUTH;

    var contactStatusPassport = WinJS.Resources.getString("contact_status_passport").value;
    var contactStatusLync = WinJS.Resources.getString("contact_status_lync").value;
    var contactStatusAvailable = WinJS.Resources.getString("contact_status_available").value;
    var contactStatusInvisible = WinJS.Resources.getString("contact_status_invisible").value;
    var contactStatusConnecting = WinJS.Resources.getString("contact_status_connecting").value;

    var contact = MvvmJS.Class.define(function (libContact) {
        this.libContact = libContact;
        this.id = this.libContact.getObjectID();
        this.identity = this.libContact.getIdentity();
        this.type = this.libContact.getContactType();
        this.isMySelf = this.identity === lib.myIdentity;
        this.isSkypeContact = this.type === LibWrap.Contact.type_SKYPE;
        this.isMessengerContact = this.type === LibWrap.Contact.type_PASSPORT;
        this.isLyncContact = this.type === LibWrap.Contact.type_LYNC;
        this.isPstnContact = this.type === LibWrap.Contact.type_FREE_PSTN || this.type === LibWrap.Contact.type_PSTN || this.type === LibWrap.Contact.type_UNDISCLOSED_PSTN;
        this.isEmergencyContact = this.type === LibWrap.Contact.type_EMERGENCY_PSTN;
        this._hasId = uid++;
    }, {
        libContact: null,

        id: 0,
        identity: null,
        type: 0,
        _hasId: {
            value: 0,
            skipDispose: true,
            writable: true
        },

        _avatarSubscription: null,

        isMySelf: false,
        isEchoService: {
            get: function () {
                return this.identity === "echo123";
            }
        },      
        isSkypeContact: false,
        isMessengerContact: false,
        isLyncContact: false,
        isPstnContact: false,
        isEmergencyContact: false,
        _isAlive: false,

        getPhoneTypeOfProperty: function (propertyId) {
            var slotId = phoneSlotsToLib.indexOf(propertyId);
            if (slotId === -1) {
                return null;
            }

            return this._getPhoneTypeInSlot(slotId);
        },
        _getPhones: function () {
            var slotsLength = phoneSlot.asArray.length,
                slotId, slots = [];

            for (slotId = 0; slotId < slotsLength; slotId++) {
                slots.push({
                    id: slotId,
                    number: "",
                    type: ""
                });
            }

            var slotPhoneType;
            var startIndex;

            
            slots[phoneSlot.identity].number = this.identity;
            if (this.isPstnContact) {
                slotPhoneType = this._getPhoneTypeInSlot(phoneSlot.identity, phoneType.phone);
                slots[phoneSlot.identity].type = slotPhoneType;
                startIndex = phoneSlot.userDefined2;
            } else {
                slots[phoneSlot.identity].type = phoneType.skype;
                startIndex = phoneSlot.mobile;
            }

            var slotPhoneNumber;
            for (slotId = startIndex; slotId < slotsLength; slotId++) {
                slotPhoneNumber = this.libContact.getStrProperty(phoneSlotsToLib[slotId], "");
                if (slotPhoneNumber === "") {
                    continue;
                }

                slotPhoneType = this._getPhoneTypeInSlot(slotId);
                slots[slotId].number = slotPhoneNumber;
                slots[slotId].type = slotPhoneType;
            }

            slots = slots.filter(function (item) {
                return item.number !== "";
            });
            slots = slots.sort(function (item1, item2) {
                return item2.type - item1.type;
            });

            return slots;
        },

        _getPhoneTypeInSlot: function (slotId, defaultValue) {
            switch (slotId) {
                case phoneSlot.identity:
                    if (this.isPstnContact) {
                        return Skype.Model.Contact.stringToPhoneType(this.libContact.getStrProperty(LibWrap.PROPKEY.contact_ASSIGNED_PHONE1_LABEL)) || phoneType.mobile;
                    }
                    return phoneType.skype;
                case phoneSlot.home:
                    return phoneType.home;
                case phoneSlot.office:
                    return phoneType.office;
                case phoneSlot.mobile:
                    return phoneType.mobile;
                case phoneSlot.userDefined1:
                    return Skype.Model.Contact.stringToPhoneType(this.libContact.getStrProperty(LibWrap.PROPKEY.contact_ASSIGNED_PHONE1_LABEL), phoneType.other);
                case phoneSlot.userDefined2:
                    return Skype.Model.Contact.stringToPhoneType(this.libContact.getStrProperty(LibWrap.PROPKEY.contact_ASSIGNED_PHONE2_LABEL), phoneType.other);
                case phoneSlot.userDefined3:
                    return Skype.Model.Contact.stringToPhoneType(this.libContact.getStrProperty(LibWrap.PROPKEY.contact_ASSIGNED_PHONE3_LABEL), phoneType.other);
                default:
                    return defaultValue;
            }
        },

        alive: function (subscription) {
            if (this._isAlive) {
                return null;
            }

            var isSelfSubscription = !subscription;
            var prop2HandlerMap = null;
            if (isSelfSubscription) {
                prop2HandlerMap = this.buildSubscriptionMap();
                subscription = Skype.Utilities.subscribePropertyChanges(this.libContact, prop2HandlerMap);
            }
            this._avatarSubscription = Skype.Model.AvatarUpdater.instance.subscribe(this.identity, this._refreshAvatarUri.bind(this));
            this._propertyChangeSubscription = subscription;

            this._isAlive = true;
            return prop2HandlerMap;
        },

        buildSubscriptionMap: function () {
            var prop2handlerMap = {};
            prop2handlerMap[LibWrap.PROPKEY.contact_AVAILABILITY] = [this._refreshAvailability.bind(this)];
            prop2handlerMap[LibWrap.PROPKEY.contact_MOOD_TEXT] = [this._refreshMood.bind(this)];
            prop2handlerMap[LibWrap.PROPKEY.contact_RICH_MOOD_TEXT] = [this._refreshMood.bind(this)];

            prop2handlerMap[LibWrap.PROPKEY.contact_DISPLAYNAME] = [this._refreshName.bind(this), this._refreshNonHtmlName.bind(this)];
            prop2handlerMap[LibWrap.PROPKEY.contact_POPULARITY_ORD] = [this._refreshPopularity.bind(this)];
            prop2handlerMap[LibWrap.PROPKEY.contact_RECEIVED_AUTHREQUEST] = [this._refreshAuthRequestMessage.bind(this)];

            this._refreshPhones = this._refreshPhones.bind(this);
            phoneSlotsToLib.forEach(function (x) {
                if (x === null) {
                    return;
                }
                prop2handlerMap[x] = [this._refreshPhones];
            }, this);

            return prop2handlerMap;
        },

        _onDispose: function () {
            log("disposing contact " + this.identity);

            this.libContact && this.libContact.discard();
        },

        _getName: function () {
            var result = this.libContact.getDisplayNameHtml();
            if (this.libContact.getContactType() == LibWrap.Contact.type_EMERGENCY_PSTN) {
                result = "emergency_contact_name".translate(this.libContact.getIdentity());
            }
            return result;
        },

        _refreshName: function () {
            this.name = this._getName();
            roboSky.write("ContactWrapper,nameUpdated");
        },

        _getNonHtmlName: function () {
            var result = this.libContact.getStrProperty(LibWrap.PROPKEY.contact_DISPLAYNAME);
            if (this.libContact.getContactType() == LibWrap.Contact.type_EMERGENCY_PSTN) {
                result = "emergency_contact_name".translate(this.libContact.getIdentity());
            }
            return result;
        },
        _refreshNonHtmlName: function () {
            this.nonHtmlName = this._getNonHtmlName();
        },

        _getPopularity: function () {
            return this.libContact.getIntProperty(LibWrap.PROPKEY.contact_POPULARITY_ORD);
        },

        _refreshPopularity: function () {
            this.popularity = this._getPopularity();
        },

        _refreshPhones: function () {
            this.phones = this._getPhones();
        },

        _getAvailability: function () {
            return this.libContact.getIntProperty(LibWrap.PROPKEY.contact_AVAILABILITY);
        },

        _getPresence: function () {
            var presence = "online";
            if (oldAvailabilitiesMappedToAvailable.indexOf(this.availability) == -1) {
                presence = "offline";
            }
            return presence;
        },

        _getIsAvailable: function () {
            return this.presence === 'online';
        },

        _getIsPstnOnly: function () {
            return (this.isPstnContact && this.identity === this.name) || this.isEmergencyContact;
        },

        _getMood: function () {
            return this.libContact.getMoodTextHtml();
        },

        _getFormattedMood: function () {
            if (this.isMessengerContact) {
                return contactStatusPassport + this._getAppendedMood();
            }

            if (this.isLyncContact) {
                return contactStatusLync + this._getAppendedMood();
            }

            return this.mood || this._getFormattedAvailability();
        },

        _getAppendedMood: function () {
            return this.mood ? (" \u203A " + this.mood) : "";
        },

        _getFormattedAvailability: function () {
            var availability = "";

            if (this.isAvailable) {
                availability = contactStatusAvailable;
            } else if (this.isMySelf) {
                
                if (this.availability == LibWrap.Contact.availability_CONNECTING) {
                    availability = contactStatusConnecting;
                } else {
                    availability = contactStatusInvisible;
                }
            }

            return availability;
        },

        _getFormattedMoodInline: function () {
            var mood = this.mood;
            if (mood) {
                return Skype.Utilities.trimHtmlNewlines(this.formattedMood, " ");
            }
            return this.formattedMood;
        },

        _refreshAvailability: function () {
            var prev_availability = this.availability;
            this.availability = this._getAvailability();
            if ([availabilityPendingauth, availabilityUnknown].contains(prev_availability) && ![availabilityPendingauth, availabilityUnknown].contains(this.availability)) {
                roboSky.write("Contact,authorized");
            }

            this._refreshBuddyStatus(); 

            this.presence = this._getPresence();
            this.isAvailable = this._getIsAvailable();

            this.formattedMood = this._getFormattedMood();
            this.formattedMoodInline = this._getFormattedMoodInline();
        },

        _refreshMood: function () {
            this.mood = this._getMood();
            this.formattedMood = this._getFormattedMood();
            this.formattedMoodInline = this._getFormattedMoodInline();
        },


        _getHasAuthRequest: function () {
            return !!this.authRequestMessage && this.authRequestMessage.length > 0;
        },

        _getHasPendingAuthorization: function () {
            if (this.isLyncContact) {
                return this.libContact.isMemberOfHardwiredGroup(LibWrap.ContactGroup.type_CONTACTS_AUTHORIZED_BY_ME) && this.libContact.hasAuthorizedMe();
            } else {
                return this.libContact.isMemberOfHardwiredGroup(LibWrap.ContactGroup.type_CONTACTS_AUTHORIZED_BY_ME) &&
                    this.libContact.isMemberOfHardwiredGroup(LibWrap.ContactGroup.type_UNKNOWN_OR_PENDINGAUTH_BUDDIES);
            }
        },

        _refreshHasPendingAuthorization: function () {
            this.hasPendingAuthorization = this._getHasPendingAuthorization();
        },

        _getBuddyStatus: function () {
            if (this.isBlocked) {
                return buddyStatus.asArray[buddyStatus.blocked].name;
            }
            
            var hasAuthorizedMe = this.libContact.hasAuthorizedMe();
            var isMyBuddy = this.libContact.isMemberOfHardwiredGroup(LibWrap.ContactGroup.type_ALL_BUDDIES);
            var isAuthorizedByMe = this.libContact.isMemberOfHardwiredGroup(LibWrap.ContactGroup.type_CONTACTS_AUTHORIZED_BY_ME);
            
            if (!isAuthorizedByMe && !isMyBuddy && !hasAuthorizedMe) {
                return buddyStatus.asArray[buddyStatus.notAuthorized].name;
            }
            if (!isAuthorizedByMe && !isMyBuddy && hasAuthorizedMe && this.hasAuthRequest) {
                return buddyStatus.asArray[buddyStatus.notAuthorizedWithRequest].name;
            }
            if (isAuthorizedByMe && isMyBuddy && !hasAuthorizedMe) {
                return buddyStatus.asArray[buddyStatus.authorizedWithRequest].name;
            }
            if (isAuthorizedByMe && isMyBuddy && hasAuthorizedMe) {
                return buddyStatus.asArray[buddyStatus.authorized].name;
            }
            return buddyStatus.asArray[buddyStatus.notAuthorized].name;
        },

        isBuddy: {
            get: function () {
                return this.libContact.isMemberOfHardwiredGroup(LibWrap.ContactGroup.type_ALL_BUDDIES);
            }
        },

        hasAuthorizedMe: {
            get: function () {
                return this.libContact.hasAuthorizedMe();
            }
        },

        isContactWaitingAuthRequest: {
            get: function () {
                log('CONTACTS_WAITING_MY_AUTHORIZATION status: {0},'.format(this.libContact.isMemberOfHardwiredGroup(LibWrap.ContactGroup.type_CONTACTS_WAITING_MY_AUTHORIZATION)));
                return this.libContact.isMemberOfHardwiredGroup(LibWrap.ContactGroup.type_CONTACTS_WAITING_MY_AUTHORIZATION);
            }
        },

        _refreshBuddyStatus: function () {
            this._refreshHasPendingAuthorization();
            this.hasAuthRequest = this._getHasAuthRequest();

            this._refreshIsBlocked();
            this.buddyStatus = this._getBuddyStatus();
            this._refreshAvatarUri(); 
        },

        _refreshIsBlocked: function () {
            this.isBlocked = this._getIsBlocked();
            if (this.isBlocked) {
                roboSky.write("Contact,blocked");
            } else {
                roboSky.write("Contact,unblocked");
            }
        },

        _getIsBlocked: function () {
            return this.libContact.isMemberOfHardwiredGroup(LibWrap.ContactGroup.type_CONTACTS_BLOCKED_BY_ME);
        },

        _getAuthRequestMessage: function () {
            return this.libContact.getAuthRequestMessageHtml();
        },

        _refreshAuthRequestMessage: function () {
            this.authRequestMessage = this._getAuthRequestMessage();
            this._refreshBuddyStatus();
        },

        _getAvatarUri: function () {
            
            
            

            

            var avatarURI = Skype.Model.AvatarUpdater.instance.getAvatarURI(this.identity),
                isDefaultAvatarURI = LibWrap.AvatarManager.isDefaultAvatarURI(avatarURI),
                useLocalAvatar = this.isPstnContact || this.isEmergencyContact || this.isMySelf || this.libContact.hasAuthorizedMe() || !isDefaultAvatarURI || this.isMessengerContact || this.isEchoService;

            return useLocalAvatar ? avatarURI : "https://api.skype.com/users/{0}/profile/avatar".format(this.identity);
        },

        _getIsDefaultAvatar: function () {
            return LibWrap.AvatarManager.isDefaultAvatarURI(this.avatarUri);
        },

        _refreshAvatarUri: function (value) {
            this.avatarUri = this._getAvatarUri(value);
            this.isDefaultAvatar = this._getIsDefaultAvatar();
        }
    }, {
        name: Skype.Utilities.cacheableProperty("name"),
        nonHtmlName: Skype.Utilities.cacheableProperty("nonHtmlName"),
        popularity: Skype.Utilities.cacheableProperty("popularity"),
        mood: Skype.Utilities.cacheableProperty("mood"),
        formattedMood: Skype.Utilities.cacheableProperty("formattedMood"),
        availability: Skype.Utilities.cacheableProperty("availability"),
        presence: Skype.Utilities.cacheableProperty("presence"),
        isAvailable: Skype.Utilities.cacheableProperty("isAvailable"),
        phones: Skype.Utilities.cacheableProperty("phones"),
        isPstnOnly: Skype.Utilities.cacheableProperty("isPstnOnly"),

        buddyStatus: Skype.Utilities.cacheableProperty("buddyStatus"),
        hasAuthRequest: Skype.Utilities.cacheableProperty("hasAuthRequest"),
        hasPendingAuthorization: Skype.Utilities.cacheableProperty("hasPendingAuthorization"),
        isBlocked: Skype.Utilities.cacheableProperty("isBlocked"),

        authRequestMessage: Skype.Utilities.cacheableProperty("authRequestMessage"),

        avatarUri: Skype.Utilities.cacheableProperty("avatarUri"),
        isDefaultAvatar: Skype.Utilities.cacheableProperty("isDefaultAvatar"),

        formattedMoodInline: Skype.Utilities.cacheableProperty("formattedMoodInline"),

        country: {
            get: function () {
                var country = this.libContact ? this.libContact.getStrProperty(LibWrap.PROPKEY.contact_COUNTRY) : "";
                country = (country && country.toLocaleLowerCase()) || "";
                return country;
            }
        },

        province: {
            get: function () {
                var country = this.libContact ? this.libContact.getStrProperty(LibWrap.PROPKEY.contact_PROVINCE) : "";
                return country;
            }
        },

        city: {
            get: function () {
                var country = this.libContact ? this.libContact.getStrProperty(LibWrap.PROPKEY.contact_CITY) : "";
                return country;
            }
        },

        locationInfo: {
            get: function () {
                var arr = [];
                this.city && arr.push(this.city);
                this.province && arr.push(this.province);
                this.country && arr.push(this.country.toUpperCase());

                return arr.join(", ");
            }
        },
        
        statusInfo: {
            get: function () {
                if (this.isLyncContact) {
                    return contactStatusLync;
                }
                if (this.isMessengerContact) {
                    return contactStatusPassport;
                }
                return this.locationInfo;
            }
        }
    }, {
        stringToPhoneType: function (sType, defaultValue) {
            
            
            
            defaultValue = defaultValue || null;
            var iType;
            iType = parseInt(sType, 10);
            if (isNaN(iType)) {
                return defaultValue;
            }

            if (phoneType.asArray[0].value <= iType && iType <= phoneType.asArray[phoneType.asArray.length - 1].value) {
                return phoneType.asArray[iType].value;
            } else {
                return defaultValue;
            }
        },
    });
    
    contact = WinJS.Class.mix(contact, Skype.Class.disposableMixin);
    WinJS.Namespace.define("Skype.Model", {
        Contact: contact,
        BuddyStatus: buddyStatus,
        PhoneSlot: phoneSlot,
        PhoneType: phoneType
    });
    
    window.traceClassMethods && window.traceClassMethods(contact, "Contact", ["alive"]);

    function defineEnum() {
        var $enum;
        if (arguments.length > 1) {
            $enum = {};
            for (var i = 0; i < arguments.length; i++) {
                $enum[arguments[i]] = i;
            }
        } else {
            $enum = arguments[0];
        }

        var items = Object.getOwnPropertyNames($enum).map(function (prop) {
            return {
                name: prop,
                value: $enum[prop]
            };
        }).sort(function (a, b) {
            return a.value < b.value;
        });

        Object.defineProperty($enum, "asArray", {
            get: function () {
                return items;
            },
            enumerable: true,
            configurable: true
        });

        return $enum;
    }
}());

(function SearchedContact() {
    "use strict";

    var searchedContact = MvvmJS.Class.derive(Skype.Model.Contact, function (libContact) {
        this.base(libContact);
    }, {
        _getName: function () {
            var result = this.libContact.getFullNameHtml();
            if (!result || !result.length) {
                result = this.libContact.getDisplayNameHtml();
            }
            return result;
        },

        _getAvatarUri: function () {
            return "https://api.skype.com/users/{0}/profile/avatar".format(this.identity);
        },
    });

    WinJS.Namespace.define("Skype.Model", {
        SearchedContact: searchedContact
    });
}());
