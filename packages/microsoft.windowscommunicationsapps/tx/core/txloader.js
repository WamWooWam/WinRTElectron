
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global self,document*/

//
// Tx Loader
//

(function () {
    // TODO: separate loading by main/iframe and load only what's needed

    var pathTxCore = "/Tx/core/";

    function addScript(src) {
        // TODO: add marks
        var script = document.createElement("script");
        script.src = src;
        document.head.appendChild(script);
    }

    function addCoreScript(src) {
        addScript(pathTxCore + src);
    }

    function loadPageScripts() {
        addCoreScript("Tx.js");
        addCoreScript("TxUtils.js");
        addCoreScript("TxChk.js");
        addCoreScript("TxConfig.js");
        addCoreScript("TxEvents.js");
        addCoreScript("TxEventsProxy.js");
        addCoreScript("TxFileLog.js");
        addCoreScript("TxCommands.js");
        addCoreScript("TxWexLogger.js");
        addCoreScript("TxNavigator.js");
        addCoreScript("TxProtocol.js");
        addCoreScript("TxRunnerBase.js");
        addCoreScript("TxRunnerMain.js");
        addCoreScript("TxRunnerIFrame.js");
        addCoreScript("TxCallbacks.js");
        addCoreScript("TxTestStore.js");
        addCoreScript("TxTestContext.js");
        addCoreScript("TxTest.js");
        addCoreScript("TxMark.js");
        addCoreScript("TxSuiteStorage.js");
        addCoreScript("TxSessionSettings.js");
        
        addCoreScript("../ui/TxBvtLog.js");
        addCoreScript("../ui/TxModel.js");
        addCoreScript("../ui/TxShortcutKeys.js");
        addCoreScript("../ui/TxToolbar.js");
        addCoreScript("../ui/TxHtmlLog.js");
        addCoreScript("../ui/TxTreeNode.js");
        addCoreScript("../ui/TxTreeEvents.js");
        addCoreScript("../ui/TxPageList.js");
        addCoreScript("../ui/TxSuite.js");

        if (self.top !== self) {
            // IFrame
            // TODO: revisit this
            addCoreScript("TxEventsProxy.js");
        }
        addCoreScript("TxInit.js");
    }

    loadPageScripts();
})();
