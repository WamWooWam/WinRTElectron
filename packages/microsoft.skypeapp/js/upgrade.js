

(function () {
    "use strict";

    WinJS.Namespace.define("Skype.Upgrade", {
        
        _mandatoryUpgradeCodes: [LibWrap.WrSkyLib.upgraderesult_FORCED_UPGRADE, LibWrap.WrSkyLib.upgraderesult_FORCED_STEALTH_UPGRADE, LibWrap.WrSkyLib.upgraderesult_DISCONTINUED],

        
        _state: {
            upgrade: 1,
            proceed: 2
        },


        
        
        
        needsUpgrade: function () {
            var upgrade = Skype.Upgrade._cache;
            return !!upgrade && Skype.Upgrade._checkMandatoryUpgrade(upgrade);
        },
        

        navigateToUpgradeAsync: function() {
            return WinJS.UI.processAll(document.querySelector('section.navigationContainer'))
                    .then(function () {
                        return Skype.UI.navigate('upgrade');
                    });
        },

        
        
        
        listen: function () {
            lib.oncheckupgraderesult = Skype.Upgrade._onLibUpgrade;
        },

        
        _cache: {
            get: function () {
                var settings = Windows.Storage.ApplicationData.current.localSettings;
                var upgradeKey = "upgrade." + Skype.Version.skypeVersion;
                var upgrade = settings.values[upgradeKey];

                
                if (upgrade === undefined) {
                    log("Skype.Upgrade._cache.get: no cached value for key [{0}]".format(upgradeKey));
                } else {
                    log("Skype.Upgrade._cache.get: cached value for key [{0}] is [{1}]".format(upgradeKey, upgrade));
                }
                return upgrade;
            },
            set: function (value) {
                var settings = Windows.Storage.ApplicationData.current.localSettings;
                var upgradeKey = "upgrade." + Skype.Version.skypeVersion;
                settings.values[upgradeKey] = value;
                log("Skype.Upgrade._cache.set: saved value for key [{0}] is [{1}]".format(upgradeKey, value));
            }
        },

        
        _onLibUpgrade: function (params) {
            var isManual = params.detail[0];
            var code = params.detail[1];
            log("Skype.Upgrade._onLibUpgrade: type [{0}] code [{1}]".format(isManual, code));

            if (!isManual) {
                Skype.Upgrade._checkMandatoryUpgrade(code);
            }
        },

        
        _checkMandatoryUpgrade: function (upgradeCode) {
            var result = false;
            if (Skype.Upgrade._mandatoryUpgradeCodes.indexOf(upgradeCode) !== -1) {
                log("Skype.Upgrade._checkMandatoryUpgrade: mandatory upgrade code received");
                result = true;
            } else {
                log("Skype.Upgrade._checkMandatoryUpgrade: code [{0}] is not requiring mandatory upgrade".format(upgradeCode));
            }

            Skype.Upgrade._cache = upgradeCode;
            return result;
        }
    });
})();
