
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Windows,Microsoft,Tx*/

Tx.test("Tx.FileSystem: create/write/close", function () {
    var fileName = Windows.Storage.ApplicationData.current.localFolder.path + "\\utfs.txt";

    var fs = new Microsoft.WindowsLive.Tx.FileSystem();
    var f = fs.createFile(fileName, Tx.GENERIC_WRITE, Tx.FILE_SHARE_READ, Tx.CREATE_ALWAYS);
    fs.writeFile(f, "foo");
    fs.writeFile(f, Date.now());
    fs.closeHandle(f);
});

Tx.test("Tx.FileSystem: create/close/open/write/close", function () {
    var fileName = Windows.Storage.ApplicationData.current.localFolder.path + "\\utfs.txt";

    var fs = new Microsoft.WindowsLive.Tx.FileSystem();

    var f = fs.createFile(fileName, Tx.GENERIC_WRITE, Tx.FILE_SHARE_EXCLUSIVE, Tx.CREATE_ALWAYS);
    fs.closeHandle(f);

    f = fs.createFile(fileName, Tx.GENERIC_WRITE, Tx.FILE_SHARE_READ, Tx.OPEN_EXISTING);
    fs.writeFile(f, "foo");
    fs.writeFile(f, Date.now());
    fs.closeHandle(f);
});

// TODO: add more tests
