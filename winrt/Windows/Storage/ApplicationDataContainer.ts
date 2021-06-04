
import { IMapView } from "../Foundation/Collections/IMapView`2";
import { IPropertySet } from "../Foundation/Collections/IPropertySet";
import { PropertySet } from "../Foundation/Collections/PropertySet";
import { Dictionary } from "../Foundation/Interop/Dictionary`2";
import { GenerateShim } from "../Foundation/Interop/GenerateShim";
import { ApplicationDataCreateDisposition } from "./ApplicationDataCreateDisposition";
import { ApplicationDataLocality } from "./ApplicationDataLocality";

@GenerateShim('Windows.Storage.ApplicationDataContainer')
export class ApplicationDataContainer {
    containers: IMapView<string, ApplicationDataContainer> = null;
    locality: ApplicationDataLocality = null;
    name: string = null;
    values: PropertySet = null;

    constructor(name: string, locality: ApplicationDataLocality) {
        this.name = name;
        this.values = new PropertySet();
        this.containers = new Dictionary<string, ApplicationDataContainer>();
        this.locality = locality;

        let data = localStorage.getItem(name);
        if (data !== null) {
            this.values = new PropertySet(JSON.parse(data));
        }

        this.values.onmapchanged = () => {
            const jsonData = JSON.stringify([...this.values]);
            localStorage.setItem(this.name, jsonData);
        };

        localStorage.setItem(this.name, JSON.stringify([...this.values]));
    }

    //
    // these functions shouldn't be here, and aren't part of the API, however
    // they were here in the previous hand written projection because i fucked up,
    // so they're here now too :/ 
    //
    lookup(key: string) {
        return this.values.lookup(key);
    }

    set(key: string, value: any) {
        this.values.insert(key, value);
    }

    remove(key: string) {
        this.values.remove(key);
    }

    createContainer(name: string, disposition: ApplicationDataCreateDisposition): ApplicationDataContainer {
        var storage = new ApplicationDataContainer(this.name + "::" + name, this.locality);
        var containers = <Dictionary<string, ApplicationDataContainer>>this.containers;
        if(containers.hasKey(name)){
            return containers.lookup(name);
        }
        else {
            containers.insert(name, storage);
            return storage;
        }
    }

    deleteContainer(name: string): void {
        var containers = <Dictionary<string, ApplicationDataContainer>>this.containers;
        containers.remove(name);
    }
}
