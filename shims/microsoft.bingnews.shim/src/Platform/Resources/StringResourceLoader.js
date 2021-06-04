export class StringResourceLoader {
    constructor(subTree) {
        this.defaultResourceSubtree = subTree !== null && subTree !== void 0 ? subTree : "Resources";
    }
    getString(resource) {
        return this.getValue(resource).value;
    }
    getValue(resource) {
        let language = "";
        let value = "";
        return { language: "en-GB", value: "STRING" };
    }
}
//# sourceMappingURL=StringResourceLoader.js.map