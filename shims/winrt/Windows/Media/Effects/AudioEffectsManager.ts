// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:05 2021
// </auto-generated>
// --------------------------------------------------

import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { AudioProcessing } from "../AudioProcessing";
import { MediaCategory } from "../Capture/MediaCategory";
import { AudioCaptureEffectsManager } from "./AudioCaptureEffectsManager";
import { AudioRenderEffectsManager } from "./AudioRenderEffectsManager";
import { AudioRenderCategory } from "../Render/AudioRenderCategory";

@GenerateShim('Windows.Media.Effects.AudioEffectsManager')
export class AudioEffectsManager { 
    static createAudioRenderEffectsManager(deviceId: string, category: AudioRenderCategory): AudioRenderEffectsManager {
        throw new Error('AudioEffectsManager#createAudioRenderEffectsManager not implemented')
    }
    static createAudioRenderEffectsManagerWithMode(deviceId: string, category: AudioRenderCategory, mode: AudioProcessing): AudioRenderEffectsManager {
        throw new Error('AudioEffectsManager#createAudioRenderEffectsManagerWithMode not implemented')
    }
    static createAudioCaptureEffectsManager(deviceId: string, category: MediaCategory): AudioCaptureEffectsManager {
        throw new Error('AudioEffectsManager#createAudioCaptureEffectsManager not implemented')
    }
    static createAudioCaptureEffectsManagerWithMode(deviceId: string, category: MediaCategory, mode: AudioProcessing): AudioCaptureEffectsManager {
        throw new Error('AudioEffectsManager#createAudioCaptureEffectsManagerWithMode not implemented')
    }
}
