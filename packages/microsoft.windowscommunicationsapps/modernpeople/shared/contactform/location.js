
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="%_NTTREE%\drop\published\ModernContactPlatform\Microsoft.WindowsLive.Platform.js" />
/// <reference path="../../Shared/JSUtil/Include.js"/>
/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="ContactForm.js"/>


Jx.delayDefine(People, "Location", function () {

    ///<disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    var Compare = P.Compare;
    var L = P.Location = {};
    ///<enable>JS2076.IdentifierIsMiscased</enable>

    L.compare = function (a1, a2) {
        /// <summary>Compares 2 addresses.</summary>
        /// <param name="a1" type="Microsoft.WindowsLive.Platform.Location"/>
        /// <param name="a2" type="Microsoft.WindowsLive.Platform.Location"/>
        /// <returns type="Number">
        ///   Subset (-1) if a1 is a subset of a2
        ///   Equal (0) if a1 is equal to a2
        ///   Superset (1) if a1 is a superset of a2
        ///   Different (2) if they don't match.
        /// </returns>

        if (a1 === null && a2 === null) {
            return Compare.equal;
        }
        if (a1 === null && a2 !== null) {
            return Compare.subset;
        }
        if (a2 === null && a1 !== null) {
            return Compare.superset;
        }

        var comparisonValue = Compare.equal;

        // State comparison will be done separately
        var a1Fields = [];
        a1Fields.push(a1.street, a1.city, a1.zipCode, a1.country);
        var a1Len = a1Fields.length;

        var a2Fields = [];
        a2Fields.push(a2.street, a2.city, a2.zipCode, a2.country);
        var a2Len = a2Fields.length;

        for (var i = 0; i < a1Len; i++) {
            var f1 = a1Fields[i];

            if (f1 === null) {
                f1 = "";
            } else {
                f1 = f1.trim().toLowerCase();
            }

            var f2 = a2Fields[i];
            if (f2 === null) {
                f2 = "";
            } else {
                f2 = f2.trim().toLowerCase();
            }


            if (f1 === f2) {
                // This field is equal, keep the current comparison state
                continue;
            } else if (f1.indexOf(f2) !== -1) {
                // No need to check for null for f2 since we already converted null string to empty

                // F1 is a superset of F2
                // Contains will also handle empty string.
                // If we already have a subset comparison value, then mark as different and break out.

                if (comparisonValue === Compare.subset) {
                    comparisonValue = Compare.different;
                    break;
                } else {
                    // Mark as superset
                    comparisonValue = Compare.superset;
                }
            } else if (f2.indexOf(f1) !== -1) {
                // F1 is a subset of F2
                // If we already have a superset comparison value, then mark as different and break out.

                if (comparisonValue === Compare.superset) {
                    comparisonValue = Compare.different;
                    break;
                } else {
                    // Mark as subset
                    comparisonValue = Compare.subset;
                }
            } else {
                // No relationship, mark as different and break
                comparisonValue = Compare.different;
                break;
            }
        }


        if (comparisonValue !== Compare.different) {
            // ComparisonState can be in Equal, Subset or Superset states

            var stateComparisonValue = compareStates(a1.state, a2.state);

            if (stateComparisonValue === Compare.different) {
                // If states are different, then the entire address is different.
                comparisonValue = Compare.different;
            } else if (((comparisonValue === Compare.subset) && (stateComparisonValue === Compare.superset)) ||
                       ((comparisonValue === Compare.superset) && (stateComparisonValue === Compare.subset))) {
                // If one is subset the other is superset, it means the entire address is different
                comparisonValue = Compare.different;
            } else if (comparisonValue === Compare.equal) {
                // If the other fields are equal, take the value from the state comparison
                comparisonValue = stateComparisonValue;
            }
        }

        return comparisonValue;
    };

    // Compares 2 states. 
    var compareStates = function (s1, s2) {
        /// <summary>Compares 2 states, can match state abbreviations to full names</summary>
        /// <param name="s1" type="String"/>
        /// <param name="s2" type="String"/>
        /// <returns type="Number">
        ///   Subset (-1) if s1 is a subset of s2
        ///   Equal (0) if s1 is equal of s2
        ///   Superset (1) if s2 is a superset of s2
        ///   Different (2) if they don't match.
        /// </returns>

        if (s1 === null) {
            s1 = "";
        }
        if (s2 === null) {
            s2 = "";
        }

        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();

        if (s1 === s2) {
            // States are equal
            return Compare.equal;
        }

        if ((s1 === "") && (s2 !== "")) {
            return Compare.subset;
        }

        if ((s2 === "") && (s1 !== "")) {
            return Compare.superset;
        }

        var st1 = stateMapping[s1] || s1;
        var st2 = stateMapping[s2] || s2;

        return st1 === st2 ? Compare.equal : Compare.different;
    };

    /// <disable>JS2024.DoNotQuoteObjectLiteralPropertyNames</disable> JSCover disagrees about keywords
    var stateMapping = {
        al: "alabama",
        ak: "alaska",
        az: "arizona",
        ar: "arkansas",
        ca: "california",
        co: "colorado",
        ct: "connecticut",
        de: "delaware",
        dc: "district of columbia",
        fl: "florida",
        ga: "georgia",
        hi: "hawaii",
        id: "idaho",
        il: "illinois",
        "in": "indiana",
        ia: "iowa",
        ks: "kansas",
        ky: "kentucky",
        la: "louisiana",
        me: "maine",
        md: "maryland",
        ma: "massachusetts",
        mi: "michigan",
        mn: "minnesota",
        ms: "mississippi",
        mo: "missouri",
        mt: "montana",
        ne: "nebraska",
        nv: "nevada",
        nh: "new hampshire",
        nj: "new jersey",
        nm: "new mexico",
        ny: "new york",
        nc: "north carolina",
        nd: "north dakota",
        oh: "ohio",
        ok: "oklahoma",
        or: "oregon",
        pa: "pennsylvania",
        ri: "rhode island",
        sc: "south carolina",
        sd: "south dakota",
        tn: "tennessee",
        tx: "texas",
        ut: "utah",
        vt: "vermont",
        wa: "washington",
        wv: "west virginia",
        wi: "wisconsin",
        wy: "wyoming"
    };
    /// <enable>JS2024.DoNotQuoteObjectLiteralPropertyNames</enable>

    L.isValid = function (l) {
        /// <summary>Determines if a given location object, from a linked-contact, is valid</summary>
        /// <param name="l" type="Microsoft.WindowsLive.Platform.Location"/>
        /// <returns type="Boolean"/>
        return Jx.isObject(l) && Jx.isNonEmptyString(l.street || l.city || l.state || l.country || l.zipCode);
    };

    L.getBestLocation = function (locations) {
        /// <summary>Given a set of locations for a particular person, returns the best one to use as the default</summary>
        /// <param name="locations" type="Array">An array of location dictionaries - each dictionary must have a 'value' key of type Microsoft.WindowsLive.Platform.Location.</param>
        /// <returns type="Object">A location dictionary from the array that was passed in</returns>
        // Find the first location with the best information
        var bestLocation = null;
        var currentScore = 0;
        locations.forEach(function (loc) {
            Debug.assert(loc && L.isValid(loc.value));
            if (!bestLocation) {
                bestLocation = loc;
                currentScore = getLocationScore(bestLocation.value);
            } else {
                var score = getLocationScore(loc.value);
                if (currentScore < score) {
                    bestLocation = loc;
                    currentScore = score;
                }
            }
        });
        return bestLocation;
    };

    function getLocationScore(loc) {
        /// <summary>Rates this location object based on the present of fields.
        /// Some fields are rated higher than other (e.g street is more higher than state)</summary>
        /// <param name="loc" type="Microsoft.WindowsLive.Platform.Location"/>
        /// <returns type="Number"/>
        var score = 0;
        if (loc.street) { score += 7; }
        if (loc.zipCode) { score += 2; }
        if (loc.city) { score += 2; }
        if (loc.state) { score += 1; }
        if (loc.country) { score += 1; }
        return score;
    };

    L.chooseBestDisplayField = function (loc) {
        /// <summary>Not every field of a location object will always be available.
        /// Given a location object from linked contact, choose the best available field.</summary>
        /// <param name="loc" type="Microsoft.WindowsLive.Platform.Location"/>
        /// <returns type="String"/>
        var locationField = "";
        if (!Jx.isNullOrUndefined(loc)) {
            locationField = loc.street || loc.city || loc.zipCode || loc.state || loc.country || "";
        }
        ///<disable>JS3092.DeclarePropertiesBeforeUse</disable>
        return locationField.replace(/[\r\n]+/g, " ");
        ///<enable>JS3092.DeclarePropertiesBeforeUse</enable>
    };

    L.isIdentical = /*@bind(Microsoft.WindowsLive.Platform.Location)*/function (loc) {
        /// <param name="loc" type="Microsoft.WindowsLive.Platform.Location"/>
        /// <returns type="Boolean"/>
        Debug.assert(Jx.isObject(loc));
        return (loc.street === this.street &&
                loc.city === this.city &&
                loc.zipCode === this.zipCode &&
                loc.state === this.state &&
                loc.country === this.country);
    };

});
 