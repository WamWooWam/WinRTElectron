import { IXmlNode } from "./IXmlNode";
import { IXmlNodeSelector } from "./IXmlNodeSelector";
import { IXmlNodeSerializer } from "./IXmlNodeSerializer";
import { NodeType } from "./NodeType";
import { XmlDocument } from "./XmlDocument";
import { XmlNamedNodeMap } from "./XmlNamedNodeMap";
import { XmlNodeList } from "./XmlNodeList";

export class XmlNode implements IXmlNode, IXmlNodeSerializer, IXmlNodeSelector {

    __domNode: Node;
    constructor(node: Node, document: XmlDocument) {
        this.__domNode = node;
        this.ownerDocument = document;
    }

    get attributes(): XmlNamedNodeMap {
        return new XmlNamedNodeMap((this.__domNode as Element).attributes);
    }

    get childNodes(): XmlNodeList {
        return this.ownerDocument.__factory.getNodeList(this.__domNode.childNodes);
    }

    get firstChild(): IXmlNode {
        return this.ownerDocument.__factory.getXmlNode(this.__domNode.firstChild);
    }

    get lastChild(): IXmlNode {
        return this.ownerDocument.__factory.getXmlNode(this.__domNode.firstChild);
    }

    get parentNode(): IXmlNode {
        return this.ownerDocument.__factory.getXmlNode(this.__domNode.parentNode);
    }

    get nextSibling(): IXmlNode {
        return this.ownerDocument.__factory.getXmlNode(this.__domNode.nextSibling);
    }

    get previousSibling(): IXmlNode {
        return this.ownerDocument.__factory.getXmlNode(this.__domNode.previousSibling);
    }

    get nodeName(): string {
        return this.__domNode.nodeName;
    }

    get nodeType(): NodeType {
        return <NodeType>this.__domNode.nodeType;
    }

    ownerDocument: XmlDocument;
    localName: any;
    namespaceUri: any;
    nodeValue: any;
    prefix: any;

    get innerText(): string {
        return this.__domNode.textContent;
    }

    set innerText(text: string) {
        this.__domNode.textContent = text;
    }

    hasChildNodes(): boolean {
        return this.__domNode.hasChildNodes();
    }
    insertBefore(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode {
        return this.ownerDocument.__factory.getXmlNode(
            this.__domNode.insertBefore(newChild.__domNode, referenceChild.__domNode)
        );
    }
    replaceChild(newChild: IXmlNode, referenceChild: IXmlNode): IXmlNode {
        return this.ownerDocument.__factory.getXmlNode(
            this.__domNode.replaceChild(newChild.__domNode, referenceChild.__domNode)
        );
    }
    removeChild(childNode: IXmlNode): IXmlNode {
        return this.ownerDocument.__factory.getXmlNode(
            this.__domNode.removeChild(childNode.__domNode)
        );
    }
    appendChild(newChild: IXmlNode): IXmlNode {
        return this.ownerDocument.__factory.getXmlNode(
            this.__domNode.appendChild(newChild.__domNode)
        );
    }
    cloneNode(deep: boolean): IXmlNode {
        return this.ownerDocument.__factory.getXmlNode(
            this.__domNode.cloneNode(deep)
        );
    }
    normalize(): void {
        this.__domNode.normalize();
    }
    selectSingleNode(xpath: string): IXmlNode {
        throw new Error("Method not implemented.");
    }
    selectNodes(xpath: string): XmlNodeList {
        throw new Error("Method not implemented.");
    }
    selectSingleNodeNS(xpath: string, namespaces: any): IXmlNode {
        throw new Error("Method not implemented.");
    }
    selectNodesNS(xpath: string, namespaces: any): XmlNodeList {
        throw new Error("Method not implemented.");
    }
    getXml(): string {
        let serialiser = new XMLSerializer();
        return serialiser.serializeToString(this.__domNode);
    }
}