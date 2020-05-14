/*  © Microsoft. All rights reserved. */
(function() {
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
classID: "WSJVideo", aspectRatioMin: 0, aspectRatioMax: 0, type: "News", templateList: ["WSJ_Medium_Video_1col_2row"]
}, WSJPhoto: {
classID: "WSJPhoto", aspectRatioMin: 0, aspectRatioMax: 0, type: "News", templateList: ["WSJ_Photos_Large_Landscape_2col_4row"]
}
}, TemplateDefinitions: {
WSJ_Large_Landscape_2col_4row: {
classID: "WSJ_Large_Landscape_2col_4row", thumbnailHeight: 350, thumbnailWidth: 590, height: 4, width: 2, minHeight: 610, lastResort: false
}, WSJ_None_2col_2row: {
classID: "WSJ_None_2col_2row", thumbnailHeight: 0, thumbnailWidth: 0, height: 2, width: 2, minHeight: 290, lastResort: false
}, WSJ_Small_Square_1col_2row: {
classID: "WSJ_Small_Square_1col_2row", thumbnailHeight: 100, thumbnailWidth: 100, height: 2, width: 1, minHeight: 290, lastResort: false
}, WSJ_None_1col_2row: {
classID: "WSJ_None_1col_2row", thumbnailHeight: 0, thumbnailWidth: 0, height: 2, width: 1, minHeight: 290, lastResort: true
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