import { WrSkyLib } from "../WrSkyLib";
import { Conversation } from "../Conversation";

export class RecentsQuery {
    constructor(lib: WrSkyLib) { }

    reload(max_items: number): void {
        console.warn('shimmed function RecentsQuery.reload');
    }

    resize(max_items: number): void {
        console.warn('shimmed function RecentsQuery.resize');
    }

    handleConversationPropertiesChange(conversation: Conversation, props: number[]): void {
        console.warn('shimmed function RecentsQuery.handleConversationPropertiesChange');
    }

    handleConversationListChange(sender: /* System.Object */ any, id: number, filterType: number, added: Boolean): void {
        console.warn('shimmed function RecentsQuery.handleConversationListChange');
    }

    addEventListener(name: string, handler: Function) {
        console.warn(`RecentsQuery::addEventListener: ${name}`);
        switch (name) {
            case "recentscountchanged": // RecentsCountChangedType
            case "unreadcountchanged": // UnreadCountChangedType
            case "recentsqueryitemmoved": // RecentsQueryItemMovedType
            case "recentsqueryitemremoved": // RecentsQueryItemRemovedType
            case "recentsqueryitemadded": // RecentsQueryItemAddedType
            case "recentsqueryreset": // RecentsQueryResetType
                break;
        }

    }
}