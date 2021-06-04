
import { IIterable } from "../../../Foundation/Collections/IIterable`1";
import { AsyncOperation, IAsyncOperation } from "../../../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";
import { Vector } from "../../../Foundation/Interop/Vector`1";
import { CredentialPromptType } from "./CredentialPromptType";
import { OnlineIdServiceTicket } from "./OnlineIdServiceTicket";
import { OnlineIdServiceTicketRequest } from "./OnlineIdServiceTicketRequest";
import { SignOutUserOperation } from "./SignOutUserOperation";
import { UserAuthenticationOperation } from "./UserAuthenticationOperation";
import { UserIdentity } from "./UserIdentity";

@GenerateShim('Windows.Security.Authentication.OnlineId.OnlineIdAuthenticator')
export class OnlineIdAuthenticator {
    applicationId: string = null;
    authenticatedSafeCustomerId: string = null;
    canSignOut: boolean = null;
    
    authenticateUserAsync(request: OnlineIdServiceTicketRequest): IAsyncOperation<UserIdentity> {
        return AsyncOperation.from(async () => {
            let identity = new UserIdentity();
            identity.firstName = "Thomas";
            identity.lastName = "May";
            identity.signInName = "wamwoowam@gmail.com";

            let tickets = new Vector<OnlineIdServiceTicket>();
            let ticket = new OnlineIdServiceTicket();
            ticket.request = request;
            ticket.value = "Test";
            tickets.append(ticket);
            identity.tickets = tickets;
            return identity;
        })
    }

    authenticateUserAsyncAdvanced(requests: IIterable<OnlineIdServiceTicketRequest>, credentialPromptType: CredentialPromptType): UserAuthenticationOperation {
        throw new Error('OnlineIdAuthenticator#authenticateUserAsyncAdvanced not implemented')
    }

    signOutUserAsync(): SignOutUserOperation {
        throw new Error('OnlineIdAuthenticator#signOutUserAsync not implemented')
    }
}
