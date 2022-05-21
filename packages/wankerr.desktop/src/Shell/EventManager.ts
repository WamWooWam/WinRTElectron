export class EventManager extends EventTarget {
    private static __instance: EventManager;
    static getInstance(): EventManager {
        return EventManager.__instance ? EventManager.__instance : (EventManager.__instance = new EventManager());
    }
}