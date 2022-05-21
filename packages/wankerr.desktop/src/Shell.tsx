import { h, Component, createContext } from "preact";
import { useContext } from "preact/hooks";
import { CoreWindowInfo } from "./Data/CoreWindowInfo";
import { Settings } from "./Data/Settings"
import { Desktop } from "./Shell/Desktop";
import { EventManager } from "./Shell/EventManager";
import { CoreWindowContainer } from "./Shell/Immersive/CoreWindowContainer";
import { Start } from "./Shell/Start";

export const AppSettings = createContext<Settings>(null);
export const CoreWindows = createContext<CoreWindowInfo[]>([])

const Wallpapers = [
    require("/static/wallpaper/img0.jpg").default,
    require("/static/wallpaper/img1.jpg").default,
]

interface ShellState {
    settings: Settings;
    coreWindows: CoreWindowInfo[]
}

export class Shell extends Component<{}, ShellState> {
    constructor(props) {
        super(props);
        this.state = {
            settings: new Settings(this.settingsUpdated.bind(this)),
            coreWindows: []
        }
    }

    componentDidMount(): void {
        let eventManager = EventManager.getInstance();
        eventManager.addEventListener("move-window", this.onMoveWindow.bind(this))
    }

    settingsUpdated() {
        this.setState({ settings: this.state.settings });
    }

    onMoveWindow(event: CustomEvent) {
        let window = event.detail as CoreWindowInfo;
        this.setState({ coreWindows: [window, ...this.state.coreWindows] });
    }

    render(props: {}, state: ShellState) {
        return (
            <AppSettings.Provider value={state.settings}>
                <CoreWindows.Provider value={state.coreWindows}>
                    <div class="root" style={{ backgroundImage: `url(${state.settings.wallpaper})` }}>
                        <Start />
                        <CoreWindowContainer windows={state.coreWindows} />

                        {/* <Desktop /> */}
                    </div>
                </CoreWindows.Provider>
            </AppSettings.Provider>
        );
    }
}