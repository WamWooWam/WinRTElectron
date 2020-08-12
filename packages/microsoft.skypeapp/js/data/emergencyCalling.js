

(function () {
    "use strict";
    var emergencyCountries = ["gb", "au", "dk", "fi"];

    var emergencyCalling = WinJS.Class.define(function () {
        },
        {
            emergencyCallingAllowed: function () {
                return emergencyCountries.contains(Skype.Model.Options.emergency_country);
            },
            
            emergencyCountry: {
                get: function () {
                    return Skype.Model.Options.emergency_country;
                },
                set: function (value) {
                    Skype.Model.Options.emergency_country = value;
                    this.dispatchEvent("countryChanged");
                }
            },

            emergencyCountryName: {
                get: function () {
                    return Skype.Model.CountriesRepository.instance.countryNameOfCode(this.emergencyCountry);
                }
            }
        }
    );

    WinJS.Namespace.define("Skype.Model", {
        EmergencyCalling: WinJS.Class.mix(emergencyCalling, WinJS.Utilities.eventMixin)
    });

})();
