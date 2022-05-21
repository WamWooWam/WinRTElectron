

// Display contact information, and also return it as a JSON string
var JSONContacts = function (contacts) {

    // convert contact to JSON string
    var JSONContact = function (contact) {

        // handle fields of ContactInfo
        var DisplayFactory = {
            displayField: function (v, k, n) {
                return k(v, n);
            },
            displayFields: function (v, k, n) {
                var json = "";
                for (var i = 0; i < v.length; i++) {
                    var node = n.cloneNode(true);
                    node.className = '_' + n.className;
                    json += "{" + k(v[i], node) + "},";
                    n.appendChild(node);
                }
                return json;
            },
            displayName: function (v, n) {
                n.innerText = ' Name: ' + v;
                return "\"Name\": \"" + v + "\"";
            },
            field: function (v, n) {
                n.innerText = ' Category: ' + v.category + ' Name: ' + v.name + ' Type: ' + v.type + ' Value: ' + v.value;
                return "\"Category\": \"" + v.category + "\", \"Name\": \"" + v.name + "\", \"Type\": \"" + v.type + "\", \"Value\": \"" + v.value + "\"";
            },
            locationField: function (v, n) {
                n.innerText = ' Category: ' + v.category + ' Name: ' + v.name + ' Type: ' + v.type + ' Value: ' + v.value + ' Address: ' + v.unstructuredAddress + ' Street: ' + v.street + ' City: ' + v.city + ' Region: ' + v.region + ' Country: ' + v.country + ' PostalCode: ' + v.postalCode;
                return "\"Category\": \"" + v.category + "\", \"Name\": \"" + v.name + "\", \"Type\": \"" + v.type + "\", \"Value\": \"" + v.value + "\", \"Address\": \"" + v.unstructuredAddress + "\", \"Street\": \"" + v.street + "\", \"City\": \"" + v.city + "\", \"Region\": \"" + v.region + "\", \"Country\": \"" + v.country + "\", \"PostalCode\": \"" + v.postalCode + "\"";
            },
            instantMessageField: function (v, n) {
                n.innerText = ' Category: ' + v.category + ' Name: ' + v.name + ' Type: ' + v.type + ' Value: ' + v.value + ' DisplayText: ' + v.displayText + ' Username: ' + v.username + ' Service: ' + v.service + ' LaunchUri: ';
                var json = "\"Category\": \"" + v.category + "\", \"Name\": \"" + v.name + "\", \"Type\": \"" + v.type + "\", \"Value\": \"" + v.value + "\", \"DisplayText\": \"" + v.displayText + "\", \"Username\": \"" + v.username + "\", \"Service\": \"" + v.service + "\", \"LaunchUri\": ";
                if (v.launchUri !== null) {
                    n.innerText += v.launchUri.displayUri;
                    json += "\"" + v.launchUri.displayUri + "\"";
                }
                else {
                    json += "\"\"";
                }
                return json;
            }
        };

        // handle ContactInfo
        var DisplayContact = function (contact) {
            var node = templateContactDiv.cloneNode(true);

            var json = "{";
            json += DisplayFactory.displayField(contact.name, DisplayFactory.displayName, node.querySelector(".cname")) + ",";
            if (contact.emails.length != 0) {
                json += "\"Emails\":[" + DisplayFactory.displayFields(contact.emails, DisplayFactory.field, node.querySelector(".email")) + "],";
            }
            if (contact.phoneNumbers.length != 0) {
                json += "\"PhoneNumbers\":[" + DisplayFactory.displayFields(contact.phoneNumbers, DisplayFactory.field, node.querySelector(".phoneNumber")) + "],";
            }
            if (contact.locations.length != 0) {
                json += "\"Locations\":[" + DisplayFactory.displayFields(contact.locations, DisplayFactory.locationField, node.querySelector(".location")) + "],";
            }
            if (contact.instantMessages.length != 0) {
                json += "\"InstantMessages\":[" + DisplayFactory.displayFields(contact.instantMessages, DisplayFactory.instantMessageField, node.querySelector(".instantMessage")) + "],";
            }
            if (contact.customFields.length != 0) {
                json += "\"CustomFields\":[" + DisplayFactory.displayFields(contact.customFields, DisplayFactory.field, node.querySelector(".custom")) + "],";
            }
            json += "},";

            contactsDiv.appendChild(node);

            return json;
        };

        // one contact
        return DisplayContact(contact) + ",";
    };

    // Always form array of ContactInfo
    var json = "{\"ContactInfo\":[";
    if (typeof contacts.length === "undefined") {
        // Single select
        json += JSONContact(contacts);
    }
    else {
        // Multiple select
        for (var i = 0; i < contacts.length; i++) {
            json += JSONContact(contacts[i]);
        }
    }

    json += "]}";
    json = json.replace(/,,/g, ",");
    json = json.replace(/],}/g, "]}");
    json = json.replace(/},}/g, "}}");
    json = json.replace(/},]/g, "}]");
    json = json.replace(/\",}/g, "\"}");
    json = json.replace(/,,/g, ",");
    
    // returns JSON string for the selected contacts
    document.getResults = function () { return json; };
    // indicate that the results are ready
    document.resultsReady = function () { return true; };
};

// Handler for operation complete
var HandleOperationResults = function (results) {
    try {
        // convert results into JSON string and display the contact information
        JSONContacts(results);
    }
    catch (e) { console.innerText += ' Exception: ' + e; }
};

// This launches the contact picker, as per settings set in the form
var LaunchTestContactPicker = function () {

    var WC = Windows.ApplicationModel.Contacts;

    // get radio button values
    var getRadioButtonGroupValue = function (group) {
        for (var i = 0; i < group.length; i++) {
            var radioBtn = group[i];
            if (radioBtn.checked) {
                return radioBtn.value;
            }
        }
    };

    // get check box values
    var getCheckBoxGroupValue = function (group) {
        var ret = new Array();
        for (var i = 0; i < group.length; i++) {
            var checkBox = group[i];
            if (checkBox.checked) {
                ret.push(checkBox.value);
            }
        }
        return ret;
    };

    // clear previously added any contact information
    while (contacts.childNodes[0]) {
        contacts.removeChild(contacts.childNodes[0]);
    }

    // create a new instance of Windows Contact Picker
    var picker = new WC.ContactPicker();

    // commit button text
    picker.commitButtonText = document.getElementById("editCommitButtonText").value;

    // selection mode
    picker.selectionMode =
            (getRadioButtonGroupValue(form["selectionMode"]) === "0" ?
                WC.ContactSelectionMode.contacts :
                WC.ContactSelectionMode.fields);

    // desired fields
    var desiredFields = getCheckBoxGroupValue(form["desiredFields"]);
    for (var i = 0; i < desiredFields.length; i++) {
        picker.desiredFields.append(desiredFields[i]);
    }

    msWriteProfilerMark("launchTestContactPicker,StartTA,People");

    // picking mode
    // this also launches the picker
    var op =
            (getRadioButtonGroupValue(form["pickingMode"]) === "0" ?
                picker.pickSingleContactAsync() :
                picker.pickMultipleContactsAsync());

    // operation completion handler
    op.done(HandleOperationResults);
};

var form = null;
var console = null;
var templateContactDiv = null;
var contactsDiv = null;
var results = null;

// These functions will be invoked from the C# test
// returns the results
document.getResults = function () { return null; };
// indicates if the results are ready
document.resultsReady = function () { return false; };

// DOMContentLoaded
window.addEventListener("DOMContentLoaded", function () {
    console = document.getElementById("console");
    form = document.forms["testContactPickerForm"];
    templateContactDiv = document.querySelector("#templates>.contact");
    contactsDiv = document.getElementById("contacts");

    if (!window.Windows) {
        var script = document.createElement("script");
        script.src =  "../../../shared/JSUtil/Include.js";
        document.head.appendChild(script);
        $include("$(winJS)/js/base.js");
        $include("$(jxCore)/Jx.js");
        $include("$(peopleShared)/Stubs/Stubs.js");
    }

}, false);
