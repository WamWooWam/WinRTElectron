// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:04 2021
// </auto-generated>
// --------------------------------------------------

import { Package } from "../../ApplicationModel/Package";
import { IIterable } from "../../Foundation/Collections/IIterable`1";
import { IAsyncOperationWithProgress } from "../../Foundation/IAsyncOperationWithProgress`2";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { Uri } from "../../Foundation/Uri";
import { DeploymentOptions } from "./DeploymentOptions";
import { DeploymentProgress } from "./DeploymentProgress";
import { DeploymentResult } from "./DeploymentResult";
import { PackageState } from "./PackageState";
import { PackageTypes } from "./PackageTypes";
import { PackageUserInformation } from "./PackageUserInformation";
import { RemovalOptions } from "./RemovalOptions";

@GenerateShim('Windows.Management.Deployment.PackageManager')
export class PackageManager { 
    addPackageAsync(packageUri: Uri, dependencyPackageUris: IIterable<Uri>, deploymentOptions: DeploymentOptions): IAsyncOperationWithProgress<DeploymentResult, DeploymentProgress> {
        throw new Error('PackageManager#addPackageAsync not implemented')
    }
    updatePackageAsync(packageUri: Uri, dependencyPackageUris: IIterable<Uri>, deploymentOptions: DeploymentOptions): IAsyncOperationWithProgress<DeploymentResult, DeploymentProgress> {
        throw new Error('PackageManager#updatePackageAsync not implemented')
    }
    removePackageAsync(packageFullName: string): IAsyncOperationWithProgress<DeploymentResult, DeploymentProgress> {
        throw new Error('PackageManager#removePackageAsync not implemented')
    }
    stagePackageAsync(packageUri: Uri, dependencyPackageUris: IIterable<Uri>): IAsyncOperationWithProgress<DeploymentResult, DeploymentProgress> {
        throw new Error('PackageManager#stagePackageAsync not implemented')
    }
    registerPackageAsync(manifestUri: Uri, dependencyPackageUris: IIterable<Uri>, deploymentOptions: DeploymentOptions): IAsyncOperationWithProgress<DeploymentResult, DeploymentProgress> {
        throw new Error('PackageManager#registerPackageAsync not implemented')
    }
    findPackages(): IIterable<Package> {
        throw new Error('PackageManager#findPackages not implemented')
    }
    findPackagesByUserSecurityId(userSecurityId: string): IIterable<Package> {
        throw new Error('PackageManager#findPackagesByUserSecurityId not implemented')
    }
    findPackagesByNamePublisher(packageName: string, packagePublisher: string): IIterable<Package> {
        throw new Error('PackageManager#findPackagesByNamePublisher not implemented')
    }
    findPackagesByUserSecurityIdNamePublisher(userSecurityId: string, packageName: string, packagePublisher: string): IIterable<Package> {
        throw new Error('PackageManager#findPackagesByUserSecurityIdNamePublisher not implemented')
    }
    findUsers(packageFullName: string): IIterable<PackageUserInformation> {
        throw new Error('PackageManager#findUsers not implemented')
    }
    setPackageState(packageFullName: string, packageState: PackageState): void {
        console.warn('PackageManager#setPackageState not implemented')
    }
    findPackageByPackageFullName(packageFullName: string): Package {
        throw new Error('PackageManager#findPackageByPackageFullName not implemented')
    }
    cleanupPackageForUserAsync(packageName: string, userSecurityId: string): IAsyncOperationWithProgress<DeploymentResult, DeploymentProgress> {
        throw new Error('PackageManager#cleanupPackageForUserAsync not implemented')
    }
    findPackagesByPackageFamilyName(packageFamilyName: string): IIterable<Package> {
        throw new Error('PackageManager#findPackagesByPackageFamilyName not implemented')
    }
    findPackagesByUserSecurityIdPackageFamilyName(userSecurityId: string, packageFamilyName: string): IIterable<Package> {
        throw new Error('PackageManager#findPackagesByUserSecurityIdPackageFamilyName not implemented')
    }
    findPackageByUserSecurityIdPackageFullName(userSecurityId: string, packageFullName: string): Package {
        throw new Error('PackageManager#findPackageByUserSecurityIdPackageFullName not implemented')
    }
    removePackageWithOptionsAsync(packageFullName: string, removalOptions: RemovalOptions): IAsyncOperationWithProgress<DeploymentResult, DeploymentProgress> {
        throw new Error('PackageManager#removePackageWithOptionsAsync not implemented')
    }
    stagePackageWithOptionsAsync(packageUri: Uri, dependencyPackageUris: IIterable<Uri>, deploymentOptions: DeploymentOptions): IAsyncOperationWithProgress<DeploymentResult, DeploymentProgress> {
        throw new Error('PackageManager#stagePackageWithOptionsAsync not implemented')
    }
    registerPackageByFullNameAsync(mainPackageFullName: string, dependencyPackageFullNames: IIterable<string>, deploymentOptions: DeploymentOptions): IAsyncOperationWithProgress<DeploymentResult, DeploymentProgress> {
        throw new Error('PackageManager#registerPackageByFullNameAsync not implemented')
    }
    findPackagesWithPackageTypes(packageTypes: PackageTypes): IIterable<Package> {
        throw new Error('PackageManager#findPackagesWithPackageTypes not implemented')
    }
    findPackagesByUserSecurityIdWithPackageTypes(userSecurityId: string, packageTypes: PackageTypes): IIterable<Package> {
        throw new Error('PackageManager#findPackagesByUserSecurityIdWithPackageTypes not implemented')
    }
    findPackagesByNamePublisherWithPackageTypes(packageName: string, packagePublisher: string, packageTypes: PackageTypes): IIterable<Package> {
        throw new Error('PackageManager#findPackagesByNamePublisherWithPackageTypes not implemented')
    }
    findPackagesByUserSecurityIdNamePublisherWithPackageTypes(userSecurityId: string, packageName: string, packagePublisher: string, packageTypes: PackageTypes): IIterable<Package> {
        throw new Error('PackageManager#findPackagesByUserSecurityIdNamePublisherWithPackageTypes not implemented')
    }
    findPackagesByPackageFamilyNameWithPackageTypes(packageFamilyName: string, packageTypes: PackageTypes): IIterable<Package> {
        throw new Error('PackageManager#findPackagesByPackageFamilyNameWithPackageTypes not implemented')
    }
    findPackagesByUserSecurityIdPackageFamilyNameWithPackageTypes(userSecurityId: string, packageFamilyName: string, packageTypes: PackageTypes): IIterable<Package> {
        throw new Error('PackageManager#findPackagesByUserSecurityIdPackageFamilyNameWithPackageTypes not implemented')
    }
    stageUserDataAsync(packageFullName: string): IAsyncOperationWithProgress<DeploymentResult, DeploymentProgress> {
        throw new Error('PackageManager#stageUserDataAsync not implemented')
    }
}
