// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------


export interface ICommonTemplate {
    eventEnabled(eventIndex: number): number;
    traceTemplate_qqzdzzq(_MCGEN_EventIndex: number, id: number, param: number, message: string, hresult: number, functionName: string, file: string, line: number): void;
    traceTemplate_qjiqqtzq(_MCGEN_EventIndex: number, id: number, userId: string, timestamp: number, classId: number, typeId: number, allowedByPrivacySettings: boolean, parameterName: string, parameterValue: number): void;
    traceTemplate_qjiqqtq(_MCGEN_EventIndex: number, id: number, userId: string, timestamp: number, classId: number, typeId: number, allowedByPrivacySettings: boolean, parameterCount: number): void;
    traceTemplate_qzq(_MCGEN_EventIndex: number, id: number, parameterName: string, parameterValue: number): void;
    traceTemplate_qzt(_MCGEN_EventIndex: number, id: number, parameterName: string, parameterValue: boolean): void;
    traceTemplate_qzz(_MCGEN_EventIndex: number, id: number, parameterName: string, parameterValue: string): void;
    traceTemplateEventDescriptor(_MCGEN_EventIndex: number): void;
    traceTemplate_d(_MCGEN_EventIndex: number, code: number): void;
    traceTemplate_qjqqxqqqq(_MCGEN_EventIndex: number, errorCode: number, provider: string, eventChannel: number, eventId: number, eventKeywords: number, eventLevel: number, eventOpcode: number, eventTask: number, eventVersion: number): void;
    traceTemplate_tz(_MCGEN_EventIndex: number, isElevated: boolean, parameter: string): void;
    traceTemplate_z(_MCGEN_EventIndex: number, filePath: string): void;
    traceTemplate_q(_MCGEN_EventIndex: number, durationMsec: number): void;
    traceTemplate_ddjxxdddjzzd(_MCGEN_EventIndex: number, hresult: number, taskId: number, backgroundTransferId: string, bytes: number, totalBytes: number, fileId: number, libraryId: number, libraryTypeId: number, mediaId: string, isolatedStoragePath: string, targetPath: string, status: number): void;
    traceTemplate_dzzt(_MCGEN_EventIndex: number, hresult: number, path: string, url: string, isXHR: boolean): void;
    traceTemplate_t(_MCGEN_EventIndex: number, appVisible: boolean): void;
}
