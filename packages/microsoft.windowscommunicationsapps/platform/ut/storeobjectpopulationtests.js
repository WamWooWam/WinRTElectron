
//
// Copyright Microsoft Corporation. All Rights Reserved.
//
// Unit Tests for StoreObjectPopulation test extensions
//
//
// The file StoreObjectPopulationTests.js is generated from XSLT transforms applied to XML source
// file(s). Changes needed should be made to the appropriate source XML files
// and/or the source xslt files used to generate StoreObjectPopulationTests.js.
//
// xsl:version    == 1
// xsl:vendor     == Microsoft
// xsl:vendor-url == http://www.microsoft.com
// msxsl:version  == v4.0.30319
//

(function() {

    var wl = Microsoft.WindowsLive.Platform;
    var wlt = wl.Test;
    var testCaseUserName = "platunittest" + Math.floor(Math.random() * 10001) + "@live.com";


    Tx.test("StoreObjectPopulationTest.testAccountTransientRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.accountTransient;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testAccountRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.account;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areNotEqual(0, existingRows.count, "Table was not correctly prepopulated");
            
        // Prepopulated tables will already have a row so reuse that row
        var existingRow = existingRows.item(0);
        var loadedRow = platform.store.loadTableEntry(tableId, existingRow.objectId);
        tc.areEqual(existingRow.objectType, loadedRow.objectType, "Incorrect object returned");
          
    });

    Tx.test("StoreObjectPopulationTest.testAccountTombstoneRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.accountTombstone;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testAggregationRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.aggregation;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areNotEqual(0, existingRows.count, "Table was not correctly prepopulated");
            
        // Prepopulated tables will already have a row so reuse that row
        var existingRow = existingRows.item(0);
        var loadedRow = platform.store.loadTableEntry(tableId, existingRow.objectId);
        tc.areEqual(existingRow.objectType, loadedRow.objectType, "Incorrect object returned");
          
    });

    Tx.test("StoreObjectPopulationTest.testBinaryObjectRequestRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.binaryObjectRequest;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testDynamicConfigRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.dynamicConfig;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areNotEqual(0, existingRows.count, "Table was not correctly prepopulated");
            
        // Prepopulated tables will already have a row so reuse that row
        var existingRow = existingRows.item(0);
        var loadedRow = platform.store.loadTableEntry(tableId, existingRow.objectId);
        tc.areEqual(existingRow.objectType, loadedRow.objectType, "Incorrect object returned");
          
    });

    Tx.test("StoreObjectPopulationTest.testDynamicConfigMetadataRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.dynamicConfigMetadata;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areNotEqual(0, existingRows.count, "Table was not correctly prepopulated");
            
        // Prepopulated tables will already have a row so reuse that row
        var existingRow = existingRows.item(0);
        var loadedRow = platform.store.loadTableEntry(tableId, existingRow.objectId);
        tc.areEqual(existingRow.objectType, loadedRow.objectType, "Incorrect object returned");
          
    });

    Tx.test("StoreObjectPopulationTest.testContactRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.contact;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testFileCleanupRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.fileCleanup;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testImplicitContactRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.implicitContact;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testMeContactRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.meContact;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areNotEqual(0, existingRows.count, "Table was not correctly prepopulated");
            
        // Prepopulated tables will already have a row so reuse that row
        var existingRow = existingRows.item(0);
        var loadedRow = platform.store.loadTableEntry(tableId, existingRow.objectId);
        tc.areEqual(existingRow.objectType, loadedRow.objectType, "Incorrect object returned");
          
    });

    Tx.test("StoreObjectPopulationTest.testPersonRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.person;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testPersonAugmentRequestRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.personAugmentRequest;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testPersonLinkRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.personLink;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testPersonServerRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.personServer;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testPersonLinkHintRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.personLinkHint;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testPersonServerHintRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.personServerHint;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testRightsManagementTemplateRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.rightsManagementTemplate;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testRowIdRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.rowId;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areNotEqual(0, existingRows.count, "Internal table was correctly populated");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testRelevanceRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.relevance;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testScenarioConnectionRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.scenarioConnection;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testSearchPersonRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.searchPerson;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testSearchRequestRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.searchRequest;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testUrlCacheRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.urlCache;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testWordWheelRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.wordWheel;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testFolderRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.folder;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areNotEqual(0, existingRows.count, "Table was not correctly prepopulated");
            
        // Prepopulated tables will already have a row so reuse that row
        var existingRow = existingRows.item(0);
        var loadedRow = platform.store.loadTableEntry(tableId, existingRow.objectId);
        tc.areEqual(existingRow.objectType, loadedRow.objectType, "Incorrect object returned");
          
    });

    Tx.test("StoreObjectPopulationTest.testMailMessageRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.mailMessage;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testMailAttachmentRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.mailAttachment;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testMailWorkItemRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.mailWorkItem;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testMailVisibilityRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.mailVisibility;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testMailConversationRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.mailConversation;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testMailChangeRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.mailChange;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testMailMessageViewLinkRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.mailMessageViewLink;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testMailRuleRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.mailRule;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testMailRuleQueuedRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.mailRuleQueued;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testMailViewRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.mailView;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areNotEqual(0, existingRows.count, "Table was not correctly prepopulated");
            
        // Prepopulated tables will already have a row so reuse that row
        var existingRow = existingRows.item(0);
        var loadedRow = platform.store.loadTableEntry(tableId, existingRow.objectId);
        tc.areEqual(existingRow.objectType, loadedRow.objectType, "Incorrect object returned");
          
    });

    Tx.test("StoreObjectPopulationTest.testSearchMailRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.searchMail;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testSearchMailAttachmentRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.searchMailAttachment;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testAttendeeRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.attendee;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testCalendarChangeRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.calendarChange;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testErrorMessageRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.errorMessage;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testEventRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.event;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testEventCacheRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.eventCache;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testEventCacheRangeRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.eventCacheRange;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testEventExceptionRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.eventException;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testFreeBusyResponseRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.freeBusyResponse;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testMeetingResponseRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.meetingResponse;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

    Tx.test("StoreObjectPopulationTest.testTestRow", function (tc) {

        var tableId = wlt.StoreTableIdentifier.test;
        var platform = PlatformTest.createPlatformForUser(tc, testCaseUserName);
        tc.isNotNull(platform);
        
        
        var existingRows = platform.store.queryEntries(tableId);
        existingRows.lock();
          
        tc.areEqual(0, existingRows.count, "Pre-existing rows found for non-prepopulated table");
            
        // Non-prepopulated tables will be empty by default
        // and the object ID of 1 can only correspond to a row
        // on the account table (which is prepopulated). As a 
        // result, this call is guaranteed to fail. 
        var nonExistentRow = null;
        try { 
          nonExistentRow = platform.store.loadTableEntry(tableId, "1");
        } catch (e) { 
          // This large decimal value corresponds to LMCSTORE_E_NOT_FOUND
          // which will be returned when the row fetch attempted fails.
          if (e.number !== -2067070973) throw e;
        }
          
        tc.isNull(nonExistentRow);
          
    });

})();
  