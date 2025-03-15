import {ColorLegend} from "../../ColorLegend";
import * as d3 from "d3";

export const GeneLevelColorLegends = (
    {
        legendWidth,
        legendHeight,
        colorScales
    }
) => {
    const cnvValueScale = d3.scaleSqrt(
        [0, 2, 10], ["#add8e6", "#ffffff", "#6A0220"])

    return (
        <g>
            <ColorLegend
                color={cnvValueScale}
                title={"CNV Value"}
                width={legendWidth}
                legendMarginTop={0}
                ticks={11}
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
                color={colorScales['e_PC1']}
                title={"ePC1"}
                width={legendWidth}
                legendMarginTop={legendHeight * 5}
            />

            <ColorLegend
                color={colorScales['e_PC2']}
                title={"ePC2"}
                width={legendWidth}
                legendMarginTop={legendHeight * 6}
            />

            <ColorLegend
                color={colorScales['e_TSNE1']}
                title={"e_TSNE1"}
                width={legendWidth}
                legendMarginTop={legendHeight * 7}
            />

            <ColorLegend
                color={colorScales['e_TSNE2']}
                title={"e_TSNE2"}
                width={legendWidth}
                legendMarginTop={legendHeight * 8}
            />

            <ColorLegend
                color={colorScales['e_UMAP1']}
                title={"e_UMAP1"}
                width={legendWidth}
                legendMarginTop={legendHeight * 9}
            />

            <ColorLegend
                color={colorScales['e_UMAP2']}
                title={"e_UMAP2"}
                width={legendWidth}
                legendMarginTop={legendHeight * 10}
            />
        </g>
    )
}
