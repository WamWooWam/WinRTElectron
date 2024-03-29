// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:09 2021
// </auto-generated>
// --------------------------------------------------

import { IFlightEvent } from "./IFlightEvent";
import { SearchMethod } from "./SearchMethod";

export interface ISearchFlightEvent extends IFlightEvent {
    searchQuery: string;
    searchIndex: string;
    searchMethod: SearchMethod;
    searchIsExplicit: boolean;
    searchIsScorable: boolean;
    searchInResults: boolean;
    searchResultCount: number;
    searchAutoRefresh: boolean;
    searchCategory: string;
    searchCategoryCode: string;
    searchDetails: string;
    searchContext: string;
}
