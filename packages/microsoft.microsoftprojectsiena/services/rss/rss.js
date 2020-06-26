//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var Channel = AppMagic.Services.Channel,
        pubDateTag = "pubDate",
        atomPublishedTag = "published",
        RSS_AUTH_NS = "http://purl.org/dc/elements/1.1/",
        DEFAULT_ATOM_NS = "http://www.w3.org/2005/Atom",
        createTag = function(ns, tag) {
            return typeof ns == "string" && ns !== "" ? ns + ":" + tag : tag
        },
        lookupPrefix = function(nsList, ns) {
            for (var keys = Object.keys(nsList), len = keys.length, i = 0; i < len; i++) {
                var prefix = keys[i];
                if (nsList[prefix] === ns)
                    return prefix
            }
            return ""
        },
        translateFeedRss = function(root) {
            var authNS = lookupPrefix(root.$ns, RSS_AUTH_NS),
                creatorTag = createTag(authNS, "creator"),
                items = root.channel.item;
            return (items instanceof Array || typeof items != "object" || (items = [items]), items instanceof Array) ? items.map(function(x) {
                    var title = x.title,
                        descr = x.description,
                        category = x.category,
                        published = x.pubDate,
                        authName = x.author || x[creatorTag],
                        link = x.link,
                        comments = x.comments,
                        source = x.source,
                        enclosure = x.enclosure,
                        categoryText = category instanceof Array ? category.map(function(cat) {
                            return cat.$text
                        }).join(";") : category ? category.$text : "";
                    var mapResult = {
                            link: link ? link.$text : "", comments: comments ? comments.$text : "", title: title ? title.$text : "", description: descr ? descr.$text : "", category: categoryText, author: authName ? authName.$text : "", source: source ? source.$text : "", enclosureUrl: enclosure && enclosure.$attributes && enclosure.$attributes.url ? enclosure.$attributes.url : "", enclosureType: enclosure && enclosure.$attributes && enclosure.$attributes.type ? enclosure.$attributes.type : ""
                        };
                    return mapResult[pubDateTag] = published ? Number(new Date(published.$text)) : null, mapResult
                }) : []
        },
        translateFeedAtom = function(root) {
            var atomNS = lookupPrefix(root.$ns, DEFAULT_ATOM_NS),
                entryTag = createTag(atomNS, "entry"),
                titleTag = createTag(atomNS, "title"),
                contentTag = createTag(atomNS, "content"),
                publishedTag = createTag(atomNS, "published"),
                authorTag = createTag(atomNS, "author"),
                authNameTag = createTag(atomNS, "name"),
                linkTag = createTag(atomNS, "link"),
                entries = root[entryTag];
            return (entries instanceof Array || typeof entries != "object" || (entries = [entries]), entries instanceof Array) ? entries.map(function(x) {
                    var title = x[titleTag],
                        content = x[contentTag],
                        published = x[publishedTag],
                        author = x[authorTag],
                        authName = author ? author[authNameTag] : null,
                        link = x[linkTag];
                    return {
                            title: title ? title.$text : "", content: content ? content.$text : "", published: published ? Number(new Date(published.$text)) : null, author: authName ? authName.$text : "", link: link && link.$attributes && link.$attributes.href ? link.$attributes.href : ""
                        }
                }) : []
        },
        processFeedCore = function(feed) {
            var rootName = feed.$name.toLowerCase();
            if (rootName === "rss")
                feed = translateFeedRss(feed);
            else if (rootName === "feed")
                feed = translateFeedAtom(feed);
            else
                return AppMagic.Services.Results.createError(AppMagic.Strings.ServiceErrorUnsupportedRss);
            for (var feedSet = AppMagic.Services.Results.createSet(feed), i = 0, len = feedSet.schema.length; i < len; i++)
                if (feedSet.schema[i].name === pubDateTag || feedSet.schema[i].name === atomPublishedTag) {
                    feedSet.schema[i].type = "d";
                    break
                }
            var schema = AppMagic.Schema.createSchemaForArrayFromPointer(feedSet.schema);
            return {
                    result: feedSet.items, schema: schema
                }
        },
        processFeed = function(resp) {
            var feed = AppMagic.Services.xml2json(resp);
            return feed
        },
        Rss = WinJS.Class.define(function Rss_ctor(){}, {
            _createFeedChannel: function(feedUri) {
                return new Channel(feedUri)
            }, configure: function(config) {
                    return !0
                }, _getFeed: function(feedUri) {
                    return this._createFeedChannel(feedUri).get().then(processFeed)
                }, queryFeed: function(state) {
                    var feedUri = state.url;
                    var feed = this._getFeed(feedUri);
                    return WinJS.Promise.as(feed).then(processFeedCore, AppMagic.Services.processError)
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Services", {
        Rss: Rss, _translateFeedRss: translateFeedRss, _processRssFeedCore: processFeedCore
    })
})();