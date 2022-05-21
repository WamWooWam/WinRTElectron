
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="Windows.Globalization.Collation.js"/>

/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../../Shared/Stubs/Stubs.js"/>
/// <reference path="ArrayCollection.js"/>
/// <reference path="QueryCollection.js"/>
/// <reference path="ConcatenatedCollection.js"/>
/// <reference path="AddressBookCollections.ref.js"/>

/// <disable>JS2052.UsePrefixOrPostfixOperatorsConsistently</disable>

Jx.delayDefine(People, "AddressBookCollections", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    P.AddressBookCollections = {};

    P.AddressBookCollections.getAlphabets = function (other, ranges, slices) {
        /// This function retrives character groupings from the system and sorts them into Native character set first and then the latin alphabets
        /// <param name="other" type="Array"/>
        /// <param name="ranges" type="Array"/>
        /// <param name="slices" type="Array"/>

        // Get the character labels from Windows
        var groupings = new Windows.Globalization.Collation.CharacterGroupings();

        // Convert the character groupings into slices with a start and an end
        var /*@type(Windows.Globalization.Collation.CharacterGrouping)*/lastGrouping = Array.prototype.reduce.call(groupings, function (/*@type(Windows.Globalization.Collation.CharacterGrouping)*/previousGrouping, /*@type(Windows.Globalization.Collation.CharacterGrouping)*/nextGrouping) {
            slices.push({
                start: previousGrouping.first,
                end: nextGrouping.first,
                label: previousGrouping.label
            });
            return nextGrouping;
        }, { first: "", label: "" });
        slices.push({
            start: lastGrouping.first,
            end: "",
            label: ""
        });

        // Split the slices into ranges: contiguous blocks with unlabelled "other" groupings in-between
        var currentRange = [];
        slices.forEach(function (/*@type(Slice)*/slice) {
            if (slice.label === "" || // Most "other" groupings are identified by a blank label
                slice.start === "" || slice.end === "" || // Groupings at the very edge also fall into "other"
                (slice.start.localeCompare("!") === -1 && slice.end.localeCompare("!") === 1) || // The symbols grouping goes into "other"
                (slice.start.localeCompare("1") === -1 && slice.end.localeCompare("1") === 1)) {

                if (currentRange.length > 0) {
                    ranges.push(currentRange);
                    currentRange = [];
                }
                other.push(slice);
            } else {
                currentRange.push(slice);
            }
        });
        Debug.assert(currentRange.length === 0);

        // If one of the ranges is the Latin alphabet, move it to the end
        var iLatinRange = null;
        for (var i = 0, len = ranges.length; i < len; ++i) {
            if (ranges[i].length === 26 && ranges[i].every(function (/*@type(Slice)*/slice) {
                // In truth, the Latin range includes more than A-Z.  But our intent here is only to detect Latin
                // when it is a secondary alphabet, so more advanced script detection should not be needed.
                Debug.assert(slice.start < "A" || slice.start > "Z", "Lowercase letters expected");
                return (slice.start >= "a" && slice.start <= "z");
            })) {
                if (iLatinRange !== null) {
                    Debug.assert(false, "Two latin ranges detected.");
                    iLatinRange = null;
                    break;
                }
                iLatinRange = i;
            }
        }
        if (iLatinRange !== null) {
            ranges.push(ranges.splice(iLatinRange, 1)[0]);
        }
    }

    P.AddressBookCollections.appendAlphabeticCollection = function (peopleManager, collection, factory) {
        /// <param name="peopleManager" type="Microsoft.WindowsLive.Platform.IPeopleManager"/>
        /// <param name="collection" type="P.ArrayCollection"/>
        /// <param name="factory" type="Function"/>

        var other = [];
        var ranges = [];
        var slices = [];

        this.getAlphabets(other, ranges, slices);

        // Generate a query for each slice
        slices.forEach(function (/*@type(Slice)*/slice) {
            var nameSlice = slice.start || "start";
            slice.collection = new P.QueryCollection(
                "person",
                factory(peopleManager, slice.start, slice.end),
                nameSlice
            );
        });

        // Now we can add the slices to our collection-of-collections
        ranges.forEach(function (/*@type(Array)*/range) {
            range.forEach(function (/*@type(Slice)*/slice) {
                collection.appendItem({
                    header: {
                        type: "nameGrouping",
                        data: {
                            label: slice.label,
                            start: slice.start,
                            end: slice.end
                        }
                    },
                    collection: slice.collection
                });
            });
        });

        // And the "other" slices get concatenated into one last collection
        collection.appendItem({
            header: {
                type: "otherGrouping",
                data: other.map(function (/*@type(Slice)*/slice) { return {
                    start: slice.start,
                    end: slice.end
                };})
            },
            collection: new P.ConcatenatedCollection(other.map(function (/*@type(Slice)*/slice) { return slice.collection; }), "other")
        });
    };

    P.AddressBookCollections.replaceAlphabeticCollection = function (peopleManager, groupings, factory, jobSet) {
        /// <param name="peopleManager" type="Microsoft.WindowsLive.Platform.IPeopleManager"/>
        /// <param name="groupings" type="P.Collection"/>
        /// <param name="factory" type="Function"/>
        /// <param name="jobSet" type="P.JobSet"/>
        var promises = [];
        for (var i = 0, len = groupings.length; i < len; i++) {
            var group = /*@static_cast(Grouping)*/groupings.getItem(i),
                header = group.header,
                /*@dynamic*/collection = group.collection;
            if (header.type === "nameGrouping") {
                promises.push(collection.replace(factory(peopleManager, header.data.start, header.data.end), jobSet));
            } else if (header.type === "otherGrouping") {
                promises.push(collection.replace(header.data.map(function (/*@type(Slice)*/slice) {
                    return factory(peopleManager, slice.start, slice.end);
                }), jobSet));
            }
        }
        return WinJS.Promise.join(promises);
    };

    P.AddressBookCollections.makeFavoritesCollection = function (peopleManager, jobSet) {
        ///<summary>The favorites collection has a sub-collection with no header, and a 
        /// static collection with a button to add more favorites.</summary>
        ///<param name="peopleManager" type="Microsoft.WindowsLive.Platform.IPeopleManager"/>
        var collection = new P.ArrayCollection("favorites");

        collection.appendItem({
            header: null,
            collection: new P.QueryCollection(
                "person",
                new P.Callback(peopleManager.getFavoritePeople, peopleManager),
                "favorites"
            )
        });

        var staticCollection = new P.StaticCollection([{ data: { title: "Add favorite", text: "\uE0B4" }, type: "addFavoritesButton" }], "addButton");
        collection.appendItem({
            header: null,
            collection: staticCollection
        });

        collection.loadComplete();
        staticCollection.loadComplete();
        return collection;
    };

    P.AddressBookCollections.makeAlphabetsCollection = function (peopleManager, jobSet) {
        ///<summary>The favorites collection has a sub-collection with no header, and a 
        /// static collection with a button to add more favorites.</summary>
        ///<param name="peopleManager" type="Microsoft.WindowsLive.Platform.IPeopleManager"/>
        var collection = new P.ArrayCollection("alphabets");

        var other = [];
        var ranges = [];
        var slices = [];
        this.getAlphabets(other, ranges, slices);

        var alphabetArray = [];
        var alphabetIndex = 0;

        // Get all the characters 
        for (var i = 0; i < ranges.length; i++) {
            var charObj = ranges[i];
            for (var j = 0; j < charObj.length; j++) {
                var char = charObj[j];
                alphabetArray.push({ data: { title: char.label, text: char.label, alphabetIndex: alphabetIndex++ }, type: "alphabetButton" });
            }
        }

        // now add a label for 'other' category at the end
        var otherLabel = Jx.res.getString('/strings/abOtherGroupingHeader');
        alphabetArray.push({ data: { title: otherLabel, text: otherLabel, alphabetIndex: alphabetIndex++ }, type: "alphabetButton" });

        var staticCollection = new P.StaticCollection(alphabetArray, "alphabetCollection");
        collection.appendItem({
            header: null,
            collection: staticCollection
        });

        collection.loadComplete();
        staticCollection.loadComplete();
        return collection;
    };
});
