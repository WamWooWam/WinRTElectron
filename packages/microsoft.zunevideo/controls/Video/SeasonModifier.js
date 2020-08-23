/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/Utilities.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {SeasonModifierPopupEntry: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.ModifierPopupEntry", "/Controls/Video/SeasonModifier.html#seasonModifierPopupEntryTemplate", null, {_gotData: function _gotData(data) {
                var domEvent;
                if (data.item) {
                    if (data.item.label)
                        this.text.textContent = data.item.label;
                    if (data.item.season)
                        this.boxArt.target = data.item.season;
                    if (data.item.ownedEpisodes)
                        this.ownedEpisodeCount.textContent = String.load(String.id.IDS_TV_OWNED_EPISODES_LABEL).format(data.item.ownedEpisodes)
                }
                if (data.isInitialSelected)
                    WinJS.Utilities.addClass(this.background, "initialSelectedModifierPopupEntry");
                if (data.modifierControl._tabPanel)
                    MS.Entertainment.Framework.AccUtils.createAndAddAriaLink(this.domElement, data.modifierControl._tabPanel, "aria-controls");
                domEvent = document.createEvent("Event");
                domEvent.initEvent("ModifierPopupEntryLoaded", true, true);
                this.domElement.dispatchEvent(domEvent)
            }})})
})()
