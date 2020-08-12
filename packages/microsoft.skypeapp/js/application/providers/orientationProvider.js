

(function () {
    "use strict";

    var Windows,
        use = function (dependencies) {
            Windows = (dependencies && dependencies.Windows) || window.Windows;
        };
    use();

    var orientationProvider = WinJS.Class.derive(Skype.Application.Providers.NullProvider, function (sensor) {
        this._orientationSensor = sensor;
    }, {
        _orientationSensor: null,

        _handleOrientationChanged: function (e) {
            var rotation = e.orientation;
            if (rotation >= Windows.Devices.Sensors.SimpleOrientation.faceup || rotation === Skype.Application.state.view.rotation) {
                return;
            }

            Skype.Application.state.view.rotation = rotation;
        },

        _onVisibilityChanged: function (isApplicationActive) {
            
            if (isApplicationActive) { 
                this.regEventListener(this._orientationSensor, "orientationchanged", this._handleOrientationChanged);
                this._handleOrientationChanged({
                    orientation: this._orientationSensor ? this._orientationSensor.getCurrentOrientation() : Windows.Devices.Sensors.SimpleOrientation.notRotated
                });
            } else {
                
                this.unregEventListener(this._orientationSensor, "orientationchanged", this._handleOrientationChanged);
            }
        },

        alive: function () {
            
            this._onVisibilityChanged = this._onVisibilityChanged.bind(this);
            this.regBind(Skype.Application.state, "isApplicationActive", this._onVisibilityChanged);
        }
    }, {
        getInstance: function () {
            var sensor;

            try {
                sensor = Windows.Devices.Sensors.SimpleOrientationSensor.getDefault();
            } catch (e) {
                log("OrientationProvider: Windows.Devices.Sensors.SimpleOrientationSensor.getDefault() failed");
                return new Skype.Application.Providers.NullProvider();
            }

            if (!sensor) {
                log("OrientationProvider: no default orientation provider");
                return new Skype.Application.Providers.NullProvider();
            }

            var method = function () { };
            try {
                sensor.getCurrentOrientation();
                sensor.addEventListener("orientationchanged", method);
                sensor.removeEventListener("orientationchanged", method);
                return new Skype.Application.Providers.OrientationProvider(sensor);
            } catch (e) {
                log("OrientationProvider: orientation provider failed");
                return new Skype.Application.Providers.NullProvider();
            }
        },
        use: use
    });

    WinJS.Namespace.define("Skype.Application.Providers", {
        OrientationProvider: orientationProvider
    });
}());