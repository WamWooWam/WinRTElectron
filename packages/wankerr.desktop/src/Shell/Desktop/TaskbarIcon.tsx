import { h as jsx, Component } from "preact"
import { PackageApplication } from "../../Data/PackageApplication"
import { lightenDarkenColour } from "../Util";

export interface TaskbarIcon {
    isOpen: boolean;
    icon?: string;
    colour?: string;
    activated?: (ev: MouseEvent) => void;
}

interface TaskbarIconState {
    mouseOver: boolean;
    mouseX: number;
}

export class TaskbarIconComponent extends Component<TaskbarIcon, TaskbarIconState> {
    render(props: TaskbarIcon, state: TaskbarIconState) {
        let iconUrl = props.icon;
        let background = props.colour ?? "transparent";
        let className = "taskbar-button taskbar-app" + (props.isOpen ? " open" : "");
        let style = {};

        if (state.mouseOver) {
            let pos = (Math.max(Math.min(state.mouseX, 60), 0));
            let lighten = lightenDarkenColour(background, 96);
            style = {
                background: `radial-gradient(60px at ${pos}px 40px, ${lighten}A0, ${background}80, transparent) no-repeat`,
            }
        }

        return (
            <button className={className} 
                    onClick={props.activated} 
                    onMouseEnter={this.onMouseEnter.bind(this)} 
                    onMouseMove={this.onMouseMove.bind(this)} 
                    onMouseLeave={this.onMouseLeave.bind(this)}>
                <div className="taskbar-app-inner" style={style}>
                    <div className="taskbar-app-icon-container" style={{ background }}>
                        <img src={iconUrl} />
                    </div>
                </div>
            </button>
        );
    }

    onMouseEnter(ev: MouseEvent) {
        this.setState({ mouseOver: true });
    }

    onMouseMove(ev: MouseEvent) {
        var rect = (ev.target as Element).getBoundingClientRect();
        this.setState({ mouseX: ev.clientX - rect.left });
    }

    onMouseLeave(ev: MouseEvent) {
        this.setState({ mouseOver: false });
    }
}