import { ActivationKind } from "../../ApplicationModel/Activation/ActivationKind";
import { Rect } from "../Rect";
import { Uri } from "../Uri";

export interface IActivationDetails {
    kind: ActivationKind
    args: string
    splashRect: Rect;
    files?: string[]
    uri?: Uri
}

export interface IAppLifecycleEvent {
    type: "activated" | "resuming" | "suspending"
    details?: IActivationDetails
}