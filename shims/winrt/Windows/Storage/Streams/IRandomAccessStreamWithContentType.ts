// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:08 2021
// </auto-generated>
// --------------------------------------------------

import { IClosable } from "../../Foundation/IClosable";
import { IContentTypeProvider } from "./IContentTypeProvider";
import { IInputStream } from "./IInputStream";
import { IOutputStream } from "./IOutputStream";
import { IRandomAccessStream } from "./IRandomAccessStream";

export interface IRandomAccessStreamWithContentType extends IRandomAccessStream, IClosable, IInputStream, IOutputStream, IContentTypeProvider {
}
