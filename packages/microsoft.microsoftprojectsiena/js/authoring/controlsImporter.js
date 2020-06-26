//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var templateNames = Microsoft.AppMagic.Authoring.TemplateNames,
        controlList = ["ctrllib\\barChart", "ctrllib\\pieChart", "ctrllib\\lineChart", "ctrllib\\audioPlayback", "ctrllib\\button", "ctrllib\\camera", "ctrllib\\checkbox", "ctrllib\\dropdown", "ctrllib\\export", "ctrllib\\gallery", "ctrllib\\group", "ctrllib\\image", "ctrllib\\import", "ctrllib\\inkControl", "ctrllib\\label", "ctrllib\\listbox", "ctrllib\\legend", "ctrllib\\microphone", "ctrllib\\radio", "ctrllib\\rating", "ctrllib\\shapes\\arrow", "ctrllib\\shapes\\circle", "ctrllib\\shapes\\partialCircle", "ctrllib\\shapes\\triangle", "ctrllib\\shapes\\rectangle", "ctrllib\\shapes\\pentagon", "ctrllib\\shapes\\hexagon", "ctrllib\\shapes\\octagon", "ctrllib\\shapes\\star", "ctrllib\\slider", "ctrllib\\sharepointUpdate", "ctrllib\\text", "ctrllib\\htmlViewer", "ctrllib\\timer", "ctrllib\\toggleSwitch", "ctrllib\\videoPlayback"],
        compositeControlList = [{
                folder: "ctrllib\\chartControls", file: "compositeColumnChart"
            }, {
                folder: "ctrllib\\chartControls", file: "compositePieChart"
            }, {
                folder: "ctrllib\\chartControls", file: "compositeLineChart"
            }, {
                folder: "ctrllib\\bingControls", file: "bingTranslator"
            }, {
                folder: "ctrllib\\bingControls", file: "bingWebSearch"
            }, {
                folder: "ctrllib\\bingControls", file: "bingImageSearch"
            }, {
                folder: "ctrllib\\bingControls", file: "bingNewsSearch"
            }, {
                folder: "ctrllib\\bingControls", file: "bingVideoSearch"
            }, {
                folder: "ctrllib\\facebookControls", file: "facebookAlbums"
            }, {
                folder: "ctrllib\\facebookControls", file: "facebookFriends"
            }, {
                folder: "ctrllib\\facebookControls", file: "FacebookPostAPhoto"
            }, {
                folder: "ctrllib\\youTubeControls", file: "YouTubePlaylist"
            }, {
                folder: "ctrllib\\youTubeControls", file: "youTubeSearch"
            }, {
                folder: "ctrllib\\youTubeControls", file: "youTubeWatch"
            }, {
                folder: "ctrllib\\instagramControls", file: "instagramFeed"
            }, {
                folder: "ctrllib\\instagramControls", file: "instagramFollowing"
            }, {
                folder: "ctrllib\\instagramControls", file: "instagramSearchPeople"
            }, {
                folder: "ctrllib\\instagramControls", file: "instagramMyLikes"
            }, {
                folder: "ctrllib\\twitterControls", file: "tweet"
            }, {
                folder: "ctrllib\\twitterControls", file: "twitterFollowing"
            }, {
                folder: "ctrllib\\twitterControls", file: "twitterSearchPeople"
            }, {
                folder: "ctrllib\\yammerControls", file: "yammerPeopleByGroup"
            }, {
                folder: "ctrllib\\yammerControls", file: "yammerPostAPhoto"
            }, {
                folder: "ctrllib\\yammerControls", file: "yammerPostAMessage"
            }, {
                folder: "ctrllib\\courseraControls", file: "courseraSearch"
            }, {
                folder: "ctrllib\\courseraControls", file: "courseraPlaylist"
            }, {
                folder: "ctrllib\\o365Controls", file: "o365Meetings"
            }, {
                folder: "ctrllib\\o365Controls", file: "o365MeetingsCreate"
            }, {
                folder: "ctrllib\\o365Controls", file: "o365Contacts"
            }, {
                folder: "ctrllib\\o365Controls", file: "o365Mail"
            }, {
                folder: "ctrllib\\o365Controls", file: "o365MailSend"
            }, {
                folder: "ctrllib\\o365Controls", file: "o365MailMessage"
            }, ],
        controlImportCompleted,
        controlImportPromise = new WinJS.Promise(function(comp) {
            controlImportCompleted = comp
        });
    WinJS.Namespace.define("AppMagic.Controls.Importer", {waitForControlImport: function() {
            return controlImportPromise
        }});
    var importControl = function(index, parentFolder) {
            if (index >= controlList.length) {
                importCompositeControl(0, parentFolder);
                return
            }
            var controlFolder = controlList[index];
            parentFolder.getFolderAsync(controlFolder).then(function(folder) {
                return Microsoft.AppMagic.Authoring.Importers.ControlImporter.import(folder.path)
            }, function(errorMessage) {
                importControl(index + 1, parentFolder)
            }).then(function(ctrlTemplate) {
                Microsoft.AppMagic.Authoring.DocumentFactory.templateStore.addTemplate(ctrlTemplate.name + "Template", ctrlTemplate);
                var nestedTemplateList = ctrlTemplate.nestedTemplates;
                if (nestedTemplateList && nestedTemplateList.size > 0)
                    for (var i = 0, len = nestedTemplateList.size; i < len; i++) {
                        var nestedTemplate = nestedTemplateList.getAt(i);
                        Microsoft.AppMagic.Authoring.DocumentFactory.templateStore.addTemplate(nestedTemplate.name + "Template", nestedTemplate)
                    }
                ctrlTemplate.dataControlTemplate && Microsoft.AppMagic.Authoring.DocumentFactory.templateStore.addTemplate(ctrlTemplate.dataControlTemplate.name + "Template", ctrlTemplate.dataControlTemplate);
                importControl(index + 1, parentFolder)
            })
        },
        importCompositeControl = function(index, parentFolder) {
            var importScreenTemplate = function() {
                    var screenTemplate = Microsoft.AppMagic.Authoring.ScreenTemplateFactory.create();
                    Microsoft.AppMagic.Authoring.DocumentFactory.templateStore.addTemplate(Microsoft.AppMagic.Authoring.TemplateNames.screenTemplateName, screenTemplate)
                };
            if (index >= compositeControlList.length) {
                importScreenTemplate();
                controlImportCompleted(!0);
                return
            }
            var compositeControl = compositeControlList[index],
                controlFolder = compositeControl.folder,
                fileName = compositeControl.file;
            parentFolder.getFolderAsync(controlFolder).then(function(folder) {
                return Microsoft.AppMagic.Authoring.Importers.ControlImporter.importCompositeControl(folder.path, fileName)
            }, function(errorMessage) {
                importCompositeControl(index + 1, parentFolder)
            }).then(function(ctrlTemplate) {
                Microsoft.AppMagic.Authoring.DocumentFactory.templateStore.addCompositeControlTemplate(ctrlTemplate.name + "Template", ctrlTemplate);
                importCompositeControl(index + 1, parentFolder)
            })
        };
    Microsoft.AppMagic.Authoring.Importers.CommonControlProperties.loadAsync("ctrllib", ["commonStyleProperties.xml"]).done(function(okay) {
        var appFolder = Windows.ApplicationModel.Package.current.installedLocation;
        importControl(0, appFolder)
    }, function(errorMessage){})
})();