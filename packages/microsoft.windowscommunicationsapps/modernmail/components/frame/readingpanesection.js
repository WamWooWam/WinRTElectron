
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Debug,Mail,Jx*/
Jx.delayDefine(Mail, "ReadingPaneSection", function () {

    var ReadingPaneSection = Mail.ReadingPaneSection = function (selection, animator, glomManager) {
        Debug.assert(Jx.isObject(selection));
        Debug.assert(Jx.isNullOrUndefined(animator) || Jx.isObject(animator));

        this.initComponent();
        this._animator = animator;

        var readingPane = this._readingPane = new Mail.StandardReadingPane("mailFrameReadingPane", selection, glomManager, animator);
        this.append(readingPane);

        this._element = null;
    };
    Jx.augment(ReadingPaneSection, Jx.Component);
    var prototype = ReadingPaneSection.prototype;

    prototype.getUI = function (ui) {
        ui.html = "<div id='mailFrameReadingPaneSection'>" +
                      "<div id='mailFrameReadingPane' class='mailFrameReadingPaneChild'>" +
                          Jx.getUI(this._readingPane).html +
                      "</div>" +
                      "<div id='idCompCompose' class='invisible mailFrameReadingPaneChild'></div>" +
                  "</div>";
    };

    prototype.onActivateUI = function () {
        var element = this._element = document.getElementById("mailFrameReadingPaneSection"),
            animator = this._animator;
        if (animator) {
            animator.setReadingPaneElements(element);
        }
    };

    prototype.setEnabled = function (enabled) {
        Jx.setClass(this._element, "invisible", !enabled);
    };

});

