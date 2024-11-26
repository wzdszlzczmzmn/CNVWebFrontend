import Head from "next/head";
import {Container} from "@mui/material";
import useSWR from "swr";
import {fetcher, getDiseaseAndSitesDataURL} from "/data/get"
import {useEffect, useRef, useState} from "react";
import * as echarts from "echarts";

const processDiseasesAndSitesData = (data) => {
    let key = 0
    let projects = []
    let allLevelData = []

    for (let item of data) {
        const project = [item['projectId'], item['total'], '-1', key.toString(), 'Project']
        key = key + 1
        projects.push(project)

        let diseases = []

        for (let diseaseItem of item['diseases']) {
            const disease =
                [diseaseItem['disease'], diseaseItem['total'], project[3], key.toString(), 'Disease', project[0]]
            key = key + 1
            diseases.push(disease)

            let primarySites = []

            for (let site of diseaseItem['primarySites']) {
                const primarySite =
                    [site['primarySite'], site['total'], disease[3], key.toString(), 'PrimarySite', disease[0]]
                key = key + 1
                primarySites.push(primarySite)

                const siteDetail = [
                    ['Allele-specific Copy Number Segment', site['Allele-specific Copy Number Segment'], primarySite[3], '', 'PrimarySiteDetail', primarySite[0]],
                    ['Copy Number Segment', site['Copy Number Segment'], primarySite[3], '', 'PrimarySiteDetail', primarySite[0]],
                    ['Gene Level Copy Number', site['Gene Level Copy Number'], primarySite[3], '', 'PrimarySiteDetail', primarySite[0]],
                    ['Masked Copy Number Segment', site['Masked Copy Number Segment'], primarySite[3], '', 'PrimarySiteDetail', primarySite[0]]
                ]
                allLevelData.push(siteDetail)
            }
            allLevelData.push(primarySites)
        }
        allLevelData.push(diseases)
    }
    allLevelData.push(projects)

    return allLevelData
}

const DiseasesAndSitesChart = () => {
    const {data, error} = useSWR(getDiseaseAndSitesDataURL, fetcher)
    const [allLevelData, setAllLevelData] = useState(null)

    const chartRef = useRef(null)

    useEffect(() => {
        if (data) {
            setAllLevelData(processDiseasesAndSitesData(data))
        }
    }, [data]);

    console.log(allLevelData)

    useEffect(() => {
        if (allLevelData) {
            const chartInstance = echarts.init(chartRef.current)

            let option

            const allOptions = {};
            allLevelData.forEach((data, index) => {
                // since dataItems of each data have same groupId in this
                // example, we can use groupId as optionId for optionStack.
                const optionId = data[0][2];
                let projectTitle
                const dataCategory = data[0][4]

                const dataMax = Math.max(...data.map(item => item[1]))
                const placeholderData = data.map(item => {
                    const newItem = [...item]
                    newItem[1] = dataMax - newItem[1]

                    return newItem
                })

                if (dataCategory === 'Project') {
                    projectTitle = 'Number of CNV Files for All Projects'
                } else if (dataCategory === 'Disease') {
                    projectTitle = `Number of CNV Files for All Diseases in the ${data[0][5]} Project`
                } else if (dataCategory === 'PrimarySite') {
                    projectTitle = `Number of CNV Files for All Primary Sites of ${data[0][5]} Disease`
                } else if (dataCategory === 'PrimarySiteDetail') {
                    projectTitle = `Number of CNV Files for Each Type in ${data[0][5]} Primary Site`
                }

                allOptions[optionId] = {
                    id: optionId,
                    title: {
                        text: projectTitle,
                        textStyle: {
                            fontWeight: 'bold',
                            fontSize: '28',
                            width: '1200',
                            overflow: 'truncate',
                            ellipsis: '...'
                        },
                        left: 'center',
                        top: '3%',
                    },
                    grid: {
                        top: '15%',
                        bottom: '18%'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        },
                        formatter: function (params) {
                            let data = params[0].data;
                            return data === undefined ? '' : data[0] + ' : ' + data[1]
                        }
                    },
                    xAxis: {
                        type: 'category',
                        axisLabel: {
                            interval: 0,
                            rotate: data.length > 5 ? 45 : 0,
                            formatter: function (value) {
                                const maxWidth = 16;
                                return value.length > maxWidth ? value.substring(0, maxWidth) + '...' : value;
                            }
                        },
                        axisTick: {
                            alignWithLabel: true
                        }
                    },
                    yAxis: {
                        minInterval: 1,
                        max: 'dataMax'
                    },
                    animationDurationUpdate: 500,
                    series: [
                        {
                            type: 'bar',
                            stack: 'Total',
                            dimensions: ['x', 'y', 'groupId', 'childGroupId'],
                            encode: {
                                x: 'x',
                                y: 'y',
                                itemGroupId: 'groupId',
                                itemChildGroupId: 'childGroupId'
                            },
                            data: data,
                            universalTransition: {
                                enabled: true,
                                divideShape: 'clone'
                            },
                            barMaxWidth: 80
                        },
                        {
                            name: 'placeholder',
                            type: 'bar',
                            stack: 'Total',
                            dimensions: ['x', 'y', 'groupId', 'childGroupId'],
                            encode: {
                                x: 'x',
                                y: 'y',
                                itemGroupId: 'groupId',
                                itemChildGroupId: 'childGroupId'
                            },
                            data: placeholderData,
                            itemStyle: {
                                borderColor: 'transparent',
                                color: 'transparent'
                            },
                            emphasis: {
                                itemStyle: {
                                    borderColor: 'transparent',
                                    color: 'transparent'
                                }
                            },
                            universalTransition: {
                                enabled: true,
                                divideShape: 'clone'
                            }
                        }
                    ],
                    graphic: [
                        {
                            type: 'text',
                            left: 50,
                            top: 20,
                            style: {
                                text: 'Back',
                                fontSize: 18,
                                fill: 'grey'
                            },
                            onclick: function () {
                                goBack();
                            }
                        }
                    ]
                };
            });
            // A stack to remember previous option id
            const optionStack = [];
            const goForward = (optionId) => {
                optionStack.push(chartInstance.getOption().id); // push current option id into stack.
                chartInstance.setOption(allOptions[optionId]);
            };
            const goBack = () => {
                if (optionStack.length === 0) {
                    console.log('Already in root level!');
                } else {
                    console.log('Go back to previous level.');
                    chartInstance.setOption(allOptions[optionStack.pop()]);
                }
            };
            option = allOptions['-1']; // The initial option is the root data option
            chartInstance.on('click', 'series', (params) => {
                const dataItem = params.data;

                if (dataItem[3]) {
                    // If current params is not belong to the "childest" data, it has data[3]
                    // since we use groupId as optionId in this example,
                    // we use childGroupId as the next level optionId.
                    const nextOptionId = dataItem[3];
                    goForward(nextOptionId);
                }
            });
            option && chartInstance.setOption(option);
        }
    })

    return (
        <>
            <Head>
                <title>Diseases And Sites Viz</title>
            </Head>
            <Container maxWidth={'xl'}>
                <div ref={chartRef} style={{width: '100%', height: '600px'}}/>
            </Container>
        </>
    )
}

export default DiseasesAndSitesChart
