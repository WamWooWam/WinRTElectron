
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx*/

Tx.config.pages = Tx.config.pages.concat([
    // Tx
    { htm: "/Tx/ut/utTxMain.htm", owner: "dantib" }, // TODO: owner is currently not used
    { htm: "/Tx/ut/utTxWorker.htm" },
    { htm: "/Tx/ut/utTxIFrame.htm" },
    // Sample Tx tests with errors
    // { htm: "/Tx/ut/utTxMainErrors.htm" },  
    // { htm: "/Tx/ut/utTxWorkerErrors.htm" },  
    // { htm: "/Tx/ut/utTxIFrameErrors.htm" },
]);
