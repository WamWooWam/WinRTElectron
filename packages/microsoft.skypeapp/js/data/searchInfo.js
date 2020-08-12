

(function () {
    "use strict";

    WinJS.Namespace.define("Skype.Model", {
        SearchInfo: MvvmJS.Class.define(function (matchInName, title, description) {
            this.matchInName = !!matchInName;
            this.title = title;
            this.description = description;
        }, {
            matchInName: false,
            title: null,
            description: null
        })
    });
}());