import { Package } from "./Package";

export class PackageRegistry {
    static packages: Map<string, Package> = new Map();

    static getPackage(id: string): Package {
        var pack = PackageRegistry.packages.get(id);
        if (!pack)
            throw new Error("Package " + id + " not found!");
        return pack;
    }

    static registerPackage(pack: Package) {
        console.log(pack);
        PackageRegistry.packages.set(pack.identity.name, pack);
    }
}