//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var mediaDetails = {
            fileSize: "fileSize", itemDate: "itemDate", dimensions: "dimensions", duration: "duration", resourceUri: "resourceUri", usedPlacesCountText: "usedPlacesCountText", isPlaying: "isPlaying"
        },
        imageDetails = [mediaDetails.resourceUri, mediaDetails.fileSize, mediaDetails.itemDate, mediaDetails.dimensions, mediaDetails.usedPlacesCountText],
        audioDetails = [mediaDetails.resourceUri, mediaDetails.fileSize, mediaDetails.itemDate, mediaDetails.duration, mediaDetails.usedPlacesCountText],
        videoDetails = [mediaDetails.resourceUri, mediaDetails.fileSize, mediaDetails.itemDate, mediaDetails.dimensions, mediaDetails.duration, mediaDetails.usedPlacesCountText],
        strings = AppMagic.AuthoringStrings,
        EmbeddedMediaViewModel = WinJS.Class.define(function EmbeddedMediaViewModel_ctor(doc) {
            this._document = doc;
            var initialCount = 0,
                mediaTypeOptions = [new MediaTypeOption(EmbeddedMediaViewModel.mediaTypes.image, strings.EmbeddedMediaPageMediaTypeImage, "/images/Image_20x20.png", initialCount), new MediaTypeOption(EmbeddedMediaViewModel.mediaTypes.video, strings.EmbeddedMediaPageMediaTypeVideo, "/images/Video_20x20.png", initialCount), new MediaTypeOption(EmbeddedMediaViewModel.mediaTypes.audio, strings.EmbeddedMediaPageMediaTypeAudio, "/images/Audio_20x20.png", initialCount), ];
            this._mediaTypeToMediaTypeOptionIndex = {};
            for (var i = 0, len = mediaTypeOptions.length; i < len; i++)
                this._mediaTypeToMediaTypeOptionIndex[mediaTypeOptions[i].mediaType] = i;
            this._viewerSrc = ko.observable("");
            this._mediaTypeOptions = ko.observableArray(mediaTypeOptions);
            this._shownMedia = ko.observable({
                mediaType: EmbeddedMediaViewModel.mediaTypes.image, displayName: strings.EmbeddedMediaPageMediaTypeImage, mediaTypeIcon: "/images/Image_20x20.png", mediaList: []
            });
            this._selectedMediaItemIndex = ko.observable(-1);
            this._selectedMediaFileName = ko.observable("");
            this._selectedMediaUses = ko.observable([]);
            this._isAudioVideoViewerPlaying = ko.observable(!1);
            this._hasResources = ko.observable(!1);
            this._controlsVisible = ko.observable(!1);
            this._selectedAudioVideoViewerIndex = ko.observable(-1);
            this._selectedDialogOption = ko.observable("")
        }, {
            _document: null, _viewerSrc: null, _mediaTypeOptions: null, _shownMedia: null, _selectedMediaItemIndex: null, _selectedMediaFileName: null, _selectedMediaUses: null, _isAudioVideoViewerPlaying: null, _hasResources: null, _hideControlsTimeoutHandle: null, _controlsVisible: null, _selectedAudioVideoViewerIndex: null, _selectedDialogOption: null, viewerSrc: {get: function() {
                        return this._viewerSrc()
                    }}, selectedMediaFileName: {get: function() {
                        return this._selectedMediaFileName()
                    }}, selectedMediaItemIndex: {get: function() {
                        return this._selectedMediaItemIndex()
                    }}, selectedMediaUses: {get: function() {
                        return this._selectedMediaUses()
                    }}, shownMedia: {
                    get: function() {
                        return this._shownMedia()
                    }, set: function(value) {
                            this._shownMedia(value)
                        }
                }, mediaTypeOptions: {get: function() {
                        return this._mediaTypeOptions()
                    }}, hasResources: {get: function() {
                        return this._hasResources()
                    }}, selectedAudioVideoViewerIndex: {
                    get: function() {
                        return this._selectedAudioVideoViewerIndex()
                    }, set: function(value) {
                            this._selectedAudioVideoViewerIndex(value)
                        }
                }, reload: function() {
                    this._hasResources(this._document.resourceManager.resources.first().hasCurrent);
                    this.onClickMediaOption(!1, this.mediaTypeOptions[0]);
                    for (var i = 1, len = this.mediaTypeOptions.length; i < len; i++)
                        this._updateMediaTypeCount(this.mediaTypeOptions[i])
                }, getMediaTypeOptionIndexFromMediaType: function(mediaType) {
                    return this._mediaTypeToMediaTypeOptionIndex[mediaType]
                }, _resetMediaItemSelection: function() {
                    this._selectedMediaFileName("");
                    this._selectedMediaItemIndex(-1);
                    this._selectedMediaUses([]);
                    this._viewerSrc("");
                    this._isAudioVideoViewerPlaying(!1)
                }, _updateMediaTypeCount: function(mediaTypeOption) {
                    var iter,
                        counter = 0,
                        mediaTypes = EmbeddedMediaViewModel.mediaTypes;
                    switch (mediaTypeOption.mediaType) {
                        case mediaTypes.audio:
                            iter = this._document.resourceManager.audioResources.first();
                            break;
                        case mediaTypes.image:
                            iter = this._document.resourceManager.imageResources.first();
                            break;
                        case mediaTypes.video:
                            iter = this._document.resourceManager.videoResources.first();
                            break;
                        default:
                            break
                    }
                    for (; iter.hasCurrent; iter.moveNext()) {
                        var resource = iter.current;
                        resource.isSampleData || counter++
                    }
                    mediaTypeOption.count = counter
                }, onClickMediaOption: function(isMediaTypeSelected, mediaTypeOption) {
                    var iter,
                        details,
                        mediaTypes = EmbeddedMediaViewModel.mediaTypes;
                    switch (mediaTypeOption.mediaType) {
                        case mediaTypes.audio:
                            details = audioDetails;
                            iter = this._document.resourceManager.audioResources.first();
                            break;
                        case mediaTypes.image:
                            details = imageDetails;
                            iter = this._document.resourceManager.imageResources.first();
                            break;
                        case mediaTypes.video:
                            details = videoDetails;
                            iter = this._document.resourceManager.videoResources.first();
                            break;
                        default:
                            break
                    }
                    for (var mediaItems = []; iter.hasCurrent; iter.moveNext()) {
                        var resource = iter.current;
                        if (!resource.isSampleData) {
                            for (var mediaItem = {
                                    fileName: resource.fileName, name: resource.name
                                }, properties = Microsoft.AppMagic.Authoring.ResourceProperties, i = 0, len = details.length; i < len; i++) {
                                switch (details[i]) {
                                    case mediaDetails.fileSize:
                                        var fileSize = resource.getProperty(properties.size);
                                        mediaItem.fileSize = fileSize;
                                        break;
                                    case mediaDetails.itemDate:
                                        var itemDate = resource.getProperty(properties.itemDate);
                                        mediaItem.itemDate = itemDate;
                                        break;
                                    case mediaDetails.dimensions:
                                        var width = resource.getProperty(properties.width);
                                        var height = resource.getProperty(properties.height);
                                        mediaItem.width = width;
                                        mediaItem.height = height;
                                        break;
                                    case mediaDetails.duration:
                                        var duration = resource.getProperty(properties.duration);
                                        mediaItem.duration = duration;
                                        break;
                                    case mediaDetails.resourceUri:
                                        mediaItem.resourceUri = ko.observable(resource.rootPath.absoluteCanonicalUri);
                                        break;
                                    case mediaDetails.usedPlacesCountText:
                                        for (var resourceByName = this._document.resourceManager.getResourceByName(resource.name), usedPlacesCount = 0, usedPlacesCountText = "", resourceUses = resourceByName.uses.first(); resourceUses.hasCurrent; resourceUses.moveNext())
                                            usedPlacesCount++;
                                        usedPlacesCountText = Core.Utility.formatString(strings.EmbeddedMediaUsedinPlaces, usedPlacesCount);
                                        mediaItem.usedPlacesCountText = usedPlacesCountText;
                                        break;
                                    default:
                                        break
                                }
                                mediaItem.isPlaying = ko.observable(!1)
                            }
                            mediaItems.push(mediaItem)
                        }
                    }
                    this._resetMediaItemSelection();
                    isMediaTypeSelected && mediaItems.length > 0 && this.shownMedia.mediaType !== mediaTypeOption.mediaType ? this.dispatchEvent(EmbeddedMediaViewModel.events.mediaoptionclicked, {
                        mediaTypeOption: mediaTypeOption, mediaItems: mediaItems
                    }) : this._shownMedia({
                        mediaType: mediaTypeOption.mediaType, displayName: mediaTypeOption.displayName, mediaTypeIcon: mediaTypeOption.mediaTypeIcon, mediaList: mediaItems
                    });
                    this._updateMediaTypeCount(mediaTypeOption)
                }, onClickRemoveMediaItem: function(mediaType, mediaItemIndex, item) {
                    this._shownMedia().mediaList[mediaItemIndex].resourceUri("");
                    var removeResult = this._document.resourceManager.removeResourceAsync(item.name);
                    mediaItemIndex === this._selectedMediaItemIndex() && this._resetMediaItemSelection();
                    this._shownMedia().mediaList.splice(mediaItemIndex, 1);
                    this._shownMedia.valueHasMutated();
                    var mediaTypeOptionIndex = this._mediaTypeToMediaTypeOptionIndex[mediaType],
                        mediaTypeOption = this.mediaTypeOptions[mediaTypeOptionIndex];
                    this._updateMediaTypeCount(mediaTypeOption)
                }, onClickAudioVideoViewer: function(mediaItemIndex) {
                    var mediaItem = this._shownMedia().mediaList[mediaItemIndex];
                    mediaItem.isPlaying(!mediaItem.isPlaying());
                    this.dispatchEvent(EmbeddedMediaViewModel.events.clickaudiovideoviewer, {index: mediaItemIndex})
                }, onClickImportMedia: function() {
                    if (AppMagic.AuthoringTool.Utility.canShowPicker()) {
                        for (var picker = new Platform.Storage.Pickers.FileOpenPicker, formats = AppMagic.AuthoringTool.Constants.ImageFormats.concat(AppMagic.AuthoringTool.Constants.MediaFormats), i = 0, len = formats.length; i < len; i++)
                            picker.fileTypeFilter.append(formats[i]);
                        var waitDialog = new AppMagic.Popups.WaitDialog("Loading media...");
                        picker.pickMultipleFilesAsync().then(function(files) {
                            waitDialog.showAsync();
                            var resources = [];
                            return files && files.length > 0 ? resources = files.map(function(file) {
                                    if (this._document.resourceManager.getResourceByName(file.displayName) === null)
                                        return this._document.resourceManager.createResourceAsync(file, !1);
                                    else {
                                        var dialog = new AppMagic.Popups.MessageDialog(Core.Utility.formatString(AppMagic.AuthoringStrings.EmbeddedMediaPageMediaDialogText, file.name), AppMagic.AuthoringStrings.EmbeddedMediaPageMediaDialogTitle);
                                        return dialog.addButton(AppMagic.Strings.Rename, function() {
                                                this._selectedDialogOption(AppMagic.Strings.Rename)
                                            }.bind(this)), dialog.addButton(AppMagic.Strings.Replace, function() {
                                                this._selectedDialogOption(AppMagic.Strings.Replace)
                                            }.bind(this)), dialog.addButton(AppMagic.Strings.Cancel, function() {
                                                    this._selectedDialogOption(AppMagic.Strings.Cancel)
                                                }.bind(this)), dialog.defaultCommandIndex = 0, dialog.cancelCommandIndex = 2, dialog.showAsync().then(function() {
                                                    if (this._selectedDialogOption() === AppMagic.Strings.Replace) {
                                                        this._shownMedia().mediaList.forEach(function(mediaItem) {
                                                            typeof mediaItem.resourceUri != "undefined" && mediaItem.fileName === file.name && mediaItem.resourceUri("")
                                                        });
                                                        var removeResult = this._document.resourceManager.removeResourceAsync(file.displayName);
                                                        return removeResult.then(function(result) {
                                                                return this._document.resourceManager.createResourceAsync(file, !1)
                                                            }.bind(this))
                                                    }
                                                    else
                                                        return this._selectedDialogOption() === AppMagic.Strings.Rename ? this._document.resourceManager.createResourceAsync(file, !0) : "cancelled"
                                                }.bind(this))
                                    }
                                }.bind(this)) : resources.push(WinJS.Promise.wrapError("Operation cancelled")), WinJS.Promise.join(resources)
                        }.bind(this)).done(function(resources) {
                            return resources.forEach(function(resource) {
                                    if (resource) {
                                        if (resource === "cancelled")
                                            return;
                                        if (this._hasResources(this._document.resourceManager.resources.first().hasCurrent), AppMagic.AuthoringTool.Constants.AudioFormats.indexOf(resource.rootPath.extension) > -1)
                                            this.onClickMediaOption(!1, this.mediaTypeOptions[this._mediaTypeToMediaTypeOptionIndex[EmbeddedMediaViewModel.mediaTypes.audio]]);
                                        else if (AppMagic.AuthoringTool.Constants.VideoFormats.indexOf(resource.rootPath.extension) > -1)
                                            this.onClickMediaOption(!1, this.mediaTypeOptions[this._mediaTypeToMediaTypeOptionIndex[EmbeddedMediaViewModel.mediaTypes.video]]);
                                        else
                                            this.onClickMediaOption(!1, this.mediaTypeOptions[this._mediaTypeToMediaTypeOptionIndex[EmbeddedMediaViewModel.mediaTypes.image]])
                                    }
                                    else
                                        AppMagic.AuthoringTool.PlatformHelpers.showMessage(strings.AddResourceErrorTitle, strings.AddResourceErrorMessage)
                                }.bind(this)), waitDialog.close(), WinJS.Promise.wrap(!0)
                        }.bind(this), function() {
                            waitDialog.close();
                            return
                        })
                    }
                }, notifyClickBack: function() {
                    return this._resetMediaItemSelection(), this._shownMedia().mediaList.forEach(function(mediaItem) {
                            typeof mediaItem.resourceUri != "undefined" && mediaItem.resourceUri("")
                        }), !0
                }, _showControls: function() {
                    this._controlsVisible(!0);
                    this._hideControlsTimeoutHandle !== null && clearTimeout(this._hideControlsTimeoutHandle)
                }, onPointerMove: function(selectedMediaItemIndex) {
                    this._selectedAudioVideoViewerIndex(selectedMediaItemIndex);
                    this._showControls();
                    var that = this;
                    this._hideControlsTimeoutHandle = setTimeout(function() {
                        that._controlsVisible(!1);
                        that._hideControlsTimeoutHandle = null
                    }, AppMagic.Constants.Controls.controlsFadeDelay)
                }, controlsVisible: {get: function() {
                        return this._controlsVisible()
                    }}
        }, {
            events: {
                clickaudiovideoviewer: "clickaudiovideoviewer", mediaoptionclicked: "mediaoptionclicked"
            }, mediaTypes: {
                    audio: "audio", image: "image", video: "video"
                }
        }),
        MediaTypeOption = WinJS.Class.define(function MediaTypeOption_ctor(mediaType, displayName, mediaTypeIcon, initialCount) {
            this._mediaType = mediaType;
            this._displayName = displayName;
            this._mediaTypeIcon = mediaTypeIcon;
            this._count = ko.observable(initialCount)
        }, {
            _mediaType: null, _displayName: null, _mediaTypeIcon: null, _count: null, mediaType: {get: function() {
                        return this._mediaType
                    }}, displayName: {get: function() {
                        return this._displayName
                    }}, mediaTypeIcon: {get: function() {
                        return this._mediaTypeIcon
                    }}, count: {
                    get: function() {
                        return this._count()
                    }, set: function(value) {
                            this._count(value)
                        }
                }, mediaTypeNameAndCount: {get: function() {
                        return Core.Utility.formatString(AppMagic.AuthoringStrings.EmbeddedMediaPageMediaTypeNameAndCountFormat, this._displayName, this._count())
                    }}
        });
    WinJS.Class.mix(EmbeddedMediaViewModel, WinJS.Utilities.eventMixin);
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {EmbeddedMediaViewModel: EmbeddedMediaViewModel})
})(Windows);