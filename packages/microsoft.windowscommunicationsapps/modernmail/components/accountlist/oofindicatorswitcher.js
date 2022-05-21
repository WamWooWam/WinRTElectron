
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*jshint browser:true */
/*global Mail,Jx,Debug,Microsoft*/

Jx.delayDefine(Mail, "OofIndicatorSwitcher", function () {

    "use strict";
    var Plat = Microsoft.WindowsLive.Platform;

    Mail.OofIndicatorSwitcher = /*@constructor*/function (showIndicatorCallback, hideIndicatorCallback, respectIgnoredTime) {
        ///<param name="showIndicatorCallback" type="Function"/>
        ///<param name="hideIndicatorCallback" type="Function"/>
        ///<param name="respectIgnoredTime" type="Boolean"/>
        Debug.assert(Jx.isFunction(showIndicatorCallback));
        Debug.assert(Jx.isFunction(hideIndicatorCallback));
        Debug.assert(Jx.isBoolean(respectIgnoredTime));
        this._showIndicatorCallback = showIndicatorCallback;
        this._hideIndicatorCallback = hideIndicatorCallback;
        this._respectIgnoredTime = respectIgnoredTime;
        
        this._timer = 0;
        this._account = null;
        this._oofSupported = false;
        
        this._onAccountChanged = this._onAccountChanged.bind(this);
        
        Debug.only(Object.seal(this));
    };

    var proto = Mail.OofIndicatorSwitcher.prototype;
                
    proto.dispose = function () {
        this._clearTimer();
        this._showIndicatorCallback = null;
        this._hideIndicatorCallback = null;
        this._clearAccount();
    };

    proto._clearTimer = function () {
        if (this._timer) {
            window.clearTimeout(this._timer);
            this._timer = 0;
        }
    };

    proto._clearAccount = function () {
        var account = this._account;
        if (account) {
            var mailResource = account.getResourceByType(Plat.ResourceType.mail);
            mailResource.removeEventListener("changed", this._onAccountChanged);
        }
        if (this._oofSupported) {
            this._hideOofIndicator();
            this._oofSupported = false;
        }
        this._account = null;
    };

    proto.setAccount = function (account) {
        /// <param name="account" type="Plat.Account"/>
        Debug.assert(account);
        Jx.log.info("Mail.OofIndicatorSwitcher.setAccount: id=" + account.objectId);
        this._clearAccount();
        this._clearTimer();

        Debug.assert(!this._account);
        this._account = account;

        var mailResource = account.getResourceByType(Plat.ResourceType.mail);       
        Debug.assert(mailResource);
        // Hook up account change updates. Whether oof is supported can be affected by 
        // syncresult so we should always hook up account change event.
        mailResource.addEventListener("changed", this._onAccountChanged);

        var easSettings = account.getServerByType(Plat.ServerType.eas);
        this._oofSupported = easSettings && easSettings.isOofSupported();
        if (this._oofSupported) {
            this._updateOofIndicator();
        }
    };    

    var OofSwitcher = Mail.OofIndicatorSwitcher;

    OofSwitcher._calculateTime = function (startTime, endTime, now) {
        /// <summary>Calculate whether now is between startTime and endTime, and the time in miliseconds to next check point</summary>
        /// <param name="startTime" type="DateTime"/>
        /// <param name="endTime" type="DateTime"/>
        /// <param name="now" type="DateTime"/>
        /// <return type="Object">Object {
        ///     isNowBetween: Boolean to indicate if now is between the given startTime and endTime,
        ///     timeToNextCheckPoint: time in miliseconds to next check point that isNowBetween needs to be recaluculated
        ///     } </param>
 
        Debug.assert(now);
        var timeToStartTime =  (startTime && (now < startTime)) ? (startTime - now) : -1,
            timeToEndTime =  (endTime && (now < endTime)) ? endTime - now : -1,
            timeToNextCheckPoint = (timeToStartTime > 0) ? timeToStartTime : timeToEndTime;
        return {
            isNowBetween: (!startTime || now >= startTime) && (!endTime || now < endTime), 
            timeToNextCheckPoint: (!startTime || !endTime || startTime < endTime)? timeToNextCheckPoint : -1 // Make sure endTime is later than startTime
        };
    };

    OofSwitcher.calculateTime = function (startTime, endTime) {
        /// <summary>Calculate whether now is between startTime and endTime, and the time in miliseconds to next check point</summary>
        /// <param name="startTime" type="DateTime"/>
        /// <param name="endTime" type="DateTime"/>
        /// <return type="Object"/>
        var now = new Date();
        return OofSwitcher._calculateTime(startTime, endTime, now);
    };

    function logTime (dateTime, string) {
        if (dateTime) {
            Jx.log.info(string + ": " + dateTime.toString());
        }
    }
 
    proto._updateOofIndicator = function () {
        /// <summary>Show/Hide OOF indicator if needed</summary>
        Debug.assert(this._account);
        Jx.log.info("Mail.OofIndicatorSwitcher._updateOofIndicator: account id= " + this._account.objectId);

        Debug.assert(this._oofSupported);
        var needToShow = false,
            syncError = false,
            account = this._account,
            mailResource = account.getResourceByType(Plat.ResourceType.mail);
        Debug.assert(mailResource);
        
        this._clearTimer();
        
        if (mailResource.oofLastSyncResult === Plat.Result.success) {
            var easSettings = account.getServerByType(Plat.ServerType.eas);
            Debug.assert(easSettings);
            if (easSettings.oofState) {
                var oofStartTime = easSettings.oofStartTime,
                    oofEndTime = easSettings.oofEndTime,
                    oofLastStateChangedTime = mailResource.oofLastStateChangedTime,
                    oofLastIgnoredTime = easSettings.oofLastIgnoredTime;
                Debug.assert(oofLastStateChangedTime, "Invalid oofLastStateChangedTime");

                logTime(oofStartTime, "oofStartTime");
                logTime(oofEndTime, "oofEndTime");
                logTime(oofLastStateChangedTime, "oofLastStateChangedTime");
                logTime(oofLastIgnoredTime, "oofLastIgnoredTime");

                var calculateResult = OofSwitcher.calculateTime(oofStartTime, oofEndTime);
                // Only show if now is between the oof start time and oof end time
                if (calculateResult.isNowBetween) {
                    // If caller asks to respect last ignored time, it should check if oof setting update is after the last time user ignored it. 
                    if (!this._respectIgnoredTime || (!oofLastIgnoredTime || mailResource.oofLastStateChangedTime >= oofLastIgnoredTime)) {
                        this._showOofIndicator();
                        needToShow = true;
                    }
                }
                
                if (calculateResult.timeToNextCheckPoint > 0) {
                    // Set timer to re calculate at a certain time. Timer shouldn't need to be more than 1 day (86400000ms) as Mail refreshes every day. 
                    // Add 5s as a buffer to allow for timer error so we won't miss the OOF window.
                    this._timer = window.setTimeout(this._updateOofIndicator.bind(this), Math.min(86400000, calculateResult.timeToNextCheckPoint + 5000));
                }
            } 
        } else  {
            syncError = true;
            Jx.log.info("Mail.OofIndicatorSwitcher._updateOofIndicator: sync error " + mailResource.oofResult);
        }
        
        if (!needToShow && !syncError) {
            this._hideOofIndicator();
        }
    };

    proto._showOofIndicator = function () {
        Debug.assert(this._oofSupported);
        var showCallback = this._showIndicatorCallback;
        if (showCallback) {
            Jx.log.info("Mail.OofIndicatorSwitcher._showOofIndicator: account id= " + this._account.objectId);
            showCallback();
        }
    };

    proto._hideOofIndicator = function () {
        Debug.assert(this._oofSupported);
        var hideCallback = this._hideIndicatorCallback;
        if (hideCallback) {
            Jx.log.info("Mail.OofIndicatorSwitcher._hideOofIndicator: account id= " + this._account.objectId);
            hideCallback();
        }
    };
    
    proto._onAccountChanged = function (ev) {
        /// <summary>Account changed handler</summary>
        /// <param name="ev" type="dynamic"/>
        if (Mail.Validators.hasPropertyChanged(ev, "oofLastStateChangedTime")) {
            if (this._oofSupported) {
                this._updateOofIndicator();
            }
        } else if (Mail.Validators.hasPropertyChanged(ev, "lastSyncResult")) {
            var easSettings = this._account.getServerByType(Plat.ServerType.eas);
            this._oofSupported = easSettings && easSettings.isOofSupported();
            if (this._oofSupported) {
                this._updateOofIndicator();
            }
        }
    };
});
