import { Shell, ShellContext } from "../Shell";
import { TrayIcon, TrayIconComponent } from "./TrayIcon";
import { h as jsx, Component, render, Fragment } from "preact"
import { getRGBFromString, lightenDarkenColour } from "../Util"
import "./taskbar.css"
import { TaskbarIcon, TaskbarIconComponent } from "./TaskbarIcon";

export interface TaskbarProps {
}

export interface TaskbarState {
    hidden: boolean;
    date: Date;
    appIcons: TaskbarIcon[];
    trayIcons: TrayIcon[];
}

export class Taskbar extends Component<TaskbarProps, TaskbarState> {
    constructor(props: TaskbarProps) {
        super(props);
        this.state = { hidden: false, date: new Date(Date.now()), trayIcons: [], appIcons: [] };
    }

    componentWillMount() {
        setInterval(() => this.updateClock(), 250);

        let shell = Shell.getInstance();
        shell.addEventListener("taskbar-shown", this.taskbarShown.bind(this));
        shell.addEventListener("taskbar-hidden", this.taskbarHidden.bind(this));
        shell.addEventListener("immersive-app-launched", this.immersiveAppLaunched.bind(this));
        shell.addEventListener("immersive-app-exited", this.immersiveAppExited.bind(this));
        shell.addEventListener("tray-icon-added", this.trayIconAdded.bind(this));
        shell.addEventListener("tray-icon-removed", this.trayIconRemoved.bind(this));
    }

    immersiveAppLaunched(event: CustomEvent) {
        let detail = event.detail;
        let icon: TaskbarIcon = {
            isOpen: true,
            icon: detail.app.visualElements.square30x30Logo,
            colour: detail.app.visualElements.backgroundColor,
            activated: () => {
                Shell.getInstance().launchImmersiveApp(detail.package, detail.app);
            }
        }

        this.setState({ appIcons: [...this.state.appIcons, icon] })
    }

    immersiveAppExited(event: CustomEvent) {

    }

    trayIconAdded(event: CustomEvent) {

    }

    trayIconRemoved(event: CustomEvent) {

    }

    taskbarShown(event: CustomEvent) {
        this.setState({ hidden: false });
    }

    taskbarHidden(event: CustomEvent) {
        this.setState({ hidden: true });
    }

    render(props: TaskbarProps, state: Readonly<TaskbarState>) {
        let date = state.date;
        let timeString = this.getString(date.getHours()) + ":" + this.getString(date.getMinutes());
        let dateString = this.getString(date.getDate()) + "/" + this.getString(date.getMonth() + 1) + "/" + this.getString(date.getFullYear());
        let backgroundColours = getRGBFromString(lightenDarkenColour(Shell.getInstance().settings.personalisation.accentColour, -48));
        let style = {
            backgroundColor: `rgba(${backgroundColours[0]}, ${backgroundColours[1]}, ${backgroundColours[2]}, 0.66)`,
            borderColor: `rgba(${backgroundColours[0]}, ${backgroundColours[1]}, ${backgroundColours[2]}, 0.90)`
        }

        let className = "taskbar" + (state.hidden ? " hide" : "");
        return (
            <div className={className} style={style}>
                <div className="taskbar-content">
                    <button className="start-button" onClick={this.onStartButtonClick.bind(this)}>
                        <img src="/static/taskbar/start.png" />
                    </button>
                    <div className="taskbar-apps-list">
                        {...state.appIcons.map((obj, index) => <TaskbarIconComponent key={index} {...obj} />)}
                    </div>
                    <div className="taskbar-tray">
                        {...state.trayIcons.map(i => <TrayIconComponent key={i.id} icon={i.icon} />)}
                    </div>
                    <button className="taskbar-button taskbar-clock">
                        <p className="taskbar-clock-time">{timeString}</p>
                        <p className="taskbar-clock-date">{dateString}</p>
                    </button>
                    <button className="taskbar-show-desktop-button" />
                </div>
            </div>
        )
    }

    updateClock() {
        this.setState({ date: new Date(Date.now()) });
    }

    onStartButtonClick() {
        Shell.getInstance().start.show();
    }

    getString(n: number) {
        return n.toLocaleString('en-GB', { minimumIntegerDigits: 2, useGrouping: false });
    }
}