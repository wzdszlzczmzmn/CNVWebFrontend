import {ColorLegend} from "../ColorLegend";
import * as d3 from "d3";

export const ColorLegends = (
    {
        width,
        marginTop,
        legendWidth,
        legendHeight,
        colorScales,
        CNVBaseline
    }
) => {
    let scaleRange

    if (CNVBaseline === 0) {
        scaleRange = [-1, 1]
    } else {
        scaleRange = [0, 10]
    }

    const cnvValueScale = d3.scaleSqrt(
        [scaleRange[0], CNVBaseline, scaleRange[1]], ["#add8e6", "#ffffff", "#6A0220"])

    return (
        <g transform={`translate(${(width - legendWidth) / 2}, ${marginTop})`}>
            <ColorLegend
                color={cnvValueScale}
                title={"CNV Value"}
                width={legendWidth}
                legendMarginTop={0}
                ticks={(scaleRange[1] - scaleRange[0] + 1)}
            />

            <ColorLegend
                color={colorScales['gender']}
                title={"Gender"}
                width={legendWidth}
                legendMarginTop={legendHeight}
            />

            <ColorLegend
                color={colorScales['vital status']}
                title={"Vital Status"}
                width={legendWidth}
                legendMarginTop={legendHeight * 2}
            />

            <ColorLegend
                color={colorScales['ethnicity']}
                title={"Ethnicity"}
                width={legendWidth}
                legendMarginTop={legendHeight * 3}
            />

            <ColorLegend
                color={colorScales['race']}
                title={"Race"}
                width={legendWidth}
                legendMarginTop={legendHeight * 4}
            />

            <ColorLegend
                color={colorScales['hcluster']}
                title={"Hcluster"}
                width={legendWidth}
                legendMarginTop={legendHeight * 5}
            />

            <ColorLegend
                color={colorScales['e_PC1']}
                title={"ePC1"}
                width={legendWidth}
                legendMarginTop={legendHeight * 6}
            />

            <ColorLegend
                color={colorScales['e_PC2']}
                title={"ePC2"}
                width={legendWidth}
                legendMarginTop={legendHeight * 7}
            />

            <ColorLegend
                color={colorScales['e_TSNE1']}
                title={"e_TSNE1"}
                width={legendWidth}
                legendMarginTop={legendHeight * 8}
            />

            <ColorLegend
                color={colorScales['e_TSNE2']}
                title={"e_TSNE2"}
                width={legendWidth}
                legendMarginTop={legendHeight * 9}
            />

            <ColorLegend
                color={colorScales['e_UMAP1']}
                title={"e_UMAP1"}
                width={legendWidth}
                legendMarginTop={legendHeight * 10}
            />

            <ColorLegend
                color={colorScales['e_UMAP2']}
                title={"e_UMAP2"}
                width={legendWidth}
                legendMarginTop={legendHeight * 11}
            />
        </g>
    )
}
