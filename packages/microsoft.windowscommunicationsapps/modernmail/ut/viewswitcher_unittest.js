
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {

    var Plat = Microsoft.WindowsLive.Platform,
        D = Mocks.Microsoft.WindowsLive.Platform.Data;

    var sandbox, provider, settings, selection;
    function setup(tc) {
        Mail.UnitTest.stubJx(tc, "bici"); 
        sandbox = document.createElement("div");
        sandbox.setAttribute("style", "position:fixed;top:0px;right:0px");
        document.body.appendChild(sandbox);

        settings = { getLocalAccountSettings: function () { return { get: Jx.fnEmpty, set: Jx.fnEmpty, container: function () { return this; } } } };

        provider = new D.JsonProvider({
            Account: {
                all: [
                    { objectId: "firstAccount" },
                ]
            },
            Folder: {
                all: [
                    {
                        objectId: "firstInboxFolder",
                        folderType: Plat.FolderType.mail,
                        specialMailFolderType: Plat.MailFolderType.inbox,
                        accountId: "firstAccount"
                    }, {
                        objectId: "firstOtherFolder",
                        folderType: Plat.FolderType.mail,
                        specialMailFolderType: Plat.MailFolderType.userGenerated,
                        accountId: "firstAccount"
                    }
                ]
            },
            MailView: {
                all: [
                    {
                        accountId: "firstAccount",
                        type: Plat.MailViewType.flagged,
                        objectId: "firstFlagged",
                        isPinnedToNavPane: true
                    }, {
                        accountId: "firstAccount",
                        type: Plat.MailViewType.inbox,
                        objectId: "firstInbox",
                        mock$sourceObjectId: "firstInboxFolder",
                        isPinnedToNavPane: true
                    }, {
                        accountId: "firstAccount",
                        type: Plat.MailViewType.userGeneratedFolder,
                        objectId: "firstOther",
                        mock$sourceObjectId: "firstOtherFolder"
                    }
                ]
            }
        }, D.MethodHandlers);

        var account = new Mail.Account(provider.getObjectById("firstAccount"), provider.getClient());
        selection = {
            account: account,
            view: new Mail.UIDataModel.MailView(provider.getObjectById("firstInbox"), account),
        };
        Jx.mix(selection, Jx.Events);
        Debug.Events.define(selection, "navChanged");

        tc.cleanup = function () {
            sandbox.removeNode(true);
            sandbox = null;
            provider = null;
        };
    }

    Tx.test("ViewSwitcher.testContent", function (tc) {
        setup(tc);

        var host = { isWide: true, addListener: Jx.fnEmpty, removeListener: Jx.fnEmpty };

        var switcher = new Mail.ViewSwitcher(provider.getClient(), host, selection, settings, Jx.fnEmpty);
        sandbox.innerHTML = Jx.getUI(switcher).html;
        switcher.activateUI();

        tc.ok(sandbox.querySelector(".inbox"));
        tc.ok(sandbox.querySelector(".flagged"));
        tc.ok(sandbox.querySelector(".folders"));

        switcher.shutdownUI();
        switcher.shutdownComponent();
        Jx.scheduler.testFlush();
    });

    Tx.test("ViewSwitcher.testFlyouts", function (tc) {
        setup(tc);

        var host = { isWide: true, addListener: Jx.fnEmpty, removeListener: Jx.fnEmpty };

        var shown = 0, hidden = 0;
        var switcher = new Mail.ViewSwitcher(provider.getClient(), host, selection, settings, function (content) {
            sandbox.insertAdjacentHTML("beforeend", Jx.getUI(content).html);
            content.activateUI();
            return {
                show: function () { ++shown; },
                hide: function () { ++hidden; }
            };
        });
        sandbox.innerHTML = Jx.getUI(switcher).html;
        switcher.activateUI();

        switcher.getFlyout("folders").show();
        tc.areEqual(shown, 1);

        switcher.getFlyout("folders").hide();
        tc.areEqual(hidden, 1);

        switcher.shutdownUI();
        switcher.shutdownComponent();
        Jx.scheduler.testFlush();
    });

    Tx.test("ViewSwitcher.testWidth", function (tc) {
        setup(tc);

        var host = { isWide: true };
        Jx.mix(host, Jx.Events);
        Debug.Events.define(host, "widthChanged");

        var switcher = new Mail.ViewSwitcher(provider.getClient(), host, selection, settings, Jx.fnEmpty);
        sandbox.innerHTML = Jx.getUI(switcher).html;
        switcher.activateUI();

        tc.isTrue(switcher.isWide);

        host.isWide = false;
        tc.isFalse(switcher.isWide);

        var context = {
            handler: function () { ++this.events; },
            events: 0
        };
        switcher.addListener("widthChanged", context.handler, context);

        host.raiseEvent("widthChanged");
        tc.areEqual(context.events, 1);

        host.raiseEvent("widthChanged");
        tc.areEqual(context.events, 2);

        switcher.removeListener("widthChanged", context.handler, context);
        host.raiseEvent("widthChanged");
        tc.areEqual(context.events, 2);

        switcher.shutdownUI();
        switcher.shutdownComponent();
        Jx.scheduler.testFlush();
    });

    Tx.test("ViewSwitcher.testSelectedViewDeleted", function (tc) {
        setup(tc);

        var selectedView = new Mail.UIDataModel.MailView(provider.getObjectById("firstOther"), selection.account);
        selection.view = selectedView;

        var host = {
            isWide: true,
            addListener: Jx.fnEmpty,
            removeListener: Jx.fnEmpty,
            selectViewAsync: function (view) { selectedView = view; },
        };

        var switcher = new Mail.ViewSwitcher(provider.getClient(), host, selection, settings, Jx.fnEmpty);
        sandbox.innerHTML = Jx.getUI(switcher).html;
        switcher.activateUI();

        tc.areEqual(selectedView.objectId, "firstOther");

        provider.getObjectById("firstOther").mock$fire("deleted");
        tc.areEqual(selectedView.objectId, "firstInbox");

        switcher.shutdownUI();
        switcher.shutdownComponent();
        Jx.scheduler.testFlush();
    });

})();
