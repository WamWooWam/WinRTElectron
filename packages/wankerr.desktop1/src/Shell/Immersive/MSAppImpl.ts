import { Shell } from "../Shell";
import { Start } from "./Start";

export class MSAppImpl {
    terminateApp(message: any) {
        Shell.getInstance().start.show();
        message.window.terminate();
    }

    createNewView(message: any) {
        
    }
}