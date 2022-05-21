
window.addEventListener("DOMContentLoaded", function() {

    Jx.app = new Jx.Application();

    var provider = new Mocks.Microsoft.WindowsLive.Platform.Data.JsonProvider({}, null, Mocks.Microsoft.WindowsLive.Platform.Data.MethodHandlers);

    function Placeholder() { }
    Jx.inherit(Placeholder, People.IdentityElements.BaseElement);
    Placeholder.prototype.getUI = function (host, id, options) {
        return People.IdentityElements.makeElement(
            "span",
            id,
            "",
            options,
            People.IdentityControl.getOption(options, "text", "Placeholder")
        );
    };

    function Disambiguator() { }
    Jx.inherit(Disambiguator, People.IdentityElements.BaseElement);
    Disambiguator.prototype.getUI = function (host, id, options) {
        return People.IdentityElements.makeElement(
            "div",
            id,
            "disambiguator",
            options,
            "<div class='disambiguatorContent'>\uE011</div>"
        );
    }
    Disambiguator.prototype.activateUI = function (host, node) {
        node.addEventListener("click", function (ev) {
            var icNode = node.parentElement;
            ev.stopPropagation();
            if (Jx.hasClass(icNode, "menuOpened")) { 
                Jx.removeClass(icNode, "menuOpened"); 
            } else {
                Jx.addClass(icNode, "menuOpened");
            }
        }, false);
    };


    var pickerInteractions = {
        onClick: function (object) { pickerInteractions.selectionManager._select(object); },
        selectionManager: {
            isSelected: function (object) {
                return (this._selectedObject === object)
            },
            _select: function (object) {
                if (this._selectedObject === object) {
                    this._selectedObject = null;
                } else {
                    this._selectedObject = object;
                }
                this.raiseEvent("selectionchange");
            }
        }
    };
    Jx.mix(pickerInteractions.selectionManager, Jx.Events);
    if (Debug && Debug.Events) {
        Debug.Events.define(pickerInteractions.selectionManager, "selectionchange");
    }
        
    var mailInteractions = {
        getTooltip: function (dataObject, defaultTooltip) {
            if (dataObject.objectType === "Recipient") { 
                return defaultTooltip + "\n" + dataObject.emailAddress;
            }
            return defaultTooltip;
        }
    };


    var definitions = {
        "People: address book me section": {
            container: "inline",
            element: People.IdentityElements.TileLayout,
            options: {
                statusIndicator: null,
                primaryContent: null
            }
        }, "People: address book favorites section": {
            container: "inline",
            element: People.IdentityElements.TileLayout,
            options: {
                className: "ic-favorite",
                primaryContent: {
                    element: People.IdentityElements.Name,
                    className: "ic-favoriteName"
                }
            },
        }, "People: address book all section": {
            container: "inline",
            element: People.IdentityElements.BillboardLayout,
            options: { className: "ic-listItem" },
        }, "People: address book snap favorites" : {
            container: "inline",
            element: People.IdentityElements.BillboardLayout,
            options: {
                className: "ic-snapFavorite",
                size: 60,
                fontSize: "normal"
            },
        }, "People: address book snap all": {
            container: "inline",
            element: People.IdentityElements.BillboardLayout,
            options: {
                className: "ic-listItem",
                size: 60,
                fontSize: "normal"
            },
        }, "People: people picker": {
            container: "inline",
            element: People.IdentityElements.PickerLayout,
            options: {
               className: "ic-listItem",
               secondaryContent: { element: Placeholder, text: "Email Placeholder" },
               secondaryHitTarget: Disambiguator
            },
            interaction: pickerInteractions
        }, "People: profile view": {
            container: "inline",
            element: People.IdentityElements.TileLayout,
            options: {
                secondaryContent: People.IdentityElements.Networks
            }
        }, "People: recent activity" : {
            generator: function (ic) {
                return "<div class='raContainer'>" +
                    "<div class='raTile'>" + ic.getUI(People.IdentityElements.Tile, { size: 40, statusIndicator: null }) +  "</div>" +
                    "<div class='raText'>" + ic.getUI(People.IdentityElements.Name, { className: "raName" }) + " Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</div>" +
                "</div>";
            }
        }, "Mail: reading pane tile" : {
            container: "inline",
            element: People.IdentityElements.Tile,
            options: { collapse: true },
            interaction: mailInteractions
        }, "Mail: reading pane sender" : {
            container: "readingPaneFrom",
            element: People.IdentityElements.Name,
            interaction: mailInteractions
        }, "Mail: reading pane to line" : {
            generator: function (ic) {
                var html = "<div class='readingPaneTo'>";
                for (var i=0; i<10; i++) {
                    html += (i>0 ? "; " : "") + ic.getUI(People.IdentityElements.Name, { className: "readingPaneToElement" });
                }
                html += "</div>";
                return html;
            },
            interaction: mailInteractions
        }, "Mail: message list tile" : {
            container: "inline",
            element: People.IdentityElements.Tile,
            options: {
                className: "noBackground",
                size: 40,
                statusIndicator: null,
                tilePriority: People.Priority.tileRender,
                defaultImage: ""
            },
            interaction: {
                interactive: false
            }
        }
    };
    var select = document.getElementById("idInputType");
    for (var controlType in definitions) {
        var option = document.createElement("option");
        option.value = option.innerText = controlType;
        select.appendChild(option);
    }

    var controls = [];

    function randomItem(rg) {
        return rg[Math.floor(Math.random() * rg.length)];
    }
    function randomName() {
        return randomItem([
            "Jane Dow",
            "\u01fandy",
            "An Ellipsis Is A Terrible Thing To Waste",
            "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
        ]);
    }
    function randomUserTile() {
        return "http://lorempixel.com/220/220/?" + Math.random();
    }
    function randomEmail() {
        return randomItem([
            "jane@dow.com",
            "janedow32@hotmail.com",
            "coriander_ranger@epicurious.com",
            "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX@gmail.com"
        ]);
    }

    function createControls() {
        // Clean up old controls
        controls.forEach(function (ic) { 
            ic.shutdownUI();
        });
        controls.length = 0;
        var canvas = document.getElementById("canvas");
        canvas.innerHTML = "";

        var html = "";
        var selectedControlType = select.value;
        var controlsToCreate = document.getElementById("idInputNumber").value;
        for (var controlType in definitions) {
            if (selectedControlType === controlType || selectedControlType === "All") {
                html += "<div class='heading'>" + controlType + "</div>";
                var definition = definitions[controlType];
                for (var i=0; i < controlsToCreate; i++) {
                    var ic = new People.IdentityControl(dataSource, null, definition.interaction);
                    if (definition.container) {
                        html += "<div class='" + definition.container + "'>";
                    }
                    if (definition.generator) {
                        html += definition.generator(ic);
                    } else {
                        var options = definition.options ? Object.create(definition.options) : {};
                        options.className = (options.className || "") + " testIdentityControl";
                        html += ic.getUI(definition.element, options);
                    }
                    if (definition.container) {
                        html += "</div>";
                    }
                    html += " ";
                    controls.push(ic);
                }
            }
        }
        document.getElementById("canvas").innerHTML = html;
        for (var i = 0, len = controls.length; i < len; ++i) {
            controls[i].activateUI();
        }
    }

    function bindInput(settings, selector, update) {
        var input = settings.querySelector(selector);
        input.update = function () { if (input.lastKnownValue !== input.value) { input.lastKnownValue = input.value; update(input.value); } };
        input.addEventListener("change", input.update, false);
        input.addEventListener("keyup", input.update, false);
        input.update();
    }
    function bindCheckbox(ancestor, selector, update) {
        var input = ancestor.querySelector(selector);
        input.update = function () { update(input.checked); };
        input.addEventListener("change", input.update, false);
        input.update();
    }
    function bindSelect(settings, selector, update) {
        var select = settings.querySelector(selector);
        select.update = function () { update(getSelectedObjects(select)); };
        select.addEventListener("change", select.update, false);
        select.update();
    }
    function randomize(settings, inputSelector, buttonSelector, randomizer) {
        var input = settings.querySelector(inputSelector);
        settings.querySelector(buttonSelector).addEventListener("click", function () {
            input.value = randomizer();
            input.update();
        }, false);
        input.value = randomizer();
    }

    var objectTypes = {};
    objectTypes.Person = {
        create: function () {
            return provider.createObject("Person");
        },
        initSettings: function (object, settings) {
            randomize(settings, "#idInputName", "#idRandomName", randomName);
            randomize(settings, "#idInputUserTile", "#idRandomUserTile", randomUserTile);
            randomize(settings, "#idInputEmail", "#idRandomEmail", randomEmail);
            bindInput(settings, "#idInputName", function (value) { object.mock$setProperty("calculatedUIName", value); });
            bindInput(settings, "#idInputUserTile", function (value) { object.userTile.mock$setProperty("appdataURI", value); });
            bindInput(settings, "#idInputEmail", function (value) { object.mock$setProperty("mostRelevantEmail", value); });
            bindSelect(settings, "#idInputLinkedContacts", function (values) {
                var linkedContacts = object.linkedContacts;
                for (var i = linkedContacts.count; i--; ) {
                    var objectId = linkedContacts.item(i).objectId;
                    var found = false;
                    for (var j = 0, len = values.length; j < len; ++j) {
                        if (values[j].objectId === objectId) {
                            values.splice(j, 1);
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        linkedContacts.mock$removeItem(i);
                    }
                }
                for (var i = 0, len = values.length; i < len; ++i) {
                    linkedContacts.mock$addItem(values[i], linkedContacts.count);
                }
            });
        }
    };
    objectTypes.Me = {
        create: function () {
            return provider.createObject("MeContact");
        },
        initSettings: objectTypes.Person.initSettings
    };
    objectTypes.Contact = {
        create: function () {
            return provider.createObject("Contact");
        },
        initSettings: function (object, settings) {
            randomize(settings, "#idInputUserTile", "#idRandomUserTile", randomUserTile);
            bindInput(settings, "#idInputFirstName", function (value) { object.mock$setProperty("firstName", value); });
            bindInput(settings, "#idInputLastName", function (value) { object.mock$setProperty("lastName", value); });
            bindInput(settings, "#idInputCompanyName", function (value) { object.mock$setProperty("companyName", value); });
            bindInput(settings, "#idInputWindowsLiveEmailAddress", function (value) { object.mock$setProperty("windowsLiveEmailAddress", value); });
            bindInput(settings, "#idInputPersonalEmailAddress", function (value) { object.mock$setProperty("personalEmailAddress", value); });
            bindInput(settings, "#idInputBusinessEmailAddress", function (value) { object.mock$setProperty("businessEmailAddress", value); });
            bindInput(settings, "#idInputOtherEmailAddress", function (value) { object.mock$setProperty("otherEmailAddress", value); });
            bindInput(settings, "#idInputMobilePhoneNumber", function (value) { object.mock$setProperty("mobilePhoneNumber", value); });
            bindInput(settings, "#idInputHomePhoneNumber", function (value) { object.mock$setProperty("homePhoneNumber", value); });
            bindInput(settings, "#idInputHome2PhoneNumber", function (value) { object.mock$setProperty("home2PhoneNumber", value); });
            bindInput(settings, "#idInputBusinessPhoneNumber", function (value) { object.mock$setProperty("businessPhoneNumber", value); });
            bindInput(settings, "#idInputBusiness2PhoneNumber", function (value) { object.mock$setProperty("business2PhoneNumber", value); });
            bindInput(settings, "#idInputUserTile", function (value) { object.userTile.mock$setProperty("appdataURI", value); });
            bindSelect(settings, "#idInputAccount", function (values) { object.mock$setProperty("account", values[0]); });
        }
    };
    objectTypes.Recipient = {
        create: function () {
            return new Mocks.Microsoft.WindowsLive.Platform.Recipient("", "", null, provider);
        },
        initSettings: function (object, settings) {
            randomize(settings, "#idInputName", "#idRandomName", randomName);
            randomize(settings, "#idInputFastName", "#idRandomFastName", randomName);
            randomize(settings, "#idInputFastName", "#idRandomFastName", randomName);
            randomize(settings, "#idInputEmail", "#idRandomEmail", randomEmail);
            bindInput(settings, "#idInputFastName", function (value) { object.mock$setProperty("fastName", value); });
            bindInput(settings, "#idInputName", function (value) { object.mock$setProperty("calculatedUIName", value); });
            bindInput(settings, "#idInputFastName", function (value) { object.mock$setProperty("fastName", value); });
            bindInput(settings, "#idInputEmail", function (value) { object.mock$setProperty("emailAddress", value); });
            bindSelect(settings, "#idInputPerson", function (values) { object.mock$setProperty("person", values[0]); });
        }
    };
    objectTypes.Literal = {
        create: function () {
            return {
                objectType: "literal",
                name: ""
            };
        },
        initSettings: function (object, settings) {
            randomize(settings, "#idInputName", "#idRandomName", randomName);
            randomize(settings, "#idInputUserTile", "#idRandomUserTile", randomUserTile);
            randomize(settings, "#idInputLargeUserTile", "#idRandomLargeUserTile", randomUserTile);
            randomize(settings, "#idInputEmail", "#idRandomEmail", randomEmail);
            bindInput(settings, "#idInputName", function (value) { object.name = value; });
            bindInput(settings, "#idInputUserTile", function (value) { object.userTile = value; });
            bindInput(settings, "#idInputLargeUserTile", function (value) { object.largeUserTile = value; });
            bindInput(settings, "#idInputEmail", function (value) { object.email = value; });
        }
    };
    objectTypes.Account = {
        create: function () {
            return provider.createObject("Account");
        },
        initSettings: function (object, settings) {
            bindInput(settings, "#idInputDisplayName", function (value) { object.mock$setProperty("displayName", value); });
        }
    };

    bindInput(document, "#idInputNumber", createControls);
    document.getElementById("idInputType").addEventListener("change", createControls, false);

    function initSelects() { 
        var selects = document.querySelectorAll("select[types]");
        for (var i = 0, len = selects.length; i < len; ++i) {
            initSelect(selects[i]);
        }
    }
    function initSelect(element) {
        if (!element.multiple) {
            var option = document.createElement("option");
            option.innerText = "None";
            option.setAttribute("optionType", "null");
            option.selected = true;
            element.appendChild(option);
        }
        var types = element.getAttribute("types").split(" ");
        types.forEach(function(objectType) {
            var option = document.createElement("option");
            option.innerText = "New " + objectType;
            option.setAttribute("optionType", "create");
            option.value = objectType;
            element.appendChild(option);
        });
        types.forEach(function(objectType) {
            var items = objectTypes[objectType].items;
            if (items) {
                for (var i = 0, len = items.length; i < len; ++i) {
                    addOption(element, objectType, id);
                }
            }
        });
    }
    initSelects();

    var dataSource = null;
    bindSelect(document, "#idSelectDataSource", function(values) {
        dataSource = values[0];
        for (var i = 0, len = controls.length; i < len; ++i) {
            controls[i].updateDataSource(dataSource);
        }
    });

    function getSelectedObjects(select) {
        var objects = [];

        var options = select.options;
        for (var i = 0, len = options.length; i < len; ++i) {
            var option = options[i];
            if (option.selected) {
                switch (option.getAttribute("optionType")) {
                    case "null":
                        objects.push(null);
                        break;
                    case "create":
                        option.selected = false;
                        var objectType = option.value;
                        var id = createObject(objectType);
                        for (var j = 0, len2 = options.length; j < len2; ++j) {
                            var testOption = options[j];
                            if (testOption.getAttribute("optionType") === objectType && testOption.value == id) {
                                testOption.selected = true;
                                break;
                            }
                        }
                        objects.push(objectTypes[objectType].items[id]);
                        break;
                    default:
                        objects.push(objectTypes[option.getAttribute("optionType")].items[option.value]);
                        break;
                }
            }
        }
        return objects;
    }

    function createObject(objectType) {
        // Create the object
        var objectInfo = objectTypes[objectType];
        var object = objectInfo.create();
        var items = objectInfo.items = objectInfo.items || [];
        var id = items.length;
        items.push(object);

        // create a settings blob for it
        var template = document.querySelector(".templates [template~='" + objectType + "']");
        var settings = template.cloneNode(true);
        settings.querySelector('.inputSectionTitle').innerText = objectType + id;
        objectInfo.initSettings(object, settings);
        document.querySelector(".inputArea").appendChild(settings);

        // Insert it into the relevant controls
        var selects = document.querySelectorAll("select[types~='" + objectType +"']");
        for (var i = 0, len = selects.length; i < len; ++i) {
            addOption(selects[i], objectType, id);
        }

        return id;
    }

    function addOption(select, objectType, id) {
        var option = document.createElement("option");
        option.setAttribute("optionType", objectType);
        option.value = id;
        option.innerText = objectType + id;
        select.appendChild(option);
    }
    
    document.querySelector("#canvas").onselectstart = function () { return false; }
}, false);
