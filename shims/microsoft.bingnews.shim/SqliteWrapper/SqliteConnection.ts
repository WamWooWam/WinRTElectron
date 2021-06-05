// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:12 2021
// </auto-generated>
// --------------------------------------------------

import { SqlResults } from "./SqlResults";
import { SqlSpecialResultConfig } from "./SqlSpecialResultConfig";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { IAsyncOperation } from "winrt/Windows/Foundation/IAsyncOperation`1";
import { IClosable } from "winrt/Windows/Foundation/IClosable";
import { AsyncOperation } from "winrt/Windows/Foundation/Interop/AsyncOperation`1";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";


@GenerateShim('SqliteWrapper.SqliteConnection')
export class SqliteConnection implements IClosable { 
    static open1(dbPath: string, readOnly: boolean): SqliteConnection {
        throw new Error('SqliteConnection#open1 not implemented')
    }
    static open2(dbPath: string): SqliteConnection {
        throw new Error('SqliteConnection#open2 not implemented')
    }
    executeAsync1(query: string, hintExpectedNumberOfRows: number, useCache: boolean, parameters: IVector<any>, getColumnNames: boolean): IAsyncOperation<SqlResults> {
        return AsyncOperation.from(async () => { throw new Error('SqliteConnection#executeAsync1 not implemented') });
    }
    executeAsync2(query: string, hintExpectedNumberOfRows: number, useCache: boolean, parameters: IVector<any>): IAsyncOperation<SqlResults> {
        return AsyncOperation.from(async () => { throw new Error('SqliteConnection#executeAsync2 not implemented') });
    }
    executeAsync3(query: string, hintExpectedNumberOfRows: number): IAsyncOperation<SqlResults> {
        return AsyncOperation.from(async () => { throw new Error('SqliteConnection#executeAsync3 not implemented') });
    }
    executeAsync4(query: string): IAsyncOperation<SqlResults> {
        return AsyncOperation.from(async () => { throw new Error('SqliteConnection#executeAsync4 not implemented') });
    }
    execute(query: string, hintExpectedNumberOfRows: number, useCache: boolean, parameters: IVector<any>, getColumnNames: boolean): SqlResults {
        throw new Error('SqliteConnection#execute not implemented')
    }
    executeSpecialConfig(query: string, hintExpectedNumberOfRows: number, useCache: boolean, parentIdBinding: number, marketBinding: string): IVector<SqlSpecialResultConfig> {
        throw new Error('SqliteConnection#executeSpecialConfig not implemented')
    }
    deleteCachedStatement(query: string): void {
        console.warn('SqliteConnection#deleteCachedStatement not implemented')
    }
    close(): void {
        console.warn('SqliteConnection#close not implemented')
    }
}