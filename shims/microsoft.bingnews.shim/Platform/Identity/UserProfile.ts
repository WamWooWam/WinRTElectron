// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:11 2021
// </auto-generated>
// --------------------------------------------------

import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Platform.Identity.UserProfile')
export class UserProfile implements IStringable { 
    static readonly currentUser: UserProfile = null;
    readonly firstName: string = null;
    readonly lastName: string = null;
    readonly signInName: string = null;
    readonly profilePictureUrl: string = null;
    toString(): string {
        throw new Error('UserProfile#toString not implemented')
    }
}