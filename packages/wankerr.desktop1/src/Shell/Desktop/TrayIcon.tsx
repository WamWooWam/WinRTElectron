import { h as jsx, Component } from "preact"

export interface TrayIcon {
    parentWindow?: any;
    id: number;
    icon: string;
    tip?: string;
    invoked?: Function;
}

export class TrayIconComponent extends Component<Partial<TrayIcon>> {
    render(props?: Partial<TrayIcon>, state?: Readonly<any>, context?: any) {
        return (
            <button className="taskbar-button taskbar-tray-icon-container">
                <img className="taskbar-tray-icon" src={props.icon} />
            </button>
        )
    }
}