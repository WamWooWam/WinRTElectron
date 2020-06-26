import { EventTarget, Enumerable } from "winrt-node/Windows.Foundation";


export class PlatformObject extends EventTarget {
    public objectId: string;
    public objectType: string;

    constructor(type: string) {
        super();
        this.objectType = type;
    }

    @Enumerable(true)
    public get canEdit(): boolean {
        return true;
    }

    @Enumerable(true)
    public get canDelete(): boolean {
        return true;
    }

    @Enumerable(true)
    public get isObjectValid(): boolean {
        return this.objectId != "invalid";
    }

    commit() {

    }

    deleteObject() {

    }

    getPlatformObject() {
        return this;
    }

    addListener() {

    }
}