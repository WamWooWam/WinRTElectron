
export class TileTemplateBindings {
    static getTemplateElements(binding: Element): HTMLElement[] {
        let elements = [];
        let template = binding.getAttribute("template");
        if (template == "TileSquare150x150PeekImageAndText04") {

        }

        console.log("unknown binding " + template);
        return elements
    }
}