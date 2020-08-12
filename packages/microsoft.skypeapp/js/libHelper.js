

(function () {
    "use strict";

    var _countryISOList;
    var _countryNameList;
    var _countryPrefixList;
    var _countryDialList;
    var phone2number = {
        "home":     "0",
        "office":   "1",
        "mobile":   "2",
        "other":    "3"
    };

    
    
    
    function _loadCountryInfo() {
        if (!_countryISOList) {
            _countryISOList = new LibWrap.VectGIString();
            _countryNameList = new LibWrap.VectGIString();
            _countryPrefixList = new LibWrap.VectUnsignedInt();
            _countryDialList = new LibWrap.VectGIString();
            lib.getISOCountryInfo(_countryISOList, _countryNameList, _countryPrefixList, _countryDialList);
        }
    }

    
    
    
    
    
    
    
    function countryISO2Name(isoCode) {
        _loadCountryInfo();

        var countryName = "";
        for (var i = 0; i < _countryISOList.getCount() ; i++) {
            if (_countryISOList.get(i) === isoCode) {
                countryName = _countryNameList.get(i);
                break;
            }
        }

        return countryName;
    }

    
    
    
    
    function countryInfo() {
        _loadCountryInfo();

        return { names: _countryNameList, prefixes: _countryPrefixList, codes: _countryISOList };
    }

    function validPSTN(number) {
        switch (lib.getContactType(number)) {
            case LibWrap.Contact.type_FREE_PSTN:
            case LibWrap.Contact.type_PSTN:
            case LibWrap.Contact.type_UNDISCLOSED_PSTN:
            case LibWrap.Contact.type_EMERGENCY_PSTN:
                return true;
        }
        return false;
    }
    
    function validIdentity(number) {
        return (LibWrap.WrSkyLib.validateIdentity(number, false) === LibWrap.WrSkyLib.normalizeresult_IDENTITY_OK);
    }


    
    
    
    var INTL_PREFIXES = ['+', '00', '011'];

    function numberStartsWithPrefix(number) {
        
        for (var i = 0; i < INTL_PREFIXES.length; i++) {
            if (number.startsWith(INTL_PREFIXES[i])) {
                return true;
            }
        }
        return false;
    }

    
    
    
    
    
    
    
    
    
    function getCountryCode(number) {
        if (!numberStartsWithPrefix(number)) { 
            return "";
        }
        var normalizedNumber = LibWrap.WrSkyLib.normalizePSTNWithCountry(number, 0);
        if (!normalizedNumber) {
            return "";
        }
        return lib.getISOCountryCodebyPhoneNo(normalizedNumber);
    }

    
    
    
    
    
    
    
    
    
    function getPhoneLabelForType(typeName) {
        return phone2number[typeName];
    }

    
    
    
    
    
    
    
    
    
    
    
    
    function identifyCountryCode(input, countryList) {

        var code = getCountryCode(input);
        if (!code || !countryList) {
            return -1;
        }

        var index = countryList.index(function (item) {
            return item.code === code;
        });

        return index;
    }

    
    
    
    
    
    
    
    
    
    
    
    
    function getIdentityForCountryCode(input, countryPrefix) {
        return LibWrap.WrSkyLib.normalizePSTNWithCountry(input, countryPrefix);
    }

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    function savePSTNContact(input, prefix, contactNumberType, contactName) {
        var identity = Skype.Lib.getIdentityForCountryCode(input, prefix);
        var label = Skype.Lib.getPhoneLabelForType(contactNumberType);

        if (label == undefined) {
            return null; 
        }

        var libContact = lib.getContactByIdentity(identity);
        if (!libContact) {
            log("Cannot create contact for provided number !");
            return null;
        }

        var contactGroupId = lib.getHardwiredContactGroup(LibWrap.ContactGroup.type_SKYPEOUT_BUDDIES);
        var contactGroup = lib.getContactGroup(contactGroupId);

        if (!libContact.isMemberOfHardwiredGroup(LibWrap.ContactGroup.type_SKYPEOUT_BUDDIES)) {

            libContact.giveDisplayName(contactName);
            libContact.setPhoneNumber(1, label, identity); 

            contactGroup.addContact(libContact.getObjectID()); 
        } else {
            
            log("savePSTNContact: This number is already present !");
        }

        contactGroup.discard();
        libContact.discard();
        return identity;
    }

    
    
    
    
    
    
    
    
    
    function getSmsAblePhones(phones) {
        var phoneType = Skype.Model.PhoneType;
        var emergencyPstn = false;

        return phones.filter(function (item) {
            emergencyPstn = lib.getContactType(item.number) == LibWrap.Contact.type_EMERGENCY_PSTN;
            return (!emergencyPstn && ((item.type === phoneType.skype) || (item.type === phoneType.mobile) || (item.type === phoneType.home) ||
                (item.type === phoneType.office) || (item.type === phoneType.other)));
        });
    }

    function conversationContainsPSTN(libConversation) {
        
        
        
        
        
        
        
        
        

        assert(libConversation, "Incorrect usage of conversationContainsPSTN");

        if (libConversation && libConversation.participants && libConversation.participants.length > 1) {
            for (var i = 0; i < libConversation.participants.length; i++) {
                if (validPSTN(libConversation.participants[i].participantContact.getIdentity())) {
                    return true;
                }
            }
        }
        return false;
    }

    function isUpgradedCall(conversationIdentity) {
        
        
        
        
        
        
        
        
        
        var isUpgraded = false;
        var libConversation = lib.getConversationByIdentity(conversationIdentity);
        if (libConversation) {
            if (libConversation.getIntProperty(LibWrap.PROPKEY.conversation_TYPE) === LibWrap.Conversation.type_DIALOG) {
                isUpgraded = libConversation.partner.getIntProperty(LibWrap.PROPKEY.participant_IS_SEAMLESSLY_UPGRADED_CALL) !== 0;
            }
            libConversation.discard();
        }
        return isUpgraded;
    }

    WinJS.Namespace.define("Skype.Lib", {
        countryISO2Name: countryISO2Name,
        countryInfo: countryInfo,
        validPSTN: validPSTN,
        validIdentity: validIdentity,
        identifyCountryCode: identifyCountryCode,
        getIdentityForCountryCode: getIdentityForCountryCode,
        numberStartsWithPrefix: numberStartsWithPrefix,
        getPhoneLabelForType: getPhoneLabelForType,
        getCountryCode: getCountryCode,
        savePSTNContact: savePSTNContact,
        getSmsAblePhones: getSmsAblePhones,
        conversationContainsPSTN: conversationContainsPSTN,
        isUpgradedCall: isUpgradedCall,
    });
}());