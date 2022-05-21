
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../Shared/JsUtil/include.js" />
/// <reference path="People.js" />

(function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = People;
    var App = P.App;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    App.prototype._showLoginPage = function () {
        ///<summary>Shows the fake login page to collect creds so the mocks can use semi-real data</summary>
        NoShip.People.etw("peopleLoginPage_start");

        var styleElement = document.createElement("style");
        styleElement.id = "mockLoginStyles";
        styleElement.type = "text/css";
        styleElement.innerText =
            ".mockLogin-padding {" +
                "-ms-flex: 1.0 auto;" +
            "}" +
            "#mockLoginDialog {" +
                "width: 100%;" +
                "text-align: center;" +
            "}" +
            ".mockLogin-center {" +
                "margin-left:auto;" +
                "margin-right:auto;" +
            "}" +
            ".mockLogin-heading {" +
                "font-size: 24pt;" +
            "}" +
            ".mockLogin-warning {" +
                "color: red;" +
                "font-style: italic;" +
                "max-width: 400px;" +
                "padding: 10px;" +
                "margin-top: 10px;" +
                "background: yellow;" +
            "}" +
            ".mockLogin-button {" +
                "width: 276px;" +
            "}";
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        document.head.appendChild(styleElement);
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>

        document.getElementById("idRoot").innerHTML =
            "<div class='mockLogin-padding'></div>" +
            "<div id='mockLoginDialog'>" +
                "<div class='mockLogin-heading mockLogin-center'>Mock Platform Configuration</div>" +
                "<div>" + 
                    "<input class='mockLogin-button' type='button' id='mockLoginUseSample' value='Use Mock Platform with Sample Data'>" +
                "</div>" +
                "<div class='mockLogin-warning mockLogin-center'>The mock platform is for unit testing purposes only, and does not provide a meaningful representation of the end-to-end experience.  To actually use this app, you must set up a Connected ID.</div>" +
            "</div>" +
            "<div class='mockLogin-padding'></div>";

        var loginButton = document.getElementById("mockLoginUseSample");
        loginButton.addEventListener("click", this._mockLogin.bind(this, false), false);
        window.addEventListener("keyup", this._keyUpListener = onKeyUp.bind(this), false);

        loginButton.focus();
        if (!Jx.isWWA) {
            loginButton.click();
        }
    };

    /*@bind(App)*/function onKeyUp(ev) {
        /// <param name="ev" type="Event" />
        switch (ev.key) {
            case "Esc":
                this._mockLogin();
                break;
        }
    }

    App.prototype._mockLogin = function () {
        ///<summary>Does a "login".  Dismisses the mock login dialog, creates the mock platform and starts the app.</summary>
        window.removeEventListener("keyup", this._keyUpListener, false);

        document.getElementById("idRoot").innerHTML = "";
        var /*@type(HTMLElement)*/head = document.getElementsByTagName("head")[0];
        head.removeChild(document.getElementById("mockLoginStyles"));
        NoShip.People.etw("peopleLoginPage_end");

        NoShip.People.etw("peopleCreatePlatform_start");
        Jx.log.info("Creating the mock platform");
        this._platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/Mocks.Microsoft.WindowsLive.Platform.Data.makeHeadtraxDataset().getClient();
        NoShip.People.etw("peopleCreatePlatform_end");

        this._handleActivation();
    };

})();
