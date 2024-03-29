// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { AsyncStatus } from "../AsyncStatus";
import { CausalityRelation } from "./CausalityRelation";
import { CausalitySource } from "./CausalitySource";
import { CausalitySynchronousWork } from "./CausalitySynchronousWork";
import { CausalityTraceLevel } from "./CausalityTraceLevel";
import { TracingStatusChangedEventArgs } from "./TracingStatusChangedEventArgs";
import { EventHandler } from "../EventHandler`1";
import { Enumerable } from "../Interop/Enumerable";
import { GenerateShim } from "../Interop/GenerateShim";

@GenerateShim('Windows.Foundation.Diagnostics.AsyncCausalityTracer')
export class AsyncCausalityTracer { 
    static traceOperationCreation(traceLevel: CausalityTraceLevel, source: CausalitySource, platformId: string, operationId: number, operationName: string, relatedContext: number): void {
        console.warn('AsyncCausalityTracer#traceOperationCreation not implemented')
    }
    static traceOperationCompletion(traceLevel: CausalityTraceLevel, source: CausalitySource, platformId: string, operationId: number, status: AsyncStatus): void {
        console.warn('AsyncCausalityTracer#traceOperationCompletion not implemented')
    }
    static traceOperationRelation(traceLevel: CausalityTraceLevel, source: CausalitySource, platformId: string, operationId: number, relation: CausalityRelation): void {
        console.warn('AsyncCausalityTracer#traceOperationRelation not implemented')
    }
    static traceSynchronousWorkStart(traceLevel: CausalityTraceLevel, source: CausalitySource, platformId: string, operationId: number, work: CausalitySynchronousWork): void {
        console.warn('AsyncCausalityTracer#traceSynchronousWorkStart not implemented')
    }
    static traceSynchronousWorkCompletion(traceLevel: CausalityTraceLevel, source: CausalitySource, work: CausalitySynchronousWork): void {
        console.warn('AsyncCausalityTracer#traceSynchronousWorkCompletion not implemented')
    }

    static __tracingStatusChanged: Set<EventHandler<TracingStatusChangedEventArgs>> = new Set();
    @Enumerable(true)
    static set ontracingstatuschanged(handler: EventHandler<TracingStatusChangedEventArgs>) {
        AsyncCausalityTracer.__tracingStatusChanged.add(handler);
    }

    static addEventListener(name: string, handler: any) {
        switch (name) {
            case 'tracingstatuschanged':
                AsyncCausalityTracer.__tracingStatusChanged.add(handler);
                break;
        }
    }

    static removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'tracingstatuschanged':
                AsyncCausalityTracer.__tracingStatusChanged.delete(handler);
                break;
        }
    }
}
