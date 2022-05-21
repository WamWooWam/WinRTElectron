
var MoCan = ModernCanvas,
    canvasId = "modernCanvas",
    characterCountId = "characterCount",
    commandIdAddId = "commandIdAdd",
    commandIdExecutedId = "commandIdExecuted",
    commandIdRemoveId = "commandIdRemove",
    commandIdRequestedId = "commandIdRequested",
    contentDataId = "contentData",
    cueTextId = "cueText",
    isRTLResult = "isRTLResult",
    maxHeightId = "maxHeight",
    menuItemCommandIdId = "menuItemCommandId",
    menuItemDisplayStringAddId = "menuItemDisplayNameAdd",
    menuItemDisplayStringRemoveId = "menuItemDisplayNameRemove",
    minHeightId = "minHeight",
    pickerResult = "pickerResult",
    pickerWithFocus = "pickerWithFocus",
    shorcutCommandIdId = "shortcutCommandId",
    shortcutStringAddId = "shortcutStringAdd",
    shortcutStringRemoveId = "shortcutStringRemove",
    testOutputId = "testOutput",
    testOutputStringId = "testOutputString",
    usageDataId = "usageData";

var canvasElement = {},
    emojiPicker = {},
    modernCanvas = {};
modernCanvas.components = {};

window.addEventListener("load", function () {
    // Initialize current Canvas components
    canvasElement = document.getElementById(canvasId);
    ModernCanvas.createCanvasAsync(canvasElement, {})
    .done(function (canvasControl) {
        /// <param name="canvasControl" type="ModernCanvas.ModernCanvas" />
        modernCanvas = canvasControl;
        // Add listeners
        Jx.addListener(modernCanvas, "command", commandListener);
        Jx.addListener(modernCanvas, "aftercommand", postCommandListener);
        modernCanvas.addListener("charactercountchanged", characterCountListener);

        // Build picker
        var pickerCallback = function (emojiId) {
            document.getElementById(pickerResult).value = emojiId;
            modernCanvas.insertElement(emojiId);
        };
        emojiPicker = new EmojiPicker.EmojiPicker(pickerCallback, modernCanvas, document.getElementById("emojiPickerAnchor"));
    });

    // Attach functionality to buttons
    document.getElementById("addCommand").addEventListener("click", addCommand, false);
    document.getElementById("addContent").addEventListener("click", addContent, false);
    document.getElementById("addShortcut").addEventListener("click", addShortcut, false);
    document.getElementById("blockFormattingCommands").addEventListener("click", blockFormattingCommands, false);
    document.getElementById("clearUsageData").addEventListener("click", clearUsageData, false);
    document.getElementById("getContent").addEventListener("click", getContent, false);
    document.getElementById("getUsageData").addEventListener("click", getUsageData, false);
    document.getElementById("isRTL").addEventListener("click", isRTL, false);
    document.getElementById("launchPicker").addEventListener("click", launchPicker, false);
    document.getElementById("removeCommand").addEventListener("click", removeCommand, false);
    document.getElementById("removeShortcut").addEventListener("click", removeShortcut, false);
    document.getElementById("resetHeight").addEventListener("click", resetHeight, false);
    document.getElementById("setCueText").addEventListener("click", setCueText, false);
    document.getElementById("setHeight").addEventListener("click", setHeight, false);
    document.getElementById("spellCheckingOff").addEventListener("click", spellCheckingOff, false);
    document.getElementById("spellCheckingOn").addEventListener("click", spellCheckingOn, false);

}, false);

function addCommand() {
    var id = document.getElementById(commandIdAddId).value;
    var output = document.getElementById(testOutputStringId).value;
    var testFunction = function (value) {
        return function () {
            var output = document.getElementById(testOutputId);
            output.value = value;
        };
    }(output);
    var command = new MoCan.Command(id, testFunction);
    modernCanvas.components.commandManager.setCommand(command);
};

function addContent() {
    var data = document.getElementById(contentDataId).value,
        location,
        format,
        m;
    var locations = document.getElementsByName("location");
    for (m = locations.length; m--;) {
        if (locations[m].checked) {
            location = locations[m].id;
            break;
        }
    }
    var formats = document.getElementsByName("format");
    for (m = formats.length; m--;) {
        if (formats[m].checked) {
            format = formats[m].id;
            break;
        }
    }
    modernCanvas.addContent(data, format, location);
};

function addShortcut() {
    var shortcutString = document.getElementById(shortcutStringAddId).value;
    var commandId = document.getElementById(shorcutCommandIdId).value;
    modernCanvas.components.shortcutManager.setShortcut(shortcutString, commandId);
};

function blockFormattingCommands() {
    var command,
        commands = ["alignCenter", "alignLeft", "alignRight", "bold", "bullets", "growFont", "indent",
            "italic", "outdent", "shrinkFont", "underline"],
        testFunction = function () { },
        commandManager = modernCanvas.components.commandManager;
    for (var m = commands.length; m--;) {
        command = new MoCan.Command(commands[m], testFunction);
        commandManager.setCommand(command);
    }
};

function characterCountListener(e) {
    var output = document.getElementById(characterCountId);
    output.value = e.characterCount;
};

function clearUsageData() {
    modernCanvas.clearUsageData();
}

function commandListener(e) {
    var output = document.getElementById(commandIdRequestedId);
    output.value = e.command;
};

function getContent() {
    var output = document.getElementById(contentDataId);
    var formats = document.getElementsByName("format");
    for (var m = formats.length; m--;) {
        if (formats[m].checked) {
            format = formats[m].id;
        }
    }
    output.value = modernCanvas.getContent(format);
};

function getUsageData() {
    var output = document.getElementById(usageDataId);
    output.value = JSON.stringify(modernCanvas.getUsageData());
};

function isRTL() {
    var output = document.getElementById(isRTLResult);
    output.value = modernCanvas.isRTL().toString();
};

function launchPicker(e) {
    emojiPicker.show();
};

function postCommandListener(e) {
    var output = document.getElementById(commandIdExecutedId);
    output.value = e.command;
};

function removeCommand() {
    var id = document.getElementById(commandIdRemoveId).value;
    modernCanvas.components.commandManager.removeCommand(id);
};

function removeShortcut() {
    var shortcutString = document.getElementById(shortcutStringRemoveId).value;
    modernCanvas.components.shortcutManager.removeShortcut(shortcutString);
};

function resetHeight() {
    var canvasStyle = document.getElementById(canvasId).style;
    canvasStyle.maxHeight = "800px";
    canvasStyle.minHeight = "400px";
    document.getElementById(maxHeightId).value = "";
    document.getElementById(minHeightId).value = "";
};

function spellCheckingOff() {
    var canvas = document.getElementById(canvasId);
    canvas.spellcheck = false;
};

function spellCheckingOn() {
    var canvas = document.getElementById(canvasId);
    canvas.spellcheck = true;
};

function setHeight() {
    var maxHeight = document.getElementById(maxHeightId).value;
    var minHeight = document.getElementById(minHeightId).value;

    if (isNaN(maxHeight) || isNaN(minHeight)) {
        return;
    }

    var canvasStyle = document.getElementById(canvasId).style;
    canvasStyle.maxHeight = maxHeight + "px";
    canvasStyle.minHeight = minHeight + "px";

    modernCanvas.refreshHeight();
};

function setCueText() {
    var data = document.getElementById(cueTextId).value;
    modernCanvas.setCueText(data);
};