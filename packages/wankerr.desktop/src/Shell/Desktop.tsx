import { h as jsx, Component, Fragment } from "preact";
import { Taskbar } from "./Desktop/Taskbar"
import { Window, WindowComponent } from "./Desktop/Window";
// import { Shell } from "../Shell";

export interface DesktopProps {

}

export interface DesktopState {
    windows: Window[];
}

export class Desktop extends Component<DesktopProps, DesktopState> {

    constructor() {
        super();
        this.state = { windows: [] };
    }

    componentWillMount() {
        // let shell = Shell.getInstance();
        // shell.addEventListener("window-opened", this.onWindowCreated.bind(this));
        // shell.addEventListener("window-closed", this.onWindowClosed.bind(this));
    }

    onWindowCreated(event: CustomEvent) {
        this.setState({ windows: [event.detail, ...this.state.windows] })
    }

    onWindowClosed(event: CustomEvent) {

    }

    render(props: DesktopProps, state: DesktopState) {
        return (
            <Fragment>
                {...state.windows.map(win => <WindowComponent key={win.id} window={win} />)}
                <Taskbar />
            </Fragment>
        )
    }
}