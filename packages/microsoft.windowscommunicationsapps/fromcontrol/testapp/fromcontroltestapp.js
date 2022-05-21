
function makeAccount(name, email, objectId) {
    var sendAsAddresses = [email];
    sendAsAddresses.size = 1;
    return {
        displayName: name,
        emailAddress: email,
        objectId: objectId,
        sendAsAddresses: sendAsAddresses,
        preferredSendAsAddress: email,
    };
};

window.fromControl = {};
window.placeholder = null;
window.accounts = [makeAccount("Default Account", "defaultAccount@domain.ext", 1)];

window.addEventListener("load", function () {
    // Create a stubbed out account manager to feed the from control
    window.accountManager = {};
    accountManager.getConnectedAccountsByScenario = function () {
        var accountCollection = {};
        accountCollection.count = accounts.length;
        accountCollection.item = function (index) {
            return accounts[index];
        }
        return accountCollection;
    };

    // Create a stubbed out people mannger to feed the from control
    window.peopleManager = {};
    peopleManager.loadRecipientByEmail = function (emailAddress, displayName) {
        return {
            addEventListener: function () { },
            calculatedUIName: displayName,
            dispose: function () { },
            emailAddress: emailAddress,
            objectType: "Recipient",
            onchanged: null,
            fastName: displayName,
            person: {
                account: accounts[emailAddress],
                addEventListener: function () { },
                calculatedUIName: displayName,
                firstName: "",
                getUserTile: function () { return ""; },
                mostRelevantEmail: emailAddress,
                objectType: "MeContact",
                removeEventListener: function () { },
                windowsLiveEmailAddress: emailAddress
            },
            removeEventListener: function () { }
        };
    };

    placeholder = document.getElementById("placeholder");
    // Attach button behaviors
    document.getElementById("addAccounts").addEventListener("click", addAccounts, false);
    document.getElementById("getSelection").addEventListener("click", getSelection, false);
    document.getElementById("multipleAccounts").addEventListener("click", multipleAccounts, false);

    startFromControl();
}, false);

function addAccounts() {
    accounts.push(makeAccount("Account 1", "account1@fromcontrol.net", 2));
    accounts.push(makeAccount("Account 2", "account2@fromcontrol.net", 3));
    startFromControl();
}

function getSelection() {
    var output = document.getElementById("getSelectionResult");
    var account = fromControl.selectedAccount;
    output.value = account.emailAddress;
}

function multipleAccounts() {
    var output = document.getElementById("multipleAccountsResult");
    output.value = fromControl.multipleAccounts().toString();
}

function startFromControl() {
    // Create a from control
    fromControl = new FromControl.FromControl(window.accountManager, window.peopleManager);
    var ui = {};
    fromControl.getUI(ui);
    Jx.log.info("FromControl created with HTML:" + ui.html);

    // Add the from control to the page
    placeholder.innerHTML = ui.html;
    fromControl.activateUI();
}