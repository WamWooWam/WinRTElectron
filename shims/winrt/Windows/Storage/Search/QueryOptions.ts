// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:08 2021
// </auto-generated>
// --------------------------------------------------

import { IIterable } from "../../Foundation/Collections/IIterable`1";
import { IVector } from "../../Foundation/Collections/IVector`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { PropertyPrefetchOptions } from "../FileProperties/PropertyPrefetchOptions";
import { ThumbnailMode } from "../FileProperties/ThumbnailMode";
import { ThumbnailOptions } from "../FileProperties/ThumbnailOptions";
import { CommonFileQuery } from "./CommonFileQuery";
import { CommonFolderQuery } from "./CommonFolderQuery";
import { DateStackOption } from "./DateStackOption";
import { FolderDepth } from "./FolderDepth";
import { IndexerOption } from "./IndexerOption";
import { SortEntry } from "./SortEntry";

@GenerateShim('Windows.Storage.Search.QueryOptions')
export class QueryOptions {
    userSearchFilter: string = null;
    language: string = null;
    indexerOption: IndexerOption = null;
    folderDepth: FolderDepth = null;
    applicationSearchFilter: string = null;
    dateStackOption: DateStackOption = null;
    fileTypeFilter: IVector<string> = null;
    groupPropertyName: string = null;
    sortOrder: IVector<SortEntry> = null;
    storageProviderIdFilter: IVector<string> = null;
    // constructor();
    // constructor(query: CommonFolderQuery);
    // 
    constructor(query?: CommonFileQuery, fileTypeFilter?: IIterable<string>) {

    }

    saveToString(): string {
        throw new Error('QueryOptions#saveToString not implemented')
    }
    loadFromString(value: string): void {
        console.warn('QueryOptions#loadFromString not implemented')
    }
    setThumbnailPrefetch(mode: ThumbnailMode, requestedSize: number, options: ThumbnailOptions): void {
        console.warn('QueryOptions#setThumbnailPrefetch not implemented')
    }
    setPropertyPrefetch(options: PropertyPrefetchOptions, propertiesToRetrieve: IIterable<string>): void {
        console.warn('QueryOptions#setPropertyPrefetch not implemented')
    }
}
