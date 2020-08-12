

(function () {
    "use strict";

    var CountriesRepository = MvvmJS.Class.define(function (filterType) {
        this._initCountries();
    }, {

        countries: null,

        countryNameOfCode: function(code){
            for (var i = 0; i < this.countries.length; i++) {
                if (this.countries.getItem(i).data.code === code) {
                    return this.countries.getItem(i).data.name;
                }
            }
            return "";
        },

        _initCountries: function () {
            
            
            this.countries = new MvvmJS.Binding.SelectableList();

            
            var countryInfo = Skype.Lib.countryInfo();
            for (var i = 0; i < countryInfo.names.getCount() ; i++) {
                this.countries.push({
                    code: countryInfo.codes.get(i),
                    name: countryInfo.names.get(i),
                    prefix: countryInfo.prefixes.get(i),
                    label: countryInfo.names.get(i) + " +" + countryInfo.prefixes.get(i)
                });
            }
            
            this.countries.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
        },
    }, {
    }, {
        instance: {
            get: function () {
                if (!instance) {
                    instance = new CountriesRepository();
                }
                return instance;
            }
        },

        cloneCountryList: function () {
            return new MvvmJS.Binding.SelectableList(Skype.Model.CountriesRepository.instance.countries.concat());
        }
    });

    var instance;

    WinJS.Namespace.define("Skype.Model", {
        CountriesRepository: CountriesRepository
    });

}());