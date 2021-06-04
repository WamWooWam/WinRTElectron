export class AvatarManager {

    getAvatarURI(identity: string): string {
        console.warn('shimmed function AvatarManager.getAvatarURI');

        return "/images/avatar.default.unknown.png"
    }

    static offlineAvatarURI(identity: string): string {
        console.warn('shimmed function AvatarManager.offlineAvatarURI');
        return "/images/avatar.default.unknown.png"
    }

    static isDefaultAvatarURI(uri: string): Boolean {
        console.warn('shimmed function AvatarManager.isDefaultAvatarURI');
        return true;
    }

    addEventListener(name: string, handler: Function) {
        console.warn(`AvatarManager::addEventListener: ${name}`);
        switch (name) {
            case "avatarurichange": // OnAvatarURIChangeType
                break;
        }

    }
}