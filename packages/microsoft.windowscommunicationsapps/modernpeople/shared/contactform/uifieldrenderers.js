
// Copyright (C) Microsoft Corporation.  All rights reserved.

///<reference path="../../Shared/JSUtil/Namespace.js"/>
///<reference path="../../../Shared/Jx/Core/Jx.js"/>
///<reference path="../../../Shared/Jx/Core/Loc.js"/>
///<reference path="./uiform-refs.js"/>

Jx.delayDefine(People, "UiFormRenderers", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    var N = P.Nav;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    function perfUiFormAction(actionOp, actionFunc) {
        return function () {
            try {
                NoShip.People.etw("uiform_start", { action: actionOp });

                return actionFunc.apply(this, arguments);
            } finally {
                NoShip.People.etw("uiform_end", { action: actionOp });
            }
        };
    };

    function _extractDomain(value) {
        /// <param name="value" type="String">The string url value to be extracted</param>
        /// <returns type="Array" >A string array containing the parts of the url with index 0 being the protocol</returns>
        var result = "";
        if (value) {
            result = value.replace(/^\s+|\s+$/g, "");

            // Remove Protocol
            var protocol = "";
            var idx = result.indexOf(":");
            if (idx > 0) {
                protocol = result.substr(0, idx).toLowerCase();
                result = result.substr(idx + 1);
            }

            if (protocol === "http" || protocol === "ftp") {

                // Remove any leading slashes
                var pos = 0;
                while (result[pos] === "/") {
                    pos++;
                }
                result = result.substr(pos);

                // Remove any trailing port
                idx = result.indexOf(":");
                if (idx > 0) {
                    result = result.substr(0, idx);
                }

                // Remove everything after the first slash (keeping only the domain)
                idx = result.indexOf("/");
                if (idx > 0) {
                    result = result.substr(0, idx);
                }
            } else {
                result = "";
            }
        }
        return result;
    };

    // Commenting out the following code as it's now effectively dead, however, it *may* 
    // be useful in a future milestone. Note: This is time expensive compared with passing
    // in the string for the tooltip.
    //    function appendString(/* @type(String) */text, /* @type(String) */value) {
    //        if (text && text.substr(text.length - 1) !== value) {
    //            text += value;
    //        }

    //        return text;
    //    };

    //    var calcTitle = perfUiFormAction("calcTitle", calcTitleX);
    //    function calcTitleX(/* @type(Node) */container, /* @type(String) */value) {
    //        var title = value || "";
    //        var children = container.childNodes;
    //        var count = children.length;
    //        for (var idx = 0; idx < count; idx++) {
    //            var node = children[idx];
    //            var nodeName = node.nodeName;
    //            if (nodeName === "DIV") {
    //                perfUiFormAction("calcTitle_div", function () {
    //                    title = appendString(title, "\n");
    //                    title = calcTitle(node, title);
    //                    title = appendString(title, "\n");
    //                })();
    //            } else if (nodeName === "SPAN") {
    //                perfUiFormAction("calcTitle_span", function () {
    //                    title = calcTitle(node, title);
    //                })();
    //            } else if (nodeName === "#text") {
    //                perfUiFormAction("calcTitle_#text", function () {
    //                    title += node.textContent;
    //                })();
    //            } else {
    //                perfUiFormAction("calcTitle_innerText", function () {
    //                    var text = node.innerText;
    //                    if (text) {
    //                        title += text;
    //                        title = appendString(title, " ");
    //                    }
    //                })();
    //            }
    //        }

    //        return title;
    //    };

    //    P.UiForm.calcTooltip = perfUiFormAction("calcToolTip", function (container) {
    //        var text = calcTitle(container, "");
    //        if (text && text[text.length - 1] === "\n") {
    //            text = text.substr(0, text.length - 1);
    //        }

    //        return text;
    //    });

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var R = P.UiFormRenderers = {
    /// <enable>JS2076.IdentifierIsMiscased</enable>
        // The internal collection of registered renderers
        _renderers: {},
        
        _getCopyCommand: function (textToClipboard) {
            ///<summary>Get the copy menu item for the popup</summary>
            ///<param name="textToClipboard" type="String"/>
            ///<returns type="Windows.UI.Popups.UICommand"/>
            return new Windows.UI.Popups.UICommand(
                Jx.res.getString("/strings/profileFieldCopy"),
                function () {
                    var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
                    dataPackage.setText(textToClipboard);
                    Windows.ApplicationModel.DataTransfer.Clipboard.setContent(dataPackage);
                }
            );
        },
        
        _getLinkCommand: function (label, uri) {
            ///<summary>Get the action menu item for the popup</summary>
            ///<param name="label" type="String">Label for the menu item</param>
            ///<param name="uri" type="String">Uri for the link of the menu item</param>
            ///<returns type="Windows.UI.Popups.UICommand"/>
            return new Windows.UI.Popups.UICommand(
                label,
                R._navigateToUri.bind(R, uri)                
            );
        },

        _showContextMenu: function (textToClipboard, linkItems, event) {
            ///<summary>Show context menu for the field.</summary>
            ///<param name="textToClipboard" type="String">Text to copy for the "Copy" item of the context menu</param>
            ///<param name="linkItems" type="Array">Contains an array of context menu links</param>
            ///<param name="event" type="Event"/>
            Debug.assert(Jx.isNullOrUndefined(linkItems) || Jx.isArray(linkItems));
            event.stopPropagation();
            event.preventDefault();

            var menu = new Windows.UI.Popups.PopupMenu();
            // Add optional commands to open links
            if (linkItems) {
                linkItems.forEach(function (linkItem) {
                    if (linkItem.label && linkItem.uri) {
                        menu.commands.append(R._getLinkCommand(linkItem.label, linkItem.uri));
                    }
                });
            }
            // The last menu item is to copy the field value.
            menu.commands.append(R._getCopyCommand(textToClipboard));

            var clientBounds = event.srcElement.getBoundingClientRect();
            try {
                menu.showForSelectionAsync({
                    x: clientBounds.left,
                    y: clientBounds.top,
                    width:  clientBounds.width, 
                    height: clientBounds.height
                }).done(null, Jx.fnEmpty);
            } catch (ex) {
                // The menu shows for mouse click, right click, context menu, and other key events. 
                // showForSelectionAsync can throw (A method was called at an unexpected time) when 
                // multiple mixed events are happening one after another. 
            }
        },
        
        _navigateToUri: function (uri) {
            ///<summary>Navigate to the specified uri</summary>
            ///<param name="uri" type="String"/>
            Debug.assert(Jx.isNonEmptyString(uri));
            Jx.bici.increment(Microsoft.WindowsLive.Instrumentation.Ids.People.profileDetailsActions, 1);
            N.navigate(uri);
        },
        
        _onKeyDown: function (uri, event) {
            ///<summary>Keydown handler</summary>
            ///<param name="uri" type="String"/>
            ///<param name="event" type="Event"/>
            Debug.assert(Jx.isObject(event));
            if (event.key === "Spacebar" || event.key === "Enter") {
                R._navigateToUri(uri);
            }
        },

        hookupDomEvent: function (node, textToClipboard, linkItems) {
            ///<summary>Listens to Dom events to show the context menu</summary>
            ///<param name="node" type="HTMLElement"/>
            ///<param name="textToClipboard" type="String">Text to copy for the "Copy" item of the context menu</param>
            ///<param name="linkItems" type="Array" optional="true">Contains an array of context menu options</param>
            Debug.assert(Jx.isHTMLElement(node));
            Debug.assert(Jx.isNonEmptyString(textToClipboard));
            Debug.assert(Jx.isNullOrUndefined(linkItems) || (Jx.isArray(linkItems) && linkItems.length > 0));
            
            if (linkItems) {
                var uri = linkItems[0].uri;
                node.addEventListener("click", R._navigateToUri.bind(R, uri), false);
                node.addEventListener("keydown", R._onKeyDown.bind(R, uri), false);
                Jx.addClass(node, "hasDefaultAction");
            }    

            node.addEventListener("contextmenu", R._showContextMenu.bind(R, textToClipboard, linkItems), false);
        },

        setSectionAttributes: function (container) {
            /// <summary>Set the attributes on the container element</summary>
            /// <param name="container" type="HTMLElement">
            /// The container where the field title and value has been rendered.
            /// </param>
            container.setAttribute("role", "button");
            container.setAttribute("tabindex", 0);
            container.setAttribute("focusable", "true");
            container.setAttribute("aria-haspopup", "true");
        },
        
        setTooltip: function (container, tooltip) {
            /// <summary>Set the tooltip on the container element</summary>
            /// <param name="container" type="HTMLElement">
            /// The container where the field title and value has been rendered.
            /// </param>
            /// <param name="tooltip" type="String"/>
            Debug.assert(Jx.isHTMLElement(container));
            Debug.assert(Jx.isNonEmptyString(tooltip));

            container.setAttribute("title", tooltip);
            container.setAttribute("aria-label", tooltip);
        },
        
        setComplexTooltip: function (container, linkUri, tooltip, encodedTooltip) {
            /// <summary>Set the tooltip on the container element. This is used on more complex
            ///  fields such as the phone numbers and addresses.</summary>
            /// <param name="container" type="HTMLElement">
            /// The container where the field title and value has been rendered.
            /// </param>
            /// <param name="linkUri" type="String"/>
            /// <param name="tooltip" type="String"/>
            /// <param name="encodedTooltip" type="String" optional="true"/>
            Debug.assert(Jx.isHTMLElement(container));
            Debug.assert(Jx.isNonEmptyString(linkUri));
            Debug.assert(Jx.isNonEmptyString(tooltip) || Jx.isNonEmptyString(encodedTooltip));

            var textDomain = _extractDomain(linkUri);
            var tooltipDomain = "";
            if (textDomain) {
                tooltipDomain = "<br><span>" + P.UiForm.encodeHTML(textDomain) + "</span>";
            }

            var winTooltip = new WinJS.UI.Tooltip(container);
            if (Jx.isNullOrUndefined(encodedTooltip)) {
                encodedTooltip = P.UiForm.encodeHTML(tooltip);
                while (encodedTooltip.indexOf("&#10;") !== -1) {
                    encodedTooltip = encodedTooltip.replace("&#10;", "<br>");
                }
            }
            
            var fullTooltip = encodedTooltip + tooltipDomain;
            winTooltip.innerHTML = fullTooltip;
        },

        genericFieldRenderer: function (uiform, container, value, fieldTitle) {
            /// <summary>
            /// Simple field render for a text values
            /// </summary>
            /// <param name="uiform" type="People.UiForm" optional="false">The uiform calling the renderer</param>
            /// <param name="container" type="HTMLElement" optional="false">
            /// This is the container where the value should be rendered for display
            /// </param>
            /// <param name="value" type="Object" optional="false">
            /// This is the value to be rendered.
            /// </param>
            container.innerText = value;
            container.setAttribute('aria-label', fieldTitle);

            return true;
        },

        genericSectionRenderer: function (uiform, container, valueContainer, fieldAttr, fieldValue, fieldTitle, displayValue) {
            /// <summary>
            /// Set a field formatter for the given type, the passed fieldFormatFunction will be
            /// called to display any fields of the defined type.
            /// </summary>
            /// <param name="container" type="HTMLElement" optional="false">
            /// The container where the field title and value has been rendered.
            /// </param>
            /// <param name="fieldTitle" type="object" optional="false">
            /// This is the title of the field being rendered.
            /// </param>
            /// <param name="displayValue" type="object" optional="false">
            /// This is the display string of the field being rendered.
            /// </param>

            R.setSectionAttributes(container);
            R.setTooltip(container, (fieldTitle + "\n" + displayValue));
            R.hookupDomEvent(container, fieldValue, null);
            return container;
        },

        emailFieldRenderer: function (uiform, container, value, fieldTitle) {
            /// <summary>
            /// Simple email field renderer that splits an email address based on "@" and "." points for possible
            /// wrapping to alternate lines
            /// </summary>
            /// <param name="uiform" type="People.UiForm" optional="false">The uiform calling the renderer</param>
            /// <param name="container" type="HTMLElement" optional="false">
            /// This is the container where the value should be rendered for display
            /// </param>
            /// <param name="value" type="object" optional="false">
            /// This is the value to be rendered.
            /// </param>
            var emailContainer = document.createElement("div");
            uiform.setCssStyle(emailContainer, "emailFld");
            var span;
            if (P.bidi.direction === "rtl") {
                span = document.createElement("span");
                span.innerText = value;
                emailContainer.appendChild(span);
            } else {
                var parts = value.split("@");
                for (var lp = 0; lp < parts.length; lp++) {
                    var tokens = parts[lp].split(".");
                    var prefix = "";
                    if (lp !== 0) {
                        prefix = "@";
                    }
                    for (var tkn = 0; tkn < tokens.length; tkn++) {
                        var token = tokens[tkn];
                        if (tkn !== 0) {
                            prefix = ".";
                        }
                        span = document.createElement("span");
                        span.innerText = prefix + token;
                        emailContainer.appendChild(span);
                    }
                }
            }
            emailContainer.setAttribute('aria-label', fieldTitle);
            container.appendChild(emailContainer);

            return true;
        },

        addRenderer: function (type, fieldRenderer, sectionRenderer) {
            /// <Summary>
            /// </Summary>
            /// <param name="type" type="String" optional="false">The key which identifies the field type</param>
            /// <param name="fieldRenderer" type="_UiFormFieldRenderer" optional="false">The field renderer to associate with the type</param>
            /// <param name="sectionRenderer" type="_UiFormSectionRenderer" optional="true">The optional section renderer to associate with the type</param>

            R._renderers[type] = {
                field: fieldRenderer,
                section: sectionRenderer
            };
        },

        getRenderer: function (/* @type(String) */type) {
            /// <returns type="_UiFormRenderer" />
            var renderer = R._renderers[type];
            if (renderer) {
                return renderer;
            }
            return R._renderers["generic"];
        }
    };
    R.addRenderer("generic", R.genericFieldRenderer, R.genericSectionRenderer);


    function emailSectionView(uiform, container, valueContainer, fieldAttr, fieldValue, fieldTitle, displayValue) {
        /// <summary>
        /// Set a field formatter for the given type, the passed fieldFormatFunction will be
        /// called to display any fields of the defined type.
        /// </summary>
        /// <param name="container" type="HTMLElement" optional="false">
        /// The container where the field title and value has been rendered.
        /// </param>
        /// <param name="fieldValue" type="Object" optional="false">
        /// This is the stored data representation of the field being rendered.
        /// </param>
        /// <param name="fieldTitle" type="Object" optional="false">
        /// This is the title of the field being rendered.
        /// </param>
        /// <param name="displayValue" type="Object" optional="false">
        /// This is the display string of the field being rendered.
        /// </param>

        R.setSectionAttributes(container);
        R.setTooltip(container, (fieldTitle + "\n" + displayValue));
        R.hookupDomEvent(container, fieldValue, [{label: Jx.res.getString("/strings/profileFieldSendEmail"), uri: 'mailto:' + encodeURI(fieldValue)}]);
        return container;
    };
    R.addRenderer("email", R.emailFieldRenderer, emailSectionView);

    function numberFieldRenderer(/* @type(People.UiForm) */uiform, container, value, fieldTitle) {
        /// <summary>
        /// Simple field render for a text values
        /// </summary>
        /// <param name="container" type="HTMLElement" optional="false">
        /// This is the container where the value should be rendered for display
        /// </param>
        /// <param name="value" type="Object" optional="false">
        /// This is the value to be rendered.
        /// </param>

        R.genericFieldRenderer(uiform, container, value, fieldTitle);
        uiform.setCssStyle(container, "nmbr");

        return true;
    };
    R.addRenderer("number", numberFieldRenderer, R.genericSectionRenderer);

    function telSectionView(uiform, container, valueContainer, fieldAttr, fieldValue, fieldTitle, displayValue) {
        /// <summary>
        /// Set a field formatter for the given type, the passed fieldFormatFunction will be
        /// called to display any fields of the defined type.
        /// </summary>
        /// <param name="container" type="HTMLElement" optional="false">
        /// The container where the field title and value has been rendered.
        /// </param>
        /// <param name="fieldValue" type="Object" optional="false">
        /// This is the stored data representation of the field being rendered.
        /// </param>
        /// <param name="fieldTitle" type="Object" optional="false">
        /// This is the title of the field being rendered.
        /// </param>
        /// <param name="displayValue" type="Object" optional="false">
        /// This is the display string of the field being rendered.
        /// </param>

        R.setSectionAttributes(container);

        var toolTip = fieldTitle + "\n" + displayValue;

        // Create an encoded tooltip with the value isolated so that it is always LTR
        var encodedToolTip = P.UiForm.encodeHTML(fieldTitle);
        var clsName = uiform.getCssClass("tipNmbr");
        encodedToolTip += "<br><div class='" + clsName + "'>" + P.UiForm.encodeHTML(displayValue) + "</div>";
        while (encodedToolTip.indexOf("&#10;") !== -1) {
            encodedToolTip = encodedToolTip.replace("&#10;", "<br>");
        }

        var uri = P.Protocol.create("tel", { phoneNumber: fieldValue }).toUrl();
        if (Jx.isNonEmptyString(uri)) {
            R.setComplexTooltip(container, uri, toolTip, encodedToolTip);
            R.hookupDomEvent(container, fieldValue, [
                { label: Jx.res.getString("/strings/profileFieldStartCall"), uri: uri },
                { label: Jx.res.getString("/strings/profileFieldSms"), uri: P.Protocol.create("sms", { phoneNumber: fieldValue }).toUrl() }
            ]);
        } else {
            R.setTooltip(container, (fieldTitle + "\n" + displayValue));
        }
        return container;
    };
    R.addRenderer("tel", numberFieldRenderer, telSectionView);

    function dateFieldRenderer(/* @type(People.UiForm) */uiform, container, value, fieldTitle) {
        /// <summary>
        /// Simple field render for a text values
        /// </summary>
        /// <param name="container" type="HTMLElement" optional="false">
        /// This is the container where the value should be rendered for display
        /// </param>
        /// <param name="value" type="Object" optional="false">
        /// This is the value to be rendered.
        /// </param>
        var dtf = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("day month year");
        container.innerText = dtf.format(value);
        container.setAttribute('aria-label', dtf.format(value));

        return true;
    };
    R.addRenderer("date", dateFieldRenderer, R.genericSectionRenderer);

    P.loadUrlRenderer();
    P.loadLocationRenderer();
});
