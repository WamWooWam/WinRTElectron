import { Component } from "preact";
import { CoreWindow } from "./CoreWindow";
import { CoreWindowInfo } from "../../Data/CoreWindowInfo";

// 
// Contains and manages active CoreWindows, snapping, etc.
//

interface CoreWindowContainerProps {
    windows: CoreWindowInfo[];
}

export class CoreWindowContainer extends Component<CoreWindowContainerProps, {}> {
    render() {
        return (
            <div className="core-window-container">
                {...this.props.windows.map(w => <CoreWindow windowId={w.id} isInTile={false}/>)}
            </div>
        )
    }
}