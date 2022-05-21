
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Jx,Mocks,People,MockJobSet,document,Debug,Include*/

Include.initializeFileScope(function () {

    var P = People;
    var M = Mocks;

    var parentElement;
    var calls;
    function setup (tc) {
        calls = new M.CallVerifier(tc);

        parentElement = document.createElement("div");
        document.body.appendChild(parentElement);
    }

    function cleanup () {
        if (parentElement) {
            document.body.removeChild(parentElement);
            parentElement = null;
        }

        calls = null;
    }

    var host = {
        getLayout: function () { 
            var layout = {};
            layout.layoutChanged = "layoutChanged";
            Debug.Events.define(layout, "layoutChanged");
            return layout;
        },
        getLayoutState: function () { 
            return "full";
        }
    };

    Tx.test("panelViewTests.testStatic", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // Set up mock panels
        var panels = [ {
            position: 5,
            id: "panel5",
            html: "<b>Panel 5</b>"
        }, {
            position: 1,
            className: "panel1",
            html: "<div>Panel 1</div><div>is the best</div>"
        }, {
            position: 3,
            html: ""
        }, {
            position: 7,
            html: "<div></div>"
        } ];
        panels.forEach(function (panel) {
            calls.initialize(panel, [ "getUI", "ready", "activateUI", "deactivateUI" ]);
        });

        // Set up mock providers
        var providers = [ {}, {} ];
        providers.forEach(function (provider) {
            calls.initialize(provider, [ "load", "unload" ]);
        });

        // Create the panel view
        var context = { };
        var hydration = { };
        var state = { };
        var view = new P.PanelView(host, new MockJobSet(), context, null, hydration, state, providers);
        calls.verify();

        // Get the HTML
        calls.expectOnce(providers[0], "load", [ view, context, null, hydration ], function (host) {
            // The first provider will return the first two panels
            host.addPanel(panels[0]);
            host.addPanel(panels[1]);
        });
        calls.expectOnce(providers[1], "load", [ view, context, null, hydration ], function (host) {
            // The second provider will return the last two
            host.addPanel(panels[2]);
            host.addPanel(panels[3]);
        });
        panels.forEach(function (panel) { 
            calls.expectOnce(panel, "getUI", [ ], function () {
                return this.html;
            });
        });
        var ui = Jx.getUI(view);
        calls.verify();

        // Verify correct ordering of the panels in the HTML
        panels.sort(function (panel1, panel2) {
            return panel1.position - panel2.position;
        });
        panels.reduce(function (previousIndex, panel) { 
            if (Jx.isNonEmptyString(panel.htm)) {
                var index = ui.html.indexOf(panel.html);
                tc.isTrue(index > previousIndex);
                return index;
            } else {
                return previousIndex;
            }
        }, -1);

        // Add the HTML to the DOM
        parentElement.innerHTML = ui.html;

        // Verify that all of the panels have the correct ids and classes
        panels.forEach(function (panel) {
            var panelElement = parentElement.querySelector("#" + panel.id);
            tc.isTrue(Jx.isHTMLElement(panelElement));
            if (panel.className) {
                tc.areNotEqual(-1, panelElement.className.indexOf(panel.className));
            }
        });

        panels.forEach(function (panel) {
            calls.expectOnce(panel, "activateUI", [ parentElement.querySelector("#" + panel.id) ], function () {
                calls.expectOnce(panel, "ready", [ ]);
            });
        });
        view.activateUI();
        calls.verify();

        panels.forEach(function (panel) {
            calls.expectOnce(panel, "deactivateUI", [ ]);
        });
        providers.forEach(function (provider) {
            calls.expectOnce(provider, "unload", [ ]);
        });
        view.shutdownUI();
        view.shutdownComponent();
        calls.verify();
    });

    Tx.test("panelViewTests.testDynamic", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var provider = { };
        var context = { };
        var hydration = { };
        var view = new P.PanelView(host, new MockJobSet(), context, null, hydration, null, [ provider ]);
        calls.verify();

        calls.expectOnce(provider, "load", [ view, context, null, hydration ]);
        view.initUI(parentElement);
        calls.verify();

        var panels = [];
        var checkPanels = function () {
            if (panels.length > 0) {
                var containerElement = panels[0].element.parentElement;
                tc.areEqual(panels.length + 1, containerElement.children.length);
                panels.forEach(function (panel, index) {
                    tc.areEqual(panel.element, containerElement.children[index]);
                });
            }
        };
        var addPanel = function(position) {
            var panel = { position: position };
            calls.expectOnce(panel, "getUI", [], function () { return ""; });
            calls.expectOnce(panel, "activateUI", null, function (element) { panel.element = element; });
            calls.expectOnce(panel, "ready");
            panels.push(panel);
            panels.sort(function (panel1, panel2) { return panel1.position - panel2.position; });

            view.addPanel(panel);
            calls.verify();

            checkPanels();
        };
        var removePanel = function (position) {
            var panelIndex;
            panels.forEach(function (panelTest, panelTestIndex) { if (panelTest.position === position) { panelIndex = panelTestIndex; } });
            tc.isTrue(Jx.isNumber(panelIndex));
            var panel = panels.splice(panelIndex, 1)[0];
            tc.areEqual(panel.position, position);

            calls.expectOnce(panel, "deactivateUI", []);
            view.removePanel(panel.id);
            calls.verify();

            checkPanels();
        };

        addPanel(100);
        addPanel(50);
        addPanel(75);
        addPanel(125);
        removePanel(100);
        removePanel(50);
        removePanel(125);
        removePanel(75);
        addPanel(5);
        addPanel(10);
        addPanel(15);
        removePanel(15);
        removePanel(10);
        addPanel(2);
        removePanel(5);
        removePanel(2);
        addPanel(13);
        addPanel(15);
        addPanel(14);

        panels.forEach(function (panel) {
            calls.expectOnce(panel, "deactivateUI", []);
        });
        calls.expectOnce(provider, "unload", []);
        view.shutdownUI();
        view.shutdownComponent();
        calls.verify();
    });

    Tx.test("panelViewTests.testReady", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var provider = { };
        var jobSet = {
            _pendingJobs: [],
            addUIJob: function (context, fn) { 
                this._pendingJobs.push(fn.bind(context));
            },
            runOneJob: function () {
                var job = this._pendingJobs.shift();
                if (job) {
                    job();
                }
            },
            cancelJobs: function () { },
            dispose: function () { }
        };
        var context = { };
        var view = new P.PanelView(host, jobSet, context, null, null, null, [ provider ]);
        calls.verify();

        var panels = { };
        var addPanel = function (position) {
            var panel = {
                position: position,
                getUI: function () { return ""; },
                activateUI: function () { },
                deactivateUI: function () { }
            };
            panels[position] = panel;
            view.addPanel(panel);
        };

        calls.expectOnce(provider, "load", [ view, context, null, null ], function () {
            addPanel(50);
            addPanel(25);
        });
        view.initUI(parentElement);
        calls.verify();

        // Ready happens in priority order, not order of adding
        calls.expectOnce(panels[25], "ready", []);
        jobSet.runOneJob();
        calls.verify();

        addPanel(15);
        addPanel(90);

        // Panels added after startup can still get a ready before panels adding during startup
        calls.expectOnce(panels[15], "ready", []);
        jobSet.runOneJob();
        calls.verify();

        // Removed panels don't get ready calls
        view.removePanel(panels[50].id);
        calls.expectOnce(panels[90], "ready", []);
        jobSet.runOneJob();
        calls.verify();

        // We reach idle
        jobSet.runOneJob();
        calls.verify();

        // Panels added after idle still get a ready call
        addPanel(33);
        calls.expectOnce(panels[33], "ready", []);
        jobSet.runOneJob();
        calls.verify();

        // And we reach idle again
        jobSet.runOneJob();
        calls.verify();

        calls.expectOnce(provider, "unload", []);
        view.shutdownUI();
        view.shutdownComponent();
        calls.verify();
    });

    Tx.test("panelViewTests.testSuspend", function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var provider = { };
        var context = { };
        var firstHydrate = { should: "disappear" };
        var state = { scrollTop: "5px" };
        var view = new P.PanelView(host, new MockJobSet(), context, null, firstHydrate, state, [ provider ]);
        calls.verify();

        var makePanel = function (position) {
            var panel = {
                position: position,
                getUI: function () { return ""; },
                activateUI: function () { },
                ready: function () { },
                deactivateUI: function () { }
            };
            calls.initialize(panel, [ "suspend" ]);
            return panel;
        };
        var panels = [
            makePanel(1),
            makePanel(2),
            makePanel(3)
        ];
        calls.expectOnce(provider, "load", [ view, context, null, firstHydrate ], function (host, context, firstHydrate) {
            panels.forEach(function (panel) { host.addPanel(panel); });
        });
        view.initUI(parentElement);
        calls.verify();

        calls.expectOnce(provider, "suspend", null, function (hydration) {
            hydration.provider = "works";
        });
        calls.expectOnce(panels[0], "suspend", null, function (hydration) {
            hydration.panel1 = "works too";
        });
        calls.expectOnce(panels[1], "suspend", null, function (hydration) {
            hydration.panel2 = { got: "fancy" };
        });
        calls.expectOnce(panels[2], "suspend", null);
        var result = view.suspend();
        calls.verify();

        tc.areEqual("works", result.provider);
        tc.areEqual("works too", result.panel1);
        tc.areEqual("fancy", result.panel2.got);
        tc.areEqual(undefined, result.should);

        calls.expectOnce(provider, "unload", []);
        view.shutdownUI();
        view.shutdownComponent();
        calls.verify();
    });
});