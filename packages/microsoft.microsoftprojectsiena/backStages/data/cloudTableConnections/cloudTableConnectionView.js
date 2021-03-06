﻿//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var ConnectionView = WinJS.Class.define(function ConnectionView_ctor(element) {
            this._element = element;
            ko.applyBindings(element.viewModel, element.children[0])
        }, {_element: null});
    AppMagic.UI.Pages.define("/backStages/data/cloudTableConnections/cloudTableConnectionView.html", ConnectionView)
})();