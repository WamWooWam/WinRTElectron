
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,window,Include*/

Include.initializeFileScope(function () {
    // Shortcut for the changing namespace
    var P = window.People;
    var WL = P;

   // One MS Way Redmond 98052 USA == One MS Way Redmond 98052 USA
    Tx.test("deDupingTests.test_deduping_equal1", function (tc) {
      var a1 = {street: "One MS Way", city: "Redmond", zipCode: "98052", state: "", country: "USA"};
      var a2 = {street: "One MS Way", city: "Redmond", zipCode: "98052", state: "", country: "USA"};
        
      var result = P.Location.compare(a1, a2);
      tc.areEqual(P.Compare.equal, result);

    });

      // St1 St2 St3 City1 State County Postal Country ==
      // St1 St2 St3 City1 State County Postal Country 
    Tx.test("deDupingTests.test_deduping_equalAllFields", function (tc) {
      var a1 = {street: "St1 St2 St3", city: "City1", state: "State", zipCode: "postal", country: "country"};
      var a2 = {street: "St1 St2 St3", city: "City1", state: "State", zipCode: "postal", country: "country"};
        
      var result = P.Location.compare(a1, a2);
      tc.areEqual(P.Compare.equal, result);

    });

    // one ms way REDMOND == ONE MS WAY Redmond 
    //  one MS way redmond ==  One Ms Way REDMOND 
    Tx.test("deDupingTests.test_deduping_equalCaseComparison", function (tc) {
      var a1 = {street: "one ms way", city: "REDMOND", zipCode: "", state: "", country: ""};
      var a2 = {street: "ONE MS WAY", city: "Redmond", zipCode: "", state: "", country: ""};
        
      var result1 = P.Location.compare(a1, a2);
      tc.areEqual(P.Compare.equal, result1);

      var a3 = {street: "one MS way", city: "redmond", zipCode: "", state: "", country: ""};
      var a4 = {street: "One Ms Way", city: "REDMOND", zipCode: "", state: "", country: ""};
        
      var result2 = P.Location.compare(a3, a4);
      tc.areEqual(P.Compare.equal, result2);

    });

    // ~ indicates leading/trailing space
    // ~~~~One MS Way ~~Redmond~ == One MS Way Redmond~~~~ 
    Tx.test("deDupingTests.test_deduping_equalTrim", function (tc) {
      var a1 = {street: "    One MS Way", city: "  Redmond ", zipCode: "", state: "", country: ""};
      var a2 = {street: "One MS Way", city: "Redmond    ", zipCode: "", state: "", country: ""};
        
      var result = P.Location.compare(a1, a2);
      tc.areEqual(P.Compare.equal, result);

    });

      // One MS way Redmond superset of One MS Redmond
      // One MS Way Redmond USA superset of One MS Redmond
    Tx.test("deDupingTests.test_deduping_superset", function (tc) {
      var a1 = {street: "One MS Way", city: "Redmond", zipCode: "", state: "", country: ""};
      var a2 = {street: "One MS", city: "Redmond", zipCode: "", state: "", country: ""};
        
      var result1 = P.Location.compare(a1, a2);
      tc.areEqual(P.Compare.superset, result1);

      var a3 = {street: "One MS Way", city: "Redmond", zipCode: "", state: "", country: "USA"};
      var a4 = {street: "One MS Way", city: "Redmond", zipCode: "", state: "", country: ""};
        
      var result2 = P.Location.compare(a3, a4);
      tc.areEqual(P.Compare.superset, result2);

    });

    // One MS Redmond subset of One MS Way Redmond
    // Redmond subset of Redmond WA
    Tx.test("deDupingTests.test_deduping_subset", function (tc) {
      var a1 = {street: "One MS", city: "Redmond", zipCode: "", state: "", country: ""};
      var a2 = {street: "One MS Way", city: "Redmond", zipCode: "", state: "", country: ""};
        
      var result1 = P.Location.compare(a1, a2);
      tc.areEqual(P.Compare.subset, result1);

      var a3 = {street: "One MS Way", city: "Redmond", zipCode: "", state: "", country: ""};
      var a4 = {street: "One MS Way", city: "Redmond", zipCode: "", state: "WA", country: ""};
        
      var result2 = P.Location.compare(a3, a4);
      tc.areEqual(P.Compare.subset, result2);

    });

    // One MS Redmond subset of One MS Way Redmond
    // Redmond subset of Redmond WA
    Tx.test("deDupingTests.test_deduping_null", function (tc) {
      var a1 = null;
      var a2 = {street: "One MS Way", city: "Redmond", zipCode: "", state: "", country: ""};
        
      var result1 = P.Location.compare(a1, a2);
      tc.areEqual(P.Compare.subset, result1);
      var result2 = P.Location.compare(a2, a1);
      tc.areEqual(P.Compare.superset, result2);

      var contacts = [];
      var c1 = {homeLocation: null};
      var c2 = {homeLocation: {city: "Redmond"}};
      contacts.push(c1);
      contacts.push(c2);

      var unique = WL.Contact.createUniqueFields(contacts);
      tc.areEqual(unique.length, 1);

    });

    // One MS Way Redmond != Two MS Way Richmond
    Tx.test("deDupingTests.test_deduping_different", function (tc) {
      var a1 = {street: "One MS Way", city: "Redmond", zipCode: "", state: "", country: ""};
      var a2 = {street: "Two MS Way", city: "Redmond", zipCode: "", state: "", country: ""};
        
      var result1 = P.Location.compare(a1, a2);
      tc.areEqual(P.Compare.different, result1);

    });

    // GA == GA
    // Georgia == Georgia
    // Georgia == GA
    // GA == Georgia
    Tx.test("deDupingTests.test_deduping_stateEqual", function (tc) {
      var a1 = {state: "GA", street: "", city: "", zipCode: "", country: ""};
      var a2 = {state: "GA", street: "", city: "", zipCode: "", country: ""};
        
      var result1 = P.Location.compare(a1, a2);
      tc.areEqual(P.Compare.equal, result1);

      var a3 = {state: "Georgia", street: "", city: "", zipCode: "", country: ""};
      var a4 = {state: "Georgia", street: "", city: "", zipCode: "", country: ""};
        
      var result2 = P.Location.compare(a3, a4);
      tc.areEqual(P.Compare.equal, result2);

      var a4 = {state: "GA", street: "", city: "", zipCode: "", country: ""};
      var a5 = {state: "Georgia", street: "", city: "", zipCode: "", country: ""};
        
      var result3 = P.Location.compare(a4, a5);
      tc.areEqual(P.Compare.equal, result3);

      var a6 = {state: "Georgia", street: "", city: "", zipCode: "", country: ""};
      var a7 = {state: "GA", street: "", city: "", zipCode: "", country: ""};
        
      var result4 = P.Location.compare(a6, a7);
      tc.areEqual(P.Compare.equal, result4);

    });

    // GA == ga
    // Georgia == GEorgia
    // georgia == ga
    Tx.test("deDupingTests.test_deduping_stateEqualCaseInsensitive", function (tc) {
      var a1 = {state: "GA", street: "", city: "", zipCode: "", country: ""};
      var a2 = {state: "ga", street: "", city: "", zipCode: "", country: ""};
        
      var result1 = P.Location.compare(a1, a2);
      tc.areEqual(P.Compare.equal, result1);

      var a3 = {state: "Georgia", street: "", city: "", zipCode: "", country: ""};
      var a4 = {state: "GEorgia", street: "", city: "", zipCode: "", country: ""};
        
      var result2 = P.Location.compare(a3, a4);
      tc.areEqual(P.Compare.equal, result2);

      var a4 = {state: "georgia", street: "", city: "", zipCode: "", country: ""};
      var a5 = {state: "gA", street: "", city: "", zipCode: "", country: ""};
        
      var result3 = P.Location.compare(a4, a5);
      tc.areEqual(P.Compare.equal, result3);

    });

    // WA != GA
    // Wash != WA
    // Wash != Washington
    // ZZ != Washington
    // GA != Washington
    Tx.test("deDupingTests.test_deduping_stateDifferent", function (tc) {
     
      var a1 = {state: "WA", street: "", city: "", zipCode: "", country: ""};
      var a2 = {state: "GA", street: "", city: "", zipCode: "", country: ""};
        
      var result1 = P.Location.compare(a1, a2);
      tc.areEqual(P.Compare.different, result1);
       
      var a3 = {state: "Wash", street: "", city: "", zipCode: "", country: ""};
      var a4 = {state: "WA", street: "", city: "", zipCode: "", country: ""};
        
      var result2 = P.Location.compare(a3, a4);
      tc.areEqual(P.Compare.different, result2);

      var a4 = {state: "Wash", street: "", city: "", zipCode: "", country: ""};
      var a5 = {state: "Washington", street: "", city: "", zipCode: "", country: ""};
        
      var result3 = P.Location.compare(a4, a5);
      tc.areEqual(P.Compare.different, result3);

      var a6 = {state: "ZZ", street: "", city: "", zipCode: "", country: ""};
      var a7 = {state: "Washington", street: "", city: "", zipCode: "", country: ""};
        
      var result4 = P.Location.compare(a6, a7);
      tc.areEqual(P.Compare.different, result4);

      var a8 = {state: "GA", street: "", city: "", zipCode: "", country: ""};
      var a9 = {state: "Washington", street: "", city: "", zipCode: "", country: ""};
        
      var result5 = P.Location.compare(a8, a9);
      tc.areEqual(P.Compare.different, result5);
    
    });

    // (425) 123 1234 > 425-123-1234
    Tx.test("deDupingTests.test_deduping_phone1", function (tc) {
      var contact1 = {homePhoneNumber: "(425) 123 1234"};
      var contact2 = {homePhoneNumber: "425-123-1234"};
      var contacts = [];
      contacts.push(contact1);
      contacts.push(contact2);

      var result = WL.Contact.createUniqueFields(contacts);

      tc.areEqual(1, result.length);
      tc.areEqual("(425) 123 1234", result[0].fieldValue);
    });
    
    // (425)) 123- 1234 > 4251231234
    Tx.test("deDupingTests.test_deduping_phone2", function (tc) {
      var contact1 = {homePhoneNumber: "(425)) 123- 1234"};
      var contact2 = {homePhoneNumber: "4251231234"};
      var contacts = [];
      contacts.push(contact1);
      contacts.push(contact2);

      var result = WL.Contact.createUniqueFields(contacts);

      tc.areEqual(1, result.length);
      tc.areEqual("(425)) 123- 1234", result[0].fieldValue);
    });

    // +1 425-123-1234 > 1 (425) 123-1234
    Tx.test("deDupingTests.test_deduping_phone3", function (tc) {
      var contact1 = {homePhoneNumber: "+1 425-123-1234"};
      var contact2 = {homePhoneNumber: "1 (425) 123-1234"};
      var contacts = [];
      contacts.push(contact1);
      contacts.push(contact2);

      var result = WL.Contact.createUniqueFields(contacts);

      tc.areEqual(1, result.length);
      tc.areEqual(result[0].fieldValue, "+1 425-123-1234");

    });

    // Dedupe by type should work across different fields
    Tx.test("deDupingTests.test_deduping_phoneNumber_substrings", function (tc) {
      var contacts = [
            { homePhoneNumber: "(425) 882-8080" },
            { homePhoneNumber: "(425) 882-8080 X2201" },
            { homePhoneNumber: "14258828080" },
            { homePhoneNumber: "+1 (425) 882-8080" },
            { homePhoneNumber: "+1 (425) 882-8080 x2201" },
            { homePhoneNumber: "+14258828080x2201" }
      ];

      var result = WL.Contact.createUniqueFields(contacts);
      tc.areEqual(1, result.length);
      tc.areEqual("+1 (425) 882-8080 x2201", result[0].fieldValue);
    });

    // Redmond and WA are both subsets of Redmond, WA
    Tx.test("deDupingTests.test_deduping_multiple_subsets", function (tc) {
      var contacts = [
            { homeLocation: { street: "", city: "Redmond", state: "", zipCode: "", country: "" } },
            { homeLocation: { street: "", city: "", state: "WA", zipCode: "", country: "" } },
            { homeLocation: { street: "", city: "Redmond", state: "WA", zipCode: "", country: "" } }
      ];

      var result = WL.Contact.createUniqueFields(contacts);
      tc.areEqual(1, result.length);
      tc.areEqual("Redmond", result[0].fieldValue.city);
      tc.areEqual("WA", result[0].fieldValue.state);
    });
    
    // Contacts with the same field on multiple networks should report each network once
    Tx.test("deDupingTests.test_deduping_networks", function (tc) {
      var contacts = [
            { account: { displayName: "FB" }, businessPhoneNumber: "8828080" },
            { account: { displayName: "WL" }, businessPhoneNumber: "8828080" },
            { account: { displayName: "FB" }, businessPhoneNumber: "8828080" }
      ];

      var result = WL.Contact.createUniqueFields(contacts);
      tc.areEqual(1, result.length);
      tc.areEqual(2, result[0].fieldNetwork.length);
      tc.areEqual("FB", result[0].fieldNetwork[0]);
      tc.areEqual("WL", result[0].fieldNetwork[1]);
    });

    // Dedupe by type should work across different fields
    Tx.test("deDupingTests.test_deduping_by_type", function (tc) {
      var contacts = [
            { homePhoneNumber: "(425) 882-8080", businessPhoneNumber: "4258828080" },
            { homePhoneNumber: "425-882-8080", mobilePhoneNumber: "705-3528" },
            { businessPhoneNumber: "7053528" }
      ];

      var result = WL.Contact.createUniqueFields(contacts, "tel");
      tc.areEqual(2, result.length);
      tc.areEqual("705-3528", result[0].fieldValue);
      tc.areEqual("(425) 882-8080", result[1].fieldValue);
    });

});