

(function () {
    "use strict";

    
    var _ONE_DAY = 1000 * 60 * 60 * 24,
        JUSTNOW_THRESHOLD = 10 * 60 * 1000; 

    var _inTodayFormatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("hour minute");
    var _inThisYearFormatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter(
        Windows.Globalization.DateTimeFormatting.YearFormat.none,
        Windows.Globalization.DateTimeFormatting.MonthFormat.numeric,
        Windows.Globalization.DateTimeFormatting.DayFormat.default,
        Windows.Globalization.DateTimeFormatting.DayOfWeekFormat.none
    );
    var _inPreviousYearsFormatter = Windows.Globalization.DateTimeFormatting.DateTimeFormatter.shortDate;

    function formatHoursAndMins(hours, minutes) {
        
        
        
        
        

        
        var result = Skype.Globalization.formatNumericID("duration_hr", hours).translate(hours);
        if (minutes > 0) {
            result += " " + Skype.Globalization.formatNumericID("duration_min", minutes).translate(minutes);
        }

        return result;
    }

    var _dowFormat = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("dayofweek.full");
    var days = {
        today: WinJS.Resources.getString("date_today").value,
        yesterday: WinJS.Resources.getString("date_yesterday").value
    };
    var date = new Date();
    date.setTime(date.getTime() + _ONE_DAY * (7 - date.getDay()));
    for (var i = 0; i < 7; i++) {
        days["day" + i] = _dowFormat.format(date);
        date.setTime(date.getTime() + _ONE_DAY);
    }

    var htmlNewlineRegex = /<[/]?br[^>]*>/g;

    
    
    var trimThese = "(<\\/?br[^>]*>)|\\s";
    var lTrim = "^(" + trimThese + ")+";
    var rTrim = "(" + trimThese + ")+$";
    var htmlWhitespacesRegex = new RegExp("(" + lTrim + ")|(" + rTrim + ")", "g");

    WinJS.Namespace.define("Skype.Utilities", {
        days: days,
        dateAsHeaderString: function (date) {
            var midnight = new Date(); 
            midnight.setHours(23, 59, 59, 900);

            var daysFromNow = Math.floor((midnight.getTime() - date.getTime()) / _ONE_DAY);
            if (daysFromNow === 0) {
                return this.days["today"];
            } else if (daysFromNow == 1) {
                return this.days["yesterday"];
            } else if (daysFromNow < 7) {
                return this.days["day" + date.getDay()];
            } else if (midnight.getYear() == date.getYear()) {
                return _inThisYearFormatter.format(date);
            } else {
                return _inPreviousYearsFormatter.format(date);
            }
        },

        dateAsRecentConversationTime: function (date, libContactType) {
            var origin = "";
            if (libContactType && libContactType === LibWrap.Contact.type_PASSPORT) {
                origin = "_passport";
            }

            var now = new Date(Date.now());
            var nowMillis = now.valueOf();
            var isLessThanLimit = (nowMillis - date.valueOf()) < JUSTNOW_THRESHOLD;

            if (isLessThanLimit) {
                return "formattedtime_justnow{0}".format(origin).translate();
            }

            var midnight = new Date(Date.now());
            midnight.setHours(23, 59, 59, 900);
            var daysFromNow = Math.floor((midnight.getTime() - date.getTime()) / _ONE_DAY);

            var timePart = "";
            if (daysFromNow === 0) {
                timePart = _inTodayFormatter.format(date);
            } else if (daysFromNow < 7) {
                timePart = this.days["day" + date.getDay()];
            } else if (now.getYear() == date.getYear()) {
                timePart = _inThisYearFormatter.format(date);
            } else {
                timePart = _inPreviousYearsFormatter.format(date);
            }
            if (origin) {
                return "formattedtime_rest{0}".format(origin).translate(timePart);
            } else {
                return timePart;
            }
        },

        xml2Json: function (xmltext, includeXmlNode) {
            var doc = new Windows.Data.Xml.Dom.XmlDocument();
            try {
                doc.loadXml(xmltext);
            } catch(e) {
                log("xml2Json error! xml: {0}, message: {1}, stack: {2}".format(xmltext, e.message, e.stack));
                return {};
            }

            return Skype.Utilities.xmlElement2Json(doc, includeXmlNode);
        },
        xmlElement2Json: function (elm, includeXmlNode) {
            var obj = {};
            var items = elm.childNodes;
            var length = items.length;
            var i, item;

            for (i = 0; i < length; i++) {
                item = items[i];
                var name = item.tagName;
                var value = item.nodeValue;
                if (value) {
                    if (name) {
                        obj[name] = value;
                    } else {
                        if (length > 1) {
                            continue;
                        }
                        return value;
                    }
                } else {
                    var newObject;
                    if (includeXmlNode) {
                        var xml = item.getXml();
                        newObject = { item: Skype.Utilities.xmlElement2Json(item, includeXmlNode), xml: xml };
                    } else {
                        newObject = Skype.Utilities.xmlElement2Json(item, includeXmlNode);
                    }
                    if (obj[name]) {
                        if (!(obj[name] instanceof Array)) {
                            obj[name] = [obj[name]];
                        }
                        obj[name].push(newObject);
                    } else {
                        obj[name] = newObject;
                    }
                }
            }

            items = elm.attributes;
            if (items) {
                length = items.length;
                for (i = 0; i < length; i++) {
                    item = items[i];
                    obj[item.name] = item.value;
                }
            }

            return obj;

        },

        formatDuration: function (seconds, verbose) {
            var sec = seconds % 60;
            seconds = Math.floor(seconds / 60);
            var minutes = seconds % 60;
            seconds = Math.floor(seconds / 60);
            var hours = seconds;
            if (verbose) {
                if (hours > 0) {
                    return formatHoursAndMins(hours, minutes);
                } else if (minutes > 0) {
                    return Skype.Globalization.formatNumericID("duration_min", minutes).translate(minutes);
                } else {
                    return Skype.Globalization.formatNumericID("duration_sec", sec).translate(sec);
                }
            } else {
                var result = ("0" + minutes.toString()).slice(-2) + ":" + ("0" + sec.toString()).slice(-2);
                if (hours > 0) {
                    if (hours < 10) {
                        hours = "0" + hours;
                    }
                    result = hours + ":" + result;
                }
                return result;
            }
        },
        
        normalizeDurationForAria: function (duration) {
            if (duration.length === 5) {
                duration = "00:" + duration;
            }
            return duration;
        },

        trimHtmlWhitespaces: function (htmlSrc) {
            return htmlSrc.replace(htmlWhitespacesRegex, "");
        },
        
        trimHtmlNewlines: function (input, replaceStr) {
            return input.replace(htmlNewlineRegex, replaceStr || "");
        },

        cacheableProperty:  function (propertyName) {
            
            
            
            
            
            

            var getterFnName = "_get" + propertyName[0].toUpperCase() + propertyName.substr(1);
            var field = "_" + propertyName;
            return {
                get: function () {
                    return this[field] !== undefined ? this[field] : (this._isAlive ? this[field] = this[getterFnName]() : this[getterFnName]());
                },
                set: function (value) {
                    this[field] = value;
                }
            };
        },
        
        nondisposableProperty: function(defaultValue) {
            
            
            
            
            
            
            
            
            

            defaultValue = defaultValue || null;
            return {
                value: defaultValue,
                writable: true,
                skipDispose: true
            };
        },

        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        compareByLCaseName: function (item1, item2) {
            var lowercaseName1 = item1.name.toLowerCase();
            var lowercaseName2 = item2.name.toLowerCase();
            return lowercaseName1.localeCompare(lowercaseName2);
        },

        getHashCode: function (value) {
            var hash = 0;
            if (value.length == 0) {
                return hash;
            }
            for (i = 0; i < value.length; i++) {
                var sglChar = value.charCodeAt(i);
                hash = ((hash << 5) - hash) + sglChar;
                hash = hash & hash; 
            }
            
            return (hash + 1 + 0xFFFFFFFF).toString(16).toUpperCase();
        },


        subscribePropertyChanges: function (libObject, prop2handlerMap) {
            var handler;
            if (libObject instanceof LibWrap.Conversation || libObject.__className === "LibWrap.Conversation") {
                libObject.subscribePropChanges(Object.keys(prop2handlerMap));
                handler = Skype.Utilities._handlePropertyChange(prop2handlerMap, true);

                libObject.addEventListener("propertieschanged", handler);
                return {
                    map: prop2handlerMap,
                    dispose: function () {
                        if (libObject) {
                            libObject.removeEventListener("propertieschanged", handler);
                            Skype.Utilities._cleanupProp2HandlerMap(prop2handlerMap);
                            libObject = null;
                        }
                    }
                };
            } else {
                handler = Skype.Utilities._handlePropertyChange(prop2handlerMap, false);
                libObject.addEventListener("propertychange", handler);
                return {
                    map: prop2handlerMap,
                    dispose: function () {
                        if (libObject) {
                            libObject.removeEventListener("propertychange", handler);
                            libObject = null;
                            Skype.Utilities._cleanupProp2HandlerMap(prop2handlerMap);
                        }
                    }
                };
            }
        },
        isSameEventNotification: function(firstNotification, secondNotification) {
            return firstNotification
                && secondNotification
                && firstNotification.type === secondNotification.type
                && firstNotification.context === secondNotification.context
                && firstNotification.title === secondNotification.title
                && firstNotification.text === secondNotification.text
                && firstNotification.icon === secondNotification.icon;
        },
        _cleanupProp2HandlerMap: function (map) {
            for (var propName in map) {
                var handlers = map[propName];
                handlers && handlers.clear && handlers.clear();
                map[propName] = null;
            }
        },
        _handlePropertyChange: function (prop2handlerMap, isConversationObject) {
            function bulkPropertyHandler(e) {
                e = e.detail[0];
                var length = e.size;
                for (var i = 0; i < length; i++) {
                    var propertyId = e[i];
                    callPropertyHandlers(propertyId);
                }
            }

            function propertyHandler(e) {
                var propertyId = e.detail[0];
                callPropertyHandlers(propertyId);
            }

            function callPropertyHandlers(propertyId) {
                var propHandlers = prop2handlerMap[propertyId];
                if (propHandlers) {
                    for (var x = 0, length = propHandlers.length; x < length; x++) {
                        propHandlers[x]();
                    }
                }
            }

            return isConversationObject ? bulkPropertyHandler : propertyHandler;
        },

        extractFilePath: function (fileName) {
            return fileName.substring(0, fileName.lastIndexOf("\\"));
        },

        extractLastSubfolder: function (fileName) {
            var path = Skype.Utilities.extractFilePath(fileName);
            return path.substring(path.lastIndexOf("\\") + 1);
        },

        cleanUpFolder: function (rootPath) {
            return Windows.Storage.StorageFolder.getFolderFromPathAsync(rootPath)
            .then(function (rootFolder) {
                return rootFolder.deleteAsync();
            });
        },

        getEnumKeyName: function (enumObject, value) {
            for (var key in enumObject) {
                if (enumObject.hasOwnProperty(key)) {
                    if (enumObject[key] === value) {
                        return key;
                    }
                }
            }
        },

        

        escapeHTML: function (text) {
            var element =  document.createElement("div");
            element.textContent = text;
            return element.innerHTML;
        },

        unEscapeHTML: function (html) {
            var element = document.createElement("div");
            element.innerHTML = html;
            return element.textContent;
        },

        getGuid: function () {
            
            var r;
            var guid = "";
            for (var i = 0; i < 8; i++) {
                
                r = Math.floor(Math.random() * 65536); 

                if (i === 3) {
                    r = r & 0x0fff | 0x4000; 
                } else if (i === 4) {
                    r = r & 0x3fff | 0x8000; 
                }

                
                
                if (r < 16) {
                    guid += "000";
                } else if (r < 256) {
                    guid += "00";
                } else if (r < 4096) {
                    guid += "0";
                }

                guid += r.toString(16);

                if (i > 0 && i < 5) {
                    guid += '-';
                }
            }

            return guid;
        }
    });


}());
