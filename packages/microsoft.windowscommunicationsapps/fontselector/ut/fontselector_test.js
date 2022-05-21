
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,document,Jx,FontSelector,$*/
(function () {
    var host;
    function setUp() {
        // Just make sure the host is pointing to the right div
        host = document.getElementById("fontSelectorDiv");
    }

    function cleanUp() {
        host.innerHTML = "";
    }

    Tx.test("FontSelector.fontNameControl", { owner: "andrha", priority: 0 }, function (tc) {
        tc.cleanUp = cleanUp;
        setUp();
        var config = {
            fonts: ["Arial", "Calibri", "Times New Roman"],
            host: host
        };

        var control = new FontSelector.NameControl(config);

        // Since the UI hasn't been initiated, the value won't be set
        // because the internal array hasn't been loaded with the values.
        // The array is loaded on initUI
        control.value = "Arial";

        tc.areEqual(control.value, null);
        tc.isFalse(control.hasUI());

        // Load the internal values and check they are the same that we passed in
        var fonts = control._getFontNameList();

        // Check to make sure the font list is replaced correctly
        tc.isTrue(fonts.length === config.fonts.length);
        for (var i = 0; i < fonts.length; i++) {
            tc.areEqual(fonts[i], config.fonts[i]);
        }

        // Init the control and put it in the host div
        control.initUI(host);

        var eventsFired = 0,
            origSelect = control._select.bind(control);
        // Make sure the correct number of change events is fired
        control._select = function (e) {
            eventsFired++;
            origSelect(e);
        };
        
        // Check the UI has been made correctly
        tc.isTrue(control.hasUI());
        tc.isTrue(Jx.isObject(control._getElement()));

        // Make sure that the _getElement correctly returns a SELECT node
        tc.areEqual(control._getElement().nodeName, "SELECT");

        // Check that the value is correctly set for a valid value
        control.value = "Arial";
        tc.areEqual(control.value, "Arial");

        // If the value is attempted to be set and is invalid, it should not change the value
        control.value = "something not in the list";
        tc.areEqual(control.value, null);

        // Test that we can add a new value and use it
        control.addSelection("something not in the list");
        control.value = "something not in the list";
        tc.areEqual(control.value, "something not in the list");

        // Check the correct number of events was fired
        tc.areEqual(eventsFired, 3);

        // Dispose of the control
        control.shutdownUI();

        tc.areEqual(host.innerHTML, "");
    });

    Tx.test("FontSelector.sizeControl", { owner: "andrha", priority: 0 }, function (tc) {
        tc.cleanUp = cleanUp;

        var config = {
            sizes: [1,2,3,8,10,12,36]
        };

        var control = new FontSelector.SizeControl(config);

        // Test that the value can't be loaded since the internal array hasn't been laoded with the font sizes
        control.value = 8;
        tc.areEqual(control.value, null);

        // This will load the internal array when called, but it's good to check that what we passed in and what is there are the same
        var sizes = control._getFontSizes();

        tc.isTrue(sizes.length === config.sizes.length);
        for (var i = 0; i < sizes.length; i++) {
            tc.areEqual(sizes[i],config.sizes[i]);
        }

        control.initUI(host);

        var eventsFired = 0,
            origSelect = control._select.bind(control);

        // Make sure the correct number of change events is fired
        control._select = function (e) {
            eventsFired++;
            origSelect(e);
        };

        // Check the UI has been made correctly
        tc.isTrue(control.hasUI());
        tc.isTrue(Jx.isObject(control._getElement()));

        // Make sure that the _getElement correctly returns a SELECT node
        tc.areEqual(control._getElement().nodeName, "SELECT");

        // Check that the value is correctly set for a valid value
        control.value = 8;
        tc.areEqual(control.value, "8pt");

        // If the value is attempted to be set and is invalid, it should change the value to null
        control.value = 48;
        tc.areEqual(control.value, null);

        // Check that we can add pt on the end and still set the value
        control.value = "12pt";
        tc.areEqual(control.value, "12pt");

        // Test that we can add a new value and use it
        control.addSelection(24);
        control.value = 24;
        tc.areEqual(control.value, "24pt");

        // Check the correct number of events was fired
        tc.areEqual(eventsFired, 4);

        // Dispose of the control
        control.shutdownUI();

        tc.areEqual(host.innerHTML, "");
    });

    Tx.test("FontSelector.colorControl", { owner: "andrha", priority: 0 }, function (tc) {
        tc.cleanUp = cleanUp;

        var config = {
            gridLayout: {
                rows: "40px 40px",
                columns: "40px 40px 40px 40px 40px"
            },
            colors: [{ value: "#2A2A2A", name: "black" },
                    { value: "#4BA524", name: "green" },
                    { value: "#006FC9", name: "blue" },
                    { value: "#7232AD", name: "purple" },
                    { value: "#BD1398", name: "pink" },
                    { value: "#757B80", name: "grey" },
                    { value: "#D03A3A", name: "red" },
                    { value: "#D05C12", name: "orange" },
                    { value: "#E2C501", name: "yellow" }],
            // Don't try to use the MenuArrowKeyHandler
            menuArrowKeyHandler: false
        };

        var control = new FontSelector.ColorControl(config);

        // Test the colors were overridden
        tc.areEqual(control._getColors(), config.colors);

        var eventsFired = 0,
            origSelect = control._select.bind(control);

        // Make sure the correct number of change events is fired
        control._select = function (e) {
            eventsFired++;
            origSelect(e);
        };

        // Since the internal array isn't loaded until getUI is called
        // for the colorControl (instead of the internal _getColors as 
        // would be for the other two controls), check that
        // the value doesn't work before initUI is called
        control.value = "#2A2A2A";
        tc.areEqual(control.value, null);

        control.initUI(host);

        // Test that values are being stored correctly
        control.value = "#2A2A2A";
        tc.areEqual(control.value, "#2A2A2A");

        // Check that an invalid selection causes the value to be lost
        control.value = "#FFFFFF";
        tc.areEqual(control.value, null);

        // Check that the rgb to hex works
        control.value = "rgb(75,165,36)";
        tc.areEqual(control.value, "#4BA524");

        // Check the correct number of events was fired
        tc.areEqual(eventsFired, 3);

        // Check that the grid layout is implemented
        var element = control._getElement();

        tc.areEqual(element.firstChild.style.msGridRow, "1");
        tc.areEqual(element.firstChild.style.msGridColumn, "1");

        tc.areEqual(element.lastChild.style.msGridRow, "2");
        tc.areEqual(element.lastChild.style.msGridColumn, "4");

        // Attempt to click something and make sure the value gets set
        // 3 should be blue
        var blue = host.querySelector(".fontColorButton3"); 
        $(blue).trigger("click");

        // do what the mutation observer would have done async
        control._onMutation([{ target: control._selectedButton }, { target: blue }]);

        tc.areEqual(control.value, "#006FC9");

        control.shutdownUI();
        tc.areEqual(host.innerHTML, "");
    });

    Tx.test("FontSelector.fontControlsDefaults", { owner: "andrha", priority: 0 }, function (tc) {
        tc.cleanUp = cleanUp;
        setUp();

        var config = {
            menuArrowKeyHandler: false
        };

        // This tests to make sure each control generates default values without causing issue.
        var control = new FontSelector.NameControl(config);

        control.initUI(host);

        // Do a small test to make sure the fonts are loaded
        control.value = "Times New Roman";
        tc.areEqual(control.value, "Times New Roman");

        control.shutdownUI();

        control = new FontSelector.SizeControl(config);

        control.initUI(host);

        // Small test to check defaults were loaded
        control.value = 12;
        tc.areEqual(control.value, "12pt");

        control.shutdownUI();
    });
    
    Tx.test("FontSelector.fontControlsMaliciousValues", {owner: "andrha", priority: 0 }, function (tc) {
        tc.cleanUp = cleanUp;
        
        setUp();
        
        // HTML Values will not be checked because they will cause an exception. HTML is stripped from the style attribute
        // and is considered invalid by IE. Following up about a possible bug 
        var config = {
            fonts: ['"Arial"', '""""']
        };
        
        // This tests to make sure each control generates default values without causing issue.
        var control = new FontSelector.NameControl(config);

        control.initUI(host);
        
        // Add a new font to make sure new elements are escaped properly
        control.addSelection('"Times New Roman"');
        config.fonts.push('"Times New Roman"');
        
        // Test that the fonts have been loaded correctly
        var element = control._getElement(),
            children = element.childNodes;
        var i;
        for(i = 0; i < children.length; i++){
            tc.areEqual(children[i].value, config.fonts[i]);
            tc.areEqual(children[i].innerHTML, config.fonts[i]);
        }
        
        control.shutdownUI();
    });

    Tx.test("FontSelector.fontNameControlAddTemp", { owner: "andrha", priority: 0 }, function (tc) {
        tc.cleanUp = cleanUp;
        setUp();

        var config = {
            fonts: ["Arial", "Calibri", "Times New Roman"],
            newOnFail: true
        };

        var control = new FontSelector.NameControl(config);

        control.initUI(host);

        // Check that there are only 3 child nodes to start
        tc.areEqual(control._getElement().childNodes.length, 3);

        control.value = "Comic Sans";
        tc.areEqual(control.value, "Comic Sans");
        tc.areEqual(control._getElement().childNodes.length, 4);

        control.clear();
        tc.areEqual(control._getElement().childNodes.length, 3);

        control.shutdownUI();
    });

})();