

(function () {
    "use strict";

    
    var pagesOrFragmentsWithBackbutton = ['dialer', 'conversation', 'contacts', 'allHistory', 'liveConversation', 'participantList'];
    var pagesOrFragmentsWithUnreadButton = ['dialer', 'conversation', 'contacts', 'liveConversation', 'participantList'];

    var RECURSIVE_DELAY = 68;
    var ANIMATION_DELAY = 17;
    var PROTECTION_DELAY = 3000;

    var animOffsetLeft; 
    var prevFragmentName;

    
    var _iterations = {};

    
    
    

    function animate(fragmentContainer, isCalledFromFinalizeSwitch) {
        var fragmentName = fragmentContainer._name;
        
        var animRegions = Skype.Application.state.view.isVertical ? fragmentContainer.querySelectorAll(".animRegion") : fragmentContainer.querySelectorAll(".animRegion:not(.animSnapOnly)");
        var animRegionCollection = new WinJS.Utilities.QueryCollection(animRegions);
        var animRegLen = animRegions.length;

        
        _iterations[fragmentName] = (_iterations[fragmentName] || 0) + 1;

        
        !isCalledFromFinalizeSwitch && animRegionCollection.clearStyle("opacity"); 

        
        
        if (animRegLen === 0 && _iterations[fragmentName] <= 10) {
            setTimeout(function () {
                animate(fragmentContainer);
            }, RECURSIVE_DELAY);
        } else if (animRegLen > 0) {
            WinJS.Utilities.removeClass(fragmentContainer, "ANIMATIONDONE");

            
            _iterations[fragmentName] = 0;

            var animGroups = createAnimationGroups(animRegions, fragmentName, prevFragmentName);

            animateConversationSwitcher(animGroups, fragmentName, prevFragmentName);

            callWinJSAnimation(fragmentContainer, animGroups);

            
            
            prevFragmentName = fragmentName;
        }

        
        

        
        protection(fragmentContainer);
    }

    function createAnimationGroups(animRegions, fragmentName, prevFragmentName) {
        var animGroups = [];
        var region;
        var groupIdPos;
        var groupId = 0;

        for (var j = 0; j < animRegions.length; j++) {
            region = animRegions[j];

            
            var isBackButton = WinJS.Utilities.hasClass(region, "win-backbutton");
            if (isBackButton && pagesOrFragmentsWithBackbutton.indexOf(prevFragmentName) > -1 && pagesOrFragmentsWithBackbutton.indexOf(fragmentName) > -1) {
                region.style.opacity = "1";
                continue;
            }

            groupIdPos = region.className.indexOf("animGroup") + 9;
            groupId = parseInt(region.className.substr(groupIdPos, 1)) - 1;
            animGroups[groupId] = animGroups[groupId] || [];
            animGroups[groupId].push(region);
        }

        var args = [];
        for (var i = 0; i < animGroups.length; i++) {
            args.push(animGroups[i] || []); 
        }
        
        return args;
    }

    
    function animateConversationSwitcher(animGroups, fragmentName, prevFragmentName) {
        var btnSwitcher = document.querySelector(".conversationSwitcher .animRegion");
        if (btnSwitcher) {
            
            if (!(pagesOrFragmentsWithUnreadButton.indexOf(prevFragmentName) > -1) && pagesOrFragmentsWithUnreadButton.indexOf(fragmentName) > -1) {
                animGroups[animGroups.length] = [btnSwitcher];
            }
        }
    }

    function callWinJSAnimation(fragmentContainer, animGroups) {
        
        
        
        setTimeout(function () {
            
            WinJS.UI.Animation.enterPage(animGroups, animOffsetLeft || {})
                .done(function () {
                    WinJS.Utilities.addClass(fragmentContainer, "ANIMATIONDONE");
                    fragmentContainer.winControl && fragmentContainer.winControl.pageEnteredAndAnimated && fragmentContainer.winControl.pageEnteredAndAnimated();
                    roboSky.write("Application,navigationAnimationDone");
                });
            
        }, ANIMATION_DELAY);

    }

    function protection(fragmentContainer) {
        
        setTimeout(function () {
            var fragmentName = fragmentContainer._name;

            
            _iterations[fragmentName] = 0;

            var animRegions = new WinJS.Utilities.query(Skype.Application.state.view.isVertical ? ".animRegion" : ".animRegion:not(.animSnapOnly)", fragmentContainer);
            animRegions.setStyle("opacity", "1"); 
        }, PROTECTION_DELAY);
    }

    
    function showAnimRegionsWithoutAnimation(fragmentContainer) {
        WinJS.Utilities.query(Skype.Application.state.view.isVertical ? ".animRegion" : ".animRegion:not(.animSnapOnly)", fragmentContainer).setStyle("opacity", "1");
    }

    function animatePrepareStep(activeFragment, next) {
        
        WinJS.Utilities.query(Skype.Application.state.view.isVertical ? ".animRegion" : ".animRegion:not(.animSnapOnly)", next).clearStyle('opacity'); 

        
        var switcherButtonAnimRegion = document.querySelector(".conversationSwitcher .animRegion"),
            buttonAllowedOnCurrent = activeFragment && (pagesOrFragmentsWithUnreadButton.indexOf(activeFragment._name) > -1),
            buttonAllowedOnNext = pagesOrFragmentsWithUnreadButton.indexOf(next._name) > -1;
        if (switcherButtonAnimRegion && ((!buttonAllowedOnCurrent && buttonAllowedOnNext) || (buttonAllowedOnCurrent && !buttonAllowedOnNext))) {
            switcherButtonAnimRegion.style.opacity = "";
        }
    }

    WinJS.Namespace.define("Skype.UI", {
        
        animatePrepareStep: animatePrepareStep,
        animate: animate
    });
})();
