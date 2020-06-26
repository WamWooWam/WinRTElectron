/// <ref src="Windows.Foundation.ts"/>

import { IAsyncOperation } from "./Windows.Foundation";

export namespace Security.Authentication.OnlineId {
    export class OnlineIdServiceTicketRequest {

    }

    export class UserIdentity {

    }

    export enum CredentialPromptType {
        promptIfNeeded,
        retypeCredentials,
        doNotPrompt
    }

    export class OnlineIdAuthenticator {
        authenticateUserAsync(request: OnlineIdServiceTicketRequest[], proptType: CredentialPromptType)
            : IAsyncOperation<UserIdentity> {
            return new IAsyncOperation<UserIdentity>(async (resolve, reject) => {
                reject({});
            });
        }
    }
}