import { Component } from "preact";

interface CoreWindowTitleBarProps {
    title: string;
    iconUrl: string;
    primaryColour: string;
    isVisible: boolean;
    
    minimiseClicked: () => void;
    closeClicked: () => void;
}

// 
// Represents a CoreWindow's title bar
//
export class CoreWindowTitleBar extends Component<CoreWindowTitleBarProps> {
    render() {
        return (
            <div class="core-window-titlebar">
                <div class="core-window-icon-container" style={{ background: this.props.primaryColour }}>
                    <img class="core-window-icon" src={this.props.iconUrl} />
                </div>

                <div class="core-window-title">{this.props.title}</div>
                <button class="core-window-minimise" onClick={this.props.minimiseClicked} />
                <button class="core-window-close" onClick={this.props.closeClicked} />
            </div>
        );
    }
}