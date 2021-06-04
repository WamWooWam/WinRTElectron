import { h, Component, createContext } from "preact";
import { useContext } from "preact/hooks";
import { Settings } from "./Data/Settings"
import { Desktop } from "./Shell/Desktop";
import { Start } from "./Shell/Start";

export const AppSettings = createContext<Settings>(null);
const Wallpapers = [
    require("/static/wallpaper/img0.jpg").default,
    require("/static/wallpaper/img1.jpg").default,
]


interface ShellState {
    settings: Settings;
}

export class Shell extends Component<{}, ShellState> {
    constructor(props) {
        super(props);
        this.state = {
            settings: new Settings(this.settingsUpdated.bind(this))
        }
    }

    settingsUpdated() {
        this.setState({ settings: this.state.settings });
    }

    render(props: {}, state: ShellState) {
        return (
            <AppSettings.Provider value={state.settings}>
                <div class="root" style={{ backgroundImage: `url(${state.settings.wallpaper})` }}>
                    <Start />
                    <Desktop />
                </div>
            </AppSettings.Provider>
        );
    }
}