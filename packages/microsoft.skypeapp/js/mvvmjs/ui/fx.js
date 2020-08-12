

(function () {
    "use strict";

    var cache = {}, mapPath2DomRoot = {};
    function createLoadTemplate(async) {
        return function (path, id) {
            var templateInfo, fullPath;
            if (!path) {
                return WinJS.Promise.timeout();
            }
            if (!id) {
                templateInfo = MvvmJS.UI.parseTemplate(path);
                path = templateInfo.path;
                id = templateInfo.id;
            }
            if (!id) {
                throw new Error("Couldn't find a templateid in the provided path: " + path);
            }

            fullPath = path + "#" + id;

            var promise = async ? WinJS.Promise.timeout() : WinJS.Promise.as();

            return promise.then(function () {
                
                var template = cache[fullPath],
                fileDomRoot, promise;
                if (template) {
                    return template;
                }

                fileDomRoot = mapPath2DomRoot[path];
                promise = fileDomRoot ? WinJS.Promise.wrap(fileDomRoot) : WinJS.UI.Fragments.renderCopy(path);

                return promise.then(function (pathRootElm) {
                    mapPath2DomRoot[path] || (mapPath2DomRoot[path] = pathRootElm);
                    return WinJS.Resources.processAll(pathRootElm);
                }).then(function (pathRootElm) {
                    var templ = pathRootElm.querySelector("[data-templateid='" + id + "']");
                    if (!templ) {
                        throw "Could not locate template: " + id;
                    }
                    return WinJS.UI.process(templ);
                }).then(function (templ) {
                    return cache[fullPath] = templ;
                });
            });
        };
    }

    WinJS.Namespace.define("MvvmJS.UI", {
        parseTemplate: function (templatePath) {
            if (!templatePath) {
                throw new Error("No valid template path supplied");
            }
            var parts = templatePath.split("#", 2),
                obj = {
                    path: parts[0],
                    id: ""
                };
            parts.length > 1 && (obj.id = parts[1]);
            return obj;
        },
        loadTemplate: createLoadTemplate(false),
        loadTemplateAsync: createLoadTemplate(true),
    });

}());

