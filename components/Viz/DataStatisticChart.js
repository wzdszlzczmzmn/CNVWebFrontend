import {useEffect, useRef, useState} from "react";
import ReactDOMServer from "react-dom/server"
import useSWR from "swr";
import {fetcher, getProjectStatisticDataURL} from 'data/get'
import * as echarts from "echarts";
import Box from "@mui/material/Box";


const tooltipCustomHTML = (otherItemsDetail) => {
    return `
        <div style="margin: 0 0 0; line-height: 1;">
            <div style="margin: 0 0 0; line-height: 1;">
                <div style="font-size: 18px; text-align: center; color: #666; font-weight: 800; line-height: 1.5;">Other</div>
                <div style="margin: 10px 0 0; line-height: 1;">
                    ${otherItemsDetail.map((item, index) => `
                        <div style="margin: 10px 0 0; line-height: 1;">
                            <div style="margin: 0 0 0; line-height: 1;">
                                <span style="
                                    display: inline-block;
                                    margin-right: 4px;
                                    border-radius: 10px;
                                    width: 10px;
                                    height: 10px;
                                    background-color: ${tooltipDotColor[index % tooltipDotColor.length]};
                                "></span>
                                <span style="font-size: 14px; color: #666; font-weight: 400; margin-left: 2px;">${item.name}</span>
                                <span style="float: right; margin-left: 20px; font-size: 14px; color: #666; font-weight: 900;">${item.value}</span>
                                <div style="clear: both;"></div>
                            </div>
                            <div style="clear: both;"></div>
                        </div>
                    `).join('')}
                </div>
                <div style="clear: both;"></div>
            </div>
            <div style="clear: both;"></div>
        </div>
    `
}

const dataViewCustomDOMElement = () => {

}

// const colorSetting = ['#0abab5', '#39cbac', '#66da9e', '#94e78d', '#c5f17c', '#f3e482']
// const colorSetting = ['#482683', '#0051ac', '#0075c2', '#0095c8', '#00b3c1', '#30ceb7']

const tooltipDotColor = ['#845ec2', '#d65db1', '#ff6f91', '#ff9671', '#ffc75f', '#ffe171']

const DataStatisticPieChart = (data, myChart) => {
    const totalNum = data.content.data.reduce((sum, item) => sum + item.value, 0)

    if (data.content['has_other'] === true) {
        const otherItem = data.content.data.pop()
        const otherItemsDetail = data.content['other_items']

        const other = {
            name: otherItem.name,
            value: otherItem.value,
            tooltip: {
                trigger: 'item',
                formatter: tooltipCustomHTML(otherItemsDetail),
                position: 'bottom'
            }
        }

        data.content.data.push(other)
    }

    return {
        tooltip: {},
        toolbox: {
            feature: {
                dataView: {
                    readOnly: true,
                },
                saveAsImage: {backgroundColor: 'transparent'},
            }
        },
        title: {
            text: data.title,
            subtext: 'Total: ' + totalNum,
            left: 'center'
        },
        series: {
            type: 'pie',
            radius: ['20%', '35%'],
            center: ['50%', '50%'],
            top: '5%',
            itemStyle: {
                borderColor: '#fff',
                borderWidth: 1
            },
            minAngle: 5,
            startAngle: 90,
            label: {
                alignTo: 'edge',
                formatter: '{name|{b}}\n{time|{c}}',
                minMargin: 5,
                edgeDistance: 25,
                lineHeight: 18,
                rich: {
                    time: {
                        fontSize: 12,
                        color: '#999'
                    }
                }
            },
            labelLine: {
                length: 60,
                length2: 0,
                maxSurfaceAngle: 80
            },
            labelLayout: function (params) {
                const isLeft = params.labelRect.x < myChart.getWidth() / 2;
                const points = params.labelLinePoints;
                // Update the end point.
                points[2][0] = isLeft
                    ? params.labelRect.x
                    : params.labelRect.x + params.labelRect.width;
                return {
                    labelLinePoints: points
                };
            },
            data: data.content.data
        }
    }
}

const DataStatisticChart = ({projectId, dataType, selectedItem}) => {
    const chartRef = useRef(null)
    const [statisticData, setStatisticData] = useState(null)

    const {data, error} = useSWR(`${getProjectStatisticDataURL}/${projectId}/${dataType}`, fetcher)

    useEffect(() => {
        if (data) {
            setStatisticData({title: selectedItem, content: data[selectedItem]});
        }
    }, [data, selectedItem])

    useEffect(() => {
        if (statisticData) {
            const chartInstance = echarts.init(chartRef.current)

            let option

            option = DataStatisticPieChart(statisticData, chartInstance)

            option && chartInstance.setOption(option)

            return () => {
                chartInstance.dispose()
            }
        }
    }, [statisticData])

    return (
        <Box ref={chartRef} sx={{flex: 1, minHeight: '540px'}}/>
    )
}

export default DataStatisticChart
