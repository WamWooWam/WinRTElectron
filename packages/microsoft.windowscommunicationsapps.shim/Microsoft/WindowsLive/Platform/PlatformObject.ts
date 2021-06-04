import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { uuidv4 } from "winrt/Windows/Foundation/Interop/Utils";
import { IObject } from "./IObject";
import { ITransientObjectHolder } from "./ITransientObjectHolder";
import { ObjectChangedHandler } from "./ObjectChangedHandler";

const KnownValidObjectTypes = [
    "Account", "MeContact", "resource", "Person"
]

export class PlatformObject implements IObject {
    constructor(objectType: string, editable: boolean = false, deleteable: boolean = false) {
        if (!KnownValidObjectTypes.includes(objectType))
            console.warn(`Unknown object type ${objectType}`);
        this.objectType = objectType;
        this.canEdit = editable;
        this.canDelete = deleteable;
        this.objectId = `${objectType}_${uuidv4()}`;
    }

    readonly canDelete: boolean;
    readonly canEdit: boolean;
    readonly isObjectValid: boolean;
    readonly objectId: string;
    readonly objectType: string;

    commit(): void {
        console.warn('Object#commit not implemented')
    }
    deleteObject(): void {
        console.warn('Object#deleteObject not implemented')
    }
    getKeepAlive(): ITransientObjectHolder {
        throw new Error('Object#getKeepAlive not implemented')
    }

    private __changed: Set<ObjectChangedHandler> = new Set();
    @Enumerable(true)
    set onchanged(handler: ObjectChangedHandler) {
        this.__changed.add(handler);
    }

    private __deleted: Set<ObjectChangedHandler> = new Set();
    @Enumerable(true)
    set ondeleted(handler: ObjectChangedHandler) {
        this.__deleted.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'changed':
                this.__changed.add(handler);
                break;
            case 'deleted':
                this.__deleted.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'changed':
                this.__changed.delete(handler);
                break;
            case 'deleted':
                this.__deleted.delete(handler);
                break;
        }
    }
}