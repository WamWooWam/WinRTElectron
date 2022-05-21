
var MockComponent = function (doc) {
    this._document = doc || document;
};

Jx.inherit(MockComponent, ModernCanvas.Component);

MockComponent.prototype.getDocument = function () {
    return this._document;
};

MockComponent.prototype.getWindow = function () {
    return this._document.defaultView;
};

MockComponent.prototype.getSelectionRange = function () {
    var selection = this.getDocument().getSelection();
    if (selection.rangeCount > 0) {
        return selection.getRangeAt(0);
    }
    return null;
};

MockComponent.prototype.getAnchorElement = function () {
    return document.createElement("div");
};