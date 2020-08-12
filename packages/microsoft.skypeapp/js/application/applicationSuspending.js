

(function () {
    "use strict";

    var _suspendingHandlers = [];

    function _callSuspendedHandlers(event) {
        _suspendingHandlers.forEach(function(handlerDef) {
            var handler = handlerDef[1];
            handler(event);
        });
    }

    function _onSuspend(event) {
        log("app is about to be suspended");

        var suspendingDeferral = event.suspendingOperation.getDeferral();
        
        setTimeout(function () {
            suspendingDeferral.complete();
            log('suspending finished (async)');
        }, 1500);

        Skype.Application.BackgroundState.setState(Skype.Application.BackgroundState.State.Background);

        
        _callSuspendedHandlers(event);
        
        if (lib && lib.getLibStatus() === LibWrap.WrSkyLib.libstatus_RUNNING) {
            lib.changeBackgroundMode(true);
        }

        Skype.Statistics.sendStats(Skype.Statistics.event.applicationSuspended);

        Skype.Statistics.sendStats(Skype.Statistics.event.applicationSuspended_sessionTime, _getSessionTime());

        Skype.Statistics.saveEventsState().done(function() {
            log('saveEventsState completed.');
        }, function onError(error) {
            log('saveEventsState error: ' + error);
        });
        log('suspending finished (sync)');
    }
    
    function _utGetHadlersCount() {
        return _suspendingHandlers.length;
    }

    function _getSessionTime() {
        var sessionTime = Math.floor((Date.now() - Skype.Application.state.startedResumedTimestamp) / 1000); 
        return sessionTime;
    }

    
    function init() {
        Skype.Application.Suspending.ExternalAPI.WebUIApplication.addEventListener("suspending", _onSuspend);
    }
    
    function regHandler(object, handler) {
        _suspendingHandlers.push([object, handler]);
    }

    function unregHandler(object, handler) {
        for (var i = 0; i < _suspendingHandlers.length; i++) {
            var handlerDef = _suspendingHandlers[i];
            if (handlerDef[0] === object && handlerDef[1] === handler) {
                _suspendingHandlers.splice(i, 1);
                return;
            }
        }
        throw new Error("Error: Suspending handler is not registered or already unregistered.");
    }

    WinJS.Namespace.define("Skype.Application.Suspending", {
        init: init,
        regHandler: regHandler,
        unregHandler: unregHandler,
        
        getHandlersCount: _utGetHadlersCount,
        
        ExternalAPI: {
            WebUIApplication: Windows.UI.WebUI.WebUIApplication
        }
    });
}());