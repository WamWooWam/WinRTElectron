// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------


export interface IXbox {
    isXboxAcquireExclusiveModeBeginEnabled: boolean;
    isXboxAcquireExclusiveModeDoneEnabled: boolean;
    isXboxAcquireExclusiveModeErrorEnabled: boolean;
    isXboxBogusMediaStateMessageIgnoredEnabled: boolean;
    isXboxControlCommandErrorEnabled: boolean;
    isXboxControlCommandSentEnabled: boolean;
    isXboxControlSeekCommandErrorEnabled: boolean;
    isXboxControlSeekCommandSentEnabled: boolean;
    isXboxDisconnectSessionBeginEnabled: boolean;
    isXboxDisconnectSessionDoneEnabled: boolean;
    isXboxDisconnectSessionErrorEnabled: boolean;
    isXboxEstablishTitleChannelBeginEnabled: boolean;
    isXboxEstablishTitleChannelDoneEnabled: boolean;
    isXboxEstablishTitleChannelErrorEnabled: boolean;
    isXboxGetActiveTitleInformationBeginEnabled: boolean;
    isXboxGetActiveTitleInformationDoneEnabled: boolean;
    isXboxGetActiveTitleInformationErrorEnabled: boolean;
    isXboxGetKeyboardBeginEnabled: boolean;
    isXboxGetKeyboardDoneEnabled: boolean;
    isXboxGetKeyboardErrorEnabled: boolean;
    isXboxGetKeyboardStateBeginEnabled: boolean;
    isXboxGetKeyboardStateDoneEnabled: boolean;
    isXboxGetKeyboardStateErrorEnabled: boolean;
    isXboxGetKeyboardTextBeginEnabled: boolean;
    isXboxGetKeyboardTextDoneEnabled: boolean;
    isXboxGetKeyboardTextErrorEnabled: boolean;
    isXboxGetMediaStateErrorEnabled: boolean;
    isXboxHeartBeatPingErrorEnabled: boolean;
    isXboxHideXboxControlsEnabled: boolean;
    isXboxLaunchTitleCallEnabled: boolean;
    isXboxLocalTransportStateChangedEnabled: boolean;
    isXboxNewSessionObjectAssignedEnabled: boolean;
    isXboxOnlinePresenceBeginEnabled: boolean;
    isXboxOnlinePresenceErrorEnabled: boolean;
    isXboxOnlinePresenceReceivedEnabled: boolean;
    isXboxReleaseExclusiveModeBeginEnabled: boolean;
    isXboxReleaseExclusiveModeDoneEnabled: boolean;
    isXboxReleaseExclusiveModeErrorEnabled: boolean;
    isXboxSendTitleMessageBeginEnabled: boolean;
    isXboxSendTitleMessageDoneEnabled: boolean;
    isXboxSendTitleMessageErrorEnabled: boolean;
    isXboxSendTouchPointsBeginEnabled: boolean;
    isXboxSendTouchPointsDoneEnabled: boolean;
    isXboxSendTouchPointsErrorEnabled: boolean;
    isXboxSessionConnectCallEnabled: boolean;
    isXboxSessionObjectReassignedEnabled: boolean;
    isXboxSessionObjectResetToNullEnabled: boolean;
    isXboxSessionStateChangeEnabled: boolean;
    isXboxSessionStatusChangedEnabled: boolean;
    isXboxSetKeyboardTextAndSelectionBeginEnabled: boolean;
    isXboxSetKeyboardTextAndSelectionDoneEnabled: boolean;
    isXboxSetKeyboardTextAndSelectionErrorEnabled: boolean;
    isXboxSetKeyboardTextBeginEnabled: boolean;
    isXboxSetKeyboardTextDoneEnabled: boolean;
    isXboxSetKeyboardTextErrorEnabled: boolean;
    isXboxShowXboxControlsEnabled: boolean;
    isXboxShowXboxControlsSetVisibleEnabled: boolean;
    isXboxSigninJoinSessionEnabled: boolean;
    isXboxSigninNoUserSessionsEnabled: boolean;
    isXboxSigninTMFServiceSigninEnabled: boolean;
    isXboxSigninX8AppSigninEnabled: boolean;
    isXboxStreamingModeChangedEnabled: boolean;
    isXboxTitleChangedEnabled: boolean;
    isXboxTitleChannelStatusChangedEnabled: boolean;
    isXboxTitleMessagingConfigChangedEnabled: boolean;
    isXboxTransportControlsLRCStateChangeEnabled: boolean;
    traceXboxSessionStateChange(newState: string, oldState: string): void;
    traceXboxTransportControlsLRCStateChange(newState: string, oldState: string): void;
    traceXboxSigninTMFServiceSignin(tag: string, hresult: number, errorText: string): void;
    traceXboxSigninJoinSession(tag: string, hresult: number, errorText: string): void;
    traceXboxSigninX8AppSignin(tag: string, hresult: number, errorText: string): void;
    traceXboxSigninNoUserSessions(tag: string, hresult: number, errorText: string): void;
    traceXboxControlCommandSent(controlKey: number, executionTimeMilliseconds: number): void;
    traceXboxControlCommandError(controlKey: number, executionTimeMilliseconds: number, responseCode: number): void;
    traceXboxControlSeekCommandSent(seekPosition: number, executionTimeMilliseconds: number): void;
    traceXboxControlSeekCommandError(seekPosition: number, executionTimeMilliseconds: number, responseCode: number): void;
    traceXboxBogusMediaStateMessageIgnored(position: number, transportState: number, positionBeforeLastSeek: number, lastSeekPosition: number): void;
    traceXboxGetMediaStateError(executionTimeMilliseconds: number, responseCode: number): void;
    traceXboxShowXboxControls(): void;
    traceXboxShowXboxControlsSetVisible(): void;
    traceXboxHideXboxControls(): void;
    traceXboxOnlinePresenceBegin(): void;
    traceXboxOnlinePresenceReceived(titleId: number, mediaAssetId: string): void;
    traceXboxOnlinePresenceError(hresult: number, errorMessage: string): void;
    traceXboxGetActiveTitleInformationBegin(): void;
    traceXboxGetActiveTitleInformationDone(): void;
    traceXboxGetActiveTitleInformationError(hresult: number, errorMessage: string): void;
    traceXboxEstablishTitleChannelBegin(): void;
    traceXboxEstablishTitleChannelDone(): void;
    traceXboxEstablishTitleChannelError(hresult: number, errorMessage: string): void;
    traceXboxSendTouchPointsBegin(): void;
    traceXboxSendTouchPointsDone(): void;
    traceXboxSendTouchPointsError(hresult: number, errorMessage: string): void;
    traceXboxGetKeyboardBegin(): void;
    traceXboxGetKeyboardDone(): void;
    traceXboxGetKeyboardError(hresult: number, errorMessage: string): void;
    traceXboxGetKeyboardStateBegin(): void;
    traceXboxGetKeyboardStateDone(): void;
    traceXboxGetKeyboardStateError(hresult: number, errorMessage: string): void;
    traceXboxGetKeyboardTextBegin(): void;
    traceXboxGetKeyboardTextDone(): void;
    traceXboxGetKeyboardTextError(hresult: number, errorMessage: string): void;
    traceXboxSetKeyboardTextBegin(text: string): void;
    traceXboxSetKeyboardTextDone(): void;
    traceXboxSetKeyboardTextError(hresult: number, errorMessage: string): void;
    traceXboxSetKeyboardTextAndSelectionBegin(text: string, selectionStart: number, selectionLength: number): void;
    traceXboxSetKeyboardTextAndSelectionDone(): void;
    traceXboxSetKeyboardTextAndSelectionError(hresult: number, errorMessage: string): void;
    traceXboxSendTitleMessageBegin(): void;
    traceXboxSendTitleMessageDone(): void;
    traceXboxSendTitleMessageError(hresult: number, errorMessage: string): void;
    traceXboxDisconnectSessionBegin(): void;
    traceXboxDisconnectSessionDone(): void;
    traceXboxDisconnectSessionError(hresult: number, errorMessage: string): void;
    traceXboxNewSessionObjectAssigned(): void;
    traceXboxSessionObjectReassigned(): void;
    traceXboxSessionObjectResetToNull(): void;
    traceXboxTitleChanged(titleId: number): void;
    traceXboxTitleMessagingConfigChanged(titleId: number, titlePort: number, enabled: boolean): void;
    traceXboxTitleChannelStatusChanged(status: number, titleId: number, titlePort: number, hresult: number): void;
    traceXboxStreamingModeChanged(clientExclusiveModeStatus: number, consoleExclusiveModeStatus: number): void;
    traceXboxLocalTransportStateChanged(localTransportConnected: boolean): void;
    traceXboxSessionStatusChanged(sessionState: number): void;
    traceXboxAcquireExclusiveModeBegin(): void;
    traceXboxAcquireExclusiveModeDone(): void;
    traceXboxAcquireExclusiveModeError(hresult: number, errorMessage: string): void;
    traceXboxHeartBeatPingError(hresult: number, errorMessage: string, sessionState: string, isCurrentWinRTSessionReassigned: boolean, isCurrentWinRTSessionNull: boolean): void;
    traceXboxSessionConnectCall(sessionState: string, isRetry: boolean): void;
    traceXboxLaunchTitleCall(titleId: number, startTimeMilliseconds: number, firstAction: string): void;
    traceXboxReleaseExclusiveModeBegin(): void;
    traceXboxReleaseExclusiveModeDone(): void;
    traceXboxReleaseExclusiveModeError(hresult: number, errorMessage: string): void;
}
