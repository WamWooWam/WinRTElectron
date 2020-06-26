import { Start } from "./Start";

export class MSAppImpl {
    terminateApp(message: any) {
        let start = Start.getInstance();
        start.show();

        message.window.terminate();
    }

    createNewView(message: any) {
        
    }
}