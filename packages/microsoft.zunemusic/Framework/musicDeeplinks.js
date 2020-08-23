/* Copyright (C) Microsoft Corporation. All rights reserved. */
if (!MS.Entertainment.UI.DeepLink.isRegistered(Microsoft.Entertainment.Application.AppMode.music))
    MS.Entertainment.UI.DeepLink.registerDeepLinksFactory(Microsoft.Entertainment.Application.AppMode.music, function() {
        var type = MS.Entertainment.UI.DeepLink.ParamType;
        return {
                location: {
                    actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkLocation, params: {
                            id: {
                                type: type.identifier, required: true, values: [MS.Entertainment.UI.Monikers.homeHub, MS.Entertainment.UI.Monikers.musicMarketplaceFeatured, ]
                            }, gamerTag: {
                                    type: type.stringFormat, required: false
                                }
                        }
                }, details: {
                        actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkDetails, params: {
                                id: {
                                    type: type.guid, required: true
                                }, dialogOnly: {
                                        type: type.boolean, required: false
                                    }, origin: {
                                        type: type.identifier, required: false, values: ["music"], caseInsensitive: true
                                    }, desiredMediaItemType: {
                                        type: type.identifier, required: false, values: [MS.Entertainment.Data.Query.edsMediaType.album, MS.Entertainment.Data.Query.edsMediaType.musicArtist, MS.Entertainment.Data.Query.edsMediaType.track], caseInsensitive: true
                                    }, idType: {
                                        type: type.identifier, required: false, values: [MS.Entertainment.Data.Query.edsIdType.canonical, MS.Entertainment.Data.Query.edsIdType.zuneCatalog, ], caseInsensitive: true
                                    }
                            }
                    }, play: {
                        actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkPlay, params: {
                                id: {
                                    type: type.guid, required: true
                                }, startIndex: {
                                        type: type.unsigned_integer, required: false
                                    }, desiredMediaItemType: {
                                        type: type.identifier, required: false, values: [MS.Entertainment.Data.Query.edsMediaType.album, MS.Entertainment.Data.Query.edsMediaType.musicArtist, MS.Entertainment.Data.Query.edsMediaType.track], caseInsensitive: true
                                    }, idType: {
                                        type: type.identifier, required: false, values: [MS.Entertainment.Data.Query.edsIdType.canonical, MS.Entertainment.Data.Query.edsIdType.zuneCatalog, ], caseInsensitive: true
                                    }, gamerTag: {
                                        type: type.stringFormat, required: false
                                    }
                            }
                    }, playPin: {
                        actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkPlayPin, params: {
                                id: {
                                    type: type.stringFormat, required: true
                                }, idType: {
                                        type: type.identifier, required: false, values: [MS.Entertainment.Data.Query.edsIdType.canonical, MS.Entertainment.Data.Query.edsIdType.zuneCatalog, ], caseInsensitive: true
                                    }, mediaType: {
                                        type: type.integer, required: true, values: [Microsoft.Entertainment.Queries.ObjectType.track, Microsoft.Entertainment.Queries.ObjectType.album, Microsoft.Entertainment.Queries.ObjectType.person, Microsoft.Entertainment.Queries.ObjectType.playlist, Microsoft.Entertainment.Queries.ObjectType.smartDJ, ]
                                    }
                            }
                    }, showPerfTrackLog: {
                        actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkShowPerfTrackLog, params: {enable: {
                                    type: type.boolean, required: true
                                }}
                    }, configureMemoryLeakTracking: {
                        actionId: MS.Entertainment.UI.Actions.ActionIdentifiers.deepLinkConfigureMemoryLeakTracking, params: {enable: {
                                    type: type.boolean, required: true
                                }}
                    }
            }
    })
