
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// This file contains logic for survey_helper.html, which is the helper page rendered in an
// iframe on the Feedback SettingsFlyout. Note: this shares most of its logic 
// with //depot/working/server/webmain/server/webshared/Product/JavaScript/wLive/InlineScripts/Shared/Feedback.inline.js

/// <reference path="%INETROOT%\modern\shared\jx\core\Qx.js" />
/// <reference path="sas.ref.js" />
/// <disable>JS2064.SpecifyNewWhenCallingConstructor</disable>

(function () {
    var ctrDiv = document.getElementById("FMSContainer");
	var postMessageTarget = "ms-appx://" + decodeURIComponent(document.domain);
	
    window.handleLoad = function () {
        ///<summary>We poll until we detect that the survey has started</summary>
        parent.postMessage({ jsLoaded: true }, postMessageTarget);
        var poller = setInterval(function () {
            try {
                /// <disable>JS3057.AvoidImplicitTypeCoercion</disable>
                if (window.MS && window.MS.Support.Fms.Survey.SurveyInstances.SURVERCONTAINER_plugin0) {
                /// <enable>JS3057.AvoidImplicitTypeCoercion</enable>
                    var plugin = window.MS.Support.Fms.Survey.SurveyInstances.SURVERCONTAINER_plugin0;
                    if (plugin.startTime) {
                        loadedSucessfully(poller, plugin);
                    }
                }
            } catch (ex) {
                Jx.log.exception("Feedback: Error when polling for FMS JS variables", ex);
            }
        }, 100);
    };

    // Parse the JSON object from the query string and store in a global variable
    var queryString = document.URL.split("?")[1];
    window._ms_support_fms_surveyConfig = /*@static_cast(SurveyConfig) */JSON.parse(queryString);

    // We want to fill the ctrDiv with the inline survey elements
    window._ms_support_fms_surveyConfig.target = ctrDiv.id;

    // Add a <link> for the local CSS (i.e ui-dark)
    addCss(_ms_support_fms_surveyConfig.localCss);

    // Pull down the colorized CSS
    addCss("/resources/sendasmile/css/" + _ms_support_fms_surveyConfig.parameters[0] + "SaSColor.css");
    
    // Include Qx (which comes with Jx)
    var qx = document.createElement("script");
    qx.type = "text/javascript";
    qx.src = "/Jx/Jx.js";

    document.head.appendChild(qx);
    
    window.addEventListener('message', onMessage, false);
    
    // We wait for [loadTimout] ms before sending a badLoad message to the parent
    var badLoadTimer = setTimeout(function () {
        parent.postMessage({ badLoad: true }, postMessageTarget);
    }, _ms_support_fms_surveyConfig.loadTimeout);


    function replaceWithAppName(string, appName, localizedAppName) {
        ///<summary>Replaces {0} and {1} in the string with the localized app name and non-localized app name respectively</summary>
        ///<param name="string" type="String">String in which to execute the regex</param>
        ///<param name="appName" type="String">Name of the app e.g "mail"</param>
        ///<param name="localizedAppName" type="String">Localized app name e.g "correo"</param>
        ///<return type="String">Returns the replaced string</return>
        return string.replace(/\{0\}/g, localizedAppName)
                     .replace(/\{1\}/g, appName);
    }
    
    function addCss(href) {
        ///<summary>Adds a link element to the DOM</summary>
        ///<param name="href" type="String">The URL of the CSS file to reference</param>
        var cssFile = document.createElement("link");
        cssFile.type = "text/css";
        cssFile.rel = "stylesheet";
        cssFile.href = href;
        
        document.head.appendChild(cssFile);
    }
    
    function setUpQx() {
        ///<summary>Adds a few methods to Qx that jQuery supports and Qx doesn't (or implements differently)</summary>        
        
        /// <disable>JS3083.DoNotOverrideBuiltInFunctions</disable>
        Qx.prototype.find = function (selector){
            ///<summary>QX wrapper around querySelectorAll</summary>
            ///<param name="selector">The CSS selector to query with</param>
            return Qx(this[0].querySelectorAll(selector));
        };
        
        Qx.prototype.val = function (set) { 
            ///<summary>Gets or sets the value of the element</summary>
            ///<param name="set" optional="true">Sets the value to the given argument</param>
             if (!set) {
                return this[0].value;
             }
             
             this[0].value = set;
             return this;
        };
        
        Qx.prototype.bind = Qx.prototype.on;
        
        Qx.prototype.attr = function (attribute, value){ 
            ///<summary>Sets the given attribute to the specified value</summary>
            ///<param name="attribute">The attribute (e.g "rows")</param>
            ///<param name="value">The value to set the attribute to</param>
            this[0][attribute] = value;
            return this;
        };
        
        Qx.prototype.hide = function (){
            ///<summary>Hides the given element</summary>        
            return this.css({display: "none"});
        };
        /// <enable>JS3083.DoNotOverrideBuiltInFunctions</enable>
    }
    
    function initCustomSurveyLogic(plugin) {
        ///<summary>We have to add custom enable/disable button logic and do some regex on the survey HTML</summary>
        ///<param name="plugin" type="FmsPlugin">The FMS Survey Plugin object</param>
        var checkRequirements = function (button, inputElement, requirements, index) {
            ///<summary>Will return a function that will enable/disable the given button as appropriate</summary>       
            ///<param name="button">The HTML element to enable or disable</param>
            ///<param name="inputElement" optional="true">The HTML element whose value to check for enabling the button</param>
            ///<param name="requirements" optional="true">The array of requirements that must be met before enabling the button</param>
            ///<param name="index" optional="true">The index of the requirement that this element satisfies</param>
            return function () {
                if (inputElement) {
                    requirements[index] = inputElement.value !== "";
                } else {
                    requirements[index] = true;
                }

                button.disabled = false;
                for (var reqs in requirements) {
                    button.disabled = button.disabled || !requirements[reqs];
                }
            };
        };
        
        setUpQx();
        
        var $ctrDiv = Qx(ctrDiv);
        var sections = $ctrDiv.find(".SURVEYSECTION");
        
        // The last section has the submit button text
        var submitButtonText = Qx(sections[sections.length - 1]).find(".NAVBUTTON").last().val();
        
        for (var sectCount = 0; sectCount < sections.length; sectCount++){
            var $section = Qx(sections[sectCount]);
            var $containers = $section.find(".QUESTIONCONTAINER");
            var $buttons =  $section.find(".NAVBUTTON");
            
            // ASSUMPTION: the next/submit button is always the last button in the DOM, after the cancel button              
            var $submitButton = Qx($buttons[$buttons.length - 1]);
            
            if (sectCount > 0) {
                $submitButton.val(submitButtonText);
                Jx.addClass($submitButton[0], "SecondButton");
            } else {
                Jx.addClass($submitButton[0], "FirstButton");
            }
            
            var requirementsForSection = [];
            for (var i = 0; i < $containers.length; i++) {
                var $container = Qx($containers[i]);
                
                // FMS sets the inline style for width as 77% for tables, so we must explicitly override it
                $container.find("table").each(/*@bind(HTMLElement)*/function () {
                    Qx(this).css({width: "100%"});                
                });
                
                // If we are a help page, hide the next button and continue
                var helpLinks = $container.find(".helplink");
                if (helpLinks[0]) {
                    $submitButton.hide();                
                    continue;
                }
                                
                var $isRequired = $container.find(".QUESTIONREQUIRED");
                
                /// <disable>JS3057.AvoidImplicitTypeCoercion</disable>
                var isRequired = $isRequired.length > 0 && $isRequired.html();
                /// <enable>JS3057.AvoidImplicitTypeCoercion</enable>
                
                // We only need to add custom button enable/disable logic for required questions
                if (isRequired) {                        
                    $submitButton[0].disabled = true;
                    requirementsForSection[i] = false;

                    // Radio button selection or non-null textual input enables the submit button
                    var allInputs = $container.find("input");
                    for (var j = 0; j < allInputs.length; j++) {
                        var input = /*@static_cast(HTMLElement) */allInputs[j];
                        if (input.type === "radio") {
                            // When the radio button is selected enable the submit button
                            Qx(input).on({click: checkRequirements($submitButton[0], null, requirementsForSection, i)});
                            
                            // Since we're in the neighborhood, might as well add a proper <label>
                            // for the radio button. This allows us to style the FMS HTML more effectively
                            var lbl = document.createElement("label");
                            
                            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
                            var cell = /*@static_cast(HTMLElement) */input.parentElement;                                    
                            /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
                            
                            if (input.nextSibling) {
                                cell.removeChild(input.nextSibling);
                                lbl.innerHTML = input.value;
                                
                                // Make the ID unique....because it wasn't before.
                                input.fmsId = input.id;
                                input.id = input.name + input.value;
                            } else if (cell.nextSibling) {
                                lbl.innerHTML = cell.nextSibling.innerHTML;
                            }
                            
                            lbl.htmlFor = input.id;                                    
                            cell.appendChild(lbl);
                        } else if (input.type === "text") {
                            // When text is entered enable the submit button
                            var checkTextFn = checkRequirements($submitButton[0], input, requirementsForSection, i);
                            Qx(input).bind({input: checkTextFn});
                            input.type = "email";                            
                        }
                    }

                    // Just in case we have any pesky large textboxes
                    var $textarea = $container.find("textarea");
                    if ($textarea[0]) {
                        $textarea.attr("rows", 4);
                        
                        // Check for both change and input events. We would prefer input,
                        // but older browsers don't support it.
                        var checkFn = checkRequirements($submitButton[0], $textarea[0], requirementsForSection, i);
                        $textarea.bind({input: checkFn});
                    }
                }
            }
        }
        
        // Replace all instances of {0} and {1} with the app name and localized app name
        // Also, hide all divs that are empty (since even empty divs may have padding).
        $ctrDiv.find(".QUESTIONTEXT, .QUESTIONINSTRUCTION, .SURVEYINTROTEXT").each(/*@bind(HTMLElement)*/function () {
            var innerHTML = this.innerHTML;
            var $this = Qx(this);
            if (!innerHTML) {
                Qx(this).hide();
            } else {
                innerHTML = replaceWithAppName(innerHTML, _ms_support_fms_surveyConfig.parameters[0], _ms_support_fms_surveyConfig.localizedAppName);
                this.innerHTML = innerHTML;
            }
        });
        
        var originalEncode = plugin.encodeAnswers;
        plugin.encodeAnswers = function (enc) {
            // Before we encode the answers we must first reset the IDs of the inputs to the ones assigned by FMS
            $ctrDiv.find("input").each(function () {
                /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
                if (this.fmsId) {
                    this.id = this.fmsId;
                }
                /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
            });
            
            // Iterate through all selected listbox options and set the corresponding FMS questions
            $ctrDiv.find("option").each( /*@bind(HTMLElement)*/function (){
                if (this.selected) {
                    for (var pageIndex = 0; pageIndex < plugin0.pages.length; pageIndex++) {
                        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
                        var questions = plugin0.pages[pageIndex].questions;
                        for (var questionIndex = 0; questionIndex < questions.length; questionIndex++) {
                            var curQuestion = questions[questionIndex];
                            if (curQuestion.getOptionById && curQuestion.getOptionById(this.id)) {
                                curQuestion.selected = true;
                            }
                        }
                        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
                    }
                }
            });
            
            // We can then call the original encode method
            return originalEncode.apply(plugin, [enc]);
        };
        
        plugin.onAfterNext.add(new window.MS.Support.Fms.SurveyEventDelegate(null, handleNavigate));      
        plugin.onAfterPrevious.add(new window.MS.Support.Fms.SurveyEventDelegate(null, handleNavigate));        
    }

    function handleNavigate() {
        ///<summary>Called when the user hits the next button</summary>
        var plugin = window.plugin0;
        var curPage = plugin.getCurrentPage();
        var pageToSkip = plugin.pages[plugin.pages.length - 2];
        var lastPage = plugin.pages[plugin.pages.length - 1];
        var onFirstPage = false;
        var showHelp = false;
        // FMS has a thank-you page BEFORE the thank-you page that we must skip.
        if (curPage === pageToSkip) {
            plugin.next();
        } else if (curPage === lastPage) {            
            // We just navigated to the thank you screen
            handleSubmit();
        } else if (curPage === plugin.pages[0]) {
            onFirstPage = true;
        } else {
            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            showHelp = Qx(curPage.domObject).find("button").length > 0;
            /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
        }        
        
        parent.postMessage({ onFirstPage: onFirstPage, showHelp: showHelp}, postMessageTarget);
    }

    function handleSubmit() {
        ///<summary>Called when the user hits the next button</summary>
        parent.postMessage({ submitted: true, textInput: window.plugin0.submitFields.SURVEYANSWERS}, postMessageTarget);
    }

    function loadedSucessfully(poller, plugin) {
        ///<summary>Called when the survey is loaded: will POST a message to the parent window informing them of the load</summary>
        ///<param name="poller" type="Number">The timer to stop</param>
        ///<param name="plugin">The FMS Survey Plugin object</param>       
        clearTimeout(badLoadTimer);
        clearInterval(poller);
        initCustomSurveyLogic(plugin);

        parent.postMessage({ loaded: true }, postMessageTarget);
    }
    
    function onMessage (evt) {
        ///<summary>Handles postMessage from the iframes</summary>
        ///<param name="evt" type="PostMessage">Event data from the post message</param>
        var msg = /*@static_cast(PostMessageData)*/evt.data;
        if (evt.origin === postMessageTarget) {
            if (msg.backButtonPressed) {
                plugin0.previous();
            } // Ignore bad messages
        }
    };
    
    /// <disable>JS3083.DoNotOverrideBuiltInFunctions</disable>
    window.alert = function () {
        /* FMS JS will alert if the user tries to click a button without selecting a mandatory option */
    };
    /// <enable>JS3083.DoNotOverrideBuiltInFunctions</enable>

    
})();