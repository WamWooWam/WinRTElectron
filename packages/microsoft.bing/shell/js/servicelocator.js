﻿/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='globaleventrelay.js' />
/// <reference path='env.js' />
/// <reference path='navigation.js' />
/// <reference path='shell.js' />
/// <reference path='viewmanagement.js' />
/// <reference path='progress.js' />
/// <reference path='networkdetection.js' />
/// <reference path='proxy.js' />
/// <reference path='appconfig.js' />
(function () {
    "use strict";

    // Create singletons
    var envInstance = new BingApp.Classes.Env();
    var eventRelayInstance = new BingApp.Classes.GlobalEventRelay(window);
    var navigationManagerInstance = new BingApp.Classes.NavigationManager("/shell/configuration/navigationmappings.json");
    var viewManagerInstance = new BingApp.Classes.ViewManager("/shell/configuration/viewregistry.json");
    var shellInstance = new BingApp.Classes.Shell(WinJS.Application);
    var proxyInstance = new BingApp.Classes.Proxy();
    var geolocatorInstance = new Windows.Devices.Geolocation.Geolocator();
    var networkDetectionService = new BingApp.Classes.NetworkDetectionService();
    var progressIndicatorServiceInstance = new BingApp.Classes.ProgressIndicatorService(eventRelayInstance);
    var appConfigurationInstance = new BingApp.Classes.AppConfiguration();
    var marketInstance = new Windows.ApplicationModel.Resources.ResourceLoader("market");

    // Expose singletons via service locator object
    var locator = {};
    Object.defineProperties(locator, {
        env: { value: envInstance, writable: false, enumerable: false, configurable: false },
        eventRelay: { value: eventRelayInstance, writable: false, enumerable: false, configurable: false },
        geolocator: { value: geolocatorInstance, writable: false, enumerable: false, configurable: false },
        shell: { value: shellInstance, writable: false, enumerable: false, configurable: false },
        navigationManager: { value: navigationManagerInstance, writable: false, enumerable: false, configurable: false },
        viewManager: { value: viewManagerInstance, writable: false, enumerable: false, configurable: false },
        progressIndicatorService: { value: progressIndicatorServiceInstance, writable: false, enumerable: false, configurable: false },
        networkDetectionService: { value: networkDetectionService, writable: false, enumerable: false, configurable: false },
        proxy: { value: proxyInstance, writable: false, enumerable: false, configurable: false },
        appConfiguration: { value: appConfigurationInstance, writable: false, enumerable: false, configurable: false },
        market: { value: marketInstance, writable: false, enumerable: false, configurable: false },
    });

    // Expose service locator via application namespace
    WinJS.Namespace.define("BingApp", {
        locator: locator
    });
})();
