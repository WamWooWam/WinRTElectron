/* Copyright (C) Microsoft Corporation. All rights reserved. */
var MS;
(function(MS) {
    (function(Entertainment) {
        (function(Platform) {
            (function(Playback) {
                (function(DeviceGroup) {
                    var DeviceGroupService = (function() {
                            function DeviceGroupService(){}
                            DeviceGroupService.prototype.deregisterDeviceAsync = function() {
                                return Microsoft.Entertainment.Service.Requests.DeviceGroup.DeviceGroupManagement.deregisterDeviceAsync()
                            };
                            DeviceGroupService.prototype.getDeviceFriendlyName = function() {
                                return Microsoft.Entertainment.Common.Infrastructure.TunerInfo.networkHostName
                            };
                            DeviceGroupService.prototype.getDeviceRegistrationStatus = function() {
                                return Microsoft.Entertainment.Service.Requests.DeviceGroup.DeviceGroupManagement.getDeviceRegisterationStatus()
                            };
                            return DeviceGroupService
                        })();
                    DeviceGroup.DeviceGroupService = DeviceGroupService;
                    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.deviceGroupService, function() {
                        return new DeviceGroupService
                    })
                })(Playback.DeviceGroup || (Playback.DeviceGroup = {}));
                var DeviceGroup = Playback.DeviceGroup
            })(Platform.Playback || (Platform.Playback = {}));
            var Playback = Platform.Playback
        })(Entertainment.Platform || (Entertainment.Platform = {}));
        var Platform = Entertainment.Platform
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
