/*  © Microsoft. All rights reserved. */
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS", {
        TopEdgy: WinJS.Class.define(function () {
            this.initialize()
        }, {
            standardChannels: null, featuredChannels: null, snappedChannels: null, channelHome: null, channelMyTopics: null, channelSources: null, channelAPNews: null, channelNYT: null, initialize: function initialize() {
                var channelManager = PlatformJS.Navigation && PlatformJS.Navigation.mainNavigator && PlatformJS.Navigation.mainNavigator.channelManager;
                if (channelManager) {
                    this.standardChannels = channelManager.standardChannels;
                    this.featuredChannels = channelManager.featuredChannels;
                    this.snappedChannels = channelManager.snappedChannels;
                    var channelData;
                    var channelProperty;
                    if (this.standardChannels) {
                        for (channelProperty in this.standardChannels) {
                            channelData = this.standardChannels[channelProperty];
                            this._assign(channelData)
                        }
                    }
                    if (this.featuredChannels) {
                        for (channelProperty in this.featuredChannels) {
                            channelData = this.featuredChannels[channelProperty];
                            if (!channelData.toggleButtonColor) {
                                var color = PlatformJS.Services.appConfig.getDictionary("PartnerToggleButtonColor").getString(channelData.id);
                                channelData.toggleButtonColor = color
                            }
                            this._assign(channelData)
                        }
                    }
                }
            }, reload: function reload() {
                var featuredChannels = [];
                this._readConfig(PlatformJS.Services.manifest.featuredChannels, featuredChannels);
                var channelManager = PlatformJS.Navigation.mainNavigator.channelManager;
                var allFeaturedChannels = channelManager.featuredChannels;
                allFeaturedChannels.length = 0;
                for (var i = 0; i < featuredChannels.length; i++) {
                    allFeaturedChannels.push(featuredChannels[i])
                }
                channelManager.featuredChannelChanged = true;
                this.initialize();
                this.initializeNews();
                Platform.Configuration.ConfigurationManager.instance.hasPendingFeaturesConfigUpdate = true;
                channelManager.loadFeaturesConfigAsync(true)
            }, _readConfig: function _readConfig(channelsList, channelArray) {
                var i = 0;
                var channelConfig = null;
                for (i = 0; i < channelsList.size; i++) {
                    channelConfig = channelsList[i];
                    var channel = this._readChannel(channelConfig);
                    channelArray.push(channel)
                }
            }, _readChannel: function _readChannel(channelConfig) {
                var i = 0,
                    state = null,
                    title = null,
                    images = null;
                if (!channelConfig.id) {
                    PlatformJS.Utilities.onError("Invalid channel Id")
                }
                if (!channelConfig.title) {
                    PlatformJS.Utilities.onError("Invalid channel title")
                }
                if (!channelConfig.fragment) {
                    PlatformJS.Utilities.onError("Invalid channel fragment")
                }
                if (!channelConfig.page) {
                    PlatformJS.Utilities.onError("Invalid channel page object name")
                }
                var subChannels = [];
                for (i = 0; i < channelConfig.subChannels.size; i++) {
                    var subChannelConfig = channelConfig.subChannels[i];
                    var subChannel = this._readChannel(subChannelConfig);
                    subChannels.push(subChannel)
                }
                try {
                    state = channelConfig.state.length > 0 ? JSON.parse(channelConfig.state) : null
                }
                catch (e) {
                    PlatformJS.Utilities.onError(e)
                }
                try {
                    images = channelConfig.images && channelConfig.images.length > 0 ? JSON.parse(channelConfig.images) : null
                }
                catch (e) {
                    PlatformJS.Utilities.onError(e)
                }
                title = channelConfig.title;
                var channel = ({
                    id: channelConfig.id, visible: channelConfig.visible === "true", title: title, icon: channelConfig.icon, pressedIcon: channelConfig.pressedIcon, pageInfo: {
                        fragment: channelConfig.fragment, page: channelConfig.page, channelId: channelConfig.id
                    }, subChannels: subChannels, doubleWide: channelConfig.doubleWide, images: images, subTitle: channelConfig.subTitle, state: state
                });
                return channel
            }, _assign: function _assign(channelData) {
                switch (channelData.id) {
                    case "Home":
                        this.channelHome = channelData;
                        break;
                    case "MyTopics":
                        this.channelMyTopics = channelData;
                        break;
                    case "Sources":
                        this.channelSources = channelData;
                        break;
                    case "APNews":
                        this.channelAPNews = channelData;
                        break;
                    case "NYT":
                        this.channelNYT = channelData;
                        break
                }
            }, initializeNews: function initializeNews() {
                this.setupNewsMyTopics()
            }, setupNewsMyTopics: function setupNewsMyTopics() {
                if (this.channelMyTopics) {
                    this.channelMyTopics.subChannels = [];
                    if (NewsJS.StateHandler.instance.getTopics) {
                        var topics = NewsJS.StateHandler.instance.getTopics();
                        if (topics) {
                            for (var topicIndex = 0; topicIndex < topics.length; topicIndex++) {
                                var topic = topics[topicIndex];
                                if (topic && topic.query) {
                                    var id = "MyNews_" + topic.query;
                                    var newChannel = NewsJS.TopEdgy.createChannel(id, topic.query, "", [], "/html/search.html", "NewsJS.Search", {
                                        queryText: topic.query, searchOrigin: NewsJS.Telemetry.Search.Origin.navBar
                                    });
                                    this.channelMyTopics.subChannels.push(newChannel)
                                }
                            }
                        }
                    }
                    PlatformJS.Navigation.mainNavigator.channelManager.channelConfigChanged = true
                }
            }
        }, {
            createChannel: function createChannel(id, title, icon, subChannels, fragment, page, state) {
                return {
                    id: id, title: title, icon: icon, subChannels: subChannels, pageInfo: {
                        fragment: fragment, page: page, channelId: id
                    }, state: state, isDisplayValue: true
                }
            }, _instance: null, instance: {
                get: function get() {
                    if (!NewsJS.TopEdgy._instance) {
                        NewsJS.TopEdgy._instance = new NewsJS.TopEdgy
                    }
                    return NewsJS.TopEdgy._instance
                }
            }
        })
    })
})()