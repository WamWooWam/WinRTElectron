
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {

    var Plat = Microsoft.WindowsLive.Platform,
        D = Mocks.Microsoft.WindowsLive.Platform.Data,
        BoundElements = Mail.BoundElements;

    var sandbox, provider, parent;
    function setup(tc) {
        sandbox = document.createElement("div");
        sandbox.setAttribute("style", "position:fixed;top:0px;right:0px");
        document.body.appendChild(sandbox);

        provider = new D.JsonProvider();

        parent = new Jx.Component();
        parent.initComponent();
        parent.updateLabel = Jx.fnEmpty;

        tc.cleanup = function () {
            sandbox.removeNode(true);
            sandbox = null;
            provider = null;
        };
    }

    Tx.test("BoundElements.testViewName", function (tc) {
        setup(tc);

        var account = provider.loadObject("Account", {
            objectId: "someAccount",
        });
        var folder = provider.loadObject("Folder", {
            accountId: "someAccount",
            objectId: "someFolder",
            folderName: "SomeName"
        });
        var view = provider.loadObject("MailView", {
            accountId: "someAccount",
            type: Plat.MailViewType.userGeneratedFolder,
            mock$sourceObjectId: "someFolder"
        });

        var name = new BoundElements.ViewName(new Mail.UIDataModel.MailView(view, new Mail.Account(account, provider.getClient())));
        parent.appendChild(name);
        sandbox.innerHTML = Jx.getUI(name).html;
        name.activateUI();

        tc.areEqual(sandbox.innerText, "SomeName");

        folder.mock$setProperty("folderName", "OtherName");
        tc.areEqual(sandbox.innerText, "SomeName"); // Not updated synchronously

        Jx.scheduler.testFlush();
        tc.areEqual(sandbox.innerText, "OtherName"); // Updated async

        folder.mock$setProperty("folderName", "YetAnotherName");
        tc.areEqual(sandbox.innerText, "OtherName"); // Not updated

        Jx.scheduler.testFlush();
        tc.areEqual(sandbox.innerText, "YetAnotherName"); // Updated async

        name.shutdownUI();
    });

    Tx.test("BoundElements.testViewCount", function (tc) {
        setup(tc);

        var account = provider.loadObject("Account", {
            objectId: "someAccount",
        });
        var view = provider.loadObject("MailView", {
            accountId: "someAccount",
            type: Plat.MailViewType.allPinnedPeople,
            notificationCount: 12
        });

        var count = new BoundElements.ViewCount(new Mail.UIDataModel.MailView(view, new Mail.Account(account, provider.getClient())));
        parent.appendChild(count);
        sandbox.innerHTML = Jx.getUI(count).html;
        count.activateUI();

        tc.areEqual(sandbox.firstChild.firstChild.innerText, "12");
        tc.areEqual(sandbox.firstChild.lastChild.innerText, "");

        view.mock$setProperty("notificationCount", 41);
        tc.areEqual(sandbox.firstChild.firstChild.innerText, "12");
        tc.areEqual(sandbox.firstChild.lastChild.innerText, "");

        Jx.scheduler.testFlush();
        tc.areEqual(sandbox.firstChild.firstChild.innerText, "41");
        tc.areEqual(sandbox.firstChild.lastChild.innerText, "");

        view.mock$setProperty("notificationCount", 0);
        tc.areEqual(sandbox.firstChild.firstChild.innerText, "41");
        tc.areEqual(sandbox.firstChild.lastChild.innerText, "");

        Jx.scheduler.testFlush();
        tc.areEqual(sandbox.firstChild.firstChild.innerText, "");
        tc.areEqual(sandbox.firstChild.lastChild.innerText, "");

        view.mock$setProperty("notificationCount", 1352636161);
        tc.areEqual(sandbox.firstChild.firstChild.innerText, "");
        tc.areEqual(sandbox.firstChild.lastChild.innerText, "");

        Jx.scheduler.testFlush();
        tc.areEqual(sandbox.firstChild.firstChild.innerText, "999");
        tc.areNotEqual(sandbox.firstChild.lastChild.innerText, "");

        view.mock$setProperty("notificationCount", 3);
        tc.areEqual(sandbox.firstChild.firstChild.innerText, "999");
        tc.areNotEqual(sandbox.firstChild.lastChild.innerText, "");

        Jx.scheduler.testFlush();
        tc.areEqual(sandbox.firstChild.firstChild.innerText, "3");
        tc.areEqual(sandbox.firstChild.lastChild.innerText, "");

        count.shutdownUI();
    });

    Tx.test("BoundElements.testViewPinner", function (tc) {
        setup(tc);

        var account = new Mail.Account(provider.loadObject("Account", {
            objectId: "someAccount",
        }), provider.getClient());
        var view = provider.loadObject("MailView", {
            accountId: "someAccount",
            type: Plat.MailViewType.outbox,
            isPinnedToNavPane: false
        });

        var pinner = new BoundElements.ViewPinner(new Mail.UIDataModel.MailView(view, account), "pin", "unpin");
        parent.appendChild(pinner);
        sandbox.innerHTML = Jx.getUI(pinner).html;
        pinner.activateUI();

        tc.areEqual(sandbox.innerText, "\ue1ce");
        tc.isFalse(sandbox.firstChild.classList.contains("pinned"));

        view.mock$setProperty("isPinnedToNavPane", true);
        tc.areEqual(sandbox.innerText, "\ue1ce");
        tc.isFalse(sandbox.firstChild.classList.contains("pinned"));

        Jx.scheduler.testFlush();
        tc.areEqual(sandbox.innerText, "\ue1cf");
        tc.isTrue(sandbox.firstChild.classList.contains("pinned"));

        pinner.shutdownUI();
    });


    Tx.test("BoundElements.testViewPinnerClick", function (tc) {
        setup(tc);

        var account = new Mail.Account(provider.loadObject("Account", {
            objectId: "someAccount",
        }), provider.getClient());
        var view = provider.loadObject("MailView", {
            accountId: "someAccount",
            type: Plat.MailViewType.outbox,
            isPinnedToNavPane: false
        });
        var called = 0, pinArg;
        view.pinToNavPane = function (arg) {
            called++;
            pinArg = arg;
        };

        var pinner = new BoundElements.ViewPinner(new Mail.UIDataModel.MailView(view, account), "pin", "unpin");
        parent.appendChild(pinner);
        sandbox.innerHTML = Jx.getUI(pinner).html;
        pinner.activateUI();

        pinner.onClick({ target: sandbox, stopPropagation: Jx.fnEmpty, preventDefault: Jx.fnEmpty });
        tc.areEqual(called, 0);

        pinner.onClick({ target: sandbox.firstChild, stopPropagation: Jx.fnEmpty, preventDefault: Jx.fnEmpty });
        tc.areEqual(called, 1);
        tc.areEqual(pinArg, true);

        view.mock$setProperty("isPinnedToNavPane", true);
        Jx.scheduler.testFlush();

        pinner.onClick({ target: sandbox.firstChild, stopPropagation: Jx.fnEmpty, preventDefault: Jx.fnEmpty });
        tc.areEqual(called, 2);
        tc.areEqual(pinArg, false);

        pinner.shutdownUI();
    });

})();
