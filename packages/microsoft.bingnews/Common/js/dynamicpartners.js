/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', {Version: 'latest'});
(function _NYTConfig_1() {
"use strict";
WinJS.Namespace.define("CommonJS.News.EntityClusterConfig.NYT", {
TemplateClassMap: {
NYTTallPortrait: {
classID: "NYTTallPortrait", aspectRatioMin: 0.8, aspectRatioMax: 0.9, type: "News", templateList: ["NYT_Medium_Portrait_1col_4row", "NYT_None_1col_2row"]
}, NYTTallLandscape: {
classID: "NYTTallLandscape", aspectRatioMin: 1.1, aspectRatioMax: 1.35, type: "News", templateList: ["NYT_Medium_Landscape_1col_4row", "NYT_None_1col_2row"]
}, NYTTallLandscapeWide: {
classID: "NYTTallLandscapeWide", aspectRatioMin: 1.35, aspectRatioMax: 1.65, type: "News", templateList: ["NYT_Medium_Landscape_Wide_1col_4row", "NYT_None_1col_2row"]
}, NYTTallSquare: {
classID: "NYTTallSquare", aspectRatioMin: 0.9, aspectRatioMax: 1.1, type: "News", templateList: ["NYT_Medium_Square_1col_4row", "NYT_None_1col_2row"]
}, NYTRegular: {
classID: "NYTRegular", aspectRatioMin: 0, aspectRatioMax: 0, type: "News", templateList: ["NYT_None_1col_2row"]
}, NYTRegularWithSmallThumbnail: {
classID: "NYTRegularWithSmallThumbnail", aspectRatioMin: 0, aspectRatioMax: 0, type: "News", templateList: ["NYT_Small_Square_1col_2row", "NYT_None_1col_2row"]
}, NYTRegularNoImage: {
classID: "NYTRegularNoImage", aspectRatioMin: 0, aspectRatioMax: 0, type: "News", templateList: ["NYT_None_1col_2row"]
}, NYTLead: {
classID: "NYTLead", aspectRatioMin: 1.33, aspectRatioMax: 1.6775, type: "News", templateList: ["NYT_Large_Landscape_2col_4row"]
}, NYTLeadNoImage: {
classID: "NYTLeadNoImage", aspectRatioMin: 0, aspectRatioMax: 0, type: "News", templateList: ["NYT_None_2col_2row"]
}, NYTBlog: {
classID: "NYTBlog", aspectRatioMin: 0, aspectRatioMax: 0, type: "News", templateList: ["NYT_Blog_Small_Square_1col_1row", "NYT_Blog_None_1col_1row"]
}, NYTVideo: {
classID: "NYTVideo", aspectRatioMin: 0, aspectRatioMax: 0, type: "Video", templateList: ["NYT_Large_Video_2col_4row", "NYT_Medium_Video_1col_2row"]
}, NYTPhoto: {
classID: "NYTPhoto", aspectRatioMin: 0, aspectRatioMax: 0, type: "News", templateList: ["NYT_Photos_Large_Landscape_2col_4row"]
}, NYTMostEmailed: {
classID: "NYTMostEmailed", aspectRatioMin: 0, aspectRatioMax: 0, type: "News", templateList: ["NYT_None_1col_2row"]
}, NYTTallPortraitPrimary: {
classID: "NYTTallPortraitPrimary", aspectRatioMin: 0.8, aspectRatioMax: 0.9, type: "News", templateList: ["NYT_Medium_Portrait_Primary_1col_4row", "NYT_None_1col_2row"]
}, NYTTallLandscapePrimary: {
classID: "NYTTallLandscapePrimary", aspectRatioMin: 1.1, aspectRatioMax: 1.35, type: "News", templateList: ["NYT_Medium_Landscape_Primary_1col_4row", "NYT_None_1col_2row"]
}, NYTTallLandscapeWidePrimary: {
classID: "NYTTallLandscapeWidePrimary", aspectRatioMin: 1.35, aspectRatioMax: 1.65, type: "News", templateList: ["NYT_Medium_Landscape_Wide_Primary_1col_4row", "NYT_None_1col_2row"]
}, NYTTallSquarePrimary: {
classID: "NYTTallSquarePrimary", aspectRatioMin: 0.9, aspectRatioMax: 1.1, type: "News", templateList: ["NYT_Medium_Square_Primary_1col_4row", "NYT_None_1col_2row"]
}
}, TemplateDefinitions: {
NYT_Large_Landscape_2col_4row: {
classID: "NYT_Large_Landscape_2col_4row", thumbnailHeight: 400, thumbnailWidth: 610, height: 4, width: 2, minHeight: 590, lastResort: false
}, NYT_None_2col_2row: {
classID: "NYT_None_2col_2row", thumbnailHeight: 0, thumbnailWidth: 0, height: 2, width: 2, minHeight: 290, lastResort: false, noThumbnail: true
}, NYT_Medium_Square_1col_4row: {
classID: "NYT_Medium_Square_1col_4row", thumbnailHeight: 300, thumbnailWidth: 300, height: 4, width: 1, minHeight: 590, lastResort: false
}, NYT_Medium_Landscape_1col_4row: {
classID: "NYT_Medium_Landscape_1col_4row", thumbnailHeight: 250, thumbnailWidth: 300, height: 4, width: 1, minHeight: 590, lastResort: false
}, NYT_Medium_Landscape_Wide_1col_4row: {
classID: "NYT_Medium_Landscape_Wide_1col_4row", thumbnailHeight: 205, thumbnailWidth: 300, height: 4, width: 1, minHeight: 590, lastResort: false
}, NYT_Medium_Portrait_1col_4row: {
classID: "NYT_Medium_Portrait_1col_4row", thumbnailHeight: 338, thumbnailWidth: 300, height: 4, width: 1, minHeight: 590, lastResort: false
}, NYT_Medium_Square_Primary_1col_4row: {
classID: "NYT_Medium_Square_Primary_1col_4row", thumbnailHeight: 300, thumbnailWidth: 300, height: 4, width: 1, minHeight: 590, lastResort: false
}, NYT_Medium_Landscape_Primary_1col_4row: {
classID: "NYT_Medium_Landscape_Primary_1col_4row", thumbnailHeight: 250, thumbnailWidth: 300, height: 4, width: 1, minHeight: 590, lastResort: false
}, NYT_Medium_Landscape_Wide_Primary_1col_4row: {
classID: "NYT_Medium_Landscape_Wide_Primary_1col_4row", thumbnailHeight: 205, thumbnailWidth: 300, height: 4, width: 1, minHeight: 590, lastResort: false
}, NYT_Medium_Portrait_Primary_1col_4row: {
classID: "NYT_Medium_Portrait_Primary_1col_4row", thumbnailHeight: 338, thumbnailWidth: 300, height: 4, width: 1, minHeight: 590, lastResort: false
}, NYT_Small_Square_1col_2row: {
classID: "NYT_Small_Square_1col_2row", thumbnailHeight: 100, thumbnailWidth: 100, height: 2, width: 1, minHeight: 290, lastResort: false
}, NYT_None_1col_2row: {
classID: "NYT_None_1col_2row", thumbnailHeight: 0, thumbnailWidth: 0, height: 2, width: 1, minHeight: 290, lastResort: true, noThumbnail: true
}, NYT_Blog_Small_Square_1col_1row: {
classID: "NYT_Blog_Small_Square_1col_1row", thumbnailHeight: 65, thumbnailWidth: 65, height: 1, width: 1, minHeight: 140, lastResort: false
}, NYT_Blog_None_1col_1row: {
classID: "NYT_Blog_None_1col_1row", thumbnailHeight: 0, thumbnailWidth: 0, height: 1, width: 1, minHeight: 140, lastResort: true, noThumbnail: true
}, NYT_MostEmailed_Small_Square_1col_2row: {
classID: "NYT_MostEmailed_Small_Square_1col_2row", thumbnailHeight: 100, thumbnailWidth: 100, height: 2, width: 1, minHeight: 290, lastResort: false
}, NYT_Large_Video_2col_4row: {
classID: "NYT_Large_Video_2col_4row", thumbnailHeight: 343, thumbnailWidth: 610, height: 4, width: 2, minHeight: 590, lastResort: false
}, NYT_Medium_Video_1col_2row: {
classID: "NYT_Medium_Video_1col_2row", thumbnailHeight: 168, thumbnailWidth: 300, height: 2, width: 1, minHeight: 290, lastResort: false
}, NYT_Photos_Large_Landscape_2col_4row: {
classID: "NYT_Photos_Large_Landscape_2col_4row", thumbnailHeight: 457, thumbnailWidth: 610, height: 4, width: 2, minHeight: 590, lastResort: true, isNonFlexible: true
}
}
})
})();
(function _WSJConfig_1() {
"use strict";
WinJS.Namespace.define("CommonJS.News.EntityClusterConfig.WSJ", {
TemplateClassMap: {
WSJRegular: {
classID: "WSJRegular", aspectRatioMin: 0, aspectRatioMax: 0, type: "News", templateList: ["WSJ_Small_Square_1col_2row", "WSJ_None_1col_2row"]
}, WSJLead: {
classID: "WSJLead", aspectRatioMin: 0, aspectRatioMax: 5, type: "News", templateList: ["WSJ_Large_Landscape_2col_4row", "WSJ_None_2col_2row"]
}, WSJLeadVideo: {
classID: "WSJLeadVideo", aspectRatioMin: 0, aspectRatioMax: 5, type: "News", templateList: ["WSJ_Large_Video_2col_4row", "WSJ_None_2col_2row"]
}, WSJVideo: {
classID: "WSJVideo", aspectRatioMin: 0, aspectRatioMax: 0, type: "Video", templateList: ["WSJ_Medium_Video_1col_2row"]
}, WSJPhoto: {
classID: "WSJPhoto", aspectRatioMin: 0, aspectRatioMax: 0, type: "News", templateList: ["WSJ_Photos_Large_Landscape_2col_4row"]
}
}, TemplateDefinitions: {
WSJ_Large_Landscape_2col_4row: {
classID: "WSJ_Large_Landscape_2col_4row", thumbnailHeight: 350, thumbnailWidth: 590, height: 4, width: 2, minHeight: 590, lastResort: false
}, WSJ_None_2col_2row: {
classID: "WSJ_None_2col_2row", thumbnailHeight: 0, thumbnailWidth: 0, height: 2, width: 2, minHeight: 290, lastResort: false, noThumbnail: true
}, WSJ_Small_Square_1col_2row: {
classID: "WSJ_Small_Square_1col_2row", thumbnailHeight: 100, thumbnailWidth: 100, height: 2, width: 1, minHeight: 290, lastResort: false
}, WSJ_None_1col_2row: {
classID: "WSJ_None_1col_2row", thumbnailHeight: 0, thumbnailWidth: 0, height: 2, width: 1, minHeight: 290, lastResort: true, noThumbnail: true
}, WSJ_Large_Video_2col_4row: {
classID: "WSJ_Large_Video_2col_4row", thumbnailHeight: 350, thumbnailWidth: 590, height: 4, width: 2, minHeight: 590, lastResort: false
}, WSJ_Medium_Video_1col_2row: {
classID: "WSJ_Medium_Video_1col_2row", thumbnailHeight: 157, thumbnailWidth: 280, height: 2, width: 1, minHeight: 290, lastResort: false
}, WSJ_Photos_Large_Landscape_2col_4row: {
classID: "WSJ_Photos_Large_Landscape_2col_4row", thumbnailHeight: 400, thumbnailWidth: 590, height: 4, width: 2, minHeight: 590, lastResort: true
}
}
})
})()