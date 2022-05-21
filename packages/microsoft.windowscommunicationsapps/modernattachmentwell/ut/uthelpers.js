
/*global Jx*/

// Mock collection object
var MockCollection = function () {
    this._array = [];
};
MockCollection.prototype.add = function (item) {
    this._array.push(item);
};
MockCollection.prototype.remove = function (item) {
    var index = this._array.indexOf(item);
    if (index >= 0) {
        this._array.splice(index, 1);
        return true;
    }
    return false;
};
MockCollection.prototype.item = function (index) {
    return this._array[index];
};
MockCollection.prototype.addEventListener = Jx.fnEmpty;
MockCollection.prototype.removeEventListener = Jx.fnEmpty;
MockCollection.prototype.unlock = Jx.fnEmpty;
Object.defineProperty(MockCollection.prototype, "count", {
    get: function () { return this._array.length; }
});

// Mock mail attachment object
var MockMailAttachment = function (fileName, id, size) {
    this._fileName = fileName;
    this._objectId = id;
    this._size = size || 0;
    this._composeStatus = 0;
    this._syncStatus = 0;
};
MockMailAttachment.prototype.addEventListener = Jx.fnEmpty;
Object.defineProperty(MockMailAttachment.prototype, "fileName", {
    get: function () { return this._fileName; }
});
Object.defineProperty(MockMailAttachment.prototype, "objectId", {
    get: function () { return this._objectId; }
});
Object.defineProperty(MockMailAttachment.prototype, "size", {
    get: function () { return this._size; },
    set: function (size) { this._size = size; }
});
Object.defineProperty(MockMailAttachment.prototype, "composeStatus", {
    get: function () { return this._composeStatus; },
    set: function (status) { this._composeStatus = status; }
});
Object.defineProperty(MockMailAttachment.prototype, "syncStatus", {
    get: function () { return this._syncStatus; },
    set: function (status) { this._syncStatus = status; }
});

// Mock mail message object
var MockMailMessage = function (attachments) {
    this._attachments = attachments;
};

MockMailMessage.prototype.getOrdinaryAttachmentCollection = function () {
    return this._attachments;
};

MockMailMessage.prototype.loadAttachment = function (id) {
    for (var i = 0; i < this._attachments.count; i++) {
        if (this._attachments.item(i).objectId === id) {
            return this._attachments.item(i);
        }
    }
    return null;
};
