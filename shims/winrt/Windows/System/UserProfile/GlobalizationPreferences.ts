
import { IVectorView } from "../../Foundation/Collections/IVectorView`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { Vector } from "../../Foundation/Interop/Vector`1";
import { DayOfWeek } from "../../Globalization/DayOfWeek";

@GenerateShim('Windows.System.UserProfile.GlobalizationPreferences')
export class GlobalizationPreferences { 
    static calendars: IVectorView<string> = null;
    static clocks: IVectorView<string> = null;
    static currencies: IVectorView<string> = null;
    static homeGeographicRegion: string = "en";
    static languages: IVectorView<string> = new Vector(["en-GB"]);
    static weekStartsOn: DayOfWeek = DayOfWeek.monday;
}
