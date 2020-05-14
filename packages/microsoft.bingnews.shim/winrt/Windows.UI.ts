/// <ref src="Windows.Foundation.ts"/>
import { EventTarget, ShimProxyHandler, Rect, Collections, IAsyncOperation } from "./Windows.Foundation"

export namespace UI {
    export namespace ApplicationSettings {
        export class SettingsPane extends EventTarget {
            public static getForCurrentView() {
                return new SettingsPane();
            }

            show() {
                console.log("Windows.UI.ApplicationSettings.SettingsPane#show");
            }
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
                this.id = this.uuidv4();
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

                return new IAsyncOperation((resolve, reject) => {
                    self.addEventListener("message", (ev: MessageEvent) => {
                        if (ev.data.target === "Windows.UI.Popups.MessageDialog"
                            && ev.data.data.id === this.id) {
                            if (ev.data.event === "success") {
                                let command = this.commands.getAt(ev.data.data.commandId);
                                if (command.invoked != null) {
                                    command.invoked(command);
                                }

                                resolve(command);
                            }
                            else {
                                reject();
                            }
                        }
                    });

                    let message = {
                        id: this.id,
                        title: this.title,
                        content: this.content,
                        commands: this.commands.getArray().map(c => { return { id: c.id, label: c.label } })
                    };

                    self.parent.postMessage({ source: "MessageDialog", event: "showAsync", data: message }, "*");
                });
            }

            private uuidv4() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }
        }
        export class UICommand {

            constructor(label: string, invoked: Function = null) {
                this.label = label;
                this.invoked = invoked;
            }

            id: number;
            label: string;
            invoked: Function;
        }
    }

    export namespace Notifications {
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

        export class ToastNotifier {
            show(xml: any) { // todo: xml

            }
        }

        export class ToastNotification {

        }
    }
}