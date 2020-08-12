

(function () {
    "use strict";

    Skype.RetailMode.init();
    if (Skype.RetailMode.enabled()) {
        Skype.RetailMode.bootstrap();
    } else {
        Skype.Application.Bootstrapper.bootstrap();
    }
}());