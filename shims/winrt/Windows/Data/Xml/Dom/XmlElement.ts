// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:01 2021
// </auto-generated>
// --------------------------------------------------

import { IXmlNode } from "./IXmlNode";
import { IXmlNodeSelector } from "./IXmlNodeSelector";
import { IXmlNodeSerializer } from "./IXmlNodeSerializer";
import { NodeType } from "./NodeType";
import { XmlAttribute } from "./XmlAttribute";
import { XmlDocument } from "./XmlDocument";
import { XmlNamedNodeMap } from "./XmlNamedNodeMap";
import { XmlNodeList } from "./XmlNodeList";
import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";
import { XmlNode } from "./XmlNode";

// @GenerateShim('Windows.Data.Xml.Dom.XmlElement')
export class XmlElement extends XmlNode { 
    tagName: string = null;
    
    getAttribute(attributeName: string): string {
        return (this.__domNode as Element).getAttribute(attributeName);
    }
    setAttribute(attributeName: string, attributeValue: string): void {
        return (this.__domNode as Element).setAttribute(attributeName, attributeValue);
    }
    removeAttribute(attributeName: string): void {
        (this.__domNode as Element).removeAttribute(attributeName);
    }
    getAttributeNode(attributeName: string): XmlAttribute {
        throw new Error('XmlElement#getAttributeNode not implemented')
    }
    setAttributeNode(newAttribute: XmlAttribute): XmlAttribute {
        throw new Error('XmlElement#setAttributeNode not implemented')
    }
    removeAttributeNode(attributeNode: XmlAttribute): XmlAttribute {
        throw new Error('XmlElement#removeAttributeNode not implemented')
    }
    getElementsByTagName(tagName: string): XmlNodeList {
        throw new Error('XmlElement#getElementsByTagName not implemented')
    }
    setAttributeNS(namespaceUri: any, qualifiedName: string, value: string): void {
        console.warn('XmlElement#setAttributeNS not implemented')
    }
    getAttributeNS(namespaceUri: any, localName: string): string {
        throw new Error('XmlElement#getAttributeNS not implemented')
    }
    removeAttributeNS(namespaceUri: any, localName: string): void {
        console.warn('XmlElement#removeAttributeNS not implemented')
    }
    setAttributeNodeNS(newAttribute: XmlAttribute): XmlAttribute {
        throw new Error('XmlElement#setAttributeNodeNS not implemented')
    }
    getAttributeNodeNS(namespaceUri: any, localName: string): XmlAttribute {
        throw new Error('XmlElement#getAttributeNodeNS not implemented')
    } 
}
