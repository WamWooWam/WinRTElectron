//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var audioVideoViewerVideoClass = "audioVideoViewerVideo",
        EmbeddedMediaView = WinJS.Class.define(function EmbeddedMediaView_ctor(element) {
            this._element = element;
            this._viewModel = element.viewModel;
            var events,
                eventTracker = new AppMagic.Utility.EventTracker;
            events = AppMagic.AuthoringTool.ViewModels.EmbeddedMediaViewModel.events;
            eventTracker.add(this._viewModel, events.clickaudiovideoviewer, this._onClickAudioVideoViewer, this);
            eventTracker.add(this._viewModel, events.mediaoptionclicked, this._onClickMediaOption, this);
            ko.utils.domNodeDisposal.addDisposeCallback(element.children[0], function() {
                eventTracker.dispose()
            });
            ko.applyBindings(this._viewModel, element.children[0])
        }, {
            _element: null, _viewModel: null, _onClickAudioVideoViewer: function(evt) {
                    var mediaItemIndex = evt.detail.index;
                    var elements = this._element.getElementsByClassName(audioVideoViewerVideoClass),
                        audioVideoViewerVideoElement = elements[mediaItemIndex];
                    var handler = function() {
                            audioVideoViewerVideoElement.removeEventListener("ended", handler);
                            this._viewModel.shownMedia.mediaList[mediaItemIndex].isPlaying(!1)
                        }.bind(this);
                    audioVideoViewerVideoElement.addEventListener("ended", handler);
                    this._viewModel.shownMedia.mediaList[mediaItemIndex].isPlaying() ? audioVideoViewerVideoElement.play() : audioVideoViewerVideoElement.pause()
                }, _getMediaListContainerElement: function() {
                    var element = this._element.getElementsByClassName("mediaListAndMediaViewerContainer");
                    return element
                }, _onClickMediaOption: function(ev) {
                    WinJS.UI.Animation.fadeOut(this._getMediaListContainerElement()).then(function() {
                        var mediaTypeOption = ev.detail.mediaTypeOption;
                        this._viewModel.shownMedia = {
                            mediaType: mediaTypeOption.mediaType, displayName: mediaTypeOption.displayName, mediaTypeIcon: mediaTypeOption.mediaTypeIcon, mediaList: ev.detail.mediaItems
                        };
                        WinJS.UI.Animation.enterContent(this._getMediaListContainerElement(), AppMagic.Constants.Animation.EnterContentAnimationOffset)
                    }.bind(this))
                }
        }, {});
    AppMagic.UI.Pages.define("/backStages/embeddedMedia/embeddedMediaPage.html", EmbeddedMediaView)
})();