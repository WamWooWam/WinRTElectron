
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

var UtilitiesLib = function () {

    return {
        // This function removes the RTL and LTR text markers from the passed in string, also removes spaces
        // from start and end of string
        removeTextMarkers: function (string) {
            return string.replace(/\u200e/g, "")
                         .replace(/\u200b/g, "")
                         .replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '')
                         .replace(/\s+/g, ' '); // trim the string
        }, //removeTextMarkers
    }; //UtilitiesLib
}();
