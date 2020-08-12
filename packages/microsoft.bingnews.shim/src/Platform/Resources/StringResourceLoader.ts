import { ResourceValue } from "./ResourceValue";

export class StringResourceLoader {
    private defaultResourceSubtree: string;
    constructor(subTree?: string) {
        this.defaultResourceSubtree = subTree ?? "Resources";
    }

    getString(resource: string): string {
        return this.getValue(resource).value;
    }

    getValue(resource: string): ResourceValue {
        let language = "";
        let value = "";

        return { language: "en-GB", value: "STRING" };
    }
}