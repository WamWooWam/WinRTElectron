import { Package } from "./Package";

export class PackageRegistry {
    static packages: Map<string, Package> = new Map();
    
    static getPackage(id: string) : Package {
        return PackageRegistry.packages.get(id);
    }

    static registerPackage(pack: Package) {
        PackageRegistry.packages.set(pack.identity.name, pack);
    }
}