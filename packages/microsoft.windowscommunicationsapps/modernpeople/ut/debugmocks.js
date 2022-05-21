
//
// Copyright (C) Microsoft. All rights reserved.
//

Include.initializeFileScope(function () {
    // Debug.Events is undefined in Cover/Retail builds
    var D = window.Debug = window.Debug || {};
    var E = D.Events = D.Events || {};
    E.define = E.define || function () { };
    D.call = D.call || Jx.fnEmpty;
});
