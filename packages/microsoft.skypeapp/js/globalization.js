

(function () {
    "use strict";
    
    
    
    var pluralRules = {
        group0: {
            
            
            
            
            languages: ["ja", "id", "ko", "tr-TR", "vi", "zh", "az", "ig", "fa", "ka", "km", "kn", "ms", "prs", "tt", "ug", "wo", "yo"],
            suffixFn: function (value) {          
                return (value == 1 ? PLURAL_SUFFIX_ONE : PLURAL_SUFFIX_FEW);
            }
        },
        group1: {
            
            
            
            languages: ["bg", "da", "de", "el", "en", "es", "et", "fi", "he", "hu", "it", "iw", "nl", "no", "pt-PT", "qps", "sv", "af", "as", "bn", "chr", "eu", "gl", "gu", "ha", "hy", "is", "kk", "kok", "ku", "ky", "lb", "mi", "ml", "mn", "mr", "ne", "nn", "or", "pa", "qut", "quz", "rw", "sd", "si", "sq", "sw", "ta", "te", "tk", "tn", "ur", "xh", "zu"],
            suffixFn: function (value) {
                return (value == 1 ? PLURAL_SUFFIX_ONE : PLURAL_SUFFIX_MANY);
            }
        },
        group2: {
            
            languages: ["fr", "pt-BR", "am", "fil", "hi", "nso", "tg", "ti", "uz"],
            suffixFn: function (value) {
                return (value > 1 ? PLURAL_SUFFIX_MANY : PLURAL_SUFFIX_ONE);
            }
        },
        group3: {
            
            languages: ["lv"],
            suffixFn: function (value) {
                return (value % 10 == 1 && value % 100 != 11 ? PLURAL_SUFFIX_ONE : (value == 0 ? PLURAL_SUFFIX_FEW : PLURAL_SUFFIX_MANY));
            },

        },
        group4: {
            
            languages: ["gd"],
            suffixFn: function (value) {
                return (value == 1 || value == 11 ? PLURAL_SUFFIX_ONE : ((value == 2 || value == 12) ? PLURAL_SUFFIX_FEW : PLURAL_SUFFIX_MANY));
            }
        },
        group5: {
            
            languages: ["ro"],
            suffixFn: function (value) {
                return (value == 1 ? PLURAL_SUFFIX_ONE : ((value == 0 || (value % 100 > 0 && value % 100 < 20)) ? PLURAL_SUFFIX_FEW : PLURAL_SUFFIX_MANY));
            },
        },
        group6: {
            
            languages: ["lt"],
            suffixFn: function (value) {
                return (value % 10 == 1 && value % 100 != 11 ? PLURAL_SUFFIX_ONE : (value % 10 >= 2 && (value % 100 < 10 || value % 100 >= 20) ? PLURAL_SUFFIX_MANY : PLURAL_SUFFIX_FEW));
            }
        },
        group7: {
            
            languages: ["ru", "uk", "hr", "sr", "be", "bs"],
            suffixFn: function (value) {
                return (value % 10 == 1 && value % 100 != 11 ? PLURAL_SUFFIX_ONE : (value % 10 >= 2 && value % 10 <= 4 && (value % 100 < 10 || value % 100 >= 20) ? PLURAL_SUFFIX_FEW : PLURAL_SUFFIX_MANY));
            }
        },
        group8: {
            
            languages: ["cs", "sk"],
            suffixFn: function (value) {
                return (value == 1 ? PLURAL_SUFFIX_ONE : ((value >= 2 && value <= 4) ? PLURAL_SUFFIX_FEW : PLURAL_SUFFIX_MANY));
            }
        },
        group9: {
            
            languages: ["pl"],
            suffixFn: function (value) {
                return (value == 1 ? PLURAL_SUFFIX_ONE : ((value % 10 >= 2 && value % 10 <= 4 && (value % 100 < 10 || value % 100 >= 20)) ? PLURAL_SUFFIX_FEW : PLURAL_SUFFIX_MANY));
            }
        },
        group10: {
            
            languages: ["sl"],
            suffixFn: function (value) {
                return (value % 100 == 1 ? PLURAL_SUFFIX_ONE : (value % 100 == 2 || value % 100 == 3 || value % 100 == 4) ? PLURAL_SUFFIX_FEW : PLURAL_SUFFIX_MANY);
            }
        },
        group11: {
            
            languages: ["ga"],
            suffixFn: function (value) {
                return (value == 1 ? PLURAL_SUFFIX_ONE : ((value >= 2 && value <= 10) ? PLURAL_SUFFIX_FEW : PLURAL_SUFFIX_MANY));
            }
        },
        group12: {
            
            languages: ["ar"],
            suffixFn: function (value) {
                return (value == 1 ? PLURAL_SUFFIX_ONE : (value == 2 ? PLURAL_SUFFIX_FEW : PLURAL_SUFFIX_MANY));
            }
        },
        group13: {
            
            languages: ["mt"],
            suffixFn: function (value) {
                return (value == 1 ? PLURAL_SUFFIX_ONE : (value == 0 || (value % 100 >= 1 && value % 100 <= 10) ? PLURAL_SUFFIX_FEW : PLURAL_SUFFIX_MANY));
            }
        },
        group14: {
            
            languages: ["mk"],
            suffixFn: function (value) {
                return (value % 10 == 1 ? PLURAL_SUFFIX_ONE : (value % 10 == 2 ? PLURAL_SUFFIX_FEW : PLURAL_SUFFIX_MANY));
            }
        },
        group17: {
            languages: ["cy"],
            
            suffixFn: function (value) {
                return (value == 1 ? PLURAL_SUFFIX_ONE : (value == 2 ? PLURAL_SUFFIX_FEW : PLURAL_SUFFIX_MANY));
            }
        }
    };

    var PLURAL_SUFFIX_ONE = '';
    var PLURAL_SUFFIX_ZERO = '.zero';
    var PLURAL_SUFFIX_FEW = '.few';
    var PLURAL_SUFFIX_MANY = '.many';

    function langTagExists(langList, langTag) {
        var langCount = langList.getCount();
        for (var i = 0; i < langCount ; i++) {
            if (langTag === langList.get(i)) {
                return true;
            }
        }

        return false;
    }

    function getTruncatedLangTag(langTag) {
        var hyphenPos = langTag.lastIndexOf("-"); 
        if (hyphenPos === -1) {
            return langTag;  
        } else {
            return langTag.substring(0, hyphenPos);
        }
    }

    function mapBcp47ToSkypeIsoLang(langtag) {
        var defaultSkypeIso = "en";

        var langList = new LibWrap.VectGIString();
        lib.getSupportedUILanguageList(langList);

        var tag = langtag.toLowerCase(); 

        
        if (tag === "nb") {
            tag = "no";
        } else if (tag === "bs") {
            tag = "bs-latn";
        }

        var truncatedTag;
        var found = false;
        do {
            found = langTagExists(langList, tag);
            if (!found) {
                truncatedTag = getTruncatedLangTag(tag);
                if (truncatedTag === tag) {
                    tag = defaultSkypeIso;
                    found = true;
                } else {
                    tag = truncatedTag;
                }
            }
        } while (!found);

        return tag;
    }

    function findPluralRule(locale) {
        for (var rule in pluralRules) {
            if (pluralRules[rule].languages.indexOf(locale) !== -1) {
                return rule;
            };
        }
        return null;
    }

    function getPluralRule(locale) {

        var tmpLocale = "",
            rule = null;

        do {
            
            rule = findPluralRule(locale);
            if (rule) {
                break;
            }
            tmpLocale = locale;
            locale = getTruncatedLangTag(locale);
            
        } while (tmpLocale !== locale);

        return rule;
    }

    function formatNumericId(identifier, value) {
        
        
        
        
        
        
        
        
        

        var language = Skype.Globalization.getCurrentLanguage(), 
            rule = Skype.Globalization.getPluralRule(language);

        if (!rule) { 
            log("No plural logic defined for locale " + language);
            return identifier;
        }

        if (value == 0) {
            var translated = WinJS.Resources.getString(identifier + PLURAL_SUFFIX_ZERO);
            if (!translated.empty) {
                return identifier + PLURAL_SUFFIX_ZERO;
            }
            
        }

        var suffixFunc = pluralRules[rule].suffixFn;
        if (!suffixFunc) {
            log("ASSERT: Check pluralRules and ruleTypesFunctions !");
            return identifier;
        }
        var suffix = suffixFunc(value);
        if (!(suffix == PLURAL_SUFFIX_ONE || suffix == PLURAL_SUFFIX_FEW || suffix == PLURAL_SUFFIX_MANY || suffix == PLURAL_SUFFIX_ZERO)) {
            log("ASSERT: Check ruleTypesFunctions !");
            return identifier;
        }

        return identifier + suffix;
    }

    var characterGroupings = new Windows.Globalization.Collation.CharacterGroupings();
    var groupingsToIndexMap = {
    };
    var characterEncodingsLength = characterGroupings.length;

    (function setupCharacterGroupings() {
        for (var i = 0; i < characterEncodingsLength; i++) {
            var label = characterGroupings[i].label;
            if (label && label !== '&' && label !== '0 – 9') {
                groupingsToIndexMap[label] = i;
            }
        }
        groupingsToIndexMap["#"] = i;
    })();

    function getCharacterGroupingsLetter(input) {
        
        
        
        
        
        
        
        
        

        var result = null;
        if (input && input.length > 0 && input.charAt(0) !== "'") {
            for (var i = 0; i < characterEncodingsLength; i++) {
                var biggerThanFromCharacter = input.localeCompare(characterGroupings[i].first) >= 0;
                var smallerThanNextFromCharacter = (i == characterEncodingsLength - 1 || input.localeCompare(characterGroupings[i + 1].first) < 0);

                if (biggerThanFromCharacter && smallerThanNextFromCharacter) {
                    result = characterGroupings[i].label;
                    break;
                }
            }
        }

        if (!result || result === '&' || result === '0 – 9') {
            result = "#";
        }

        return result;
    }

    function getCharacterGroupingsIndex(key) {
        
        
        
        
        
        
        
        
        

        return groupingsToIndexMap[key];
    }

    
    
    var globalization = WinJS.Class.define(null, null,
        {
            formatPrice: function (price, currencyCode, fractionDigits) { 
                var that = Skype.Globalization.formatPrice;
                that.formatters = that.formatters || {};

                that.formatters[currencyCode] = that.formatters[currencyCode] || new Windows.Globalization.NumberFormatting.CurrencyFormatter(currencyCode);
                if (!isNaN(fractionDigits)) {
                    that.formatters[currencyCode].fractionDigits = fractionDigits;
                }
                return that.formatters[currencyCode].format(price);
            },

            formatNumber: function (number, fractionDigits) { 
                var that = Skype.Globalization.formatNumber;
                that.decimalFormatter = that.decimalFormatter || new Windows.Globalization.NumberFormatting.DecimalFormatter();
                if (!isNaN(fractionDigits)) {
                    that.decimalFormatter.fractionDigits = fractionDigits;
                }
                return (Skype.Globalization.isRightToLeft()) ? "\u200E" + that.decimalFormatter.format(number) : that.decimalFormatter.format(number);
            },

            isRightToLeft: function (language) {
                if (arguments.length === 0) {
                    language = Skype.Globalization.getCurrentLanguage();
                }
                var rtlLanguages = ['ar', 'dv', 'fa', 'he', 'ku-Arab', 'pa-Arab', 'prs', 'ps', 'sd-Arab', 'syr', 'ug', 'ur', 'qps-plocm'];

                for (var i = 0; i < rtlLanguages.length; i++) {
                    if (language.startsWith(rtlLanguages[i])) {
                        return true;
                    }
                }
                return false;
            },

            getCurrentLanguage: function () {
                return Windows.Globalization.ApplicationLanguages.languages[0];
            },

            tryEastAsianFontOverride: function () {

                var languages = Windows.Globalization.ApplicationLanguages.languages, 
                    cssElement = document.getElementById("eastAsianFontOverride"), 
                    cssSeparator = ", ",
                    currentFontFallback = window.getComputedStyle(document.body).fontFamily.split(cssSeparator);

                
                if (cssElement) {
                    cssElement.parentElement.removeChild(cssElement);
                }

                
                
                

                var fontMapping = {
                    ChineseSimplified: { 
                        tags: ["zh-CN", "zh-Hans", "zh-SG"],
                        font: '"Microsoft YaHei UI"',
                        langPriority: null, 
                        fontPosition: null  
                    },
                    ChineseTraditional: {
                        tags: ["zh-HK", "zh-TW", "zh-Hant", "zh-MO"],
                        font: '"Microsoft JhengHei UI"',
                        langPriority: null,
                        fontPosition: null
                    },
                    Korean: {
                        tags: ["ko"],
                        font: '"Malgun Gothic"',
                        langPriority: null,
                        fontPosition: null
                    },
                    Japanese: {
                        tags: ["ja"],
                        font: '"Meiryo UI"',
                        langPriority: null,
                        fontPosition: null
                    }
                };

                
                function _getPriority(tags) {
                    for (var i = 0; i < languages.length; i++) {
                        for (var j = 0; j < tags.length; j++) {
                            if (languages[i].startsWith(tags[j])) {
                                return i; 
                            };
                        }
                    }
                    return -1;
                }

                
                var fontMap;

                for (fontMap in fontMapping) {
                    fontMapping[fontMap].langPriority = _getPriority(fontMapping[fontMap].tags);
                    fontMapping[fontMap].fontPosition = currentFontFallback.indexOf(fontMapping[fontMap].font);
                };

                
                var newOrder = [],
                    pivot = null,
                    langPriority,
                    fontPosition;

                for (fontMap in fontMapping) {
                    langPriority = fontMapping[fontMap].langPriority;
                    fontPosition = fontMapping[fontMap].fontPosition;

                    if (langPriority !== 0) { 
                        pivot = (pivot == null) ? fontPosition : (fontPosition < pivot) ? fontPosition : pivot;
                    }
                    if (langPriority > 0) { 
                        newOrder[langPriority] = fontMap;
                    }
                }

                
                newOrder = newOrder.filter(function (font) {
                    return font !== undefined;
                });

                
                if (newOrder.length == 0) {
                    return;
                }
                
                
                var newFonts = [];
                newOrder.forEach(function (key) {
                    newFonts.push(fontMapping[key].font); 
                    currentFontFallback.splice(fontMapping[key].fontPosition, 1); 
                });

                
                Array.prototype.splice.apply(currentFontFallback, [pivot, 0].concat(newFonts));

                
                var cssSelector = "body, .win-type-xx-large, .win-type-x-large, .win-type-large, .win-type-medium, .win-type-small, .win-type-x-small, .win-type-xx-small, input, textarea, .win-textarea, button, select, option ", 
                    cssRule = "";

                
                cssRule = "{ font-family: " + currentFontFallback.join(cssSeparator) + "}",
                cssElement = document.createElement("style");
                cssElement.type = "text/css";
                cssElement.id = "eastAsianFontOverride";
                WinJS.Utilities.setInnerHTMLUnsafe(cssElement, cssSelector + cssRule);

                
                document.head.appendChild(cssElement);
            },
            
            createBiDiString: function (text) {
                
                if (text) {
                    
                    text = text + (Skype.Globalization.isRightToLeft() ? "\u200E" : "\u200F");
                }
                return text;
            },

            createLocalizedList: function (items) {
                var list = "",
                    last = items.length - 1;
                for (var i = 0; i < last; i++) {
                    list += "comma_separated_item".translate(items[i]);
                }
                list += items[last];
                return list;
            },
            
            mapBCP47toSkypeIsoLang: mapBcp47ToSkypeIsoLang,
            getPluralRule: getPluralRule,
            formatNumericID: formatNumericId,

            getCharacterGroupingsLetter: getCharacterGroupingsLetter,
            getCharacterGroupingsIndex: getCharacterGroupingsIndex,
            characterGroupings: characterGroupings,
            DirectionControl: {
                leftToRightOverride: "\u202D",
                popDirectionalFormatting: "\u202C"
            }
        });

    WinJS.Namespace.define("Skype", {
        Globalization: globalization
    });
})();
