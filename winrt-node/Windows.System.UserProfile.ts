/// <ref src="Windows.Globalisation.ts"/>
import { Globalization } from "./Windows.Globalization"
import { Foundation } from "./Windows";

export namespace System {
    export namespace UserProfile {
        export class GlobalizationPreferences {
            static weekStartsOn = Globalization.DayOfWeek.monday;

            static get languages() {
                return new Foundation.Collections.Vector(["en-GB"])
            }
        }
    }

    export namespace Profile {

        export class HardwareToken {

            constructor(){
                let encoder = new TextEncoder();
                this.id = encoder.encode("lmao-hardware-specific");
            }

            id: Uint8Array;
        }

        export class HardwareIdentification {
            static getPackageSpecificToken(buff) {
                return new HardwareToken();
            }
        }
    }

    export enum ProcessorArchitecture {
        arm
    }
}