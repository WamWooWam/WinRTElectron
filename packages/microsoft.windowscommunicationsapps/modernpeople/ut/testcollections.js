
//
// Copyright (C) Microsoft. All rights reserved.
//

Include.initializeFileScope(function () {

$include("$(peopleShared)/Mocks/Platform/Platform.js");
$include("$(peopleShared)/Mocks/Platform/Collection.js");

/// <disable>JS2076.IdentifierIsMiscased</disable>
var Plat = Microsoft.WindowsLive.Platform;
var MP = Mocks.Microsoft.WindowsLive.Platform;
var P = window.People;
/// <enable>JS2076.IdentifierIsMiscased</enable>

function mockCollectionCallback (collection) {
    return new P.Callback(function () { return this; }, collection, []);
};

P.makeSubCollection = function (letter, dataset, preventLoad) {
    /// <summary>This function makes a collection of person objects whose name starts with the appropriate letter.</summary>
    /// <param name="letter" type="String"/>
    /// <param name="dataset" type="Array"/>
    /// <param name="preventLoad" type="Boolean"/>
    var provider = { clone: function (item) { return item; } };
    var platformCollection = new MP.Collection("person", provider);
    var collection = new P.QueryCollection("person", mockCollectionCallback(platformCollection), letter);
    dataset.filter(
        function (fullName) { return fullName[0] === letter; }
    ).map(
        function (fullName, index) {
            return {
                objectId: letter + index, 
                calculatedUIName: fullName
            };
        }
    ).forEach(/*@bind(MP.Collection)*/function (item, i) { 
        this.mock$addItem(item, i); 
    }, platformCollection);
    if (!preventLoad) {
        collection.load(new MockJobSet());
    }    
    return { collection: collection, platformCollection: platformCollection };
};

P.makeTestCollectionEx = function (dataset, preventLoad) {
    /// <summary>This function makes a collection of groupings, one for each letter of the alphabet, and populates
    /// each with a set of names from the dataset above</summary>
    /// <param name="dataset" type="Array"/>
    /// <param name="preventLoad" type="Boolean"/>

    // TODO: WinLive 400741 Remove this and fix the underlying code errors.
    /// <disable>JS3053.IncorrectNumberOfArguments</disable>
    var collection = new People.ArrayCollection();
    var platformCollections = [];
    Array.prototype.map.call("ABCDEFGHIJKLMNOPQRSTUVWXYZ", function (letter) {
            var subCollection = P.makeSubCollection(letter, dataset, preventLoad);
            platformCollections.push(subCollection.platformCollection);
            return {
                header: {
                    type: "nameGrouping",
                    data: letter
                },
                collection: subCollection.collection
            };
        }
    ).forEach(collection.appendItem, collection);
    /// <enable>JS3053.IncorrectNumberOfArguments</enable>
    collection.loadComplete();
    return { collection: collection, platformCollections: platformCollections };
};

P.makeTestCollection = function (dataset, preventLoad) {
    /// <summary>This function makes a collection of groupings, one for each letter of the alphabet, and populates
    /// each with a set of names from the dataset above</summary>
    ///<param name="dataset" type="Array"/>
    ///<param name="preventLoad" type="Boolean">Determines whether to load the sub-collections immediately</param>
    return P.makeTestCollectionEx(dataset, preventLoad).collection;
};

});
