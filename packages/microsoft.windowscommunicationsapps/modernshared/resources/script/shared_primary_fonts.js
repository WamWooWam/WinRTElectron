
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Jx*/

(function() {

    // this file takes the place of the body style rule which used to be set in shared_styles.css.  it used to use
    // compile time font lists, but this file calculates the style rule at run time.
    
    // this file should be included in an app entry point html files to calculate the primary and authoring font families,
    // add css classes that can be used in later markup, and set the primary font rule for the body such that it overrides
    // style imposed by WinJS.  Dynamic fonts can still be used without including this file, since they are included in Jx,
    // if these default behaviors are not needed.

    Jx.mark("DynamicFont:SharedFonts,StartTA,DynamicFont");

    var DF = Jx.DynamicFont;
    DF.addPrimaryAndAuthoringClasses();

    // this overrides the default body font with a rule more specific than those imposed by WinJS.
    // as pointed out in shared_styles.css, WinJS adds body:-ms-lang(language) which would override our desired rules
    DF.insertPrimaryFontFamilyRule("body:not(#spec)");

    Jx.mark("DynamicFont:SharedFonts,StopTA,DynamicFont");

})();
