import React from "react";
import "../styles/tile.css";

const tileProps = {
    2: {
        "backgroundColor": "#eee4da",
        "color": "#786e64",
        "fontSize": "72px"
    },
    4: {
        "backgroundColor": "#ece0ca",
        "color": "#786e64",
        "fontSize": "72px"
    },
    8: {
        "backgroundColor": "#f2b179",
        "color": "#ffffff",
        "fontSize": "72px"
    },
    16: {
        "backgroundColor": "#ec8d53",
        "color": "#ffffff",
        "fontSize": "72px"
    },
    32: {
        "backgroundColor": "#f57c5f",
        "color": "#ffffff",
        "fontSize": "72px"
    },
    64: {
        "backgroundColor": "#e95839",
        "color": "#ffffff",
        "fontSize": "72px"
    },
    128: {
        "backgroundColor": "#f4d86d",
        "color": "#ffffff",
        "fontSize": "40px"
    },
    256: {
        "backgroundColor": "#f1d04b",
        "color": "#ffffff",
        "fontSize": "40px"
    },
    512: {
        "backgroundColor": "#e4c02a",
        "color": "#ffffff",
        "fontSize": "40px"
    },
    1024: {
        "backgroundColor": "#dd9210",
        "color": "#ffffff",
        "fontSize": "32px"
    },
    2048: {
        "backgroundColor": "#ecc400",
        "color": "#ffffff",
        "fontSize": "32px"
    }
};

class Tile extends React.Component {
    constructor(props) {
        super(props);
    }

    mixStyles() {
        // beware: we cannot set .top and .left directly on tileProps[...], thus we create
        // a fresh copy of the related object first.
        var style = Object.assign({}, tileProps[this.props.value]);
        style.top = this.props.top + "px";
        style.left = this.props.left + "px";
        return style;
    }

    render() {
        return (
            <div className="tile" style={this.mixStyles()}>
                {this.props.value}
            </div>
        );
    }
}

export default Tile;
