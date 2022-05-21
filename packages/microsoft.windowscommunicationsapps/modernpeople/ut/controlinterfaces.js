
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// The Expected Control Interfaces that must be implemented.
// The implementation will be enforced by UnitTests rather than including the definitions
// into the production code.
(function (A) {

    var P = A.People || (A.People = {}),
        U = P.UnitTest || (P.UnitTest = {}),
        I = U.Interfaces || (U.Interfaces = {});

    // The expected Host interface that the Controls will use to interact with the Host
    I.IPageHost = /*@constructor*/function () {
        // Returns an ICommandBar instance for the Hosted Controls to use
        this.getCommandBar = function () { };
    };

    // The Hosts command bar should provide these functions and interfaces
    I.ICommandBar = /*@constructor*/function () {
        // Add a new command to the command bar
        this.addCommand = function (command) { };

        // Update and existing command in the command bar
        this.updateCommand = function (command) { };
        
        // Refresh the command bar after adding commands
        this.refresh = function () { };

        // Remove all (page) of the current commands from the command bar 
        // Note: the host is free to add / keep any of it own specific commands
        // if any
        this.reset = function () { };
    };

    // The expected Implementation for the commands
    I.ICommand = /*@constructor*/function () {
        this.commandId = {};
        this.name = "";
        this.iconSymbol = "";
        this.context = {};
        this.onInvoke = function (context) { };
        this.setSelected = function (selected) { };
    };

    I.IPageControl = /*@constructor*/function () {
        /// <summary>
        /// Loads the control, the params contains a structured object that
        /// is defined as part of the API
        /// The params contains an object which includes the mode, data, hydration context, etc.
        /// </summary>
        /// <param name="params" type="Object" optional="false">
        /// This parameter contains an object in the structure used by the IPageHost container.
        /// it is defined with the following attributes
        ///
        /// mode = (type:string, optional:false)
        /// Identifies the actual mode that control should be prepared to 
        /// activate from. The mode is the driver for interrupting the other properties of this object (data, fields, context)
        /// Supported Modes:
        ///   'load'�    = Normal load, only data is required
        ///   'hydrate'� = Control is to re-hydrate using the original data object and
        ///               the context which contains the object returned by prepareSuspension.
        ///   'linked'�  = Deep linking support, uses data object and fields, with the properties
        ///               of the field acting as the name along with their corresponding values
        ///
        /// data = (type:IMeContact, optional:false)
        /// This should contain the primary data type for the control implementing this interface
        /// it is ALWAYS provided by the host application when calling load for all "mode" types.
        ///
        /// fields = (type:object, optional:true)
        /// Passed in to support deep linking or initial creation 
        /// Populate profile from some other service (Facebook, LinkedIn, etc)
        /// With the individual fields passed in here (rather than the service)
        /// And the fields are treated as 'unsafe'�
        /// If a control ignores these and it shouldn't then the bug is on the
        /// control  (where it should be) and not the Hosting App (PeopleApp)
        ///
        /// context = (type:object, optional:true)
        /// This is used primarily for the hydration context, but perhaps it could
        /// also be used for some sort of 'other'� context depending on the control
        /// or whatever we need in the future (save / load scenario)
        /// </param>
        this.load = function (params) { };

        /// <summary>
        /// Causes the control to attempt to save the current contents of the 
        /// control. If successful this will return true, for view only controls
        /// this method will return false.
        /// </summary>
        /// <returns type="Boolean">
        /// True when successful, otherwise false to indicate that the save operation either was 
        /// not performed or was unsuccessful.
        /// </returns>
        // this.save = function () { };

        /// <summary>
        /// Serialize the current state of the control into an object
        /// Used during the dehydrate operation
        /// </summary>
        /// <returns type="Object">The Returned object represents the current state of the control and can be used to 
        /// reconstruct the display when passed as the context to the load function with a mode of 'hydrate'
        /// If nothing is to be stored then this may return null.
        /// </returns>
        this.prepareSuspension = function () { };

        /// <summary>
        /// Called when the control is activated (being navigated to).
        /// The control can set focus in this call.
        /// </summary>
        this.activate = function () { };

        /// <summary>
        /// Called when the control is deactivated (being navigated away). 
        /// Returns bool to indicate if it's okay to be navigated away. 
        /// For example, if the control is an edit control, this is the 
        /// chance to ask user if he/she wants to save the data before 
        /// navigating away. 
        /// </summary>
        /// <param name="forcedClose" type="Boolean" optional="true">
        /// Tells the control whether this is a forced close event, which means that it cannot stop the process.
        /// </param>
        /// <returns type="Boolean">
        /// True if the page will go to the new location.
        /// False if the page should not loose focusand remain the same.
        /// </returns>
        this.deactivate = function (forcedClose) { };

        /// <summary>
        /// Called when the control is unloaded. 
        /// The control should release any resources and do cleanup at this time. It cannot stop the operation,
        /// the hosting application may terminate after calling this method. The control is deemed to be "destructed" 
        /// after calling this method and will no longer be called.
        /// </summary>
        this.unload = function () { };
    };
} (window));
