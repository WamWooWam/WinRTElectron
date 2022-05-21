
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/// <reference path="../../shared/Jx/Core/Jx.dep.js" />
/// <reference path="Windows.Storage.Pickers.js" />
/// <reference path="Windows.Storage.AccessCache.js" />
/// <disable>JS3057.AvoidImplicitTypeCoercion</disable>
/// <disable>JS3054.NotAllCodePathsReturnValue</disable>

(function () {

    // Provides a mechanism for overlaying a partially transparent design image inside the app
    // To invoke from the console, use:
    //    load("redline.js");
    // This will open a file picker (in WWA or IE) which can be pointed to the redline share and used to 
    // retrieve the image of your choice.
    //
    // This image will be displayed under the app (to preserve hover effects and interactivity) and the body of the 
    // app will be set to 50% opacity.  This value can be adjusted using the +/- keys.
    //
    // The image can be moved around with the arrow keys, and toggled on and off with the space bar.  For moving larger
    // distances, Ctrl+arrow keys will move 20 pixels at a time.  The offset is reported to help with pixel measurements.
    //
    // Press F6 to select a different image.
    //
    var state = {
        url: "",
        top: 0,
        left: 0,
        opacity: 0.5
    };
    var enabled = false;
    WinJS.Promise.wrap().then(function () {
        state = Debug.getCookie("redline") || state;
        if (Jx.isWWA) {
            state.url = ""; // WWA object URLs are transient. Look up a file from the MRU
            var mru = Windows.Storage.AccessCache.StorageApplicationPermissions.mostRecentlyUsedList;
            var mruToken = Array.prototype.reduce.call(mru.entries, function (token, /*@type(Windows.Storage.AccessCache.AccessListEntry)*/entry) {
                return token || (entry.metadata === "redline" && entry.token);
            }, null);
            if (mruToken) {
                return mru.getFileAsync(mruToken).then(function (file) {
                    state.url = window.URL.createObjectURL(file, { oneTimeOnly: false });
                });
            }
        }
    }).done(function () {
        if (Jx.isNonEmptyString(state.url)) {
            enabled = true;
            updateUI();
        } else {
            pickFile();
        }
    }, function () {
        pickFile();
    });

    window.addEventListener("keydown", function (/*@type(Event)*/ev) {
        var handled = true;
        if (ev.key === "F6") {
            pickFile();
        } else if (ev.key === "Spacebar" && Jx.isNonEmptyString(state.url)) {
            enabled = !enabled;
        } else if (enabled) {
            var distance = ev.ctrlKey ? 20 : 1;
            switch (ev.key) {
                case "Add": state.opacity = Math.min(1, state.opacity - 0.125); break;
                case "Subtract": state.opacity = Math.max(0, state.opacity + 0.125); break;
                case "Up": state.top = state.top - distance; break;
                case "Down": state.top = state.top + distance; break;
                case "Left": state.left = state.left - distance; break;
                case "Right": state.left = state.left + distance; break;
                case "Home": state.left = state.top = 0; break;
                default: handled = false; break;
            }
        } else {
            handled = false;
        }

        if (handled) {
            ev.preventDefault();
            ev.stopPropagation();
            updateUI();
        }
    }, true);

    function pickFile() {
        // Pops a file picker to select a file
        if (Jx.isWWA) {
            var picker = Windows.Storage.Pickers.FileOpenPicker();
            picker.fileTypeFilter.append(".png");
            picker.pickSingleFileAsync().done(function (file) {
                if (Jx.isWWA) {
                    Windows.Storage.AccessCache.StorageApplicationPermissions.mostRecentlyUsedList.add(file, "redline");
                }
                state.url = window.URL.createObjectURL(file, { oneTimeOnly: false });
                enabled = true;
                updateUI();
            }, function () {
                enabled = false;
                updateUI();
            });
        } else {
            var input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.style.display = "none";
            document.body.appendChild(input);
            input.click();
            state.url = input.value;
            enabled = Jx.isNonEmptyString(input.value);
            document.body.removeChild(input);
            updateUI();
        }
    }

    var image, label;
    function updateUI() {
        // Updates the image and label elements to reflect the values in state.
        createElements();
        if (enabled) {
            Debug.setCookie("redline", state);
            image.src = state.url;
            image.style.top = state.top + "px";
            image.style.left = state.left + "px";
            label.style.display = image.style.display = "";
            document.body.style.opacity = state.opacity;

            var text = "";
            if (state.top || state.left) {
                text = state.left + ", " + state.top;
            }
            label.innerText = text;
        } else {
            label.style.display = image.style.display = "none";
            document.body.style.opacity = "";
        }

    }

    function createElements() {
        // Creates the image and label elements and adds them to the page.
        if (!image) {
            image = document.createElement("img");
            image.style.position = "absolute";
            image.style.width = image.style.height = "auto";
            image.style.zIndex = "-1";
            document.body.appendChild(image);
        }

        if (!label) {
            label = document.createElement("div");
            label.style.position = "absolute";
            label.style.top = label.style.right = "20px";
            label.style.color = "red";
            label.style.fontSize = "16pt";
            document.body.appendChild(label);
        }
   }

})();
