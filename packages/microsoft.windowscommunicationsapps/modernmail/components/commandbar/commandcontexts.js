﻿Jx.delayDefine(Mail.Commands,"Contexts",function(){var i=Microsoft.WindowsLive.Platform,t=i.MailViewType,n=Mail.Commands.Contexts={doesAccountSupportMail:function(n){return n.account&&n.account.isMailEnabled()},allowFolderOperations:function(){var n=Mail.guiState;return!(n.isOnePane&&n.isReadingPaneActive)},supportMultiSelect:function(){return!Mail.SearchHandler.isSearching||Mail.SearchHandler.searchResultsEditable},allowFilterSwitch:function(){var t=Mail.guiState;return!n.composeInFocus()&&!Mail.SearchHandler.isSearching&&t.isMessageListVisible},isMessageListActive:function(){var n=Mail.guiState;return n.isMessageListVisible},isReadingPaneActive:function(){var n=Mail.guiState;return n.isReadingPaneVisible},singleSelection:function(){var n=Mail.Globals.appState.selectedMessages;return Jx.isArray(n)&&n.length===1},nonEmptySelection:function(){var n=Mail.Globals.appState.selectedMessages;return Jx.isArray(n)&&n.length>0},canChangeReadState:function(i){return n.nonEmptySelection()&&i.view.type!==t.outbox&&(n.hasReadMessages()||n.hasUnreadMessages())},_containsItemsWithReadState:function(n){var t=Mail.Globals.appState.selectedMessages;return t.some(function(t){return t.canMarkRead&&t.read===n})},hasReadMessages:function(){return n._containsItemsWithReadState(true)},hasUnreadMessages:function(){return n._containsItemsWithReadState(false)},_containsItemsWithFlagState:function(n){var t=Mail.Globals.appState.selectedMessages;return t.some(function(t){return t.canFlag&&t.flagged===n})},hasFlaggedMessages:function(){return n._containsItemsWithFlagState(true)},hasUnflaggedMessages:function(){return n._containsItemsWithFlagState(false)},selectionSupportMoving:function(){var n=Mail.Globals.appState.selectedMessages;return n.some(function(n){return n.canMove})},selectedMessagesSupportSweep:function(n){var t=function(n){return!n.isDraft&&n.from};return n.messages.some(t)},allExceptDraftsAndOutbox:function(n){var t=n.message;return!t.isInOutbox&&!t.isDraft},draftsAreSelected:function(n){return n.messages.some(function(n){return n.isDraft})},selectionSupportsEditCommand:function(){var n=Mail.Globals.appState.lastSelectedMessage,t;return n?(t=Mail.GlomManager.messageOpenInAnotherWindow(n),t&&n.isDraft||n.isInOutbox):false},folderSupportsJunkCommand:function(n){var i=n.view.type;return i!==t.draft&&i!==t.junkMail&&i!==t.outbox},_doesTileExist:function(n){Mail.writeProfilerMark("Commands.Contexts._doesTileExist",Mail.LogEvent.start);var t=n.view,i=t&&Jx.isNonEmptyString(t.startScreenTileId)&&Windows.UI.StartScreen.SecondaryTile.exists(t.startScreenTileId);return Mail.writeProfilerMark("Commands.Contexts._doesTileExist",Mail.LogEvent.stop),i},showPin:function(t){var i=false,r=t.view;try{i=r&&Mail.ViewCapabilities.canPinToStart(r)&&!n._doesTileExist(t)}catch(u){Jx.log.exception("CommandContexts.showPin - _doesTileExist fails with ",u)}return i},showUnpin:function(t){var i=false,r=t.view;try{i=r&&Mail.ViewCapabilities.canPinToStart(r)&&n._doesTileExist(t)}catch(u){Jx.log.exception("CommandContexts.showUnpin - _doesTileExist fails with ",u)}return i},isPrintingEnabled:function(){var t=new Mail.PrintHandler;return t.printEnabled&&n.singleSelection()},allowResponse:function(n){var i=n.view.type;return i!==t.outbox&&i!==t.junkMail},irmAllows:function(n){var t=Mail.Globals.appState.lastSelectedMessage;return t[n]},irmCanRespond:function(){return n.irmAllows("irmCanForward")||n.irmAllows("irmCanReply")||n.irmAllows("irmCanReplyAll")},composeInFocus:function(){var n=Mail.Globals.commandManager.getContext("composeSelection");return n&&n.composeInFocus},copyEnabled:function(){var n=Mail.Globals.commandManager.getContext("composeSelection"),t;return n?(t=n.getSelectionState(),t.hasNonEmptySelection):false},composeInLink:function(){var n=Mail.Globals.commandManager.getContext("composeSelection"),t;return n?(t=n.getSelectionState(),t.isLink):false},composeFormatToggle:function(n){var t=Mail.Globals.commandManager.getContext("composeSelection"),i;return t?(i=t.getSelectionStyles(),i[n]):false}}})