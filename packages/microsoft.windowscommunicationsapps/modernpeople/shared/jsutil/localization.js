
//
// Copyright (C) Microsoft. All rights reserved.
//

Jx.delayDefine(People, "bidi", function () {

    var P = window.People;

    P.BiDi = function () {
        var direction = getComputedStyle(document.body).direction; 
        this.direction = direction;
    };

    P.bidi = new P.BiDi();
});
