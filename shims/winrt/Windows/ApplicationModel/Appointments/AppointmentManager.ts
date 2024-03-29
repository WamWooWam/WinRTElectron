// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:22:59 2021
// </auto-generated>
// --------------------------------------------------

import { Appointment } from "./Appointment";
import { DateTime } from "../../Foundation/DateTime";
import { IAsyncAction } from "../../Foundation/IAsyncAction";
import { IAsyncOperation } from "../../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { Rect } from "../../Foundation/Rect";
import { TimeSpan } from "../../Foundation/TimeSpan";
import { Placement } from "../../UI/Popups/Placement";

@GenerateShim('Windows.ApplicationModel.Appointments.AppointmentManager')
export class AppointmentManager { 
    static showAddAppointmentAsync(appointment: Appointment, selection: Rect): IAsyncOperation<string> {
        throw new Error('AppointmentManager#showAddAppointmentAsync not implemented')
    }
    static showAddAppointmentWithPlacementAsync(appointment: Appointment, selection: Rect, preferredPlacement: Placement): IAsyncOperation<string> {
        throw new Error('AppointmentManager#showAddAppointmentWithPlacementAsync not implemented')
    }
    static showReplaceAppointmentAsync(appointmentId: string, appointment: Appointment, selection: Rect): IAsyncOperation<string> {
        throw new Error('AppointmentManager#showReplaceAppointmentAsync not implemented')
    }
    static showReplaceAppointmentWithPlacementAsync(appointmentId: string, appointment: Appointment, selection: Rect, preferredPlacement: Placement): IAsyncOperation<string> {
        throw new Error('AppointmentManager#showReplaceAppointmentWithPlacementAsync not implemented')
    }
    static showReplaceAppointmentWithPlacementAndDateAsync(appointmentId: string, appointment: Appointment, selection: Rect, preferredPlacement: Placement, instanceStartDate: Date): IAsyncOperation<string> {
        throw new Error('AppointmentManager#showReplaceAppointmentWithPlacementAndDateAsync not implemented')
    }
    static showRemoveAppointmentAsync(appointmentId: string, selection: Rect): IAsyncOperation<boolean> {
        throw new Error('AppointmentManager#showRemoveAppointmentAsync not implemented')
    }
    static showRemoveAppointmentWithPlacementAsync(appointmentId: string, selection: Rect, preferredPlacement: Placement): IAsyncOperation<boolean> {
        throw new Error('AppointmentManager#showRemoveAppointmentWithPlacementAsync not implemented')
    }
    static showRemoveAppointmentWithPlacementAndDateAsync(appointmentId: string, selection: Rect, preferredPlacement: Placement, instanceStartDate: Date): IAsyncOperation<boolean> {
        throw new Error('AppointmentManager#showRemoveAppointmentWithPlacementAndDateAsync not implemented')
    }
    static showTimeFrameAsync(timeToShow: Date, duration: number): IAsyncAction {
        throw new Error('AppointmentManager#showTimeFrameAsync not implemented')
    }
}
