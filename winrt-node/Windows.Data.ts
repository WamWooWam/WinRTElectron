export namespace Data {
    export namespace Xml {
        export namespace Dom {
            export class XmlDocument {
                private xmlDocument: XMLDocument;
                
                constructor() {
                    
                }

                loadXml(str: string): void {
                    let parser = new DOMParser();
                    this.xmlDocument = <XMLDocument>parser.parseFromString(str, "application/xml");
                }
            } 
        }
    }
}