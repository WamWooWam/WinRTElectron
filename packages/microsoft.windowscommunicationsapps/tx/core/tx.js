
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global self,Tx*/

// TODO: use JxCore when available

self.Tx = self.Tx || {};

// TODO: move all code to TxCore.js and keep only script loading and initialization in Tx.js
// TODO: move is* code to TxIs.js

Tx.isWWA = "Windows" in self;

Tx.isWorker = "WorkerGlobalScope" in self;

Tx.isIFrame = Boolean(self.top && self.top !== self);

Tx.isMain = self.top === self;

Tx.isUndefined = function (v) {
    return v === undefined;
};

Tx.isObject = function (obj) {
    return obj !== undefined && obj !== null && typeof obj === "object";
};

Tx.isFunction = function (v) {
    return typeof v === "function";
};

Tx.isString = function (v) {
    return typeof v === "string";
};

Tx.isNonEmptyString = function (v) {
    return typeof v === "string" && Boolean(v);
};

Tx.isNumber = function (n) {
    return typeof n === "number";
};

Tx.isValidNumber = function (n) {
    return typeof n === "number" && isFinite(n);
};

Tx.isInstanceOf = function (obj, instance) {
    // TODO: add Tx.isDefined
    Tx.assert(!Tx.isUndefined(instance), "Tx.isInstanceOf: invalid instance");

    // TODO: do we need to check for obj === undefined?
    return obj instanceof instance;
};

Tx.isRegExp = function (v) {
    return v instanceof RegExp;
};

Tx.isArray = function (v) {
    return Array.isArray(v);
};

Tx.fnEmpty = Tx.noop = function () { };

// Tx.FileSystem constants - http://msdn.microsoft.com/en-us/library/windows/desktop/hh449422(v=vs.85).aspx
Tx.GENERIC_READ = 0x80000000;
Tx.GENERIC_WRITE = 0x40000000;
Tx.FILE_SHARE_EXCLUSIVE = 0;
Tx.FILE_SHARE_READ = 1;
Tx.FILE_SHARE_WRITE = 2;
Tx.FILE_SHARE_DELETE = 4;
Tx.CREATE_NEW = 1;
Tx.CREATE_ALWAYS = 2;
Tx.OPEN_EXISTING = 3;
Tx.OPEN_ALWAYS = 4;
Tx.TRUNCATE_EXISTING = 5;
Tx.FILE_BEGIN = 0;
Tx.FILE_CURRENT = 1;
Tx.FILE_END = 2;
