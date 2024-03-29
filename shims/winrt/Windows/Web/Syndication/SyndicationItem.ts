// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:11 2021
// </auto-generated>
// --------------------------------------------------

import { XmlDocument } from "../../Data/Xml/Dom/XmlDocument";
import { IVector } from "../../Foundation/Collections/IVector`1";
import { DateTime } from "../../Foundation/DateTime";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { Uri } from "../../Foundation/Uri";
import { ISyndicationNode } from "./ISyndicationNode";
import { ISyndicationText } from "./ISyndicationText";
import { SyndicationAttribute } from "./SyndicationAttribute";
import { SyndicationCategory } from "./SyndicationCategory";
import { SyndicationContent } from "./SyndicationContent";
import { SyndicationFeed } from "./SyndicationFeed";
import { SyndicationFormat } from "./SyndicationFormat";
import { SyndicationLink } from "./SyndicationLink";
import { SyndicationPerson } from "./SyndicationPerson";

@GenerateShim('Windows.Web.Syndication.SyndicationItem')
export class SyndicationItem implements ISyndicationNode { 
    title: ISyndicationText = null;
    summary: ISyndicationText = null;
    source: SyndicationFeed = null;
    rights: ISyndicationText = null;
    publishedDate: Date = null;
    lastUpdatedTime: Date = null;
    content: SyndicationContent = null;
    commentsUri: Uri = null;
    id: string = null;
    editMediaUri: Uri = null;
    editUri: Uri = null;
    itemUri: Uri = null;
    links: IVector<SyndicationLink> = null;
    authors: IVector<SyndicationPerson> = null;
    categories: IVector<SyndicationCategory> = null;
    contributors: IVector<SyndicationPerson> = null;
    etag: string = null;
    nodeNamespace: string = null;
    nodeName: string = null;
    language: string = null;
    baseUri: Uri = null;
    nodeValue: string = null;
    elementExtensions: IVector<ISyndicationNode> = null;
    attributeExtensions: IVector<SyndicationAttribute> = null;
    // constructor();
    // constructor(title: string, content: SyndicationContent, uri: Uri);
    constructor(...args) { }
    load(item: string): void {
        console.warn('SyndicationItem#load not implemented')
    }
    loadFromXml(itemDocument: XmlDocument): void {
        console.warn('SyndicationItem#loadFromXml not implemented')
    }
    getXmlDocument(format: SyndicationFormat): XmlDocument {
        throw new Error('SyndicationItem#getXmlDocument not implemented')
    }
}
