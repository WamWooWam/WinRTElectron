// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:11 2021
// </auto-generated>
// --------------------------------------------------

import { XmlDocument } from "../../Data/Xml/Dom/XmlDocument";
import { IVector } from "../../Foundation/Collections/IVector`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { Uri } from "../../Foundation/Uri";
import { ISyndicationNode } from "./ISyndicationNode";
import { SyndicationAttribute } from "./SyndicationAttribute";
import { SyndicationFormat } from "./SyndicationFormat";

@GenerateShim('Windows.Web.Syndication.SyndicationGenerator')
export class SyndicationGenerator implements ISyndicationNode { 
    nodeValue: string = null;
    nodeNamespace: string = null;
    nodeName: string = null;
    language: string = null;
    baseUri: Uri = null;
    attributeExtensions: IVector<SyndicationAttribute> = null;
    elementExtensions: IVector<ISyndicationNode> = null;
    version: string = null;
    uri: Uri = null;
    text: string = null;
    // constructor();
    // constructor(text: string);
    constructor(...args) { }
    getXmlDocument(format: SyndicationFormat): XmlDocument {
        throw new Error('SyndicationGenerator#getXmlDocument not implemented')
    }
}