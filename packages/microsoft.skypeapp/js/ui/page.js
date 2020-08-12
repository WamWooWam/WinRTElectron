

(function () {
    "use strict";

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

    WinJS.Namespace.define("Skype.UI.Page", {
        _PageBaseMixin: {
            
            disposeOnHide: false,
            useOneInstance: false,

            _renderFinishedSignals: null,

            renderFinishedPromise: {
                get: function () {
                    if (!this._renderFinishedSignals) {
                        return WinJS.Promise.as();
                    }
                    var promises = [];
                    for (var key in this._renderFinishedSignals) {
                        promises.push(this._renderFinishedSignals[key].promise);
                    }
                    return WinJS.Promise.join(promises);
                }
            },

            addEventListener: function (object, event, handler) {
                throw new Error("use reqEventListener instead of addEventListener");
            },
 
            removeEventListener: function (object, event, handler) {
                throw new Error("use unreqEventListener instead of removeEventListener");
            },
             
            addTimeout: function (fn, timeout) {
                throw new Error("use regTimeout instead of addTimeout");
            },
             
            removeTimeout: function (id) {
                throw new Error("use unregTimeout instead of removeTimeout");
            },

            getUniquePageId: function () {
                return this.uri ? this.uri.replace(/ms-appx:\/\/microsoft.skypeapp\/pages\//, '') : "disposedPage";
            },

            dispose: function () {
                log("Page dispose() {0}".format(this.getUniquePageId()));
                Skype.Statistics.sendStats(Skype.Statistics.event.disposePage, this.getUniquePageId());
                Skype.Class.disposableMixin.dispose.call(this);
            },

            processed: function (element, options) {
                log("Page processed() {0}".format(this.getUniquePageId()));
                WinJS.Resources.processAll(element); 
            },

            ready: function (element, options) {
                log("Page ready() {0}".format(this.getUniquePageId()));
                this.onReady && this.onReady(options);
            },

            show: function (element, options) {
                log("Page show() {0}".format(this.getUniquePageId()));
                Skype.Statistics.sendStats(Skype.Statistics.event.showPage, this.getUniquePageId());
                this.onShow && this.onShow(options);
            },

            hide: function () {
                log("Page hide() {0}".format(this.getUniquePageId()));
                Skype.Statistics.sendStats(Skype.Statistics.event.hidePage, this.getUniquePageId());
                this.onHide && this.onHide();
            },
            
            pageEnteredAndAnimated: function () {
                log("Page pageEnteredAndAnimated() {0}".format(this.getUniquePageId()));
                this.onPageEnteredAndAnimated && this.onPageEnteredAndAnimated();
            },

            error: function (e) {
                
                
                log("Page error() {0} {1}".format(this.getUniquePageId()), e);

                if (this.onError) {
                    return this.onError(e);
                }
            }
        },

        define: function (uri, rootElement, members) {
            var pageClass = WinJS.UI.Pages.define(uri);
            var baseRender = pageClass.prototype.render;
            
            WinJS.Class.mix(pageClass, Skype.Class.disposableMixin, Skype.UI.Page._PageBaseMixin);
            if (members) {
                WinJS.Class.mix(pageClass, members);
            }

            
            
            pageClass.prototype.render = function (element, options, loadResult) {
                log("Page render() {0}".format(this.getUniquePageId()));
                element = baseRender.call(this, element, options, loadResult);
                this.element = element.querySelector(rootElement);
                this.element.winControl = this;
                this.options = options || {};
                this.onRender && this.onRender();
                return element;
            };
            window.traceClassMethods && window.traceClassMethods(pageClass, "Page(" + uri + ")", ["render", "show", "ready", "init"]);

            return pageClass;
        }
    });
    


})();