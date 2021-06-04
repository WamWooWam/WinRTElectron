/// <ref src="Windows.Foundation.ts"/>
import { EventTarget, Rect, Collections, IAsyncOperation, Enumerable } from "./Windows.Foundation"
import { ShimProxyHandler } from "./ShimProxyHandler";
import promiseIpc from "electron-promise-ipc"
import { uuidv4 } from "./util";
import { IpcHelper } from "./IpcHelper";
import { ipcRenderer } from "electron";

export namespace UI {
    export namespace ApplicationSettings {
        enum SettingsPaneMessageType {
            show,
            hide,
            requestContent,
            contentInvoked
        }

        class SettingsPaneMessage {
            type: SettingsPaneMessageType
            index?: number
        }

        export class SettingsPane extends EventTarget {

            private commands: Collections.Vector<SettingsCommand>;

            constructor() {
                super();

                ipcRenderer.on("settings-pane", (event, resp) => {
                    if (resp.type == SettingsPaneMessageType.requestContent) {
                        let pane = SettingsPane.getForCurrentView();
                        let commands = pane.getCommands().getArray().map(c => { return { id: c.id, label: c.label } });;
                        let message = {
                            type: SettingsPaneMessageType.requestContent,
                            commands: commands
                        }

                        return IpcHelper.send("settings-pane", message);
                    }

                    if (resp.type == SettingsPaneMessageType.contentInvoked) {
                        let pane = SettingsPane.getForCurrentView();
                        let commands = pane.getCommands();

                        let command: SettingsCommand = null;
                        for (const item of commands.getArray()) {
                            if (item.id == resp.index) {
                                command = item;
                                break;
                            }
                        }

                        if (!command) return;

                        if (command.invoked)
                            command.invoked(command);
                    }
                })
            }

            getCommands() {
                if (!this.commands) {
                    var event = new SettingsPaneCommandsRequestedEventArgs();
                    this.dispatchEvent(event);
                    this.commands = event.request.applicationCommands;
                }

                return this.commands;
            }

            private static instance: SettingsPane;
            static getForCurrentView() {
                return SettingsPane.instance ?? (SettingsPane.instance = new SettingsPane());
            }

            static show() {
                let message: any = {
                    type: SettingsPaneMessageType.show
                }

                IpcHelper.send("settings-pane", message);
            }

            @Enumerable()
            static get edge(): SettingsEdgeLocation {
                return SettingsEdgeLocation.right;
            }
        }

        export class SettingsPaneCommandsRequestedEventArgs extends Event {
            constructor() {
                super("commandsrequested");
                this.request = new SettingsPaneCommandsRequest();
            }

            request: SettingsPaneCommandsRequest;
        }

        export class SettingsPaneCommandsRequest {
            constructor() {
                this.applicationCommands = new Collections.Vector<SettingsCommand>([]);
            }

            applicationCommands: Collections.Vector<SettingsCommand>;
        }

        export class SettingsCommand implements Popups.IUICommand {
            constructor(commandId: any, label: string, handler: Popups.UICommandInvokedHandler) {
                this.id = commandId;
                this.label = label;
                this.invoked = handler;
            }

            id: any;
            label: string;
            invoked: Popups.UICommandInvokedHandler;
        }

        export enum SettingsEdgeLocation {
            right,
            left
        }
    }

    export namespace Input {
        export class EdgeGesture extends EventTarget {
            public static getForCurrentView() {
                return new Proxy(new EdgeGesture(), new ShimProxyHandler);
            }
        }
    }

    export namespace Core {
        export interface IPropertyAnimation {
            duration: number;
        }

        export namespace AnimationMetrics {
            export enum AnimationEffect {
                expand,
                collapse,
                reposition,
                fadeIn,
                fadeOut,
                addToList,
                deleteFromList,
                addToGrid,
                deleteFromGrid,
                addToSearchGrid,
                deleteFromSearchGrid,
                addToSearchList,
                deleteFromSearchList,
                showEdgeUI,
                showPanel,
                hideEdgeUI,
                hidePanel,
                showPopup,
                hidePopup,
                pointerDown,
                pointerUp,
                dragSourceStart,
                dragSourceEnd,
                transitionContent,
                reveal,
                hide,
                dragBetweenEnter,
                dragBetweenLeave,
                swipeSelect,
                swipeDeselect,
                swipeReveal,
                enterPage,
                transitionPage,
                crossFade,
                peek,
                updateBadge,
            }
            export enum AnimationEffectTarget {
                primary,
                added,
                affected,
                background,
                content,
                deleted,
                deselected,
                dragSource,
                hidden,
                incoming,
                outgoing,
                outline,
                remaining,
                revealed,
                rowIn,
                rowOut,
                selected,
                selection,
                shown,
                tapped,
            }
            export enum PropertyAnimationType {
                scale,
                translation,
                opacity,
            }
            export class AnimationDescription {
                constructor(effect: AnimationEffect, target: AnimationEffectTarget) {

                }

                get animations(): Array<IPropertyAnimation> {
                    return [{ duration: 1000 }]; // idfk
                }
            }
        }
    }

    export namespace ViewManagement {
        export class ApplicationView extends EventTarget {
            public static getForCurrentView() {
                return new Proxy(new ApplicationView(), new ShimProxyHandler);
            }

            public get id(): number {
                return 0;
            }

            public get title(): string {
                return "title";
            }

            public set title(value: string) {

            }

            public static get value(): ApplicationViewState {
                if (window.matchMedia("(max-width: 376px)").matches)
                    return ApplicationViewState.snapped
                else
                    return ApplicationViewState.filled;
            }
        }

        export enum ApplicationViewBoundsMode {
            useVisible,
            useCoreWindow,
        }
        export enum ApplicationViewMode {
            default,
            compactOverlay,
            spanning,
        }
        export enum ApplicationViewOrientation {
            landscape,
            portrait,
        }
        export enum ApplicationViewState {
            fullScreenLandscape,
            filled,
            snapped,
            fullScreenPortrait,
        }
        export enum ApplicationViewSwitchingOptions {
            default,
            skipAnimation,
            consolidateViews,
        }
        export enum ApplicationViewWindowingMode {
            auto,
            preferredLaunchViewSize,
            fullScreen,
            compactOverlay,
            maximized,
        }
        export enum HandPreference {
            leftHanded,
            rightHanded,
        }
        export enum UserInteractionMode {
            mouse,
            touch,
        }
        export enum ViewSizePreference {
            default,
            useLess,
            useHalf,
            useMore,
            useMinimum,
            useNone,
            custom,
        }

        export class InputPane extends EventTarget {
            public static getForCurrentView() {
                return new Proxy(new InputPane(), new ShimProxyHandler);
            }

            get occludedRect(): Rect {
                return { x: 0, y: 0, width: 0, height: 0 };
            }
        }

        export class UISettings {
            messageDuration: number = 1;
            handPreference: HandPreference = HandPreference.rightHanded;
            animationsEnabled: Boolean = true;
            mouseHoverTime: number = 2000;
        }
    }

    interface MessageDialogRequest {
        title: string
        content: string
        commands: Array<any>
    }

    interface MessageDialogResponse {
        status: string
        message: string
        commandId: number
    }

    export namespace Popups {
        export enum MessageDialogOptions {
            none,
            acceptUserInputAfterDelay
        }

        export class MessageDialog {
            private id: string;

            content: string;
            title: string;

            commands: Collections.Vector<UICommand>;

            options: MessageDialogOptions;
            defaultCommandIndex: number;
            cancelCommandIndex: number;

            constructor(content: string, title: string = "") {
                this.id = uuidv4();
                this.content = content;
                this.title = title;
                this.commands = new Collections.Vector<UICommand>([]);
            }

            showAsync(): IAsyncOperation<UICommand> {

                if (this.commands.count() == 0) {
                    this.commands.append(new UICommand("Close"));
                }

                for (let i = 0; i < this.commands.count(); i++) {
                    const el = this.commands.getAt(i);
                    el.id = i;
                }

                let message = {
                    title: this.title,
                    content: this.content,
                    commands: this.commands.getArray().map(c => { return { id: c.id, label: c.label } })
                };

                return new IAsyncOperation((resolve, reject) => {
                    IpcHelper.send("message-dialog", message)
                        .then((resp: MessageDialogResponse) => {
                            if (resp.status === "success") {
                                let command = this.commands.getAt(resp.commandId);
                                if (command.invoked != null) {
                                    command.invoked(command);
                                }

                                resolve(command);
                            }
                            else {
                                reject();
                            }
                        });
                });
            }
        }

        export class UICommand implements IUICommand {

            constructor(label: string, invoked: UICommandInvokedHandler = null) {
                this.label = label;
                this.invoked = invoked;
            }

            id: number;
            label: string;
            invoked: UICommandInvokedHandler;
        }

        export interface IUICommand {
            id: any;
            label: string;
            invoked: UICommandInvokedHandler;
        }

        export type UICommandInvokedHandler = (command: IUICommand) => void;
    }

    export namespace Notifications {
        export class BadgeUpdateManager {
            static createBadgeUpdaterForApplication(): BadgeUpdater {
                return new BadgeUpdater();
            }

            static getTemplateContent() {
                return new XMLDocument();
            }
        }

        export class BadgeNotification {
            constructor(xml: XMLDocument) {

            }
        }

        export class BadgeUpdater {
            update(notification: BadgeNotification) {

            }
        }

        export class ToastNotificationManager {
            private static _manager: ToastNotificationManager;

            static getDefault(): ToastNotificationManager {
                return (ToastNotificationManager._manager ?? (ToastNotificationManager._manager = new ToastNotificationManager()));
            }

            createToastNotifier(pack: string) {
                return new ToastNotifier();
            }

            getTemplateContent() {

            }
        }

        export class TileUpdateManager {
            static createTileUpdaterForApplication() {
                return new TileUpdater();
            }
        }

        export class TileUpdater {
            update() {

            }

            clear() {

            }
        }

        export class ToastNotifier {
            show(xml: any) { // todo: xml

            }
        }

        export class ToastNotification {

        }
    }
}