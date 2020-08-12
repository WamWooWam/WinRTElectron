export class AccountManager {
    static local_SETTINGS_KEY_USER_CID: string = 'skype.liveuser.CID';

    static isTheSameLiveUser(): Boolean {
        throw new Error('shimmed function AccountManager.isTheSameLiveUser');
    }

    static isTheSameSkypeUser(accountName: string): Boolean {
        throw new Error('shimmed function AccountManager.isTheSameSkypeUser');
    }

    static updateAccountName(accountName: string): void {
        console.warn('shimmed function AccountManager.updateAccountName');
    }

}