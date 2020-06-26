//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var trueKeyword = translateToLocaleSpecific("true"),
        falseKeyword = translateToLocaleSpecific("false");
    function translateToLocaleSpecific(enumName) {
        return typeof Microsoft != "undefined" && typeof Microsoft.AppMagic != "undefined" && typeof Microsoft.AppMagic.Common != "undefined" && typeof Microsoft.AppMagic.Common.LocalizationHelper != "undefined" ? Microsoft.AppMagic.Common.LocalizationHelper.convertToLocaleSpecific(enumName, null) : enumName
    }
    function translateKeyword(keywordName){}
    WinJS.Namespace.define("AppMagic.AuthoringTool.VisualIntellisense", {
        BooleanValues: [{
                text: trueKeyword, displayText: trueKeyword, image: "", description: trueKeyword, ruleValue: trueKeyword
            }, {
                text: falseKeyword, displayText: falseKeyword, image: "", description: falseKeyword, ruleValue: falseKeyword
            }, ], TextAlignments: [{
                    text: translateToLocaleSpecific("Align!Left"), displayText: AppMagic.Strings.VisualIntellisenseAlignLeft, image: "../images/text_left.svg", description: "Left", ruleValue: "left"
                }, {
                    text: translateToLocaleSpecific("Align!Center"), displayText: AppMagic.Strings.VisualIntellisenseAlignCenter, image: "../images/text_center.svg", description: "Center", ruleValue: "center"
                }, {
                    text: translateToLocaleSpecific("Align!Right"), displayText: AppMagic.Strings.VisualIntellisenseAlignRight, image: "../images/text_right.svg", description: "Right", ruleValue: "right"
                }, {
                    text: translateToLocaleSpecific("Align!Justify"), displayText: AppMagic.Strings.VisualIntellisenseAlignJustify, image: "../images/text_justify.svg", description: "Justify", ruleValue: "justify"
                }], VerticalAlignments: [{
                    text: translateToLocaleSpecific("VerticalAlign!Top"), displayText: AppMagic.Strings.VisualIntellisenseVerticalAlignTop, image: "../images/verticalAlignTop_icon.svg", description: "Top", ruleValue: "top"
                }, {
                    text: translateToLocaleSpecific("VerticalAlign!Middle"), displayText: AppMagic.Strings.VisualIntellisenseVerticalAlignMiddle, image: "../images/verticalAlignCenter_icon.svg", description: "Middle", ruleValue: "middle"
                }, {
                    text: translateToLocaleSpecific("VerticalAlign!Bottom"), displayText: AppMagic.Strings.VisualIntellisenseVerticalAlignBottom, image: "../images/verticalAlignBottom_icon.svg", description: "Bottom", ruleValue: "bottom"
                }], TopBorderStyles: [{
                    text: translateToLocaleSpecific("BorderStyle!None"), displayText: AppMagic.Strings.VisualIntellisenseBorderStyleNone, image: "../images/transparent.svg", description: "None", ruleValue: "none"
                }, {
                    text: translateToLocaleSpecific("BorderStyle!Solid"), displayText: AppMagic.Strings.VisualIntellisenseBorderStyleSolid, image: "", description: "Solid", ruleValue: "solid"
                }, {
                    text: translateToLocaleSpecific("BorderStyle!Dashed"), displayText: AppMagic.Strings.VisualIntellisenseBorderStyleDashed, image: "", description: "Dashed", ruleValue: "dashed"
                }, {
                    text: translateToLocaleSpecific("BorderStyle!Dotted"), displayText: AppMagic.Strings.VisualIntellisenseBorderStyleDotted, image: "", description: "Dotted", ruleValue: "dotted"
                }], TopFontFamilies: [{
                    text: translateToLocaleSpecific("Font!Arial"), displayText: AppMagic.Strings.VisualIntellisenseFontFamilyArial, image: "", description: "Font!Arial", ruleValue: "Arial"
                }, {
                    text: translateToLocaleSpecific("Font!Calibri"), displayText: AppMagic.Strings.VisualIntellisenseFontFamilyCalibri, image: "", description: "Font!Calibri", ruleValue: "Calibri"
                }, {
                    text: translateToLocaleSpecific("Font!Cambria"), displayText: AppMagic.Strings.VisualIntellisenseFontFamilyCambria, image: "", description: "Font!Cambria", ruleValue: "Cambria"
                }, {
                    text: translateToLocaleSpecific("Font!'Courier New'"), displayText: AppMagic.Strings.VisualIntellisenseFontFamilyCourierNew, image: "", description: "Font!'Courier New'", ruleValue: "Courier New"
                }, {
                    text: translateToLocaleSpecific("Font!Georgia"), displayText: AppMagic.Strings.VisualIntellisenseFontFamilyGeorgia, image: "", description: "Font!Georgia", ruleValue: "Georgia"
                }, {
                    text: translateToLocaleSpecific("Font!'Segoe UI'"), displayText: AppMagic.Strings.VisualIntellisenseFontFamilySegoeUI, image: "", description: "Font!'Segoe UI'", ruleValue: "Segoe UI"
                }, {
                    text: translateToLocaleSpecific("Font!Tahoma"), displayText: AppMagic.Strings.VisualIntellisenseFontFamilyTahoma, image: "", description: "Font!Tahoma", ruleValue: "Tahoma"
                }, {
                    text: translateToLocaleSpecific("Font!Verdana"), displayText: AppMagic.Strings.VisualIntellisenseFontFamilyVerdana, image: "", description: "Font!Verdana", ruleValue: "Verdana"
                }, {
                    text: translateToLocaleSpecific("Font!'Yu Gothic'"), displayText: AppMagic.Strings.VisualIntellisenseFontFamilyYuGothic, image: "", description: "Font!'Yu Gothic'", ruleValue: "Yu Gothic"
                }], TopFontWeights: [{
                    text: translateToLocaleSpecific("FontWeight!Normal"), displayText: AppMagic.Strings.VisualIntellisenseFontWeightNormal, image: "", description: "Normal", ruleValue: "normal"
                }, {
                    text: translateToLocaleSpecific("FontWeight!Lighter"), displayText: AppMagic.Strings.VisualIntellisenseFontWeightLighter, image: "", description: "Lighter", ruleValue: "lighter"
                }, {
                    text: translateToLocaleSpecific("FontWeight!Semibold"), displayText: AppMagic.Strings.VisualIntellisenseFontWeightSemibold, image: "", description: "Semibold", ruleValue: "600"
                }, {
                    text: translateToLocaleSpecific("FontWeight!Bold"), displayText: AppMagic.Strings.VisualIntellisenseFontWeightBold, image: "", description: "Bold", ruleValue: "bold"
                }], ImagePositionStyles: [{
                    text: translateToLocaleSpecific("ImagePosition!Fill"), displayText: AppMagic.Strings.VisualIntellisenseImagePositionFill, image: "../images/position_fill_icon.svg", description: "Fill", ruleValue: "fill"
                }, {
                    text: translateToLocaleSpecific("ImagePosition!Fit"), displayText: AppMagic.Strings.VisualIntellisenseImagePositionFit, image: "../images/position_fit_icon.svg", description: "Fit", ruleValue: "fit"
                }, {
                    text: translateToLocaleSpecific("ImagePosition!Stretch"), displayText: AppMagic.Strings.VisualIntellisenseImagePositionStretch, image: "../images/position_stretch_icon.svg", description: "Stretch", ruleValue: "stretch"
                }, {
                    text: translateToLocaleSpecific("ImagePosition!Tile"), displayText: AppMagic.Strings.VisualIntellisenseImagePositionTile, image: "../images/position_tile_icon.svg", description: "Tile", ruleValue: "tile"
                }, {
                    text: translateToLocaleSpecific("ImagePosition!Center"), displayText: AppMagic.Strings.VisualIntellisenseImagePositionCenter, image: "../images/position_center_icon.svg", description: "Center", ruleValue: "center"
                }], Transitions: [{
                    text: translateToLocaleSpecific("Transition!None"), displayText: AppMagic.Strings.VisualIntellisenseTransitionNone, image: "../images/transition_none_icon.svg", description: "None", ruleValue: "none"
                }, {
                    text: translateToLocaleSpecific("Transition!Push"), displayText: AppMagic.Strings.VisualIntellisenseTransitionPush, image: "../images/transition_push_icon.svg", description: "Push", ruleValue: "push"
                }, {
                    text: translateToLocaleSpecific("Transition!Pop"), displayText: AppMagic.Strings.VisualIntellisenseTransitionPop, image: "../images/transition_pop_icon.svg", description: "Pop", ruleValue: "pop"
                }], Layouts: [{
                    text: translateToLocaleSpecific("Layout!Horizontal"), displayText: AppMagic.Strings.VisualIntellisenseLayoutHorizontal, image: "", description: "Horizontal", ruleValue: "horizontal"
                }, {
                    text: translateToLocaleSpecific("Layout!Vertical"), displayText: AppMagic.Strings.VisualIntellisenseLayoutVertical, image: "", description: "Vertical", ruleValue: "vertical"
                }], Overflows: [{
                    text: translateToLocaleSpecific("Overflow!Hidden"), displayText: AppMagic.Strings.VisualIntellisenseOverflowHidden, image: "", description: "Hidden", ruleValue: "hidden"
                }, {
                    text: translateToLocaleSpecific("Overflow!Scroll"), displayText: AppMagic.Strings.VisualIntellisenseOverflowScroll, image: "", description: "Scroll", ruleValue: "scroll"
                }], Themes: [{
                    text: translateToLocaleSpecific("Themes!Vivid"), displayText: AppMagic.Strings.VisualIntellisenseThemesTheme1, image: "", description: "Theme1", ruleValue: "theme1"
                }, {
                    text: translateToLocaleSpecific("Themes!Eco"), displayText: AppMagic.Strings.VisualIntellisenseThemesTheme2, image: "", description: "Theme2", ruleValue: "theme2"
                }, {
                    text: translateToLocaleSpecific("Themes!Harvest"), displayText: AppMagic.Strings.VisualIntellisenseThemesTheme3, image: "", description: "Theme3", ruleValue: "theme3"
                }, {
                    text: translateToLocaleSpecific("Themes!Dust"), displayText: AppMagic.Strings.VisualIntellisenseThemesTheme4, image: "", description: "Theme4", ruleValue: "theme4"
                }, {
                    text: translateToLocaleSpecific("Themes!Awakening"), displayText: AppMagic.Strings.VisualIntellisenseThemesTheme5, image: "", description: "Theme5", ruleValue: "theme5"
                }], TextModes: [{
                    text: translateToLocaleSpecific("TextMode!SingleLine"), displayText: AppMagic.Strings.VisualIntellisenseTextModeSingleLine, image: "", description: "Single-line", ruleValue: "singleline"
                }, {
                    text: translateToLocaleSpecific("TextMode!Password"), displayText: AppMagic.Strings.VisualIntellisenseTextModePassword, image: "", description: "Password", ruleValue: "password"
                }, {
                    text: translateToLocaleSpecific("TextMode!MultiLine"), displayText: AppMagic.Strings.VisualIntellisenseTextModeMultiLine, image: "", description: "Multi-line", ruleValue: "multiline"
                }], Directions: [{
                    text: translateToLocaleSpecific("Direction!Start"), displayText: AppMagic.Strings.VisualIntellisenseDirectionStart, image: "", description: "Start", ruleValue: "start"
                }, {
                    text: translateToLocaleSpecific("Direction!End"), displayText: AppMagic.Strings.VisualIntellisenseDirectionEnd, image: "", description: "End", ruleValue: "end"
                }], PenModes: [{
                    text: translateToLocaleSpecific("PenMode!Draw"), displayText: AppMagic.Strings.VisualIntellisensePenModesDraw, image: "../images/pen_draw_icon.svg", description: "", ruleValue: "draw"
                }, {
                    text: translateToLocaleSpecific("PenMode!Erase"), displayText: AppMagic.Strings.VisualIntellisensePenModesErase, image: "../images/pen_erase_icon.svg", description: "", ruleValue: "erase"
                }, {
                    text: translateToLocaleSpecific("PenMode!Select"), displayText: AppMagic.Strings.VisualIntellisensePenModesSelect, image: "../images/pen_select_icon.svg", description: "", ruleValue: "select"
                }], PenModesInvariant: [{
                    text: "PenMode!Draw", displayText: AppMagic.Strings.VisualIntellisensePenModesDraw, image: "../images/pen_draw_icon.svg", description: "", ruleValue: "draw"
                }, {
                    text: "PenMode!Erase", displayText: AppMagic.Strings.VisualIntellisensePenModesErase, image: "../images/pen_erase_icon.svg", description: "", ruleValue: "erase"
                }, {
                    text: "PenMode!Select", displayText: AppMagic.Strings.VisualIntellisensePenModesSelect, image: "../images/pen_select_icon.svg", description: "", ruleValue: "select"
                }], PenTypes: [{
                    text: "Mouse", displayText: AppMagic.Strings.VisualIntellisensePenTypesMouse, image: "", description: "Mouse", ruleValue: "1"
                }, {
                    text: "Touch", displayText: AppMagic.Strings.VisualIntellisensePenTypesTouch, image: "", description: "Touch", ruleValue: "2"
                }, {
                    text: "Pen", displayText: AppMagic.Strings.VisualIntellisensePenTypesPen, image: "", description: "Pen", ruleValue: "4"
                }], PreDefinedColors: [[{
                        value: new AppMagic.Utility.Color(192, 0, 0, 1), image: "", description: "Blazer"
                    }, {
                        value: new AppMagic.Utility.Color(255, 0, 0, 1), image: "", description: "Chili"
                    }, {
                        value: new AppMagic.Utility.Color(197, 90, 17, 1), image: "", description: "Rust"
                    }, {
                        value: new AppMagic.Utility.Color(255, 192, 0, 1), image: "", description: "Tangerine"
                    }, {
                        value: new AppMagic.Utility.Color(255, 242, 0, 1), image: "", description: "Sunrise"
                    }, {
                        value: new AppMagic.Utility.Color(146, 208, 80, 1), image: "", description: "Spring"
                    }, {
                        value: new AppMagic.Utility.Color(0, 176, 80, 1), image: "", description: "Cloverfield"
                    }, {
                        value: new AppMagic.Utility.Color(0, 176, 240, 1), image: "", description: "Aquarius"
                    }, {
                        value: new AppMagic.Utility.Color(0, 112, 192, 1), image: "", description: "Patriot"
                    }, ], [{
                        value: new AppMagic.Utility.Color(0, 32, 96, 1), image: "", description: "Navy"
                    }, {
                        value: new AppMagic.Utility.Color(112, 48, 160, 1), image: "", description: "Iris"
                    }, {
                        value: new AppMagic.Utility.Color(127, 127, 127, 1), image: "", description: "Magnetic"
                    }, {
                        value: new AppMagic.Utility.Color(69, 69, 69, 1), image: "", description: "Charcoal"
                    }, {
                        value: new AppMagic.Utility.Color(0, 0, 0, 1), image: "", description: "Ink"
                    }, {
                        value: new AppMagic.Utility.Color(255, 255, 255, 1), image: "", description: "Steed"
                    }, ], ], ScreenTransitions: [{
                    ruleExpression: translateToLocaleSpecific("ScreenTransition!Fade"), displayName: translateToLocaleSpecific("ScreenTransition!Fade")
                }, {
                    ruleExpression: translateToLocaleSpecific("ScreenTransition!Cover"), displayName: translateToLocaleSpecific("ScreenTransition!Cover")
                }, {
                    ruleExpression: translateToLocaleSpecific("ScreenTransition!UnCover"), displayName: translateToLocaleSpecific("ScreenTransition!UnCover")
                }, {
                    ruleExpression: translateToLocaleSpecific("ScreenTransition!None"), displayName: translateToLocaleSpecific("ScreenTransition!None")
                }], RecentlyUsedColors: [{
                    value: new AppMagic.Utility.Color(0, 0, 0, 0), image: "../images/transparent.svg", description: ""
                }], MaxRecentlyUsedColors: 3, ColorMruIndex: 1, BorderThickness: {
                min: 0, max: 10
            }, FontSize: {
                min: 8, max: 96
            }, TemplateSize: {
                min: 35, max: 1366
            }, TemplatePadding: {
                min: 0, max: 250
            }, PenThickness: {
                min: 0, max: 200
            }, ColorTransparency: {
                min: 0, max: 1
            }, Padding: {
                min: 0, max: 50
            }, Fade: {
                min: -100, max: 100
            }, MinimumBarWidth: {
                min: 10, max: 100
            }, NumberOfSeries: {
                min: 1, max: 9
            }
    })
})();