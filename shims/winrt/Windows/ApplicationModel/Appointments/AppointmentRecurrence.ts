// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:22:59 2021
// </auto-generated>
// --------------------------------------------------

import { AppointmentDaysOfWeek } from "./AppointmentDaysOfWeek";
import { AppointmentRecurrenceUnit } from "./AppointmentRecurrenceUnit";
import { AppointmentWeekOfMonth } from "./AppointmentWeekOfMonth";
import { DateTime } from "../../Foundation/DateTime";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";

@GenerateShim('Windows.ApplicationModel.Appointments.AppointmentRecurrence')
export class AppointmentRecurrence { 
    weekOfMonth: AppointmentWeekOfMonth = null;
    until: Date | null = null;
    unit: AppointmentRecurrenceUnit = null;
    occurrences: number | null = null;
    month: number = null;
    interval: number = null;
    daysOfWeek: AppointmentDaysOfWeek = null;
    day: number = null;
}
