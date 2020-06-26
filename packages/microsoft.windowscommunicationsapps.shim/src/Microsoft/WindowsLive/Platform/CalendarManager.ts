import { Manager } from "./ManagerBase"
import { Collection } from "./Utils";

export class CalendarManager extends Manager {
    getEvents() {
        return new Collection([]);
    }

    getCalendarErrors() {
        return new Collection([]);
    }

    getCalendarError(e: string) {
        
    }
}