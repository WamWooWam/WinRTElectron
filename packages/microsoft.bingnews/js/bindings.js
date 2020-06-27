/*  © Microsoft. All rights reserved. */
(function () {
    "use strict";
    function updateArticleTimes(newsArticle) {
        if (newsArticle.published) {
            var utcTime1 = newsArticle.published.utctime;
            var time1 = CommonJS.Utils.convertBDITimeToFriendlyTime(utcTime1);
            newsArticle.publishTime = time1 && time1.indexOf("NaN") < 0 ? time1 : ""
        }
        else {
            newsArticle.publishTime = ""
        }
        if (newsArticle.updated) {
            var utcTime2 = newsArticle.updated.utctime;
            var time2 = CommonJS.Utils.convertBDITimeToFriendlyTime(utcTime2);
            newsArticle.updatedTime = time2 && time2.indexOf("NaN") < 0 ? time2 : ""
        }
        else {
            newsArticle.updatedTime = ""
        }
    }
    function convertCMSArticle(entity, options) {
        var convertedArticle = CommonJS.Utils.convertCMSArticle(entity, null, options);
        if (entity && entity.content && entity.content.publicationDate && convertedArticle) {
            convertedArticle.published = entity.content.publicationDate.published;
            convertedArticle.updated = entity.content.publicationDate.updated
        }
        return convertedArticle
    }
    function rssFeedTile(tileName, onclick) {
        var binding = {
            title: tileName, onclick: onclick, moduleInfo: {
                height: "90px", width: "260px", fragmentPath: "/html/templates.html", templateId: "rssFeedTile"
            }
        };
        return binding
    }
    function semanticZoomTile(clusterTitle) {
        var binding = {
            clusterTitle: clusterTitle, moduleInfo: {
                fragmentPath: "/html/templates.html", templateId: "semanticZoomTile", width: "250px", height: "80px"
            }
        };
        return binding
    }
    function commonStoryTile(article) {
        var binding = {
            article: article, title: NewsJS.Utilities.fixupBidiPunctuation(article.title), snippet: article.snippet, imageUrl: article.thumbnail ? article.thumbnail.url : "", backgroundImageUrl: article.thumbnail ? "url('" + article.thumbnail.url + "')" : "", favIconUrl: article.sourceImageUrl, subtitle: article.publishTime ? article.source + " · " + article.publishTime : article.source
        };
        return binding
    }
    function snappedTitleTile(title) {
        var binding = {
            title: title, moduleInfo: {
                fragmentPath: "/html/templates.html", templateId: "snappedTitleTile"
            }
        };
        return binding
    }
    function snappedStoryTile(article) {
        var binding = commonStoryTile(article);
        binding.source = article.source;
        binding.image = {
            url: binding.imageUrl, cacheId: "PlatformImageCache"
        };
        var landscape = true;
        if (article.thumbnail && article.thumbnail.width && article.thumbnail.height) {
            if (article.thumbnail.height > article.thumbnail.width) {
                landscape = false
            }
        }
        binding.publishTime = article.publishTime ? article.publishTime : "";
        var articleWithoutContent = article.editorial && !article.destination;
        var hasImage = (article.thumbnail && article.thumbnail.url) ? true : false;
        binding.moduleInfo = {
            fragmentPath: "/html/templates.html", className: (landscape ? "snappedStoryTileLandscapeImage" : "snappedStoryTilePortraitImage") + (articleWithoutContent ? " win-interactive" : ""), templateId: hasImage ? "snappedStoryTile" : "snappedStoryTileNoImage"
        };
        return binding
    }
    function developingNewsTile(article) {
        var binding = convertCMSArticle(article, null);
        binding.moduleInfo = {
            fragmentPath: "/html/templates.html", className: "developingNewsTileLandscapeImage", templateId: "developingNewsTile"
        };
        return binding
    }
    function snappedSourceTile(source) {
        var binding = {
            data: source, moduleInfo: {
                fragmentPath: "/html/templates.html", templateId: "snappedSourceItemTemplate"
            }
        };
        return binding
    }
    function sourceImageDisplayConverter(sourceImageUrl) {
        return (sourceImageUrl && sourceImageUrl.length > 0) ? "block" : "none"
    }
    function sourceImageCard(url) {
        return {
            url: url, cacheId: "Sources", imageTag: url
        }
    }
    function todayHeroEditorialTile(article) {
        var imageUrl = article.images ? article.images[0].url : "";
        var binding = {
            article: article, title: article.title, imageUrl: imageUrl, backgroundImageUrl: "url('" + imageUrl + "')", subtitle: article.source + " · " + article.publishTime, moduleInfo: {
                height: "470px", width: "470px", fragmentPath: "/html/templates.html", templateId: "todayHeroTile"
            }
        };
        return binding
    }
    function addTopicCardTile() {
        var binding = {
            title: PlatformJS.Services.resourceLoader.getString("AddTopic"), type: "favorite", imageGlyphText: "\uE109", moduleInfo: {
                height: "270px", width: "280px", fragmentPath: "/html/templates.html", templateId: "addTopicCardTile", isInteractive: false
            }
        };
        return binding
    }
    function clusterColorMapper(bindingElement, dstElement) {
        var className;
        var bindingElementType = bindingElement ? bindingElement.type : "";
        if (bindingElementType === "favorite") {
            className = "favoriteTopic"
        }
        else if (bindingElementType === "search") {
            className = "searchTopic"
        }
        else if (bindingElementType === "addTopic") {
            className = "addTopic"
        }
        else {
            className = "defaultTopic"
        }
        WinJS.Utilities.addClass(dstElement, className)
    }
    function clusterHeadingTopicTile(topic, type, onopen, ondelete) {
        var binding = {
            template: "clusterHeadingTopicTile", query: topic, title: topic, item: binding, type: type, open: onopen, del: ondelete, glyph: WinJS.UI.AppBarIcon["cancel"], invokeBehavior: "Search", moduleInfo: {
                height: "90px", width: "260px", fragmentPath: "/html/templates.html", templateId: "clusterHeadingTopicTile", isInteractive: false
            }
        };
        return binding
    }
    function semanticZoomSourceTile(sourceDisplayName) {
        var binding = {
            template: "homeSemanticTileNoImage", title: sourceDisplayName, moduleInfo: {
                height: "140px", width: "290px", fragmentPath: "/html/templates.html", templateId: "homeSemanticTileNoImage", isInteractive: false
            }
        };
        return binding
    }
    function semanticZoomTopicTile(topic, type) {
        var binding = {
            template: "topicSemanticZoomTile", query: topic, title: topic, type: type, imageGlyphText: type === "addTopic" ? "\uE109" : "", invokeBehavior: "Search", moduleInfo: {
                height: "140px", width: "290px", fragmentPath: "/html/templates.html", templateId: "topicSemanticZoomTile", isInteractive: false
            }
        };
        return binding
    }
    function noResultsTile(message1, message2, glyph) {
        var binding = {
            sentinel: true, message1: message1, message2: message2, imageGlyphText: glyph, moduleInfo: {
                fragmentPath: "/html/templates.html", templateId: "noResultsAlert"
            }
        };
        return binding
    }
    WinJS.Namespace.define("NewsJS.Bindings", {
        noResultsTile: noResultsTile, rssFeedTile: rssFeedTile, snappedTitleTile: snappedTitleTile, snappedStoryTile: snappedStoryTile, developingNewsTile: developingNewsTile, snappedSourceTile: snappedSourceTile, sourceImageDisplayConverter: WinJS.Binding.converter(sourceImageDisplayConverter), sourceImageCard: WinJS.Binding.converter(sourceImageCard), semanticZoomTile: semanticZoomTile, addTopicCardTile: addTopicCardTile, todayHeroEditorialTile: todayHeroEditorialTile, convertCMSArticle: convertCMSArticle, clusterHeadingTopicTile: clusterHeadingTopicTile, clusterColorMapper: clusterColorMapper, semanticZoomTopicTile: semanticZoomTopicTile, semanticZoomSourceTile: semanticZoomSourceTile, updateArticleTimes: updateArticleTimes, resolveDestination: CommonJS.Utils.resolveDestination
    })
})()