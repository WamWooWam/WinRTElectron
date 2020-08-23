/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator();
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls.WebHostMessage");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls.WebHostMessage", {
        _webHostMessageFactories: {}, registerWebHostMessageFactory: function registerWebHostMessageFactory(taskId, factory) {
                MS.Entertainment.UI.Controls.WebHostMessage._webHostMessageFactories[taskId] = factory
            }, ParamType: {
                guid: /^(\{{0,1}([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}\}{0,1})$/g, boolean: /^true|false$/gi, integer: /^[-+]?[0-9]+$/g, string: /.+/g, uri: /^https:\/\//gi
            }, validateWebHostMessage: (function validateWebHostMessage(taskId, message) {
                var _taskWebHostMessages = [];
                return function validateWebHostMessage(taskId, message) {
                        if (!taskId)
                            throw"validateWebHostMessage: taskId parameter is mandatory";
                        if (!message)
                            throw"validateWebHostMessage: message parameter is mandatory";
                        var _webHostMessages = _taskWebHostMessages[taskId];
                        if (!_webHostMessages) {
                            var factory = MS.Entertainment.UI.Controls.WebHostMessage._webHostMessageFactories[taskId];
                            if (factory)
                                _webHostMessages = _taskWebHostMessages[taskId] = factory();
                            if (!_webHostMessages)
                                return false;
                            for (var name in _webHostMessages) {
                                var webHostMessage = _webHostMessages[name];
                                MS.Entertainment.UI.Controls.WebHostMessage.assert(webHostMessage.fields, "WebHostMessage definition: 'fields' field not specified");
                                for (var fieldName in webHostMessage.fields) {
                                    var field = webHostMessage.fields[fieldName];
                                    MS.Entertainment.UI.Controls.WebHostMessage.assert(typeof field.required === "boolean", "WebHostMessage definition: 'required' field not specified");
                                    MS.Entertainment.UI.Controls.WebHostMessage.assert(field.type, "WebHostMessage definition: 'type' field not specified")
                                }
                            }
                        }
                        webHostMessage = _webHostMessages[message.verb];
                        if (!webHostMessage)
                            return false;
                        for (name in webHostMessage.fields)
                            if (webHostMessage.fields[name].required && !message[name])
                                return false;
                        for (name in message) {
                            if (name === "verb")
                                continue;
                            if (!webHostMessage.fields[name])
                                return false;
                            webHostMessage.fields[name].type.lastIndex = 0;
                            if (!webHostMessage.fields[name].type.test(message[name]))
                                return false;
                            if (webHostMessage.fields[name].values)
                                if (webHostMessage.fields[name].values.indexOf(message[name]) === -1)
                                    return false
                        }
                        return true
                    }
            })()
    });
    MS.Entertainment.UI.Controls.WebHostMessage.registerWebHostMessageFactory(MS.Entertainment.UI.Controls.WebHost.TaskId.ACCOUNT, function() {
        var type = MS.Entertainment.UI.Controls.WebHostMessage.ParamType;
        return {
                CLOSE_DIALOG: {fields: {
                        reason: {
                            type: type.string, required: true, values: ["SUCCESS", "ERROR", "CANCEL", "REJECTION", ]
                        }, errorCode: {
                                type: type.string, required: false
                            }, info: {
                                type: type.string, required: false
                            }, header: {
                                type: type.string, required: true
                            }, url: {
                                type: type.string, required: false
                            }
                    }}, OPEN_DIALOG: {fields: {
                            reason: {
                                type: type.string, required: true, values: ["xblmembership", "redeemcode", "zunepass", ]
                            }, targetUrl: {
                                    type: type.string, required: true
                                }, header: {
                                    type: type.string, required: true
                                }, url: {
                                    type: type.string, required: false
                                }
                        }}, CURRENT_PAGE: {fields: {
                            uri: {
                                type: type.uri, required: true
                            }, header: {
                                    type: type.string, required: true
                                }, url: {
                                    type: type.string, required: false
                                }
                        }}, AUTH_REQUEST: {fields: {
                            domain: {
                                type: type.string, required: true, values: ["XBOX", "BILLING"]
                            }, header: {
                                    type: type.string, required: true
                                }, url: {
                                    type: type.string, required: false
                                }
                        }}, BEGIN_NAVIGATE: {fields: {
                            header: {
                                type: type.string, required: true
                            }, url: {
                                    type: type.string, required: false
                                }
                        }}, UPGRADE_MEMBERSHIP: {fields: {
                            message: {
                                type: type.string, required: false, values: ["UPGRADE_MEMBERSHIP"]
                            }, header: {
                                    type: type.string, required: true
                                }, url: {
                                    type: type.string, required: false
                                }
                        }}, MEMBERSHIP_UPGRADE_SUCESSFUL: {fields: {
                            message: {
                                type: type.string, required: false, values: ["MEMBERSHIP_UPGRADE_SUCESSFUL"]
                            }, header: {
                                    type: type.string, required: true
                                }, url: {
                                    type: type.string, required: false
                                }
                        }}, MEMBERSHIP_UPGRADE_NAVIGATE: {fields: {
                            reason: {
                                type: type.string, required: false, values: ["NEXT"]
                            }, header: {
                                    type: type.string, required: true
                                }, url: {
                                    type: type.string, required: false
                                }
                        }}, TOKEN_REDEMPTION_SUCCESSFUL: {fields: {
                            message: {
                                type: type.string, required: false, values: ["TOKEN_REDEMPTION_SUCCESSFUL"]
                            }, header: {
                                    type: type.string, required: true
                                }, url: {
                                    type: type.string, required: false
                                }
                        }}, NAVIGATION_ERROR: {fields: {
                            httpStatus: {
                                type: type.string, required: false
                            }, failureName: {
                                    type: type.string, required: false
                                }, failureUrl: {
                                    type: type.uri, required: false
                                }, header: {
                                    type: type.string, required: true
                                }, message: {
                                    type: type.string, required: true
                                }
                        }}, SIGNOUT_CLICKED: {fields: {
                            header: {
                                type: type.string, required: true
                            }, url: {
                                    type: type.string, required: false
                                }
                        }}, ready: {fields: {
                            flowId: {
                                type: type.guid, required: true
                            }, message: {
                                    type: type.string, required: true
                                }, version: {
                                    type: type.string, required: false
                                }
                        }}, busy: {fields: {
                            flowId: {
                                type: type.guid, required: true
                            }, message: {
                                    type: type.string, required: true
                                }, version: {
                                    type: type.string, required: false
                                }
                        }}, error: {fields: {
                            source: {
                                type: type.string, required: false
                            }, code: {
                                    type: type.string, required: false
                                }, description: {
                                    type: type.string, required: false
                                }, errorDetails: {
                                    type: type.string, required: false
                                }, flowId: {
                                    type: type.guid, required: true
                                }, message: {
                                    type: type.string, required: true
                                }, version: {
                                    type: type.string, required: false
                                }
                        }}, done: {fields: {
                            status: {
                                type: type.string, required: false
                            }, title: {
                                    type: type.string, required: false
                                }, price: {
                                    type: type.string, required: false
                                }, receipt: {
                                    type: type.string, required: false
                                }, flowId: {
                                    type: type.guid, required: true
                                }, message: {
                                    type: type.string, required: true
                                }, version: {
                                    type: type.string, required: false
                                }, offerId: {
                                    type: type.string, required: false
                                }, entitlementType: {
                                    type: type.string, required: false
                                }
                        }}, authRequest: {fields: {
                            relyingParty: {
                                type: type.string, required: false
                            }, flowId: {
                                    type: type.guid, required: true
                                }, message: {
                                    type: type.string, required: true
                                }, version: {
                                    type: type.string, required: false
                                }
                        }}
            }
    });
    MS.Entertainment.UI.Controls.WebHostMessage.registerWebHostMessageFactory(MS.Entertainment.UI.Controls.WebHost.TaskId.CREATEACCOUNT, function() {
        var type = MS.Entertainment.UI.Controls.WebHostMessage.ParamType;
        return {
                CLOSE_DIALOG: {fields: {
                        reason: {
                            type: type.string, required: true, values: ["SUCCESS", "ERROR", "CANCEL", "REJECTION", ]
                        }, errorCode: {
                                type: type.string, required: false
                            }, header: {
                                type: type.string, required: true
                            }, url: {
                                type: type.string, required: false
                            }
                    }}, CURRENT_PAGE: {fields: {
                            header: {
                                type: type.string, required: true
                            }, url: {
                                    type: type.string, required: false
                                }
                        }}, AUTH_REQUEST: {fields: {
                            domain: {
                                type: type.string, required: true, values: ["XBOX", "BILLING"]
                            }, header: {
                                    type: type.string, required: true
                                }, url: {
                                    type: type.string, required: false
                                }
                        }}, BEGIN_NAVIGATE: {fields: {
                            header: {
                                type: type.string, required: true
                            }, url: {
                                    type: type.string, required: false
                                }
                        }}, NAVIGATION_ERROR: {fields: {
                            httpStatus: {
                                type: type.string, required: false
                            }, failureName: {
                                    type: type.string, required: false
                                }, failureUrl: {
                                    type: type.uri, required: false
                                }, header: {
                                    type: type.string, required: true
                                }, message: {
                                    type: type.string, required: true
                                }
                        }}
            }
    });
    MS.Entertainment.UI.Controls.WebHostMessage.registerWebHostMessageFactory(MS.Entertainment.UI.Controls.WebHost.TaskId.MUSIC, function() {
        var type = MS.Entertainment.UI.Controls.WebHostMessage.ParamType;
        return {
                CLOSE_DIALOG: {fields: {
                        reason: {
                            type: type.string, required: true, values: ["SUCCESS", "ERROR", "CANCEL", "REJECTION"]
                        }, errorCode: {
                                type: type.string, required: false
                            }, info: {
                                type: type.string, required: false
                            }, header: {
                                type: type.string, required: true
                            }, url: {
                                type: type.string, required: false
                            }
                    }}, CURRENT_PAGE: {fields: {
                            uri: {
                                type: type.uri, required: true
                            }, header: {
                                    type: type.string, required: true
                                }, url: {
                                    type: type.string, required: false
                                }
                        }}, AUTH_REQUEST: {fields: {
                            domain: {
                                type: type.string, required: true, values: ["XBOX", "BILLING"]
                            }, header: {
                                    type: type.string, required: true
                                }, url: {
                                    type: type.string, required: false
                                }
                        }}, BEGIN_NAVIGATE: {fields: {
                            header: {
                                type: type.string, required: true
                            }, url: {
                                    type: type.string, required: false
                                }
                        }}, CONTENT_ADDED: {fields: {
                            offerIds: {
                                type: type.string, required: true
                            }, reason: {
                                    type: type.string, required: false, values: ["CONGRATS"]
                                }, header: {
                                    type: type.string, required: true
                                }, url: {
                                    type: type.string, required: false
                                }
                        }}, NAVIGATION_ERROR: {fields: {
                            httpStatus: {
                                type: type.string, required: false
                            }, failureName: {
                                    type: type.string, required: false
                                }, failureUrl: {
                                    type: type.uri, required: false
                                }, header: {
                                    type: type.string, required: true
                                }, message: {
                                    type: type.string, required: true
                                }
                        }}, ready: {fields: {
                            flowId: {
                                type: type.guid, required: true
                            }, message: {
                                    type: type.string, required: true
                                }, version: {
                                    type: type.string, required: false
                                }
                        }}, busy: {fields: {
                            flowId: {
                                type: type.guid, required: true
                            }, message: {
                                    type: type.string, required: true
                                }, version: {
                                    type: type.string, required: false
                                }
                        }}, error: {fields: {
                            source: {
                                type: type.string, required: false
                            }, code: {
                                    type: type.string, required: false
                                }, description: {
                                    type: type.string, required: false
                                }, errorDetails: {
                                    type: type.string, required: false
                                }, flowId: {
                                    type: type.guid, required: true
                                }, message: {
                                    type: type.string, required: true
                                }, version: {
                                    type: type.string, required: false
                                }
                        }}, done: {fields: {
                            status: {
                                type: type.string, required: false
                            }, title: {
                                    type: type.string, required: false
                                }, price: {
                                    type: type.string, required: false
                                }, receipt: {
                                    type: type.string, required: false
                                }, flowId: {
                                    type: type.guid, required: true
                                }, message: {
                                    type: type.string, required: true
                                }, version: {
                                    type: type.string, required: false
                                }
                        }}, authRequest: {fields: {
                            relyingParty: {
                                type: type.string, required: false
                            }, flowId: {
                                    type: type.guid, required: true
                                }, message: {
                                    type: type.string, required: true
                                }, version: {
                                    type: type.string, required: false
                                }
                        }}
            }
    });
    MS.Entertainment.UI.Controls.WebHostMessage.registerWebHostMessageFactory(MS.Entertainment.UI.Controls.WebHost.TaskId.SUBSCRIPTIONSIGNUP, function() {
        var type = MS.Entertainment.UI.Controls.WebHostMessage.ParamType;
        return {
                CLOSE_DIALOG: {fields: {
                        reason: {
                            type: type.string, required: true, values: ["SUCCESS", "ERROR", "CANCEL", "REJECTION"]
                        }, errorCode: {
                                type: type.string, required: false
                            }, info: {
                                type: type.string, required: false
                            }, header: {
                                type: type.string, required: true
                            }, url: {
                                type: type.string, required: false
                            }
                    }}, UPGRADE_MEMBERSHIP: {fields: {
                            message: {
                                type: type.string, required: false, values: ["UPGRADE_MEMBERSHIP"]
                            }, header: {
                                    type: type.string, required: true
                                }, url: {
                                    type: type.string, required: false
                                }
                        }}, MEMBERSHIP_UPGRADE_SUCESSFUL: {fields: {
                            message: {
                                type: type.string, required: false, values: ["MEMBERSHIP_UPGRADE_SUCESSFUL"]
                            }, header: {
                                    type: type.string, required: true
                                }, url: {
                                    type: type.string, required: false
                                }
                        }}, TOKEN_REDEMPTION_SUCCESSFUL: {fields: {
                            message: {
                                type: type.string, required: false, values: ["TOKEN_REDEMPTION_SUCCESSFUL"]
                            }, header: {
                                    type: type.string, required: true
                                }, url: {
                                    type: type.string, required: false
                                }
                        }}, CURRENT_PAGE: {fields: {
                            uri: {
                                type: type.uri, required: true
                            }, header: {
                                    type: type.string, required: true
                                }, url: {
                                    type: type.string, required: false
                                }
                        }}, AUTH_REQUEST: {fields: {
                            domain: {
                                type: type.string, required: true, values: ["XBOX", "BILLING"]
                            }, header: {
                                    type: type.string, required: true
                                }, url: {
                                    type: type.string, required: false
                                }
                        }}, BEGIN_NAVIGATE: {fields: {
                            header: {
                                type: type.string, required: true
                            }, url: {
                                    type: type.string, required: false
                                }
                        }}, NAVIGATION_ERROR: {fields: {
                            httpStatus: {
                                type: type.string, required: false
                            }, failureName: {
                                    type: type.string, required: false
                                }, failureUrl: {
                                    type: type.uri, required: false
                                }, header: {
                                    type: type.string, required: true
                                }, message: {
                                    type: type.string, required: true
                                }
                        }}
            }
    });
    MS.Entertainment.UI.Controls.WebHostMessage.registerWebHostMessageFactory(MS.Entertainment.UI.Controls.WebHost.TaskId.TOU, function() {
        var type = MS.Entertainment.UI.Controls.WebHostMessage.ParamType;
        return {
                CLOSE_DIALOG: {fields: {
                        reason: {
                            type: type.string, required: true, values: ["SUCCESS", "ERROR", "CANCEL", "REJECTION", ]
                        }, errorCode: {
                                type: type.string, required: false
                            }, info: {
                                type: type.string, required: false
                            }, header: {
                                type: type.string, required: true
                            }, url: {
                                type: type.string, required: false
                            }
                    }}, CURRENT_PAGE: {fields: {
                            uri: {
                                type: type.uri, required: true
                            }, header: {
                                    type: type.string, required: true
                                }, url: {
                                    type: type.string, required: false
                                }
                        }}, AUTH_REQUEST: {fields: {
                            domain: {
                                type: type.string, required: true, values: ["XBOX", "BILLING"]
                            }, header: {
                                    type: type.string, required: true
                                }, url: {
                                    type: type.string, required: false
                                }
                        }}, BEGIN_NAVIGATE: {fields: {
                            header: {
                                type: type.string, required: true
                            }, url: {
                                    type: type.string, required: false
                                }
                        }}, NAVIGATION_ERROR: {fields: {
                            httpStatus: {
                                type: type.string, required: false
                            }, failureName: {
                                    type: type.string, required: false
                                }, failureUrl: {
                                    type: type.uri, required: false
                                }, header: {
                                    type: type.string, required: true
                                }, message: {
                                    type: type.string, required: true
                                }
                        }}, ready: {fields: {
                            flowId: {
                                type: type.guid, required: true
                            }, message: {
                                    type: type.string, required: true
                                }, version: {
                                    type: type.string, required: false
                                }
                        }}, busy: {fields: {
                            flowId: {
                                type: type.guid, required: true
                            }, message: {
                                    type: type.string, required: true
                                }, version: {
                                    type: type.string, required: false
                                }
                        }}, error: {fields: {
                            source: {
                                type: type.string, required: false
                            }, code: {
                                    type: type.string, required: false
                                }, description: {
                                    type: type.string, required: false
                                }, errorDetails: {
                                    type: type.string, required: false
                                }, flowId: {
                                    type: type.guid, required: true
                                }, message: {
                                    type: type.string, required: true
                                }, version: {
                                    type: type.string, required: false
                                }
                        }}, done: {fields: {
                            status: {
                                type: type.string, required: false
                            }, title: {
                                    type: type.string, required: false
                                }, price: {
                                    type: type.string, required: false
                                }, receipt: {
                                    type: type.string, required: false
                                }, flowId: {
                                    type: type.guid, required: true
                                }, message: {
                                    type: type.string, required: true
                                }, version: {
                                    type: type.string, required: false
                                }
                        }}, authRequest: {fields: {
                            relyingParty: {
                                type: type.string, required: false
                            }, flowId: {
                                    type: type.guid, required: true
                                }, message: {
                                    type: type.string, required: true
                                }, version: {
                                    type: type.string, required: false
                                }
                        }}
            }
    });
    MS.Entertainment.UI.Controls.WebHostMessage.registerWebHostMessageFactory(MS.Entertainment.UI.Controls.WebHost.TaskId.VIDEO, function() {
        var type = MS.Entertainment.UI.Controls.WebHostMessage.ParamType;
        return {
                CLOSE_DIALOG: {fields: {
                        reason: {
                            type: type.string, required: true, values: ["SUCCESS", "ERROR", "CANCEL", "REJECTION"]
                        }, errorCode: {
                                type: type.string, required: false
                            }, info: {
                                type: type.string, required: false
                            }, offerIds: {
                                type: type.string, required: false
                            }, option: {
                                type: type.string, required: false, values: ["PC_STREAM", "PC_DOWNLOAD_NOW"]
                            }, header: {
                                type: type.string, required: true
                            }, url: {
                                type: type.string, required: false
                            }
                    }}, CURRENT_PAGE: {fields: {
                            uri: {
                                type: type.uri, required: true
                            }, header: {
                                    type: type.string, required: true
                                }, url: {
                                    type: type.string, required: false
                                }
                        }}, AUTH_REQUEST: {fields: {
                            domain: {
                                type: type.string, required: true, values: ["XBOX", "BILLING"]
                            }, header: {
                                    type: type.string, required: true
                                }, url: {
                                    type: type.string, required: false
                                }
                        }}, BEGIN_NAVIGATE: {fields: {
                            header: {
                                type: type.string, required: true
                            }, url: {
                                    type: type.string, required: false
                                }
                        }}, CONTENT_ADDED: {fields: {
                            offerIds: {
                                type: type.string, required: true
                            }, header: {
                                    type: type.string, required: true
                                }, url: {
                                    type: type.string, required: false
                                }
                        }}, BANDWIDTH_CHECK: {fields: {
                            header: {
                                type: type.string, required: true
                            }, url: {
                                    type: type.string, required: false
                                }
                        }}, NAVIGATION_ERROR: {fields: {
                            httpStatus: {
                                type: type.string, required: false
                            }, failureName: {
                                    type: type.string, required: false
                                }, failureUrl: {
                                    type: type.uri, required: false
                                }, header: {
                                    type: type.string, required: true
                                }, message: {
                                    type: type.string, required: true
                                }
                        }}, ready: {fields: {
                            flowId: {
                                type: type.guid, required: true
                            }, message: {
                                    type: type.string, required: true
                                }, version: {
                                    type: type.string, required: false
                                }
                        }}, busy: {fields: {
                            flowId: {
                                type: type.guid, required: true
                            }, message: {
                                    type: type.string, required: true
                                }, version: {
                                    type: type.string, required: false
                                }
                        }}, error: {fields: {
                            source: {
                                type: type.string, required: false
                            }, code: {
                                    type: type.string, required: false
                                }, description: {
                                    type: type.string, required: false
                                }, errorDetails: {
                                    type: type.string, required: false
                                }, flowId: {
                                    type: type.guid, required: true
                                }, message: {
                                    type: type.string, required: true
                                }, version: {
                                    type: type.string, required: false
                                }
                        }}, done: {fields: {
                            status: {
                                type: type.string, required: false
                            }, title: {
                                    type: type.string, required: false
                                }, price: {
                                    type: type.string, required: false
                                }, receipt: {
                                    type: type.string, required: false
                                }, flowId: {
                                    type: type.guid, required: true
                                }, message: {
                                    type: type.string, required: true
                                }, version: {
                                    type: type.string, required: false
                                }
                        }}, authRequest: {fields: {
                            relyingParty: {
                                type: type.string, required: false
                            }, flowId: {
                                    type: type.guid, required: true
                                }, message: {
                                    type: type.string, required: true
                                }, version: {
                                    type: type.string, required: false
                                }
                        }}
            }
    })
})()
