// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { IXbox } from "./IXbox";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Entertainment.Instrumentation.Providers.Xbox')
export class Xbox implements IXbox { 
    isXboxAcquireExclusiveModeBeginEnabled: boolean = null;
    isXboxAcquireExclusiveModeDoneEnabled: boolean = null;
    isXboxAcquireExclusiveModeErrorEnabled: boolean = null;
    isXboxBogusMediaStateMessageIgnoredEnabled: boolean = null;
    isXboxControlCommandErrorEnabled: boolean = null;
    isXboxControlCommandSentEnabled: boolean = null;
    isXboxControlSeekCommandErrorEnabled: boolean = null;
    isXboxControlSeekCommandSentEnabled: boolean = null;
    isXboxDisconnectSessionBeginEnabled: boolean = null;
    isXboxDisconnectSessionDoneEnabled: boolean = null;
    isXboxDisconnectSessionErrorEnabled: boolean = null;
    isXboxEstablishTitleChannelBeginEnabled: boolean = null;
    isXboxEstablishTitleChannelDoneEnabled: boolean = null;
    isXboxEstablishTitleChannelErrorEnabled: boolean = null;
    isXboxGetActiveTitleInformationBeginEnabled: boolean = null;
    isXboxGetActiveTitleInformationDoneEnabled: boolean = null;
    isXboxGetActiveTitleInformationErrorEnabled: boolean = null;
    isXboxGetKeyboardBeginEnabled: boolean = null;
    isXboxGetKeyboardDoneEnabled: boolean = null;
    isXboxGetKeyboardErrorEnabled: boolean = null;
    isXboxGetKeyboardStateBeginEnabled: boolean = null;
    isXboxGetKeyboardStateDoneEnabled: boolean = null;
    isXboxGetKeyboardStateErrorEnabled: boolean = null;
    isXboxGetKeyboardTextBeginEnabled: boolean = null;
    isXboxGetKeyboardTextDoneEnabled: boolean = null;
    isXboxGetKeyboardTextErrorEnabled: boolean = null;
    isXboxGetMediaStateErrorEnabled: boolean = null;
    isXboxHeartBeatPingErrorEnabled: boolean = null;
    isXboxHideXboxControlsEnabled: boolean = null;
    isXboxLaunchTitleCallEnabled: boolean = null;
    isXboxLocalTransportStateChangedEnabled: boolean = null;
    isXboxNewSessionObjectAssignedEnabled: boolean = null;
    isXboxOnlinePresenceBeginEnabled: boolean = null;
    isXboxOnlinePresenceErrorEnabled: boolean = null;
    isXboxOnlinePresenceReceivedEnabled: boolean = null;
    isXboxReleaseExclusiveModeBeginEnabled: boolean = null;
    isXboxReleaseExclusiveModeDoneEnabled: boolean = null;
    isXboxReleaseExclusiveModeErrorEnabled: boolean = null;
    isXboxSendTitleMessageBeginEnabled: boolean = null;
    isXboxSendTitleMessageDoneEnabled: boolean = null;
    isXboxSendTitleMessageErrorEnabled: boolean = null;
    isXboxSendTouchPointsBeginEnabled: boolean = null;
    isXboxSendTouchPointsDoneEnabled: boolean = null;
    isXboxSendTouchPointsErrorEnabled: boolean = null;
    isXboxSessionConnectCallEnabled: boolean = null;
    isXboxSessionObjectReassignedEnabled: boolean = null;
    isXboxSessionObjectResetToNullEnabled: boolean = null;
    isXboxSessionStateChangeEnabled: boolean = null;
    isXboxSessionStatusChangedEnabled: boolean = null;
    isXboxSetKeyboardTextAndSelectionBeginEnabled: boolean = null;
    isXboxSetKeyboardTextAndSelectionDoneEnabled: boolean = null;
    isXboxSetKeyboardTextAndSelectionErrorEnabled: boolean = null;
    isXboxSetKeyboardTextBeginEnabled: boolean = null;
    isXboxSetKeyboardTextDoneEnabled: boolean = null;
    isXboxSetKeyboardTextErrorEnabled: boolean = null;
    isXboxShowXboxControlsEnabled: boolean = null;
    isXboxShowXboxControlsSetVisibleEnabled: boolean = null;
    isXboxSigninJoinSessionEnabled: boolean = null;
    isXboxSigninNoUserSessionsEnabled: boolean = null;
    isXboxSigninTMFServiceSigninEnabled: boolean = null;
    isXboxSigninX8AppSigninEnabled: boolean = null;
    isXboxStreamingModeChangedEnabled: boolean = null;
    isXboxTitleChangedEnabled: boolean = null;
    isXboxTitleChannelStatusChangedEnabled: boolean = null;
    isXboxTitleMessagingConfigChangedEnabled: boolean = null;
    isXboxTransportControlsLRCStateChangeEnabled: boolean = null;
    traceXboxSessionStateChange(newState: string, oldState: string): void {
        console.warn('Xbox#traceXboxSessionStateChange not implemented')
    }
    traceXboxTransportControlsLRCStateChange(newState: string, oldState: string): void {
        console.warn('Xbox#traceXboxTransportControlsLRCStateChange not implemented')
    }
    traceXboxSigninTMFServiceSignin(tag: string, hresult: number, errorText: string): void {
        console.warn('Xbox#traceXboxSigninTMFServiceSignin not implemented')
    }
    traceXboxSigninJoinSession(tag: string, hresult: number, errorText: string): void {
        console.warn('Xbox#traceXboxSigninJoinSession not implemented')
    }
    traceXboxSigninX8AppSignin(tag: string, hresult: number, errorText: string): void {
        console.warn('Xbox#traceXboxSigninX8AppSignin not implemented')
    }
    traceXboxSigninNoUserSessions(tag: string, hresult: number, errorText: string): void {
        console.warn('Xbox#traceXboxSigninNoUserSessions not implemented')
    }
    traceXboxControlCommandSent(controlKey: number, executionTimeMilliseconds: number): void {
        console.warn('Xbox#traceXboxControlCommandSent not implemented')
    }
    traceXboxControlCommandError(controlKey: number, executionTimeMilliseconds: number, responseCode: number): void {
        console.warn('Xbox#traceXboxControlCommandError not implemented')
    }
    traceXboxControlSeekCommandSent(seekPosition: number, executionTimeMilliseconds: number): void {
        console.warn('Xbox#traceXboxControlSeekCommandSent not implemented')
    }
    traceXboxControlSeekCommandError(seekPosition: number, executionTimeMilliseconds: number, responseCode: number): void {
        console.warn('Xbox#traceXboxControlSeekCommandError not implemented')
    }
    traceXboxBogusMediaStateMessageIgnored(position: number, transportState: number, positionBeforeLastSeek: number, lastSeekPosition: number): void {
        console.warn('Xbox#traceXboxBogusMediaStateMessageIgnored not implemented')
    }
    traceXboxGetMediaStateError(executionTimeMilliseconds: number, responseCode: number): void {
        console.warn('Xbox#traceXboxGetMediaStateError not implemented')
    }
    traceXboxShowXboxControls(): void {
        console.warn('Xbox#traceXboxShowXboxControls not implemented')
    }
    traceXboxShowXboxControlsSetVisible(): void {
        console.warn('Xbox#traceXboxShowXboxControlsSetVisible not implemented')
    }
    traceXboxHideXboxControls(): void {
        console.warn('Xbox#traceXboxHideXboxControls not implemented')
    }
    traceXboxOnlinePresenceBegin(): void {
        console.warn('Xbox#traceXboxOnlinePresenceBegin not implemented')
    }
    traceXboxOnlinePresenceReceived(titleId: number, mediaAssetId: string): void {
        console.warn('Xbox#traceXboxOnlinePresenceReceived not implemented')
    }
    traceXboxOnlinePresenceError(hresult: number, errorMessage: string): void {
        console.warn('Xbox#traceXboxOnlinePresenceError not implemented')
    }
    traceXboxGetActiveTitleInformationBegin(): void {
        console.warn('Xbox#traceXboxGetActiveTitleInformationBegin not implemented')
    }
    traceXboxGetActiveTitleInformationDone(): void {
        console.warn('Xbox#traceXboxGetActiveTitleInformationDone not implemented')
    }
    traceXboxGetActiveTitleInformationError(hresult: number, errorMessage: string): void {
        console.warn('Xbox#traceXboxGetActiveTitleInformationError not implemented')
    }
    traceXboxEstablishTitleChannelBegin(): void {
        console.warn('Xbox#traceXboxEstablishTitleChannelBegin not implemented')
    }
    traceXboxEstablishTitleChannelDone(): void {
        console.warn('Xbox#traceXboxEstablishTitleChannelDone not implemented')
    }
    traceXboxEstablishTitleChannelError(hresult: number, errorMessage: string): void {
        console.warn('Xbox#traceXboxEstablishTitleChannelError not implemented')
    }
    traceXboxSendTouchPointsBegin(): void {
        console.warn('Xbox#traceXboxSendTouchPointsBegin not implemented')
    }
    traceXboxSendTouchPointsDone(): void {
        console.warn('Xbox#traceXboxSendTouchPointsDone not implemented')
    }
    traceXboxSendTouchPointsError(hresult: number, errorMessage: string): void {
        console.warn('Xbox#traceXboxSendTouchPointsError not implemented')
    }
    traceXboxGetKeyboardBegin(): void {
        console.warn('Xbox#traceXboxGetKeyboardBegin not implemented')
    }
    traceXboxGetKeyboardDone(): void {
        console.warn('Xbox#traceXboxGetKeyboardDone not implemented')
    }
    traceXboxGetKeyboardError(hresult: number, errorMessage: string): void {
        console.warn('Xbox#traceXboxGetKeyboardError not implemented')
    }
    traceXboxGetKeyboardStateBegin(): void {
        console.warn('Xbox#traceXboxGetKeyboardStateBegin not implemented')
    }
    traceXboxGetKeyboardStateDone(): void {
        console.warn('Xbox#traceXboxGetKeyboardStateDone not implemented')
    }
    traceXboxGetKeyboardStateError(hresult: number, errorMessage: string): void {
        console.warn('Xbox#traceXboxGetKeyboardStateError not implemented')
    }
    traceXboxGetKeyboardTextBegin(): void {
        console.warn('Xbox#traceXboxGetKeyboardTextBegin not implemented')
    }
    traceXboxGetKeyboardTextDone(): void {
        console.warn('Xbox#traceXboxGetKeyboardTextDone not implemented')
    }
    traceXboxGetKeyboardTextError(hresult: number, errorMessage: string): void {
        console.warn('Xbox#traceXboxGetKeyboardTextError not implemented')
    }
    traceXboxSetKeyboardTextBegin(text: string): void {
        console.warn('Xbox#traceXboxSetKeyboardTextBegin not implemented')
    }
    traceXboxSetKeyboardTextDone(): void {
        console.warn('Xbox#traceXboxSetKeyboardTextDone not implemented')
    }
    traceXboxSetKeyboardTextError(hresult: number, errorMessage: string): void {
        console.warn('Xbox#traceXboxSetKeyboardTextError not implemented')
    }
    traceXboxSetKeyboardTextAndSelectionBegin(text: string, selectionStart: number, selectionLength: number): void {
        console.warn('Xbox#traceXboxSetKeyboardTextAndSelectionBegin not implemented')
    }
    traceXboxSetKeyboardTextAndSelectionDone(): void {
        console.warn('Xbox#traceXboxSetKeyboardTextAndSelectionDone not implemented')
    }
    traceXboxSetKeyboardTextAndSelectionError(hresult: number, errorMessage: string): void {
        console.warn('Xbox#traceXboxSetKeyboardTextAndSelectionError not implemented')
    }
    traceXboxSendTitleMessageBegin(): void {
        console.warn('Xbox#traceXboxSendTitleMessageBegin not implemented')
    }
    traceXboxSendTitleMessageDone(): void {
        console.warn('Xbox#traceXboxSendTitleMessageDone not implemented')
    }
    traceXboxSendTitleMessageError(hresult: number, errorMessage: string): void {
        console.warn('Xbox#traceXboxSendTitleMessageError not implemented')
    }
    traceXboxDisconnectSessionBegin(): void {
        console.warn('Xbox#traceXboxDisconnectSessionBegin not implemented')
    }
    traceXboxDisconnectSessionDone(): void {
        console.warn('Xbox#traceXboxDisconnectSessionDone not implemented')
    }
    traceXboxDisconnectSessionError(hresult: number, errorMessage: string): void {
        console.warn('Xbox#traceXboxDisconnectSessionError not implemented')
    }
    traceXboxNewSessionObjectAssigned(): void {
        console.warn('Xbox#traceXboxNewSessionObjectAssigned not implemented')
    }
    traceXboxSessionObjectReassigned(): void {
        console.warn('Xbox#traceXboxSessionObjectReassigned not implemented')
    }
    traceXboxSessionObjectResetToNull(): void {
        console.warn('Xbox#traceXboxSessionObjectResetToNull not implemented')
    }
    traceXboxTitleChanged(titleId: number): void {
        console.warn('Xbox#traceXboxTitleChanged not implemented')
    }
    traceXboxTitleMessagingConfigChanged(titleId: number, titlePort: number, enabled: boolean): void {
        console.warn('Xbox#traceXboxTitleMessagingConfigChanged not implemented')
    }
    traceXboxTitleChannelStatusChanged(status: number, titleId: number, titlePort: number, hresult: number): void {
        console.warn('Xbox#traceXboxTitleChannelStatusChanged not implemented')
    }
    traceXboxStreamingModeChanged(clientExclusiveModeStatus: number, consoleExclusiveModeStatus: number): void {
        console.warn('Xbox#traceXboxStreamingModeChanged not implemented')
    }
    traceXboxLocalTransportStateChanged(localTransportConnected: boolean): void {
        console.warn('Xbox#traceXboxLocalTransportStateChanged not implemented')
    }
    traceXboxSessionStatusChanged(sessionState: number): void {
        console.warn('Xbox#traceXboxSessionStatusChanged not implemented')
    }
    traceXboxAcquireExclusiveModeBegin(): void {
        console.warn('Xbox#traceXboxAcquireExclusiveModeBegin not implemented')
    }
    traceXboxAcquireExclusiveModeDone(): void {
        console.warn('Xbox#traceXboxAcquireExclusiveModeDone not implemented')
    }
    traceXboxAcquireExclusiveModeError(hresult: number, errorMessage: string): void {
        console.warn('Xbox#traceXboxAcquireExclusiveModeError not implemented')
    }
    traceXboxHeartBeatPingError(hresult: number, errorMessage: string, sessionState: string, isCurrentWinRTSessionReassigned: boolean, isCurrentWinRTSessionNull: boolean): void {
        console.warn('Xbox#traceXboxHeartBeatPingError not implemented')
    }
    traceXboxSessionConnectCall(sessionState: string, isRetry: boolean): void {
        console.warn('Xbox#traceXboxSessionConnectCall not implemented')
    }
    traceXboxLaunchTitleCall(titleId: number, startTimeMilliseconds: number, firstAction: string): void {
        console.warn('Xbox#traceXboxLaunchTitleCall not implemented')
    }
    traceXboxReleaseExclusiveModeBegin(): void {
        console.warn('Xbox#traceXboxReleaseExclusiveModeBegin not implemented')
    }
    traceXboxReleaseExclusiveModeDone(): void {
        console.warn('Xbox#traceXboxReleaseExclusiveModeDone not implemented')
    }
    traceXboxReleaseExclusiveModeError(hresult: number, errorMessage: string): void {
        console.warn('Xbox#traceXboxReleaseExclusiveModeError not implemented')
    }
}
