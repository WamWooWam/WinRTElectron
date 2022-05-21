import { Component, RenderableProps } from "preact";
import { useContext } from "preact/hooks";
import { AppSettings } from "../Shell";
import { TileGroup } from "./Start/TileGroup";
import { TileSize } from "./Start/TileSize";
import { Tile } from "./Start/Tile";
import "./start.css"

interface StartHeaderButtonProps {
    primaryClass: string
}

const HeaderButton = (props: RenderableProps<StartHeaderButtonProps>) => {
    return (
        <div class={"start-header-button " + props.primaryClass}>
            {props.children}
        </div>
    )
}

interface StartState {
    tileGroups: Array<any>
}

export class Start extends Component<any, StartState> {

    componentDidMount() {
        fetch("/StartScreen.xml").then(resp => resp.text())
            .then(text => this.parseLayout(text));
    }

    parseLayout(text: string) {
        let doc = new DOMParser().parseFromString(text, 'application/xml');
        let root = doc.querySelector("launcher");

        if (root == null) {
            return;
        }

        let tileGroups = [];
        let groups = root.querySelectorAll("group");
        for (const group of groups) {
            let groupProps = {
                title: group.getAttribute("name"),
                tiles: []
            };

            for (const tile of group.querySelectorAll("tile")) {
                let rawAppId = tile.getAttribute("AppID");
                let tileProps = {
                    packageName: null,
                    appId: null,
                    size: TileSize.square150x150,
                    fence: false
                };

                if (rawAppId !== null) {
                    // parsing windows 8 start screen xml dump
                    console.log(`Parsing AppID ${rawAppId}`);
                    let idx = rawAppId.lastIndexOf("!");
                    if (idx === -1) {
                        tileProps.appId = rawAppId;
                    }
                    else {
                        let packageFamilyName = rawAppId.substring(0, idx);
                        let appId = rawAppId.substring(idx + 1);

                        // idx = packageFamilyName.lastIndexOf("_");
                        // if (idx !== -1) {
                        //     packageFamilyName = packageFamilyName.substring(0, idx);
                        // }

                        tileProps.packageName = packageFamilyName;
                        tileProps.appId = appId;
                    }

                    tileProps.fence = tile.getAttribute("FencePost") === "1";
                    tileProps.size = TileSize[tile.getAttribute("size")];
                }
                else {
                    tileProps.packageName = tile.getAttribute("packageName");
                    tileProps.appId = tile.getAttribute("appId");
                    tileProps.fence = tile.getAttribute("fence") === "true";
                    tileProps.size = TileSize[tile.getAttribute("size")];
                }

                groupProps.tiles.push(tileProps);
            }

            tileGroups.push(groupProps);
        }

        this.setState({ tileGroups: tileGroups });
    }

    render() {
        let settings = useContext(AppSettings);
        return (
            <div class="start start-screen">
                <div class="start-content">
                    <div class="start-header start-main-header">
                        <h1 class="start-title">Start</h1>
                        <div class="start-header-buttons">
                            <HeaderButton primaryClass="start-header-user-button">
                                <div class="username">
                                    <p class="primary">Thomas</p>
                                    <p class="secondary">May</p>
                                </div>
                                <img src={settings.avatar} class="picture" />
                            </HeaderButton>
                            <HeaderButton primaryClass="start-header-power">
                                &#xE07D;
                            </HeaderButton>
                            <HeaderButton primaryClass="start-header-search">
                                &#xE2FB;
                            </HeaderButton>
                        </div>
                    </div>

                    <div class="start-tiles-scroll-container">
                        <div class="start-tiles">
                            {this.state.tileGroups ? this.state.tileGroups.map(m => <TileGroup {...m}/>): []}
                        </div>
                    </div>

                    <div class="start-footer">
                        <button class="start-show-all-button start-arrow-button">
                            <svg xmlns="http://www.w3.org/2000/svg" class="start-show-all-icon" viewBox="2.5 7 15 15">
                                <g id="layer0">
                                    <path id="circle"
                                        d="m 16.650391,14.580078 c 0,-0.898437 -0.172528,-1.746419 -0.517579,-2.543945 C 15.78776,11.238607 15.317383,10.541992 14.72168,9.946289 14.125977,9.350586 13.430989,8.878581 12.636719,8.530273 11.842447,8.181967 10.996094,8.007812 10.097656,8.007812 9.505208,8.007812 8.930664,8.087565 8.374023,8.24707 7.817383,8.406576 7.294922,8.629559 6.806641,8.916016 6.318359,9.202475 5.872396,9.545898 5.46875,9.946289 5.065104,10.34668 4.720052,10.791016 4.433594,11.279297 c -0.286459,0.488281 -0.50944,1.010742 -0.668946,1.567383 -0.159505,0.55664 -0.239257,1.13444 -0.239257,1.733398 0,0.598959 0.079752,1.176758 0.239257,1.733399 0.159506,0.55664 0.382487,1.077474 0.668946,1.5625 0.286458,0.485025 0.629883,0.927734 1.030273,1.328125 0.400391,0.40039 0.844727,0.743814 1.333008,1.030273 0.488281,0.286459 1.010742,0.507813 1.567383,0.664063 0.55664,0.15625 1.134439,0.234374 1.733398,0.234374 0.598958,0 1.176758,-0.07812 1.733399,-0.234374 0.55664,-0.15625 1.077473,-0.377604 1.5625,-0.664063 0.485025,-0.286459 0.927734,-0.628256 1.328125,-1.025391 0.40039,-0.397134 0.743814,-0.839843 1.030273,-1.328125 0.286457,-0.488281 0.507813,-1.010742 0.664063,-1.567382 0.15625,-0.556641 0.234375,-1.13444 0.234375,-1.733399 z" />
                                    <path id="arrow"
                                        d="m 14.199219,14.550818 v 0.0293 l -3.056641,3.203125 H 8.916016 l 2.34375,-2.392578 H 6.181641 v -1.650391 h 5.078125 l -2.34375,-2.382812 h 2.226562 z" />
                                </g>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}