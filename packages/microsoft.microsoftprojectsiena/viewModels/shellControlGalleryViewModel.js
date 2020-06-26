//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var Controls = AppMagic.ControlStrings,
        ShellControlGalleryViewModel = WinJS.Class.define(function ShellControlGalleryViewModel_ctor() {
            this._controls = {};
            this._controls[AppMagic.AuthoringStrings.Visuals] = [{
                    title: Controls.Office365, image: "images/thumbnails/controls/Office_80x40.svg", controlGroup: !0, order: 1, backgroundColor: "rgba(150, 101, 150, 1)", hasWideTile: !0
                }, {
                    title: Controls.Web, image: "images/thumbnails/controls/web.svg", controlGroup: !0, order: 2, backgroundColor: "rgba(150, 101, 150, 1)", hasWideTile: !1
                }, {
                    title: Controls.Education, image: "images/thumbnails/controls/education.svg", controlGroup: !0, order: 3, backgroundColor: "rgba(150, 101, 150, 1)", hasWideTile: !1
                }, {
                    title: Controls.Social, image: "images/thumbnails/controls/Social_80x40.svg", controlGroup: !0, order: 4, backgroundColor: "rgba(150, 101, 150, 1)", hasWideTile: !0
                }, {
                    title: Controls.Label, image: "images/thumbnails/controls/label.svg", template: "Label", order: 5
                }, {
                    title: Controls.Image, image: "images/thumbnails/controls/image.svg", template: "Image", order: 6
                }, {
                    title: Controls.Galleries, image: "images/thumbnails/controls/customgallery.svg", controlGroup: !0, order: 7, hasWideTile: !0
                }, {
                    title: Controls.Button, image: "images/thumbnails/controls/pushbutton.svg", template: "Button", order: 8
                }, {
                    title: Controls.Slider, image: "images/thumbnails/controls/sliders.svg", template: "Slider", order: 9
                }, {
                    title: Controls.Charts, image: "images/thumbnails/controls/chart_tile.svg", controlGroup: !0, order: 10, hasWideTile: !0
                }, {
                    title: Controls.Dropdown, image: "images/thumbnails/controls/dropdown.svg", template: "Dropdown", order: 11
                }, {
                    title: Controls.Shapes, image: "images/thumbnails/controls/shapes.svg", controlGroup: !0, order: 12
                }, {
                    title: Controls.Video, image: "images/thumbnails/controls/videoPlayback.svg", template: "VideoPlayback", order: 13, hasWideTile: !0
                }, {
                    title: Controls.Audio, image: "images/thumbnails/controls/audioPlayback.svg", template: "AudioPlayback", order: 14
                }, {
                    title: Controls.Pen, image: "images/thumbnails/controls/Pen.svg", template: "InkControl", order: 15
                }, {
                    title: Controls.Camera, image: "images/thumbnails/controls/camera.svg", template: "Camera", order: 16
                }, {
                    title: Controls.Microphone, image: "images/thumbnails/controls/microphone.svg", template: "Microphone", order: 17
                }, {
                    title: Controls.Checkbox, image: "images/thumbnails/controls/checkbox.svg", template: "Checkbox", order: 18
                }, {
                    title: Controls.Radio, image: "images/thumbnails/controls/radiobutton.svg", template: "Radio", order: 19
                }, {
                    title: Controls.Listbox, image: "images/thumbnails/controls/listbox_icon.svg", template: "Listbox", order: 20
                }, {
                    title: Controls.ToggleSwitch, image: "images/thumbnails/controls/toggleswitch.svg", template: "ToggleSwitch", order: 21
                }, {
                    title: Controls.InputText, image: "images/thumbnails/controls/textbox.svg", template: "Text", order: 22
                }, {
                    title: Controls.HTMLViewer, image: "images/thumbnails/controls/htmlViewer.svg", template: "HtmlViewer", order: 23
                }, {
                    title: Controls.Rating, image: "images/thumbnails/controls/rating.svg", template: "Rating", order: 24
                }, {
                    title: Controls.Timer, image: "images/thumbnails/controls/timer.svg", template: "Timer", order: 25
                }, {
                    title: Controls.Import, image: "images/thumbnails/controls/import.svg", template: "Import", order: 26
                }, {
                    title: Controls.Export, image: "images/thumbnails/controls/export.svg", template: "Export", order: 27
                }, {
                    title: Controls.SharePointUpdate, image: "images/thumbnails/controls/sharepoint_icon.svg", template: "SharePointUpdate", order: 28
                }, ];
            this._controls[Controls.Galleries] = [{
                    title: Controls.TextGallery, image: "images/thumbnails/controls/textgallery_icon_80x40.svg", template: "Gallery", variant: "textualGalleryHorizontal", order: 1
                }, {
                    title: Controls.TextGallery, image: "images/thumbnails/controls/textgalleryvert_icon_80x40.svg", template: "Gallery", variant: "textualGalleryVertical", order: 2
                }, {
                    title: Controls.ImageGallery, image: "images/thumbnails/controls/imagegallery_icon_80x40.svg", template: "Gallery", variant: "imageGalleryHorizontal", order: 3
                }, {
                    title: Controls.ImageGallery, image: "images/thumbnails/controls/imagegalleryvertical_icon_80x40.svg", template: "Gallery", variant: "imageGalleryVertical", order: 4
                }, {
                    title: Controls.ImageGalleryWithCaption, image: "images/thumbnails/controls/imagewithcaption_icon_80x40.svg", template: "Gallery", variant: "imageGalleryWithCaptionHorizontal", order: 5
                }, {
                    title: Controls.ImageGalleryWithCaption, image: "images/thumbnails/controls/imagewithcaptionvertical_icon_80x40.svg", template: "Gallery", variant: "imageGalleryWithCaptionVertical", order: 6
                }, {
                    title: Controls.ImageGalleryWithText, image: "images/thumbnails/controls/imagewithtext_icon_80x40.svg", template: "Gallery", variant: "imageGalleryWithTextHorizontal", order: 7
                }, {
                    title: Controls.ImageGalleryWithText, image: "images/thumbnails/controls/imagewithtextvertical_icon_80x40.svg", template: "Gallery", variant: "imageGalleryWithTextVertical", order: 8
                }, {
                    title: Controls.CustomGallery, image: "images/thumbnails/controls/customgallery_icon_80x40.svg", template: "Gallery", order: 9
                }, {
                    title: Controls.CustomGallery, image: "images/thumbnails/controls/customgalleryvert_icon_80x40.svg", template: "Gallery", variant: "galleryVertical", order: 10
                }, ];
            this._controls[Controls.Charts] = [{
                    title: Controls.CompositeColumnChart, image: "images/thumbnails/controls/barchart.svg", template: "CompositeColumnChart", order: 1, isComposite: !0
                }, {
                    title: Controls.CompositePieChart, image: "images/thumbnails/controls/piechart.svg", template: "CompositePieChart", order: 2, isComposite: !0
                }, {
                    title: Controls.CompositeLineChart, image: "images/thumbnails/controls/linechart.svg", template: "CompositeLineChart", order: 3, isComposite: !0
                }, ];
            this._controls[Controls.Shapes] = [{
                    title: Controls.Circle, image: "images/thumbnails/controls/circle.svg", template: "Circle", order: 1
                }, {
                    title: Controls.QuarterCircle, image: "images/thumbnails/controls/circle1qtr.svg", template: "PartialCircle", variant: "quarterCircle", order: 2
                }, {
                    title: Controls.HalfCircle, image: "images/thumbnails/controls/halfCircle.svg", template: "PartialCircle", order: 3
                }, {
                    title: Controls.ThreeQuarterCircle, image: "images/thumbnails/controls/circle3qtr.svg", template: "PartialCircle", variant: "threequarterCircle", order: 4
                }, {
                    title: Controls.Triangle, image: "images/thumbnails/controls/equiTriangle.svg", template: "Triangle", order: 5
                }, {
                    title: Controls.RightTriangle, image: "images/thumbnails/controls/cornerTriangle.svg", template: "Triangle", variant: "rightAngled", order: 6
                }, {
                    title: Controls.Rectangle, image: "images/thumbnails/controls/rectangle.svg", template: "Rectangle", order: 7
                }, {
                    title: Controls.Pentagon, image: "images/thumbnails/controls/pentagon.svg", template: "Pentagon", order: 8
                }, {
                    title: Controls.Hexagon, image: "images/thumbnails/controls/hexagon.svg", template: "Hexagon", order: 9
                }, {
                    title: Controls.Octagon, image: "images/thumbnails/controls/octagon.svg", template: "Octagon", order: 10
                }, {
                    title: Controls.Point5Star, image: "images/thumbnails/controls/star5.svg", template: "Star", order: 11
                }, {
                    title: Controls.Point6Star, image: "images/thumbnails/controls/star6.svg", template: "Star", variant: "star6", order: 12
                }, {
                    title: Controls.Point8Star, image: "images/thumbnails/controls/star8.svg", template: "Star", variant: "star8", order: 13
                }, {
                    title: Controls.Point12Star, image: "images/thumbnails/controls/star12.svg", template: "Star", variant: "star12", order: 14
                }, {
                    title: Controls.BackArrow, image: "images/thumbnails/controls/backArrow.svg", template: "Arrow", variant: "backArrow", order: 15
                }, {
                    title: Controls.NextArrow, image: "images/thumbnails/controls/forwardArrow.svg", template: "Arrow", order: 16
                }, ];
            this._controls[Controls.Social] = [{
                    title: Controls.YammerPeopleByGroup, image: "images/thumbnails/controls/YammerPeople_80x40.svg", template: "yammerPeopleByGroup", order: 1, isComposite: !0, backgroundColor: "rgba(0, 114, 198, 1)", hoverColor: "rgba(0, 101, 176, 1)"
                }, {
                    title: Controls.YammerPostPhoto, image: "images/thumbnails/controls/YammerPostPhoto_80x40.svg", template: "yammerPostAPhoto", order: 2, isComposite: !0, backgroundColor: "rgba(0, 114, 198, 1)", hoverColor: "rgba(0, 101, 176, 1)"
                }, {
                    title: Controls.YammerPost, image: "images/thumbnails/controls/Post_80x40.svg", template: "yammerPostAMessage", order: 3, isComposite: !0, backgroundColor: "rgba(0, 114, 198, 1)", hoverColor: "rgba(0, 101, 176, 1)"
                }, {
                    title: Controls.FacebookAlbums, image: "images/thumbnails/controls/Albums_80x40.svg", template: "FacebookAlbums", order: 4, isComposite: !0, backgroundColor: "rgba(59, 89, 152, 1)", hoverColor: "rgba(48, 73, 126, 1)"
                }, {
                    title: Controls.FacebookFriends, image: "images/thumbnails/controls/Friends_80x40.svg", template: "FacebookFriends", order: 5, isComposite: !0, backgroundColor: "rgba(59, 89, 152, 1)", hoverColor: "rgba(48, 73, 126, 1)"
                }, {
                    title: Controls.FacebookPostAPhoto, image: "images/thumbnails/controls/PostPhoto_80x40.svg", template: "FacebookPostAPhoto", order: 6, isComposite: !0, backgroundColor: "rgba(59, 89, 152, 1)", hoverColor: "rgba(48, 73, 126, 1)"
                }, {
                    title: Controls.InstagramFeed, image: "images/thumbnails/controls/RSS_80x40.svg", template: "InstagramFeed", order: 7, isComposite: !0, backgroundColor: "rgba(60, 108, 146, 1)", hoverColor: "rgba(53, 96, 130, 1)"
                }, {
                    title: Controls.InstagramFollowing, image: "images/thumbnails/controls/InstagramFollowing_80x40.svg", template: "InstagramFollowing", order: 8, isComposite: !0, backgroundColor: "rgba(60, 108, 146, 1)", hoverColor: "rgba(53, 96, 130, 1)"
                }, {
                    title: Controls.InstagramSearchPeople, image: "images/thumbnails/controls/InstagramPeopleSearch_80x40.svg", template: "InstagramSearchPeople", order: 9, isComposite: !0, backgroundColor: "rgba(60, 108, 146, 1)", hoverColor: "rgba(53, 96, 130, 1)"
                }, {
                    title: Controls.InstagramMyLikes, image: "images/thumbnails/controls/InstagramLikes_80x40.svg", template: "InstagramMyLikes", order: 10, isComposite: !0, backgroundColor: "rgba(60, 108, 146, 1)", hoverColor: "rgba(53, 96, 130, 1)"
                }, {
                    title: Controls.TwitterFollowing, image: "images/thumbnails/controls/TwitterFollowing_80x40.svg", template: "TwitterFollowing", order: 11, isComposite: !0, backgroundColor: "rgba(85, 172, 238, 1)", hoverColor: "rgba(61, 160, 235, 1)"
                }, {
                    title: Controls.TwitterSearchPeople, image: "images/thumbnails/controls/TwitterPeopleSearch_80x40.svg", template: "TwitterSearchPeople", order: 12, isComposite: !0, backgroundColor: "rgba(85, 172, 238, 1)", hoverColor: "rgba(61, 160, 235, 1)"
                }, {
                    title: Controls.TwitterTweet, image: "images/thumbnails/controls/TwitterTweet_80x40.svg", template: "Tweet", order: 13, isComposite: !0, backgroundColor: "rgba(85, 172, 238, 1)", hoverColor: "rgba(61, 160, 235, 1)"
                }, ];
            this._controls[Controls.Web] = [{
                    title: Controls.BingImageSearch, image: "images/thumbnails/controls/ImageSearch_80x40.svg", template: "BingImageSearch", order: 1, isComposite: !0, backgroundColor: "rgba(255, 185, 0, 1)", hoverColor: "rgba(236, 177, 0, 1)"
                }, {
                    title: Controls.BingNewsSearch, image: "images/thumbnails/controls/BingNews_80x40.svg", template: "BingNewsSearch", order: 2, isComposite: !0, backgroundColor: "rgba(255, 185, 0, 1)", hoverColor: "rgba(236, 177, 0, 1)"
                }, {
                    title: Controls.BingWebSearch, image: "images/thumbnails/controls/Search_80x40.svg", template: "BingWebSearch", order: 3, isComposite: !0, backgroundColor: "rgba(255, 185, 0, 1)", hoverColor: "rgba(236, 177, 0, 1)"
                }, {
                    title: Controls.BingTranslator, image: "images/thumbnails/controls/BingTranslator_80x40.svg", template: "BingTranslator", order: 4, isComposite: !0, backgroundColor: "rgba(255, 185, 0, 1)", hoverColor: "rgba(236, 177, 0, 1)"
                }, {
                    title: Controls.BingVideoSearch, image: "images/thumbnails/controls/BingVideoSearch_80x40.svg", template: "BingVideoSearch", order: 5, isComposite: !0, backgroundColor: "rgba(255, 185, 0, 1)", hoverColor: "rgba(236, 177, 0, 1)"
                }, {
                    title: Controls.YouTubeplaylist, image: "images/thumbnails/controls/WatchPlaylist_80x40.svg", template: "YouTubePlaylist", order: 6, isComposite: !0, backgroundColor: "rgba(205, 32, 31, 1)", hoverColor: "rgba(175, 27, 27, 1)"
                }, {
                    title: Controls.YouTubeSearch, image: "images/thumbnails/controls/YoutubeVideoSearch_80x40.svg", template: "YouTubeSearch", order: 7, isComposite: !0, backgroundColor: "rgba(205, 32, 31, 1)", hoverColor: "rgba(175, 27, 27, 1)"
                }, {
                    title: Controls.YouTubeWatch, image: "images/thumbnails/controls/Watch_80x40.svg", template: "YouTubeWatch", order: 8, isComposite: !0, backgroundColor: "rgba(205, 32, 31, 1)", hoverColor: "rgba(175, 27, 27, 1)"
                }, ];
            this._controls[Controls.Education] = [{
                    title: Controls.CourseraSearch, image: "images/thumbnails/controls/YoutubeVideoSearch_80x40.svg", template: "CourseraSearch", order: 1, isComposite: !0, backgroundColor: "rgba(0, 104, 176, 1)", hoverColor: "rgba(4, 97, 147, 1)"
                }, {
                    title: Controls.CourseraPlaylist, image: "images/thumbnails/controls/WatchPlaylist_80x40.svg", template: "CourseraPlaylist", order: 2, isComposite: !0, backgroundColor: "rgba(0, 104, 176, 1)", hoverColor: "rgba(4, 97, 147, 1)"
                }, ];
            this._controls[Controls.Office365] = [{
                    title: Controls.O365Meetings, image: "images/thumbnails/controls/O365Meetings_80x40.svg", template: "o365Meetings", order: 1, isComposite: !0, backgroundColor: "rgba(220, 60, 0, 1)", hoverColor: "rgba(206, 56, 0, 1)"
                }, {
                    title: Controls.O365MeetingsCreate, image: "images/thumbnails/controls/O365MeetingsCreate_80x40.svg", template: "O365MeetingsCreate", order: 2, isComposite: !0, backgroundColor: "rgba(220, 60, 0, 1)", hoverColor: "rgba(206, 56, 0, 1)"
                }, {
                    title: Controls.O365Contacts, image: "images/thumbnails/controls/O365Contacts_80x40.svg", template: "o365Contacts", order: 3, isComposite: !0, backgroundColor: "rgba(220, 60, 0, 1)", hoverColor: "rgba(206, 56, 0, 1)"
                }, {
                    title: Controls.O365Mail, image: "images/thumbnails/controls/O365Mail_80x40.svg", template: "o365Mail", order: 4, isComposite: !0, backgroundColor: "rgba(220, 60, 0, 1)", hoverColor: "rgba(206, 56, 0, 1)"
                }, {
                    title: Controls.O365MailSend, image: "images/thumbnails/controls/O365MailSend_80x40.svg", template: "o365MailSend", order: 5, isComposite: !0, backgroundColor: "rgba(220, 60, 0, 1)", hoverColor: "rgba(206, 56, 0, 1)"
                }, {
                    title: Controls.O365MailMessage, image: "images/thumbnails/controls/O365MailMessage_80x40.svg", template: "o365MailMessage", order: 6, isComposite: !0, backgroundColor: "rgba(220, 60, 0, 1)", hoverColor: "rgba(206, 56, 0, 1)"
                }, ];
            for (var keys = Object.keys(this._controls), i = 0, len = keys.length; i < len; i++)
                this._controls[keys[i]].sort(ShellControlGalleryViewModel.sortFn)
        }, {
            _controls: null, _filterControls: function(key, text, filteredControlsStartMatch, filteredControlsNonStartMatch) {
                    for (var controls = this.getControls(key), i = 0, len = controls.length; i < len; i++) {
                        var control = controls[i];
                        if (!control.controlGroup) {
                            var title = control.title.toLowerCase(),
                                index = title.indexOf(text);
                            index === 0 ? filteredControlsStartMatch.push(control) : index > 0 && filteredControlsNonStartMatch.push(control)
                        }
                        else
                            this._filterControls(control.title, text, filteredControlsStartMatch, filteredControlsNonStartMatch)
                    }
                }, controls: {get: function() {
                        return this._controls
                    }}, getControls: function(key) {
                    return Contracts.checkArray(this._controls[key]), this._controls[key]
                }, getFilteredLeafControls: function(key, text) {
                    var filteredControlsStartMatch = [],
                        filteredControlsNonStartMatch = [];
                    return this._filterControls(key, text.toLowerCase(), filteredControlsStartMatch, filteredControlsNonStartMatch), filteredControlsStartMatch.sort(ShellControlGalleryViewModel.sortFn), filteredControlsNonStartMatch.sort(ShellControlGalleryViewModel.sortFn), filteredControlsStartMatch.concat(filteredControlsNonStartMatch)
                }
        }, {sortFn: function(a, b) {
                return a.order >= b.order ? 1 : -1
            }});
    WinJS.Namespace.define("AppMagic.AuthoringTool.ViewModels", {ShellControlGalleryViewModel: ShellControlGalleryViewModel})
})();