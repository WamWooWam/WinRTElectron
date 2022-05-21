
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../../../shared/Jx/Core/Jx.js" />
/// <reference path="../JSUtil/Include.js" />
/// <reference path="../JSUtil/Namespace.js" />
/// <reference path="Windows.Foundation.js" />
/// <reference path="%_NTTREE%\drop\published\ModernContactPlatform\Microsoft.WindowsLive.Platform.js"/>
/// <reference path="Protocols.ref.js" />
/// <dictionary>audiocall,videocall,tel,sms,mailto,mri</dictionary>

Jx.delayDefine(People, "Protocol", function () {

var P = People,
    ContactIMType = Microsoft.WindowsLive.Platform.ContactIMType;

var verbs = {
    profile:   { identifier: "identifier", service: "required" },
    message:   { identifier: "identifier", service: "required" },
    audiocall: { identifier: "identifier", service: "required" },
    videocall: { identifier: "identifier", service: "required" },
    tel:       { identifier: "phoneNumber", service: "illegal" },
    sms:       { identifier: "phoneNumber", service: "illegal" },
    mailto:    { identifier: "email", service: "illegal" }
};

var services = [
    { name: "messenger",    sourceId: "WL",    imType: ContactIMType.windowsLive, mriFormat: "1:{0}", identifier: "windowsLiveEmailAddress" },
    { name: "outlook-com",  sourceId: "ABCH"   },
    { name: "skype-com",    sourceId: "SKYPE", mriFormat: "8:{0}" },
    { name: "facebook-com", sourceId: "FB",    mriFormat: "13:{0};via=14:FB", postName: "facebook.com" },
    { name: "twitter-com",  sourceId: "TWITR", mriFormat: "13:{0};via=14:TWITR", postName: "twitter.com" },
    { name: "google-com",   sourceId: "GOOG"   },
    { name: "weibo-com",    sourceId: "SINWE"  },
    { name: "linkedin-com", sourceId: "LI"     },
    { name: "yahoo-com",    sourceId: "YAHOO", imType: ContactIMType.yahoo, mriFormat: "32:{0}", identifier: "yahooEmailAddress" },
    { name: "lync-com",     sourceId: "LYNC",  imType: ContactIMType.office, mriFormat: "2:{0}", identifier: "federatedEmailAddress" }
];

function findServiceByName(serviceName) {
    /// <param name="serviceName" type="String"/>
    /// <returns type="ServiceInfo"/>
    for (var i = 0; i < services.length; i++) {
        var service = /*@static_cast(ServiceInfo)*/services[i];
        if (service.name === serviceName) {
            return service;
        }
    }
    return null;
}
function findServiceBySourceId(sourceId) {
    /// <param name="sourceId" type="String"/>
    /// <returns type="ServiceInfo"/>
    for (var i = 0; i < services.length; i++) {
        var service = /*@static_cast(ServiceInfo)*/services[i];
        if (service.sourceId === sourceId) {
            return service;
        }
    }
    return null;
}
function findServiceByIMType(imType) {
    /// <param name="sourceId" type="String"/>
    /// <returns type="ServiceInfo"/>
    if (Jx.isDefined(imType)) {
        for (var i = 0; i < services.length; i++) {
            var service = /*@static_cast(ServiceInfo)*/services[i];
            if (service.imType === imType) {
                return service;
            }
        }
    }
    return null;
}
function findServiceByPostName(postName) {
    /// <param name="postName" type="String"/>
    /// <returns type="ServiceInfo"/>
    for (var i = 0; i < services.length; i++) {
        var service = /*@static_cast(ServiceInfo)*/services[i];
        if (service.postName === postName) {
            return service;
        }
    }
    return null;
}

P.Protocol = function () {
    this.verb = "";
    this.contact = {
        sourceId: "",
        identifier: "",
        email: "",
        phoneNumber: ""
    };
};
P.Protocol.prototype = {
    isValid: function () {
        /// <returns type="Boolean"/>
        return this !== invalid;
    },
    toUrl: function () {
        /// <summary>This function will always make an URL, ignore extra data, and fail gracefully if insufficient data
        /// is provided. A user may pass in a sourceId/identifier but use a protocol that doesn't support that form of
        /// addressing.  We may well add new services later, and multiple layers shouldn't need to know what is supported.
        /// Or they may pass in sourceId that doesn't map to a supported service.  Don't make them worry about that either.
        /// </summary>
        /// <returns type="String">The URL, or an empty string</returns>
        if (!this.isValid()) {
            return "";
        }

        Debug.assert(this.verb in verbs, "Unsupported verb");
        var schemeComponents = [this.verb];

        var verb = /*@static_cast(VerbInfo)*/verbs[this.verb];
        if (verb.service !== "illegal") {
            var service = null;
            if (Jx.isNonEmptyString(this.contact.sourceId)) {
                service = findServiceBySourceId(this.contact.sourceId);
                if (!service) {
                    Jx.log.warning("Unsupported sourceId ignored: " + this.contact.sourceId);
                } else {
                    schemeComponents.push(service.name);
                }
            }

            if (verb.service === "required" && !service) {
                Jx.log.warning("No service provided when creating service-required verb");
                return "";
            }
        }

        if (this.contact.phoneNumber) {
            // Sanitize the phone number: strip visual separators
            this.contact.phoneNumber = this.contact.phoneNumber.replace(/[\s-.()]/g, "");
        }

        var identifier = this.contact[verb.identifier];
        if (!identifier) {
            Jx.log.error("No contact identifier provided for verb");
            return "";
        }
        
        // For FB, we have a special Uri schema.
        return schemeComponents.join("-") + ":" + (this.contact.sourceId === "FB" ? "?serviceUserId=" + encodeIdentifier(identifier) + "&displayName=" + encodeIdentifier(this.contact.calculatedUIName) : encodeIdentifier(identifier)); 
    },
    toMri: function () {
        /// <summary>Creates an MRI for the provided contact data.  Note that not all contact types (like ABCH) support
        /// MRIs.  MRI details are documented at http://abch/wiki/mri.aspx.</summary>
        /// <returns type="String">The MRI, or an empty string if not provided</returns>
        if (this.isValid()) {
            var service = findServiceBySourceId(this.contact.sourceId);
            if (service) {
                var mriFormat = service.mriFormat;
                if (mriFormat) {
                    var identifier = this.contact.identifier;
                    return mriFormat.replace("{0}", function () { return identifier; });
                }
            }
        }
        return "";
    },
    toPerson: function (platform) {
        /// <summary>Looks up a person object from the platform for the provided contact data.</summary>
        /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client"/>
        /// <returns tye="Microsoft.WindowsLive.Platform.Person">The person, or null if the person can't be found</returns>
        var service = findServiceBySourceId(this.contact.sourceId);
        if (!service) {
            Jx.log.warning("Unsupported sourceId ignored: " + this.contact.sourceId);
            return null;
        }

        if (service.identifier) { // Services with non-standard identifiers are looked up by MRI
            var mri = this.toMri();
            Debug.assert(Jx.isNonEmptyString(mri));
            return platform.peopleManager.tryLoadPersonByMri(mri);
        } else { // Other services can be looked up by thirdPartyObjectId
            return platform.peopleManager.tryLoadPersonBySourceIDAndObjectID(this.contact.sourceId, this.contact.identifier);
        }
    }
};

P.Protocol.create = function (verb, /*@dynamic*/contact) {
    /// <param name="verb" type="String"/>
    /// <param name="contact"/>
    /// <returns type="P.Protocol"/>
    Debug.assert(Jx.isNonEmptyString(verb));
    Debug.assert(Jx.isObject(contact));
    Debug.assert(Jx.isNullOrUndefined(contact.sourceId) || Jx.isString(contact.sourceId));
    Debug.assert(Jx.isNullOrUndefined(contact.identifier) || Jx.isString(contact.identifier));
    Debug.assert(Jx.isNullOrUndefined(contact.email) || Jx.isString(contact.email));
    Debug.assert(Jx.isNullOrUndefined(contact.phoneNumber) || Jx.isString(contact.phoneNumber));

    var result = new P.Protocol();
    result.verb = verb;
    result.contact.sourceId = contact.sourceId || "";
    result.contact.identifier = contact.identifier || "";
    result.contact.email = contact.email || "";
    result.contact.phoneNumber = contact.phoneNumber || "";
    return result;
};

P.Protocol.createFromContact = function (verb, contact) {
    /// <param name="contact" type="Microsoft.WindowsLive.Platform.Contact"/>
    /// <returns type="P.Protocol"/>
    var result = new P.Protocol();
    result.verb = verb;
    try {
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable> JSGen has the wrong capitalization for imType
        var service = findServiceByIMType(contact.imType) || findServiceBySourceId(contact.account.sourceId);
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
        if (service) {
            result.contact.sourceId = service.sourceId;
            result.contact.identifier = contact[service.identifier || "thirdPartyObjectId"];
            result.contact.calculatedUIName = contact["calculatedUIName"];
        } else {
            Jx.log.warning("Unsupported service ignored");
        }
    } catch (ex) {
        Jx.log.exception("Error getting contact information", ex);
        return invalid;
    }
    return result;
};

P.Protocol.createFromPostInfo = function(postName, thirdPartyObjectId) {
    var result = new P.Protocol();
    var service = findServiceByPostName(postName);
    if (service) {
        result.contact.sourceId = service.sourceId;
        result.contact.identifier = thirdPartyObjectId;
    } else {
        Jx.log.warning("Unsupported service ignored");
    }
    return result;
}

P.Protocol.fromUri = function (uri) {
    ///<summary>Parses the provided URI</summary>
    ///<param name="uri" type="Windows.Foundation.Uri"/>
    ///<returns type="P.Protocol">Parsed URL info</returns>
    Debug.assert(Jx.isObject(uri));
    Jx.log.pii("Processing uri: " + uri.rawUri);

    var result = new P.Protocol(); 

    var schemeName = uri.schemeName;

    // Reject URLs with invalid fields
    if (Jx.isNonEmptyString(uri.userName) || Jx.isNonEmptyString(uri.password) || Jx.isNonEmptyString(uri.port)) {
        Jx.log.error("Illegal field specified in uri");
        return invalid;
    }
          
    // Split the scheme into "verb"-"service"
    var split = schemeName.split("-");
    var verbName = split.shift().toLowerCase();
    var serviceName = split.join("-").toLowerCase();

    // Look up the verb
    if (Object.keys(verbs).indexOf(verbName) === -1) {
        Jx.log.error("Unrecognized verb");
        return invalid;
    }
    result.verb = verbName;
    var verb = /*@static_cast(VerbInfo)*/verbs[verbName];

    // Look up the service
    if (serviceName === "") {
        if (verb.service === "required") {
            Jx.log.error("Service not specified for service-required verb");
            return invalid;
        }
    } else {
        if (verb.service === "illegal") {
            Jx.log.error("Service specified for unsupported verb");
            return invalid;
        }

        // Look up the service
        var service = findServiceByName(serviceName);
        if (!service) {
            Jx.log.error("Unrecognized service");
            return invalid;
        }
        result.contact.sourceId = service.sourceId;
    }

    // Grab the object id / email / phone number
    if (uri.path === "" || uri.path === "/") {
        Jx.log.error("No identifier specified");
        return invalid;
    }
    result.contact[verb.identifier] = decodeIdentifier(uri.path);
    return result;
};

var invalid = new P.Protocol();
invalid.verb = "invalid";


function encodeIdentifier(identifier) {
    /// <summary>Encodes the provided identifier for use in URLs.  A slightly less stringent of encodeURIComponent, which leaves "@", "+" and ":" unmolested.</summary>
    /// <param name="identifier" type="String"/>
    /// <returns type="String"/>
    identifier = identifier.replace(/[\ud800-\udfff]/g, "");
    return encodeURIComponent(identifier).replace(/%(40|2B|3A)/gi, decodeURIComponent); 
}
function decodeIdentifier(identifier) {
    /// <summary>Complementary function to encodeIdentifier.</summary>
    /// <param name="identifier" type="String"/>
    /// <returns type="String"/>
    return decodeURIComponent(identifier); 
}

});
