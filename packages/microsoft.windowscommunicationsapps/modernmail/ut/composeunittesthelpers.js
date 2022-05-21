
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Compose, Jx*/

(function(){
    /// Define global objects
    Compose.UnitTest = Compose.UnitTest || {};
    var U = Compose.UnitTest;

    // Instantiates and sets up a Compose Component, giving it a div into which it can place its UI and activating it
    U.initializeComponent = function (tc, ctor) {
        var component = new ctor(),
            mockRoot = document.createDocumentFragment(),
            mockRootDiv = document.createElement("div"),
            ui = { html: null, css: null };

        // Need to mock out the getElementById function because only document has that one
        mockRoot.getElementById = function (id) {
            return this.querySelector("#" + id);
        };
        Compose.doc = mockRoot;
        tc.addCleanup(function () {
            Compose.doc = document;
        });

        // Mock away some of the more complicated portions of the Compose component
        component._componentCreator = {};
        component._componentCache = {
            removeComponent: Jx.fnEmpty,
            addComponent: Jx.fnEmpty
        };
        component._validationViewController = {};
        component.setComponentBinder({ attach: Jx.fnEmpty });

        // Get the HTML from the Compose component
        var mockWindowDiv = document.createElement("div");
        mockWindowDiv.className = "composeWindow";
        component.getUI(ui);
        mockWindowDiv.innerHTML = ui.html;
        mockRootDiv.appendChild(mockWindowDiv);
        mockRoot.appendChild(mockRootDiv);
        component._element = mockRootDiv;

        // Finally, activate the Compose component
        component.activateUI();

        return component;
    };

    // Creates a message model object initialized with the given properties
    U.createMessageModel = function (properties) {
        var messageModel = Compose.MailMessageModel.instance({ initAction: Compose.ComposeAction.createNew });
        if (properties) {
            messageModel.set(properties);
        }

        return messageModel;
    };

})();
