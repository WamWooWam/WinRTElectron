// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:01 2021
// </auto-generated>
// --------------------------------------------------

import { IXmlCharacterData } from "./IXmlCharacterData";
import { IXmlNode } from "./IXmlNode";
import { IXmlNodeSelector } from "./IXmlNodeSelector";
import { IXmlNodeSerializer } from "./IXmlNodeSerializer";
import { IXmlText } from "./IXmlText";
import { NodeType } from "./NodeType";
import { XmlDocument } from "./XmlDocument";
import { XmlNamedNodeMap } from "./XmlNamedNodeMap";
import { XmlNodeList } from "./XmlNodeList";
import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";

@GenerateShim('Windows.Data.Xml.Dom.XmlCDataSection')
export class XmlCDataSection implements IXmlText, IXmlCharacterData, IXmlNode, IXmlNodeSerializer, IXmlNodeSelector { 
    __domNode: Node;
    data: string = null;
    length: number = null;
    prefix: any = null;
    nodeValue: any = null;
    firstChild: IXmlNode = null;
    lastChild: IXmlNode = null;
    localName: any = null;
    namespaceUri: any = null;
    nextSibling: IXmlNode = null;
    nodeName: string = null;
    nodeType: NodeType = null;
    attributes: XmlNamedNodeMap = null;
    ownerDocument: XmlDocument = null;
    parentNode: IXmlNode = null;
    childNodes: XmlNodeList = null;
    previousSibling: IXmlNode = null;
    innerText: string = null;
    splitText(offset: number): IXmlText {
        throw new Error('XmlCDataSection#splitText not implemented')
    }
    substringData(offset: number, count: number): string {
        throw new Error('XmlCDataSection#substringData not implemented')
    }
    appendData(data: string): void {
        console.warn('XmlCDataSection#appendData not implemented')
    }
    insertData(offset: number, data: string): void {
        console.warn('XmlCDataSection#insertData not implemented')
    }
    deleteData(offset: number, count: number): void {
        console.warn('XmlCDataSection#deleteData not implemented')
    }
    replaceData(offset: number, count: number, data: string): void {
        console.warn('XmlCDataSection#replaceData not implemented')
    }
    hasChildNodes(): boolean {
        throw new Error('XmlCDataSection#hasChildNodes not implemented')
    }
    insertBefore(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode {
        throw new Error('XmlCDataSection#insertBefore not implemented')
    }
    replaceChild(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode {
        throw new Error('XmlCDataSection#replaceChild not implemented')
    }
    removeChild(childNode: IXmlNode): IXmlNode {
        throw new Error('XmlCDataSection#removeChild not implemented')
    }
    appendChild(newChild: IXmlNode): IXmlNode {
        throw new Error('XmlCDataSection#appendChild not implemented')
    }
    cloneNode(deep: boolean): IXmlNode {
        throw new Error('XmlCDataSection#cloneNode not implemented')
    }
    normalize(): void {
        console.warn('XmlCDataSection#normalize not implemented')
    }
    selectSingleNode(xpath: string): IXmlNode {
        throw new Error('XmlCDataSection#selectSingleNode not implemented')
    }
    selectNodes(xpath: string): XmlNodeList {
        throw new Error('XmlCDataSection#selectNodes not implemented')
    }
    selectSingleNodeNS(xpath: string, namespaces: any): IXmlNode {
        throw new Error('XmlCDataSection#selectSingleNodeNS not implemented')
    }
    selectNodesNS(xpath: string, namespaces: any): XmlNodeList {
        throw new Error('XmlCDataSection#selectNodesNS not implemented')
    }
    getXml(): string {
        throw new Error('XmlCDataSection#getXml not implemented')
    }
}