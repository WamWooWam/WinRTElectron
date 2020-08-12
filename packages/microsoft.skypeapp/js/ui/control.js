

(function () {
    "use strict";

    function geControlConstructor(ctor) {
        return function (element, options) {
            this.element = element;
            element.winControl = this;
            this.options = options || {};
            WinJS.Utilities.markDisposable(element, Skype.Class.disposableMixin.dispose.bind(this)); 
            return ctor.call(this, element, options);
        };
    }

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    WinJS.Namespace.define("Skype.UI.Control", {
        define: function (ctor, instanceMembers, staticMembers) {
            var userControlCtor = geControlConstructor(ctor);

            userControlCtor.isDeclarativeControlContainer = true;
            var cls = WinJS.Class.define(userControlCtor, instanceMembers, staticMembers);
            return WinJS.Class.mix(cls, Skype.Class.disposableMixin);
        },

        derive: function (baseClass, ctor, instanceMembers, staticMembers) {
            var userControlCtor = geControlConstructor(ctor);

            userControlCtor.isDeclarativeControlContainer = true;
            return WinJS.Class.derive(baseClass, userControlCtor, instanceMembers, staticMembers);
        }
    });

    WinJS.Namespace.define("Skype.UI.ObservableControl", {
        define: function (ctor, instanceMembers, observableMembers, staticMembers) {
            var userControlCtor = geControlConstructor(ctor);

            var cls = MvvmJS.Class.define(userControlCtor, instanceMembers, observableMembers, staticMembers);
            cls.isDeclarativeControlContainer = true;
            return WinJS.Class.mix(cls, Skype.Class.disposableMixin);
        }
    });
})();