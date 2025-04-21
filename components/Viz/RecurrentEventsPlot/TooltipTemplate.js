import React from "react"
import _ from "lodash"

export const RecurrentEventsTooltipTemplate = (props) => {
    return (
        <div style={{ margin: "0px 0 0", lineHeight: 1 }}>
            <div style={{ margin: "0px 0 0", lineHeight: 1 }}>
                <div style={{ fontSize: 18, textAlign: "center", color: "#666", fontWeight: 800, lineHeight: "1.5" }}>
                    {props.aliquot}
                </div>

                <div style={{ margin: '10px 0 0', lineHeight: 1 }}>
                    <div style={{ margin: '0 0 0', lineHeight: 1 }}>
                        <span style={{ fontSize: 14, color: "#666", fontWeight: 400, marginLeft: 2 }}>
                            {`${props.chromosome}: ${props.xPosition}`}
                        </span>
                        <span style={{ float: "right", marginLeft: 20, fontSize: 14, color: "#666", fontWeight: 800 }}>
                            {_.round(props.value, 3)}
                        </span>
                        <div style={{ clear: "both" }}/>
                    </div>
                    <div style={{ clear: "both" }}/>
                </div>
            </div>
            <div style={{ clear: "both" }}/>
        </div>
    )
}

export const CNVMetaMatrixTooltipTemplate = (title, valueColor, valueTitle, value) => (
    <div style={{ margin: "0px 0 0", lineHeight: 1 }}>
        <div style={{ margin: "0px 0 0", lineHeight: 1 }}>
            <div style={{ fontSize: 18, textAlign: "center", color: "#666", fontWeight: 800, lineHeight: "1.5" }}>
                {title}
            </div>

            <div style={{ margin: '10px 0 0', lineHeight: 1 }}>
                <div style={{ margin: '0 0 0', lineHeight: 1 }}>
                    <span style={{
                        display: "inline-block",
                        marginRight: 4,
                        borderRadius: 10,
                        width: 10,
                        height: 10,
                        backgroundColor: valueColor
                    }}/>
                    <span style={{ fontSize: 14, color: "#666", fontWeight: 400, marginLeft: 2}}>
                        {valueTitle}
                    </span>
                    <span style={{float: "right", marginLeft: 20, fontSize: 14, color: "#666", fontWeight: 900}}>
                        {value}
                    </span>
                    <div style={{clear: "both"}}/>
                </div>
                <div style={{clear: "both"}}/>
            </div>
        </div>
        <div style={{clear: "both"}}/>
    </div>
)
