import { h as jsx, Component } from "preact";
import { uuidv4 } from "winrt/Windows/Foundation/Interop/Utils";
import { Application } from "../Application";

export class Window {
    id: string;
    app: Application;
    
    constructor(owner: Application) {
        this.id = uuidv4();
        this.app = owner;
    }
}

export interface WindowProps {
    window: Window;
}

export interface WindowState {
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
}

export class WindowComponent extends Component<WindowProps, WindowState> {
    render(props: WindowProps, state: WindowState) {
        return <div />
    }
}