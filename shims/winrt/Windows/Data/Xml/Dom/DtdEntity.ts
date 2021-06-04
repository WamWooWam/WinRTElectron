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
import { XmlDocument } from "./XmlDocument";
import { XmlNamedNodeMap } from "./XmlNamedNodeMap";
import { XmlNodeList } from "./XmlNodeList";
import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";

@GenerateShim('Windows.Data.Xml.Dom.DtdEntity')
export class DtdEntity implements IXmlNode, IXmlNodeSerializer, IXmlNodeSelector { 
    __domNode: Node;
    notationName: any = null;
    publicId: any = null;
    systemId: any = null;
    innerText: string = null;
    prefix: any = null;
    nodeValue: any = null;
    attributes: XmlNamedNodeMap = null;
    childNodes: XmlNodeList = null;
    firstChild: IXmlNode = null;
    lastChild: IXmlNode = null;
    localName: any = null;
    namespaceUri: any = null;
    nextSibling: IXmlNode = null;
    nodeName: string = null;
    nodeType: NodeType = null;
    ownerDocument: XmlDocument = null;
    parentNode: IXmlNode = null;
    previousSibling: IXmlNode = null;
    hasChildNodes(): boolean {
        throw new Error('DtdEntity#hasChildNodes not implemented')
    }
    insertBefore(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode {
        throw new Error('DtdEntity#insertBefore not implemented')
    }
    replaceChild(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode {
        throw new Error('DtdEntity#replaceChild not implemented')
    }
    removeChild(childNode: IXmlNode): IXmlNode {
        throw new Error('DtdEntity#removeChild not implemented')
    }
    appendChild(newChild: IXmlNode): IXmlNode {
        throw new Error('DtdEntity#appendChild not implemented')
    }
    cloneNode(deep: boolean): IXmlNode {
        throw new Error('DtdEntity#cloneNode not implemented')
    }
    normalize(): void {
        console.warn('DtdEntity#normalize not implemented')
    }
    selectSingleNode(xpath: string): IXmlNode {
        throw new Error('DtdEntity#selectSingleNode not implemented')
    }
    selectNodes(xpath: string): XmlNodeList {
        throw new Error('DtdEntity#selectNodes not implemented')
    }
    selectSingleNodeNS(xpath: string, namespaces: any): IXmlNode {
        throw new Error('DtdEntity#selectSingleNodeNS not implemented')
    }
    selectNodesNS(xpath: string, namespaces: any): XmlNodeList {
        throw new Error('DtdEntity#selectNodesNS not implemented')
    }
    getXml(): string {
        throw new Error('DtdEntity#getXml not implemented')
    }
}