
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../JsUtil/namespace.js" />
/// <reference path="../../AddressBook/pages/AddressBook.js" />
/// <reference path="../../Social/Common/Social.dep.js" />
/// <reference path="../../Profile/Controls/ProfileViewControl.js" />
/// <reference path="../../Profile/Controls/ProfilePictureControl.js" />

Jx.delayDefine(People, "Nav", function () {
    
    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    var N = window.People.Nav = {};
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    N.useMockPages = false;

    var s = N.Scenes;
    // This is a map that maps the pages to controls.
    N.Pages = {
        allcontacts: {
            id: "allcontacts",
            control: "allcontactsctrl",
            requirePerson: false,
            requireMe: false,
            showMessageBar: true,
            showConnectedTo: true
        },
        createcontact: {
            id: "createcontact",
            control: "addprofile",
            requirePerson: false,
            requireMe: false,
            blockNavbar: true,
            stickyAppbar: true,
            isEdit: true
        },
        editmepicture: {
            id: "editmepicture",
            control: "editmepicture",
            requirePerson: true,
            requireMe: true,
            blockNavbar: true,
            stickyAppbar: true,
            showMessageBar: true,
            isEdit: true
        },
        editprofile: {
            id: "editprofile",
            control: "editprofile",
            requirePerson: true,
            requireMe: false,
            blockNavbar: true,
            stickyAppbar: true,
            isEdit: true
        },
        galsearchresults: {
            id: "galsearchresults",
            control: "galsearchresults",
            requirePerson: false,
            requireMe: false,
            showMessageBar: true
        },
        linkperson: {
            id: "linkperson",
            control: "link",
            requirePerson: true,
            requireMe: false,
            blockNavbar: true,
            stickyAppbar: true,
            showMessageBar: true,
            isEdit: true
        },
        notification: {
            id: "notification",
            control: "notification",
            requirePerson: false,
            requireMe: false,
            showMessageBar: true
        },
        viewab: {
            id: "viewab",
            control: "ab",
            requirePerson: false,
            requireMe: false,
            showMessageBar: true,
            showConnectedTo: true
        },
        viewme: {
            id: "viewme",
            control: "landing",
            requirePerson: true,
            requireMe: true,
            showConnectedTo: true
        },
        viewmephoto: {
            id: "viewmephoto",
            control: "photo",
            requirePerson: true,
            requireMe: true
        },
        viewmeprofile: {
            id: "viewmeprofile",
            control: "viewmeprofile",
            requirePerson: true,
            requireMe: true,
            showConnectedTo: true
        },
        viewmera: {
            id: "viewmera",
            control: "ra",
            requirePerson: true,
            requireMe: true,
            showMessageBar: true
        },
        viewperson: {
            id: "viewperson",
            control: "landing",
            requirePerson: true,
            requireMe: false,
            showMessageBar: true,
            isEdit: false
        },
        viewphoto: {
            id: "viewphoto",
            control: "photo",
            requirePerson: true,
            requireMe: false,
            showMessageBar: true
        },
        viewprofile: {
            id: "viewprofile",
            control: "profile",
            requirePerson: true,
            requireMe: false,
            showMessageBar: true
        },
        viewra: {
            id: "viewra",
            control: "ra",
            requirePerson: true,
            requireMe: false,
            showMessageBar: true
        },
        viewraitem: {
            id: "viewraitem",
            control: "raitem",
            requirePerson: true,
            requireMe: false,
            showMessageBar: true
        },
        whatsnew: {
            id: "whatsnew",
            control: "whatsnew",
            requirePerson: false,
            requireMe: false,
            showMessageBar: true,
            showConnectedTo: true
        }
    };
    Debug.call(function () {
        for (var page in N.Pages) {
            Debug.assert(N.Pages[page].id === page);
            Debug.assert(escape(page) === page);
        }
    });

    N.navigate = function (path) {
        /// <summary>Navigates to the given URI, special cases navigation within People app.</summary>
        /// <param name="path" type="String">The uri (hash) of the destination page.</param>
        Debug.assert(Jx.isNonEmptyString(path));
        if (path[0] === "#") {
            Debug.assert(P.inPeopleApp, "Relative URIs are only valid in the people app.  Uri is: " + path);
            // This function can be called in navigation event handler, We should always navigate asynchronously.
            N._navigateAsync(path);
        } else {
            try {
                // Protect against bad paths being passed to the app
                NoShip.People.etw("externalNavigate", { uri: path });
                
                if (!NoShip.disableExternalNavigate) {
                    
                    var uri = new Windows.Foundation.Uri(path);
                    var protocol = P.Protocol.fromUri(uri);
                    if ((protocol.verb === "sms") || (protocol.verb === "tel") || (protocol.contact.sourceId === "SKYPE")) {
                        var launcherOptions = new Windows.System.LauncherOptions();
                        launcherOptions.preferredApplicationDisplayName = "Skype";
                        launcherOptions.preferredApplicationPackageFamilyName = "Microsoft.SkypeApp_kzf8qxf38zg5c";
                        Windows.System.Launcher.launchUriAsync(uri, launcherOptions).done();
                    } else if ((protocol.verb === "profile" || protocol.verb === "message") && protocol.contact.sourceId === "FB") {
                        var accountData = Jx.root._platformCache._platform.accountManager.getAccountBySourceId("FB", "");
                        var launcherOptions = new Windows.System.LauncherOptions();
                        launcherOptions.preferredApplicationDisplayName = (accountData && !Jx.isNullOrUndefined(accountData.displayName)) ? accountData.displayName : "Facebook";
                        launcherOptions.preferredApplicationPackageFamilyName = "Facebook.Facebook_e4jwt0ac4m2g0";
                        Windows.System.Launcher.launchUriAsync(uri, launcherOptions).done();
                    } else {
                        Windows.System.Launcher.launchUriAsync(uri).done();
                    }
                
                }
                
            } catch (err) {
                Jx.log.exception("bad URI: ", err);
                if (P.inPeopleApp) {
                    N._navigateAsync("#");
                }
            }
        }
    };

    N._navigateAsync = function (uri) {
        /// <summary>Asynchronously navigate to the given URI, used within People app.</summary>
        /// <param name="uri" type="String">The uri (hash) of the destination page.</param>
        Debug.assert(Jx.isNonEmptyString(uri));
        Debug.assert(uri[0] === "#");
        Debug.assert(Jx.root);
        Debug.assert(Jx.root instanceof P.CpMain);

        Jx.root.go(Jx.parseHash(uri.slice(1)));
    };

    N.back = function () {
        /// <summary>Navigate back to previous location. Only works in People app.</summary>
        Debug.assert(Jx.root);
        Debug.assert(Jx.root instanceof P.CpMain);
        Debug.assert(Jx.root.back);
        Jx.root.back();
    };

    N.canGoBack = function () {
        /// <summary>Checks whether the backstack is empty.</summary>
        /// <returns type="Boolean">True if you can call back(), false otherwise.</returns>
        return Jx.root.canGoBack();
    };

    N.backAsync = function () {
        /// <summary>Navigate back to previous location aynchronously. Only works in People app.</summary>
        msSetImmediate(function () {
            Jx.root.back();
        });
    };

    N.getUri = function (page, id, data, verb) {
        /// <summary>Gets the URI of the page.</summary>
        /// <param name="page" type="String">The name of the page for the task to be completed.</param>
        /// <param name="id" type="String">The id for the item to be displayed in the page.</param>
        /// <param name="data" type="Object" optional="true">The object that contains customized data for the page.</param>
        /// <param name="verb" type="String" optional="true">The verb used to create the Uri.</param>
        /// <returns type="String">The URI used for navigation</returns>
        Debug.assert(Jx.isNonEmptyString(page), "Invalid parameter: page");
        Debug.assert(Jx.isNullOrUndefined(id) || Jx.isString(id), "Invalid paramter: id");
        Debug.assert(id !== "0", "Invalid parameter: id is zero");
        
        if (!Jx.isNullOrUndefined(data)) {
            data = escape(JSON.stringify(data));
        } else {
            data = "";
        }
                
        var uri = null;
        if (P.inPeopleApp) {
            // In app nav needs the hash string.
            // For nav within People app, the URI format is "#page=PAGE&id=ID&data=DATA&verb=VERB".
            uri = "#page=" + escape(page) + "&id=" + escape(id || "") + "&data=" + data;

            // because this is such an agressive change, only add the verb parameter if it is present
            if (!Jx.isNullOrUndefined(verb)) {
                uri += "&verb=" + escape(verb);
            }
        } else {
            // For nav from other apps, the URI format is "wlpeople:PAGE,ID,DATA,VERB"
            uri = "wlpeople:" + escape(page) + "," + escape(id || "") + "," + data;

            // because this is such an agressive change, only add the verb parameter if it is present
            if (!Jx.isNullOrUndefined(verb)) {
                uri += "," + escape(verb);
            }
        }
        return uri;
    };

    N.getViewAddressBookUri = function (data) {
        /// <summary>Gets the URI of the address book page.</summary>
        /// <param name="data" type="Object" optional="true">The object that contains customized data for the page.</param>
        /// <returns type="String">The URI used for navigation</returns>
        return N.getUri(N.Pages.viewab.id, "", data);
    };

    N.getProfileDetailUri = function (id, data) {
        /// <summary>Gets the URI of the contact detail page.</summary>
        /// <param name="data" type="Object" optional="true">The object that contains customized data for the page.</param>
        /// <returns type="String">The URI used for navigation</returns>
        Debug.assert(Jx.isNonEmptyString(id));
        return N.getUri(N.Pages.viewprofile.id, id, data);
    };

    N.getEditProfileDetailUri = function (id, data) {
        /// <summary>Gets the URI of edit contact detail page.</summary>
        /// <param name="id" type="String">The id for the contact to be displayed in the page.</param>
        /// <param name="data" type="Object" optional="true">The object that contains customized data for the page.</param>
        /// <returns type="String">The URI used for navigation</returns>
        Debug.assert(Jx.isNonEmptyString(id));
        return N.getUri(N.Pages.editprofile.id, id, data);
    };

    N.getCreateContactUri = function (data) {
        /// <summary>Gets the URI of create a contact page.</summary>
        /// <param name="data" type="Object" optional="true">The object that contains customized data for the page.</param>
        /// <returns type="String">The URI used for navigation</returns>
        return N.getUri(N.Pages.createcontact.id, "", data);
    };

    N.getMeUri = function (data) {
        /// <summary>Gets the URI of the Me page.</summary>
        /// <param name="data" type="Object" optional="true">The object that contains customized data for the page.</param>
        /// <returns type="String">The URI used for navigation</returns>
        return N.getUri(N.Pages.viewme.id, "", data);
    };

    N.getMePhotoUri = function (data) {
        /// <summary>Gets the URI of the ME profile page.</summary>
        /// <param name="data" type="Object" optional="true">The object that contains customized data for the page.</param>
        /// <returns type="String">The URI used for navigation</returns>
        return N.getUri(N.Pages.viewmephoto.id, "", data);
    };

    N.getMeProfileUri = function (data) {
        /// <summary>Gets the URI of the ME profile page.</summary>
        /// <param name="data" type="Object" optional="true">The object that contains customized data for the page.</param>
        /// <returns type="String">The URI used for navigation</returns>
        return N.getUri(N.Pages.viewmeprofile.id, "", data);
    };

    N.getMeRAUri = function (data) {
        /// <summary>Gets the URI of the ME profile page.</summary>
        /// <param name="data" type="Object" optional="true">The object that contains customized data for the page.</param>
        /// <returns type="String">The URI used for navigation</returns>
        return N.getUri(N.Pages.viewmera.id, "", data);
    };

    N.getEditMePictureUri = function (data) {
        /// <summary>Gets the URI of edit my profile picture page.</summary>
        /// <param name="data" type="Object" optional="true">The object that contains customized data for the page.</param>
        /// <returns type="String">The URI used for navigation</returns>
        return N.getUri(N.Pages.editmepicture.id, "", data);
    };

    N.getViewRAUri = function (id, data) {
        /// <summary>Gets the URI of view contact's what's new page.</summary>
        /// <param name="id" type="String">The id for the contact whose RA is to be displayed in the page.</param>
        /// <param name="data" type="Object" optional="true">The object that contains customized data for the page.</param>
        /// <returns type="String">The URI used for navigation</returns>
        Debug.assert(Jx.isNullOrUndefined(id) || Jx.isString(id));
        return N.getUri(N.Pages.viewra.id, id, data);
    };

    N.getViewPhotoUri = function (id, data) {
        /// <summary>Gets the URI of view contact's photo page.</summary>
        /// <param name="id" type="String">The id for the contact whose RA is to be displayed in the page.</param>
        /// <param name="data" type="Object" optional="true">The object that contains customized data for the page.</param>
        /// <returns type="String">The URI used for navigation</returns>
        Debug.assert(Jx.isNullOrUndefined(id) || Jx.isString(id));
        return N.getUri(N.Pages.viewphoto.id, id, data);
    };

    N.getRASelfpageUri = function (id, data) {
        /// <summary>Gets the URI of a recent activity item's self page.</summary>
        /// <param name="id" type="String">The id for the contact whose RA item is to be displayed in the page.</param>
        /// <param name="data" type="Object" optional="true">The object that contains customized data for the page which contains network id and item id).</param>
        /// <returns type="String">The URI used for navigation</returns>
        Debug.assert(Jx.isNonEmptyString(id));
        return N.getUri(N.Pages.viewraitem.id, id, data);
    };

    N.getWhatsNewUri = function (data) {
        /// <summary>Gets the URI of the what's new page.</summary>
        /// <param name="data" type="Object" optional="true">The object that contains customized data for the page.</param>
        /// <returns type="String">The URI used for navigation</returns>
        return N.getUri(N.Pages.whatsnew.id, "", data);
    };

    N.getNotificationUri = function (data) {
        /// <summary>Gets the URI of the notification page.</summary>
        /// <param name="data" type="Object" optional="true">The object that contains customized data for the page.</param>
        /// <returns type="String">The URI used for navigation</returns>
        return N.getUri(N.Pages.notification.id, "", data);
    };

    N.getAllContactsUri = function (data) {
        /// <summary>Gets the URI of the allContacts page.</summary>
        /// <param name="data" type="Object" optional="true">The object that contains customized data for the page.</param>
        /// <returns type="String">The URI used for navigation</returns>
        return N.getUri(N.Pages.allcontacts.id, "", data);
    };

    N.getAllContactsSearchUri = function (queryString, locale) {
        /// <summary>Gets the URI for a search on the All Contacts page. This format is different from other pages</summary>
        /// <param name="queryString" type="String">The string for the search query.</param>
        /// <param name="locale" type="String">The locale from the search event.</param>
        /// <returns type="String">The URI used for search page</returns>
        Debug.assert(Jx.isString(queryString));

        // For search, the query string is considered as id for the page.
        var uri = null;

        if (P.inPeopleApp) {
            // In app nav needs the hash string.
            // For nav within People app, the URI format is '#page=search&query=queryString&data="locale"'.
            uri = '#page=' + N.Pages.allcontacts.id + '&query=' + escape(queryString) + '&data="' + escape(locale) + '"';
        } else {
            // For nav from other apps, the URI format is "wlpeople:search,queryString,locale"
            uri = "wlpeople:" + N.Pages.allcontacts.id + "," + escape(queryString) + "," + escape(locale);
        }

        return uri;
    };

    N.getGALSearchUri = function (queryString, locale) {
        /// <summary>Gets the URI for a search on the All Contacts page. This format is different from other pages</summary>
        /// <param name="queryString" type="String">The string for the search query.</param>
        /// <param name="locale" type="String">The locale from the search event.</param>
        /// <returns type="String">The URI used for search page</returns>
        Debug.assert(Jx.isString(queryString));

        // For search, the query string is considered as id for the page.
        var uri = null;

        if (P.inPeopleApp) {
            // In app nav needs the hash string.
            // For nav within People app, the URI format is '#page=galsearchresults&query=queryString&data="locale"'.
            uri = '#page=' + N.Pages.galsearchresults.id + '&query=' + escape(queryString) + '&data="' + escape(locale) + '"';
        } else {
            // For nav from other apps, the URI format is "wlpeople:galsearchresults,queryString,locale"
            uri = "wlpeople:" + N.Pages.galsearchresults.id + "," + escape(queryString) + "," + escape(locale);
        }

        return uri;
    };

    N.getLinkPersonUri = function (id, data) {
        /// <summary>Gets the URI of the link person page.</summary>
        /// <param name="id" type="String">The id for the contact whose RA is to be displayed in the page.</param>
        /// <param name="data" type="Object" optional="true">The object that contains customized data for the page.</param>
        /// <returns type="String">The URI used for navigation</returns>
        Debug.assert(Jx.isNonEmptyString(id));
        return N.getUri(N.Pages.linkperson.id, id, data);
    };

    N.getViewPersonUri = function (id, data, verb) {
        /// <summary>Gets the URI of the person's landing page.</summary>
        /// <param name="id" type="String">The id for the contact whose RA is to be displayed in the page.</param>
        /// <param name="data" type="Object" optional="true">The object that contains customized data for the page.</param>
        /// <param name="verb" type="String" optional="true">The verb used to create the PersonUri.</param>
        /// <returns type="String">The URI used for navigation</returns>
        Debug.assert(Jx.isNullOrUndefined(id) || Jx.isString(id));
        return N.getUri(N.Pages.viewperson.id, id, data, verb);
    };

    N.getViewRecipientUri = function (recipient, account) {
        /// <summary>Gets the URI of the recipient's landing page.</summary>
        /// <param name="recipient" type="Microsoft.WindowsLive.Platform.Recipient"/>
        /// <param name="account" type="Microsoft.WindowsLive.Platform.Account" optional="true">A contextual account - if the contact doesn't exist, it should be added to this account</param>
        /// <returns type="String">The URI used for navigation</returns>
        Debug.assert(Jx.isObject(recipient), "Invalid parameter: recipient");
        Debug.assert(Jx.isNullOrUndefined(account) || Jx.isObject(account), "Invalid parameter: account");

        var uri;
        var person = recipient.person;
        if (person && person.isInAddressBook) {
            if (person.objectType === "MeContact") {
                uri = N.getMeUri();
            } else {
                uri = N.getViewPersonUri(person.objectId);
            }
        } else {
            uri = N.getViewPersonUri("", {
                objectType: "literal",
                name: recipient.calculatedUIName,
                email: recipient.emailAddress,
                accountId: account ? account.objectId : null
            });
        }
        return uri;
    };

    N.convertProtocolPathToHash = function (path) {
        /// <summary>Convert the protocol URI path to in-app navigation hash string.</summary>
        /// <param name="path" type="String">The path specified in the protocol URI.</param>
        /// <returns type="String"> The URI to navigate to in hash string.</returns>
        Debug.assert(Jx.isString(path));

        // The format for the URI path (except for search) is PAGE,CONTACT_ID,OPTIONAL_DATA where the OPTIONAL_DATA must be JSON stringified.
        // For example: wlpeople:viewprofile,fav0 opens the profile page for contact with id=fav0.
        // The input for the above example would be: "viewprofile, fav0". The output would be "#page=viewprofile&id=fav0".
        // The path will be processed like this:
        // 1. Trim the trailing spaces.
        // 2. Tokenize the path with ',' and get the first 3 tokens.
        // 3. Check the first token for page name. Path with invalid page name is considered invalid.
        // 4. Check the second token. If second token is required for the page but is missing from the path, the path is invalid.
        // 5. Check the third token as needed. It should be JSON stringified. If the third token is invalid, the token is dropped but the path is still valid.
        // 5. Get the hash URI based on the tokens.
        // 6. Returns the hash URI. If the path is invalid, returns null.
        var trimmedPath = path.replace(/\s*$/, "");
        var match = /([^,]*)(?:,([^,]*)(?:,(.*))?)?/g.exec(trimmedPath);
        var tokens = match ? match.slice(1) : [];
        var pageName = unescape(tokens[0] || "").toLowerCase();
        var hash = null;

        // Validate the page, id retrieved from path and setup the page location.
        if (pageName in N.Pages) {
            var useSecondToken = N.Pages[pageName].requirePerson || (pageName === N.Pages.allcontacts.id);
            var secondToken = (useSecondToken && tokens[1]) ? unescape(tokens[1]) : "";

            if ((pageName === N.Pages.allcontacts.id) && (tokens.length > 2)) {
                
                // Special case for all Contacts with search. The format is "wlpeople:allcontacts,queryString,locale".
                var locale = tokens.length > 2 ? unescape(tokens[2]) : "";
                hash = N.getAllContactsSearchUri(secondToken, locale);
                
            } else if (pageName === N.Pages.galsearchresults.id) {
                
                // Special case for search. The format is "wlpeople:search,queryString,locale".
                var locale = tokens.length > 2 ? unescape(tokens[2]) : "";
                hash = N.getGALSearchUri(secondToken, locale);
                
            } else {
                var data = null;
                if (tokens[2]) {
                    try {
                        data = JSON.parse(unescape(tokens[2]));
                    } catch (err) {
                        Jx.log.exception("People.Navigate.convertUriToHash: JSON.parse failed.", err);
                        Jx.log.info("failed token: '" + tokens[2] + "'.");
                    }
                }
                hash = N.getUri(pageName, secondToken, data);
            }
        }
        return hash;
    };

    N.setPageLastScrollPosition = function (scrollPositionKey, scrollPositionValue) {
        try {
            // save a key, value pair to local storage
            // scrollPositionKey (make sure its unique)
            window.localStorage.setItem(scrollPositionKey, scrollPositionValue);
        } catch (e) {
            // we failed, write a log entry and then clear out the old key if it exists
            Jx.log.write(2, 'Failed to save state to local storage: [ ' + scrollPositionKey + ' ]' + e.toString());
            N.removePageLastScrollPosition(scrollPositionKey);
        }
    };

    N.getPageLastScrollPosition = function (scrollPositionKey) {
        return parseInt(window.localStorage.getItem(scrollPositionKey), 0);
    };

    N.removePageLastScrollPosition = function (scrollPositionKey) {
        if (window.localStorage.removeItem(scrollPositionKey) !== 0) {
            Jx.log.write(2, 'Failed to remove old state [ ' + scrollPositionKey + ' ]');
        }
    };

    N.inPeopleApp = function () {
        /// <summary>Determines whether the hosting app is the People app.</summary>
        /// <returns type="Boolean">True if the hosting app is the People app, false otherwise.</returns>
        return P.inPeopleApp || false;
    };
});
