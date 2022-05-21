
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
function dumpObj(obj, objmap) {
   var fSkip = false;
   var fHasObjectId = false;
   if ("objectId" in obj) {
      fHasObjectId = true;
      if (objmap[obj.objectId] === true) {
         fSkip = true;
      }
   }

   var objToString = obj.toString();
   var objText = objToString + "<ul>";
   if (fSkip) {
       objText += "<li> Previously seen object [" + obj.objectId + "]</li>";
   }
   else if ("[object Microsoft.WindowsLive.Platform.Collection]" === objToString) {
        var count = obj.count;
        objText += "<li>Count: " + count + "</li>";
        objText += "<li>Items: <ul>";
        for (var i = 0; i < count; ++i)
        {
            objText += "<li>" + dumpObj(obj.item(i), objmap) +"</li>";
        }
        objText += "</ul></li>";       
   }
   else {
       if (fHasObjectId) {
           objmap[obj.objectId] = true;
       }
       for (var name in obj) {

           var propVal = "";
           try {
               if (typeof obj[name] === "object") {
                   propVal = dumpObj(obj[name], objmap);
               } else {
                   propVal = obj[name];
               }
           } catch (e) {
               propVal = "Error: " + e;
           }

           objText += "<li>" + name + ": " + propVal + "</li>";
       }
   }
   return objText + "</ul>";
}

function dumpToHtml(obj) {
   var objmap = new Array();
   if (!obj) {
      return "the script input did not return a value";
   }
   var objText = obj.toString();
   if (typeof obj === "object") {
      objText += dumpObj(obj, objmap);
   }
   return objText;
}

function clearLog() {
    document.getElementById('msglog').innerHTML = "";
}

function log(str) {
    if (document.getElementById('msglog').innerHTML !== "") {
        document.getElementById('msglog').innerHTML += "<br/>"+toStaticHTML(str);
    }
    else {
        document.getElementById('msglog').innerHTML = toStaticHTML(str);
    }
}

function doExpr() {
    var expressionData = document.getElementById('expressionInput').value;
    var result = "";
    var d1 = new Date();
    clearLog();
    document.getElementById('evaltime').innerHTML = ": Running";

    try {
        var evaledData = eval(expressionData);
        result = dumpToHtml(evaledData);
    }
    catch (exception) {
        result = "Exception!<br/>" + dumpToHtml(exception);
    }
    var d2 = new Date();
    document.getElementById('evaltime').innerHTML = ":" + (d2 - d1) + "ms";
    log(result);
}

var ReplicationTest = ReplicationTest || {};
ReplicationTest.harness = null;
ReplicationTest.accountCollection = null;
ReplicationTest.peopleCollection = null;
ReplicationTest.defaultAccount = null;
ReplicationTest.accountResourceContacts = null;

function getPropertyName (obj, val) {
    for (var property in obj) {
        if (obj[property] == val) {
            return property;
        }
    }
}

function logCollectionChanged(type, displayName, notification) {
    var logElement = document.getElementById('repllog');
    var html = logElement.innerHTML;

    var action = "";

    if (notification.eType == 0) {         // itemAdded
        action = "(ItemAdded)";
    } else if (notification.eType == 1) {  // itemChanged
        action = "(ItemChanged)";
    } else if (notification.eType == 2) {  // itemRemoved
        action = "(ItemRemoved)";
    }

    logElement.innerHTML = html + "<br /> " + type + notification.objectId + action + " Name:" + displayName;
}

function logSyncStatus() {
    var syncStatusElement = document.getElementById('syncstatus');
    var wl = Microsoft.WindowsLive.Platform;

    var statusLog = "<div>" + PlatformStatus.getAuthStatus(ReplicationTest.defaultAccount) + "</div><ul>";
    statusLog += PlatformStatus.getSyncStatus(ReplicationTest.defaultAccount, [wl.ResourceType.mail, wl.ResourceType.accounts]) + "</ul>";
    syncStatusElement.innerHTML = toStaticHTML(statusLog);
}

function defaultAccountChanged(ev) {
    var value = ev.detail[0];

    for (var i = 0; i < value.length; ++i) {
        if ((value[i] == "lastAuthResult") || (value[i] == "isSynchronizing") || (value[i] == "lastSyncResult") || (value[i] == "resourceState")) {
            logSyncStatus();
            break;
        }
    }
}

function accountCollectionChanged(ev) {
    var notification = ev.detail[0];
    var displayName = "";
    var type = "(account)";
    var account = ReplicationTest.harness.client.accountManager.loadAccount(notification.objectId);
    if (account != null) {
        displayName = account.displayName;
    }

    logCollectionChanged(type, displayName, notification);
}

function personCollectionChanged(ev) {
    var notification = ev.detail[0];
    var displayName = "";
    var type = "(person)";

    var person = ReplicationTest.harness.client.peopleManager.tryLoadPerson(notification.objectId);
    if (person != null) {
        displayName = person.calculatedUIName
    }

    logCollectionChanged(type, displayName, notification);
}

function cleanupObjects() {
    try {
        if (ReplicationTest.accountCollection != null) {
            ReplicationTest.accountCollection.removeEventListener("collectionchanged", accountCollectionChanged);
            ReplicationTest.accountCollection.dispose();
            ReplicationTest.accountCollection = null;
        }

        if (ReplicationTest.peopleCollection != null) {
            ReplicationTest.peopleCollection.removeEventListener("collectionchanged", personCollectionChanged);
            ReplicationTest.peopleCollection.dispose();
            ReplicationTest.peopleCollection = null;
        }

        if (ReplicationTest.defaultAccount != null) {
            ReplicationTest.defaultAccount.removeEventListener("changed", defaultAccountChanged);
            ReplicationTest.defaultAccount = null;
        }

        if (ReplicationTest.accountResourceContacts != null) {
            ReplicationTest.accountResourceContacts.removeEventListener("changed", defaultAccountChanged);
            ReplicationTest.accountResourceContacts = null;
        }

        if (ReplicationTest.harness != null) {
            ReplicationTest.harness.dispose();
            ReplicationTest.harness = null;
        }
    }
    catch (e) {
        alert('Error during cleanup:' + e);
    }
};

function startReplication() {
    var logElement = document.getElementById('repllog');
    var resourcesElement = document.getElementById('repltype');
    var startButton = document.getElementById('startReplicationButton');
    var stopButton = document.getElementById('stopReplicationButton');
    var dateNow = new Date();

    resourcesElement.setAttribute("disabled", true);
    startButton.setAttribute("disabled", true);

    try {
        logElement.innerHTML = "Replication started: " + dateNow;

        var harness = ReplicationTest.harness = new Microsoft.WindowsLive.Platform.Test.ClientTestHarness("test_app", Microsoft.WindowsLive.Platform.Test.PluginsToStart.none);
        var platform = harness.client;

        var defaultAccount = platform.accountManager.defaultAccount;
        if ("presence_ut@hotmail.com" === defaultAccount.emailAddress) {
            throw "The Default Account is not configured.  Please run /drop/debug/ModernContactPlatform/Test/MoshAuth.exe to set a default account.";
        }
        else {
            var accounts = ReplicationTest.accountCollection = harness.store.getCollection(Microsoft.WindowsLive.Platform.Test.StoreTableIdentifier.account);
            accounts.addEventListener("collectionchanged", accountCollectionChanged);

            var existing = "";
            for (var i = 0; i < accounts.count; ++i) {
                var item = accounts.item(i);
                existing = existing + "<br /> " + "(account)" + item.objectId + "(Existing)" + " Name:" + item.displayName;
            }
            logElement.innerHTML = logElement.innerHTML + existing;
            accounts.unlock();

            var collection = ReplicationTest.peopleCollection = platform.peopleManager.getPeopleNameBetween(Microsoft.WindowsLive.Platform.OnlineStatusFilter.all, "a", true, "z", true);
            collection.addEventListener("collectionchanged", personCollectionChanged);

            existing = "";
            for (var i = 0; i < collection.count; ++i) {
                var item = collection.item(i);
                existing = existing + "<br /> " + "(person)" + item.objectId + "(Existing)" + " Name:" + item.calculatedUIName;
            }
            logElement.innerHTML = logElement.innerHTML + existing;
            collection.unlock();

            defaultAccount.addEventListener("changed", defaultAccountChanged);
            ReplicationTest.defaultAccount = defaultAccount;

            var accountResourceContacts = defaultAccount.getResourceByType(Microsoft.WindowsLive.Platform.ResourceType.contacts);
            accountResourceContacts.addEventListener("changed", defaultAccountChanged);
            ReplicationTest.accountResourceContacts = accountResourceContacts;

            logSyncStatus();

            var options = resourcesElement.options;
            for (var i = 0; i < options.length; ++i) {
                if (options[i].selected) {
                    harness.requestServiceResources(options[i].value);
                }
            }

            Jx.removeClass(stopButton, "invisible");
        }
    }
    catch (e) {
        logElement.innerHTML = "Error:" + e;

        cleanupObjects();

        resourcesElement.removeAttribute("disabled");
        startButton.removeAttribute("disabled");
    }
}

function stopReplication() {
    var logElement = document.getElementById('repllog');
    var resourcesElement = document.getElementById('repltype');
    var startButton = document.getElementById('startReplicationButton');
    var stopButton = document.getElementById('stopReplicationButton');
    var dateNow = new Date();

    logElement.innerHTML = logElement.innerHTML + "<br />Replication stopped: " + dateNow;

    cleanupObjects();

    resourcesElement.removeAttribute("disabled");
    startButton.removeAttribute("disabled");
    Jx.addClass(stopButton, "invisible");
}

function importRetailExperienceData() {
    var harness = ReplicationTest.harness = new Microsoft.WindowsLive.Platform.Test.ClientTestHarness("test_app", Microsoft.WindowsLive.Platform.Test.PluginsToStart.none);
    var platform = harness.client;

    var defaultAccount = platform.accountManager.defaultAccount;
    var verb = platform.createVerb("ImportRetailExperienceData", "");
    platform.runResourceVerb(defaultAccount, "retail", verb);
}

function setSelection(settingElementName, settingValue) {
    var selectElement = document.getElementById(settingElementName);
    if (null != selectElement) {
        var options = selectElement.options;
        var oldSelectedElement = null;
        var newSelectedElement = null;
        //var unknownElement = null;

        for (var i = 0; i < options.length; ++i) {
            var option = options.item(i);
            if (option.value === settingValue) {
                newSelectedElement = option;
            }
            if (option.selected) {
                oldSelectedElement = option;
            }
          //if (option.value === "<unknown>") {
          //    unknownElement = option;
          //}
        }

      //if (Jx.isNullOrUndefined(newSelectedElement)) {
      //    newSelectedElement = unknownElement;
      //}

        if (oldSelectedElement != newSelectedElement) {
            if (Jx.isObject(oldSelectedElement)) {
                oldSelectedElement.selected = false;
            }
            if (Jx.isObject(newSelectedElement)) {
                newSelectedElement.selected = true;
            }
        }
    }
}

var platformSettings = {};
platformSettings['accountsRoaming'] = { appSettingName: "ROAMING_Enabled", defaultValue: "(null)" };
platformSettings['catalogMode'] = { appSettingName: "CATALOG_QueryString", defaultValue: "(null)" };
platformSettings['contactsEnvironment'] = { appSettingName: "ENVIRONMENT", defaultValue: "Production" };
platformSettings['easiMode'] = { appSettingName: "EASI_IsEasi", defaultValue: "(null)" };
platformSettings['googEasIsWorking'] = { appSettingName: "GOOG_EasIsWorking", defaultValue: "(null)" };

function initSettings() {
    for (var settingName in platformSettings) {
        var setting = platformSettings[settingName];
        var settingValue = PlatformStatus.getSetting(setting.appSettingName, setting.defaultValue);
        setSelection(settingName, settingValue);
    }

    var packageId = Windows.ApplicationModel.Package.current.id.name;
    var packageElement = document.getElementById('packageMode');
    packageElement.innerHTML = packageId;

    initPrimaryAccountMode();
}

function updateSetting(settingElementName, settingAppStateName, defaultSettingValue) {
    var oldSettingValue = PlatformStatus.getSetting(settingAppStateName, defaultSettingValue);
    var selectElement = document.getElementById(settingElementName);
    var newSelectedElement = null;

    // get the currently selected
    if (null != selectElement) {
        var options = selectElement.options;

        for (var i = 0; i < options.length; ++i) {
            var option = options.item(i);
            if (option.selected) {
                newSelectedElement = option;
                break;
            }
        }
    }

    if (Jx.isObject(newSelectedElement)) {
        var newSettingValue = newSelectedElement.value;
        if (newSettingValue !== oldSettingValue) {
            // Update the cached value
            if (newSettingValue === defaultSettingValue) {
                Windows.Storage.ApplicationData.current.localSettings.values.remove(settingAppStateName);
            }
            else {
                Windows.Storage.ApplicationData.current.localSettings.values.insert(settingAppStateName, newSettingValue);
            }
        }
    }
}


function onSettingChange(settingName) {
    var setting = platformSettings[settingName];
    if (Jx.isObject(setting)) {
        updateSetting(settingName, setting.appSettingName, setting.defaultValue);
    }
}

function initPrimaryAccountMode()
{
    Windows.Storage.PathIO.readTextAsync("ms-appdata:///local/Configuration/accounts.json")
        .done(function (contents) {
            var data = JSON.parse(contents);
            setSelection('primaryAccountMode', data.mode);
            var companyNameElement = document.getElementById('companyName');
            companyNameElement.value = data.companyName || "";
            companyNameElement.readOnly = true;
        }, Jx.fnEmpty);
}

function onPrimaryAccountModeChange() {
    var newSelectedElement = null;
    var selectElement = document.getElementById('primaryAccountMode');
    var options = selectElement.options;

    for (var i = 0; i < options.length; ++i) {
        var option = options.item(i);
        if (option.selected) {
            newSelectedElement = option;
            break;
        }
    }

    if (Jx.isObject(newSelectedElement)) {
        var companyNameElement = document.getElementById('companyName');
        if (newSelectedElement.value !== "(null)") {
            companyNameElement.readOnly = true;

            var companyName = companyNameElement.value;
            var output = { mode: newSelectedElement.value };
            if (!!companyName) {
                output.companyName = companyName;
            }
            var jsonToWrite = JSON.stringify(output);

            Windows.Storage.ApplicationData.current.localFolder.createFolderAsync("Configuration", Windows.Storage.CreationCollisionOption.openIfExists)
                .then(function (folder) {
                    return folder.createFileAsync("accounts.json", Windows.Storage.CreationCollisionOption.replaceExisting);
                }).then(function (file) {
                    return Windows.Storage.FileIO.writeTextAsync(file, jsonToWrite);
                }).done(function () {
                    log("Success.  Wrote: " + jsonToWrite);
                }, function (e) {
                    log("Error" + e);
                });
        } else {
            companyNameElement.readOnly = false;
            Windows.Storage.ApplicationData.current.localFolder.getFolderAsync("Configuration")
                .then(function (folder) {
                    return folder.deleteAsync(Windows.Storage.permanentDelete);
                }).done(function () {
                    log("Success.  Deleted configuration");
                }, function (e) {
                    log("Error" + e);
                });
        }
    }
}
