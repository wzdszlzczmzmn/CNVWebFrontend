import Stack from "@mui/material/Stack"
import HeatMapLeftPanel from './HeatMapLeftPanel'
import HeatMapMainPanel from './HeatMapMainPanel'
import { List } from "@mui/material"
import { MemoCNVHeatMapContainer } from '../Container/CNVHeatMapContainer'
import React, { Fragment, useMemo, useRef, useState } from "react"
import Divider from "@mui/material/Divider"
import {
    PieChart,
    Settings
} from "@mui/icons-material"
import useSWR from "swr"
import { getProjectMetaInfoURL, fetcher } from '/data/get'
import { ListCollapsePanel } from '/components/Layout/ListCollapsePanel'
import { DataSelector, SettingInput } from '/components/InputComponents/SettingInputComponents'
import ErrorView from "../../../StateViews/ErrorView"
import LoadingView from "../../../StateViews/LoadingView"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Chip from "@mui/material/Chip"
import { geneChipColors } from "colorSettings/geneChipColors"
import { styled } from "@mui/material/styles"
import { StyledTooltipFontSize12 } from 'components/styledAntdComponent/StyledTooltip'
import { Modal, Button, Table, Input, Dropdown, Flex, Switch, Row, Col } from 'antd'
import Draggable from "react-draggable"
import _ from "lodash"
import { produce } from "immer"
import GeneIcon from '/components/icons/Gene'
import { MenuOutlined } from '@ant-design/icons'


const HeatMapPanel = ({ projectId, cnvType }) => {
    const {
        data: metaInfo,
        error: metaError,
        isLoading: isLoadingMeta
    } = useSWR(`${getProjectMetaInfoURL}?projectId=${projectId}&cnvType=${cnvType}`, fetcher)

    if (metaError) {
        return <ErrorView/>
    }

    if (isLoadingMeta) {
        return <LoadingView/>
    }

    return (
        cnvType === 'Gene Level Copy Number' ?
            <GeneLevelHeatMapPanelContent projectId={projectId} cnvType={cnvType} metaInfo={metaInfo}/>
            :
            <HeatMapPanelContent projectId={projectId} cnvType={cnvType} metaInfo={metaInfo}/>
    )
}

const HeatMapPanelContent = ({ projectId, cnvType, metaInfo }) => {
    const [sideBarOpen, setSideBarOpen] = useState(true)

    const handleSideBarChange = () => {
        setSideBarOpen(!sideBarOpen)
    }

    const {
        dataSetting,
        handleDiseaseTypeChange,
        handlePrimarySiteChange,
        handleWorkflowTypeChange,
        handleValueTypeChange,
        handleClusterChange,
    } = useDataSetting(metaInfo)

    const [wholeChartSetting, handleWholeChartSettingChange] = useChartDynamicSetting({
        paddingTop: 40,
    })

    const [treeChartSetting, handleTreeChartSettingChange] = useChartDynamicSetting({
        width: 300,
        marginToHeatMap: 20,
    })

    const [heatMapChartSetting, handleHeatMapChartSettingChange] = useChartDynamicSetting(
        {
            blockWidth: 2,
            defaultHeight: 6,
            blockHeight: 6,
            blockGap: 0.1,
            chromosomeLegendHeight: 25,
        },
        (prev, name, value) =>
            name === "defaultHeight"
                ? { ...prev, blockHeight: value, [name]: value }
                : { ...prev, [name]: value }
    )

    const [metaChartSetting, handleMetaChartSettingChange] = useChartDynamicSetting({
        width: 16,
    })

    const [hclusterClassifiedChartSetting, handleHclusterChartSettingChange] = useChartDynamicSetting({
        paddingToHeatMap: 40,
        hclusterInfoWidth: 20,
        hclusterInfoHeight: 20,
    })

    const [nodeHistorySetting, handleNodeHistoryChartSettingChange] = useChartDynamicSetting({
        width: 35,
        height: 20,
    })

    const isShowValueTypeSelector = useMemo(() => {
        return (
            cnvType === 'Allele-specific Copy Number Segment' ||
            (cnvType === 'Copy Number Segment' && dataSetting.workflowType === 'AscatNGS')
        )
    }, [cnvType, dataSetting.workflowType])

    const cnvBaseline = useMemo(
        () =>
            calculateCNVBaseline(
                cnvType,
                dataSetting.workflowType,
                dataSetting.valueType
            ),
        [cnvType, dataSetting.valueType, dataSetting.workflowType]
    )

    return (
        <Stack direction='row' sx={{ height: '100%' }}>
            {
                sideBarOpen ?
                    <HeatMapLeftPanel sx={{ px: 1 }}>
                        <List component='div'>
                            <DataSettingPanel
                                metaInfo={metaInfo}
                                dataSetting={dataSetting}
                                handleDiseaseTypeChange={handleDiseaseTypeChange}
                                handlePrimarySiteChange={handlePrimarySiteChange}
                                handleWorkflowTypeChange={handleWorkflowTypeChange}
                                handleValueTypeChange={handleValueTypeChange}
                                handleClusterChange={handleClusterChange}
                                isShowValueTypeSelector={isShowValueTypeSelector}
                            />
                            <WholeChartSettingPanel
                                wholeChartSetting={wholeChartSetting}
                                onSettingChange={handleWholeChartSettingChange}
                            />
                            <TreeChartSettingPanel
                                treeChartSetting={treeChartSetting}
                                onSettingChange={handleTreeChartSettingChange}
                            />
                            <HeatMapSettingPanel
                                heatMapSetting={heatMapChartSetting}
                                onSettingChange={handleHeatMapChartSettingChange}
                            />
                            <MetaChartSettingPanel
                                metaChartSetting={metaChartSetting}
                                onSettingChange={handleMetaChartSettingChange}
                            />
                            <HclusterSettingPanel
                                hclusterClassifiedChartSetting={hclusterClassifiedChartSetting}
                                onSettingChange={handleHclusterChartSettingChange}
                            />
                            <NodeHistorySettingPanel
                                nodeHistorySetting={nodeHistorySetting}
                                onSettingChange={handleNodeHistoryChartSettingChange}
                            />
                        </List>
                    </HeatMapLeftPanel>
                    :
                    <></>
            }
            <HeatMapMainPanel sideBarOpen={sideBarOpen} handleSideBarChange={handleSideBarChange}>
                <MemoCNVHeatMapContainer
                    projectId={projectId}
                    CNVBaseline={cnvBaseline}
                    vizSetting={{
                        wholeChartSetting: wholeChartSetting,
                        treeChartSetting: treeChartSetting,
                        heatMapChartSetting: heatMapChartSetting,
                        metaChartSetting: metaChartSetting,
                        hclusterClassifiedChartSetting: hclusterClassifiedChartSetting,
                        nodeHistorySetting: nodeHistorySetting
                    }}
                    dataSetting={dataSetting}
                    cnvType={cnvType}
                />
            </HeatMapMainPanel>
        </Stack>
    )
}

const GeneLevelHeatMapPanelContent = ({ projectId, cnvType, metaInfo }) => {
    const [sideBarOpen, setSideBarOpen] = useState(true)

    const handleSideBarChange = () => {
        setSideBarOpen(!sideBarOpen)
    }

    const [isModalOpen, setIsModalOpen] = useState(false)

    const showModal = () => {
        setIsModalOpen(true)
    }

    const handleModalCancel = () => {
        setIsModalOpen(false)
    }

    const [selectedGenes, setSelectedGenes] = useState(
        [
            {
                gene_id: 'ENSG00000223972.5',
                gene_name: 'DDX11L1',
                chromosome: 'chr1',
                start: 11869,
                end: 14409,
            },
            {
                gene_id: 'ENSG00000227232.5',
                gene_name: 'WASH7P',
                chromosome: 'chr1',
                start: 14404,
                end: 29570,
            },
            {
                gene_id: 'ENSG00000278267.1',
                gene_name: 'MIR6859-1',
                chromosome: 'chr1',
                start: 17369,
                end: 17436,
            },
            {
                gene_id: 'ENSG00000243485.5',
                gene_name: 'MIR1302-2HG',
                chromosome: 'chr1',
                start: 29554,
                end: 31109,
            },
            {
                gene_id: 'ENSG00000284332.1',
                gene_name: 'MIR1302-2',
                chromosome: 'chr1',
                start: 30366,
                end: 30503,
            },
            {
                gene_id: 'ENSG00000237613.2',
                gene_name: 'FAM138A',
                chromosome: 'chr1',
                start: 34554,
                end: 36081,
            },
            {
                gene_id: 'ENSG00000268020.3',
                gene_name: 'OR4G4P',
                chromosome: 'chr1',
                start: 52473,
                end: 53312,
            },
            {
                gene_id: 'ENSG00000240361.2',
                gene_name: 'OR4G11P',
                chromosome: 'chr1',
                start: 57598,
                end: 64116,
            },
            {
                gene_id: 'ENSG00000186092.6',
                gene_name: 'OR4F5',
                chromosome: 'chr1',
                start: 65419,
                end: 71585,
            },
            {
                gene_id: 'ENSG00000238009.6',
                gene_name: 'AL627309.1',
                chromosome: 'chr1',
                start: 89295,
                end: 133723,
            },
        ]
    )

    const sortedGenes = useMemo(
        () => ([...selectedGenes].sort((a, b) => a.gene_name.length - b.gene_name.length)),
        [selectedGenes]
    )

    return (
        <>
            <Stack direction='row' sx={{ height: '85vh' }}>
                {
                    sideBarOpen ?
                        <HeatMapLeftPanel sx={{ px: 1 }}>
                            <List>
                                <ListCollapsePanel
                                    defaultOpenState={true}
                                    icon={<PieChart/>}
                                    title={'Data Setting'}
                                    showDivider={true}
                                >
                                    <Stack spacing={2}>
                                        <Box>
                                            <Typography sx={{ fontWeight: '500', mb: 1, px: 1, mt: 2 }}>Selected
                                                Genes:</Typography>
                                            <Stack direction='row' sx={{ flexWrap: 'wrap', width: '100%' }}>
                                                {
                                                    selectedGenes.length === 0 ?
                                                        <StyledTooltipFontSize12
                                                            title="No Selected Genes"
                                                            placement='top'
                                                        >
                                                            <StyledGeneChip
                                                                label="No Selected Genes"
                                                                customColor="#A80C05"
                                                                variant="outlined"
                                                                size="small"
                                                            />
                                                        </StyledTooltipFontSize12>
                                                        :
                                                        sortedGenes.slice(0, 9).map((gene, index) => (
                                                            <StyledTooltipFontSize12
                                                                key={gene.gene_id}
                                                                title={
                                                                    <Box>
                                                                        <div>ID: <i>{gene.gene_id}</i></div>
                                                                        <div>Name: <i>{gene.gene_name}</i></div>
                                                                        <div>Chromosome: <i>{gene.chromosome}</i>
                                                                        </div>
                                                                        <div>Start: <i>{gene.start}</i></div>
                                                                        <div>End: <i>{gene.end}</i></div>
                                                                    </Box>
                                                                }
                                                                placement="top"
                                                            >
                                                                <StyledGeneChip
                                                                    label={gene.gene_name}
                                                                    customColor={geneChipColors[index]}
                                                                    variant="outlined"
                                                                    size="small"
                                                                />
                                                            </StyledTooltipFontSize12>
                                                        ))}
                                                {
                                                    selectedGenes.length > 9 ?
                                                        <StyledTooltipFontSize12
                                                            title="Click to see all selected genes."
                                                            placement="top">
                                                            <StyledGeneChip
                                                                label={`+${selectedGenes.length - 9} Genes`}
                                                                customColor="#000000"
                                                                variant="outlined"
                                                                size="small"
                                                                onClick={showModal}
                                                            />
                                                        </StyledTooltipFontSize12>
                                                        :
                                                        <></>
                                                }
                                            </Stack>
                                        </Box>
                                    </Stack>
                                </ListCollapsePanel>
                            </List>
                        </HeatMapLeftPanel>
                        :
                        <></>
                }
                <HeatMapMainPanel sideBarOpen={sideBarOpen} handleSideBarChange={handleSideBarChange}>
                </HeatMapMainPanel>
            </Stack>
            <SelectGenesModal
                isModalOpen={isModalOpen}
                handleModalCancel={handleModalCancel}
                selectedGenes={selectedGenes}
                setSelectedGenes={setSelectedGenes}
            />
        </>
    )
}

const SelectGenesModal = ({ isModalOpen, handleModalCancel, selectedGenes, setSelectedGenes }) => {
    const [clonedSelectedGenes, setClonedSelectedGenes] = useState(
        _.cloneDeep(selectedGenes).map(
            gene => ({
                ...gene,
                isDelete: false
            }))
    )

    const [disabled, setDisabled] = useState(true);
    const [bounds, setBounds] = useState({
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
    });

    const draggleRef = useRef(null);

    const onStart = (_event, uiData) => {
        const { clientWidth, clientHeight } = window.document.documentElement;
        const targetRect = draggleRef.current?.getBoundingClientRect();
        if (!targetRect) {
            return;
        }
        setBounds({
            left: -targetRect.left + uiData.x,
            right: clientWidth - (targetRect.right - uiData.x),
            top: -targetRect.top + uiData.y,
            bottom: clientHeight - (targetRect.bottom - uiData.y),
        });
    };

    const confirmGenesDelete = () => {
        setSelectedGenes(clonedSelectedGenes.filter(gene => !gene.isDelete).map(({ isDelete, ...gene }) => gene))
        handleModalCancel()
    }

    return (
        <Modal
            title={
                <div
                    style={{
                        width: '100%',
                        cursor: 'move',
                    }}
                    onMouseOver={() => {
                        if (disabled) {
                            setDisabled(false);
                        }
                    }}
                    onMouseOut={() => {
                        setDisabled(true);
                    }}
                    // fix eslintjsx-a11y/mouse-events-have-key-events
                    // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/master/docs/rules/mouse-events-have-key-events.md
                    onFocus={() => {
                    }}
                    onBlur={() => {
                    }}
                    // end
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <GeneIcon style={{ fontSize: '36px', marginRight: '6px' }}/>
                        <Typography sx={{ fontWeight: '500', fontSize: '28px', pointerEvents: 'none' }}>
                            Selected Genes
                        </Typography>
                        <Typography
                            sx={{
                                fontWeight: 'normal',
                                fontSize: '14px',
                                color: '#888',
                                position: 'relative',
                                top: '4px',
                                pointerEvents: 'none'
                            }}
                        >
                            (Maximum of 100 genes)
                        </Typography>
                    </Box>
                </div>
            }
            modalRender={(modal) => (
                <Draggable
                    disabled={disabled}
                    bounds={bounds}
                    nodeRef={draggleRef}
                    onStart={(event, uiData) => onStart(event, uiData)}
                >
                    <div ref={draggleRef}>{modal}</div>
                </Draggable>
            )}
            open={isModalOpen}
            onCancel={handleModalCancel}
            footer={[
                <Button key="modal-cnacel-button" type="default" onClick={() => handleModalCancel()}>Cancel</Button>,
                <Button
                    key="modal-confirm-button"
                    type="primary"
                    onClick={() => confirmGenesDelete()}
                >
                    Confirm
                </Button>
            ]}
            width={850}
            centered
        >
            <SelectedGenesSearchBar
                clonedSelectedGenes={clonedSelectedGenes}
                setClonedSelectedGenes={setClonedSelectedGenes}
            />
            <SelectedGenesTable selectedGenes={clonedSelectedGenes} setSelectedGenes={setClonedSelectedGenes}/>
        </Modal>
    )
}

const SelectedGenesSearchBar = ({ clonedSelectedGenes, setClonedSelectedGenes }) => {
    const onSearch = () => {
        console.log(1)
    }

    const [fields, setFields] = useState([
        {
            text: 'Gene ID',
            value: 'gene_id',
            checked: true,
        },
        {
            text: 'Gene Name',
            value: 'gene_name',
            checked: true,
        },
        {
            text: 'Chromosome',
            value: 'chromosome',
            checked: true,
        },
        {
            text: 'Start',
            value: 'start',
            checked: true,
        },
        {
            text: 'End',
            value: 'end',
            checked: true,
        }
    ])

    const handleSwitchChange = (value) => {
        setFields(
            produce(draft => {
                const field = draft.find(field => field.value === value)
                field.checked = !field.checked
            })
        )
    }

    return (
        <Stack direction="row" spacing={1}>
            <Input.Search
                placeholder="input search text"
                allowClear
                onSearch={onSearch}
                style={{
                    width: 200,
                    marginLeft: 'auto',
                }}
            />
            <Dropdown placement="bottom" dropdownRender={() => <SearchFieldSwitchList fields={fields}
                                                                                      handleSwitchChange={handleSwitchChange}/>}>
                <Button icon={<MenuOutlined/>} style={{ color: '#276D8C', borderColor: '#276D8C' }}/>
            </Dropdown>
        </Stack>
    )
}

const SelectedGenesTable = ({ selectedGenes, setSelectedGenes }) => {
    const handleSelectedGeneIsDeleteChange = (id) => {
        setSelectedGenes(
            produce((draft) => {
                const gene = draft.find(gene => gene.gene_id === id)
                gene.isDelete = !gene.isDelete
            })
        )
    }

    const columns = [
        {
            title: 'Gene ID',
            dataIndex: 'gene_id',
            key: 'gene_id',
            align: 'center',
            sorter: (a, b) => a.gene_id.localeCompare(b.gene_id),
        },
        {
            title: 'Gene Name',
            dataIndex: 'gene_name',
            key: 'gene_name',
            align: 'center',
            sorter: (a, b) => a.gene_name.localeCompare(b.gene_name),
        },
        {
            title: 'Chromosome',
            dataIndex: 'chromosome',
            key: 'chromosome',
            align: 'center',
            sorter: (a, b) => a.chromosome.localeCompare(b.chromosome),
            filters: getFilters(selectedGenes, (item) => item.chromosome),
        },
        {
            title: 'Start',
            dataIndex: 'start',
            key: 'start',
            align: 'center',
            sorter: (a, b) => a.start - b.start,
        },
        {
            title: 'End',
            dataIndex: 'end',
            key: 'end',
            align: 'center',
            sorter: (a, b) => a.end - b.end,
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                record.isDelete ?
                    <Button
                        color="primary"
                        variant="dashed"
                        onClick={() => handleSelectedGeneIsDeleteChange(record.gene_id)}
                    >
                        Add
                    </Button>
                    :
                    <Button
                        danger
                        type="dashed"
                        onClick={() => handleSelectedGeneIsDeleteChange(record.gene_id)}
                    >
                        Remove
                    </Button>
            )
        }
    ]

    return (
        <StyledTable
            columns={columns}
            dataSource={selectedGenes}
            pagination={{
                defaultPageSize: 5,
                showQuickJumper: true,
                showSizeChanger: false,
            }}
            rowKey="gene_id"
        />
    )
}

const StyledTable = styled(Table)({
    '& .ant-table': {
        '& .ant-table-container': {
            '& .ant-table-body, & .ant-table-content': {
                scrollbarWidth: 'thin',
                scrollbarColor: '#eaeaea transparent',
                scrollbarGutter: 'stable',
                '& .ant-empty': {
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 600,
                }
            },
            '& .ant-table-header > table': {
                width: 'max-content',
                minWidth: '100%',
                '& .ant-table-cell-fix-right-first': {
                    minWidth: '125px'
                }
            }
        },
    },
    '& .ant-spin-nested-loading': {
        '& .ant-spin': {
            maxHeight: 1000,
        }
    }
});

const DataSettingPanel = ({
    metaInfo,
    dataSetting,
    handleDiseaseTypeChange,
    handlePrimarySiteChange,
    handleWorkflowTypeChange,
    handleValueTypeChange,
    handleClusterChange,
    isShowValueTypeSelector,
}) => {
    const dataSettingFields = [
        {
            key: "diseaseType",
            value: dataSetting.diseaseType,
            setValue: handleDiseaseTypeChange,
            title: "Disease Type:",
            valueList: Object.keys(metaInfo),
        },
        {
            key: "primarySite",
            value: dataSetting.primarySite,
            setValue: handlePrimarySiteChange,
            title: "Primary Site:",
            valueList: Object.keys(metaInfo[dataSetting.diseaseType]),
        },
        {
            key: "workflowType",
            value: dataSetting.workflowType,
            setValue: handleWorkflowTypeChange,
            title: "Workflow Type:",
            valueList:
                metaInfo[dataSetting.diseaseType][dataSetting.primarySite],
        },
        ...(isShowValueTypeSelector
            ? [
                {
                    key: "valueType",
                    value: dataSetting.valueType,
                    setValue: handleValueTypeChange,
                    title: "Value Type:",
                    valueList: ["Total", "Major", "Minor"],
                },
            ]
            : []),
        {
            key: "cluster",
            value: dataSetting.cluster,
            setValue: handleClusterChange,
            title: "Cluster:",
            valueList: Array.from({ length: 9 }, (_, i) => i + 2),
        },
    ]

    return (
        <ListCollapsePanel
            defaultOpenState={true}
            icon={<PieChart/>}
            title={'Data Setting'}
            showDivider={true}
        >
            <Stack spacing={2} sx={{ mt: 2, mb: 2, px: 2 }}>
                {dataSettingFields.map((field, index) => (
                    <Fragment key={field.key}>
                        <DataSelector
                            value={field.value}
                            setValue={field.setValue}
                            title={field.title}
                            valueList={field.valueList}
                        />
                        {index < dataSettingFields.length - 1 && <Divider/>}
                    </Fragment>
                ))}
            </Stack>
        </ListCollapsePanel>
    )
}

const WholeChartSettingPanel = ({
    wholeChartSetting,
    onSettingChange
}) => {
    const settings = [
        {
            id: "wholeChartPaddingTop",
            name: "paddingTop",
            value: wholeChartSetting.paddingTop,
            type: "number",
            title: "Padding Top:",
        },
    ]

    return (
        <ChartSettingPanel
            icon={<Settings/>}
            title={'Whole Chart Setting'}
            settings={settings}
            onSettingChange={onSettingChange}
        />
    )
}

const TreeChartSettingPanel = ({
    treeChartSetting,
    onSettingChange,
}) => {
    const settings = [
        {
            id: "treeChartWidth",
            name: "width",
            value: treeChartSetting.width,
            type: "number",
            title: "Width:",
        },
        {
            id: "treeChartMarginToHeatMap",
            name: "marginToHeatMap",
            value: treeChartSetting.marginToHeatMap,
            type: "number",
            title: "Margin To HeatMap:",
        },
    ]

    return (
        <ChartSettingPanel
            icon={<Settings/>}
            title={'Tree Chart Setting'}
            settings={settings}
            onSettingChange={onSettingChange}
        />
    )
}

const HeatMapSettingPanel = ({
    heatMapSetting,
    onSettingChange,
}) => {
    const settings = [
        {
            id: "heatMapBlockWidth",
            name: "blockWidth",
            value: heatMapSetting.blockWidth,
            type: "number",
            title: "Block Width:",
        },
        {
            id: "heatMapDefaultHeight",
            name: "defaultHeight",
            value: heatMapSetting.defaultHeight,
            type: "number",
            title: "Block Height:",
        },
        {
            id: "heatMapBlockGap",
            name: "blockGap",
            value: heatMapSetting.blockGap,
            type: "number",
            title: "Block Gap:",
        },
        {
            id: "heatMapChromosomeLegendHeight",
            name: "chromosomeLegendHeight",
            value: heatMapSetting.chromosomeLegendHeight,
            type: "number",
            title: "Chromosome Legend Height:",
        },
    ]

    return (
        <ChartSettingPanel
            icon={<Settings/>}
            title={'HeatMap Setting'}
            settings={settings}
            onSettingChange={onSettingChange}
        />
    )
}

const MetaChartSettingPanel = ({
    metaChartSetting,
    onSettingChange,
}) => {
    const settings = [
        {
            id: "metaChartWidth",
            name: "width",
            value: metaChartSetting.width,
            type: "number",
            title: "Width:",
        },
    ]

    return (
        <ChartSettingPanel
            icon={<Settings/>}
            title={'Meta Chart Setting'}
            settings={settings}
            onSettingChange={onSettingChange}
        />
    )
}

const HclusterSettingPanel = ({
    hclusterClassifiedChartSetting,
    onSettingChange,
}) => {
    const settings = [
        {
            id: "hclusterChartPaddingToHeatMap",
            name: "paddingToHeatMap",
            value: hclusterClassifiedChartSetting.paddingToHeatMap,
            type: "number",
            title: "Margin To HeatMap:",
        },
        {
            id: "hclusterChartHclusterInfoWidth",
            name: "hclusterInfoWidth",
            value: hclusterClassifiedChartSetting.hclusterInfoWidth,
            type: "number",
            title: "Hcluster Info Width:",
        },
        {
            id: "hclusterChartHclusterInfoHeight",
            name: "hclusterInfoHeight",
            value: hclusterClassifiedChartSetting.hclusterInfoHeight,
            type: "number",
            title: "Hcluster Info Height:",
        },
    ]

    return (
        <ChartSettingPanel
            icon={<Settings/>}
            title={'Hcluster Setting'}
            settings={settings}
            onSettingChange={onSettingChange}
        />
    )
}

const NodeHistorySettingPanel = ({
    nodeHistorySetting,
    onSettingChange,
}) => {
    const settings = [
        {
            id: "nodeHistorySettingWidth",
            name: "width",
            value: nodeHistorySetting.width,
            type: "number",
            title: "Width:",
        },
        {
            id: "nodeHistorySettingHeight",
            name: "height",
            value: nodeHistorySetting.height,
            type: "number",
            title: "Height:",
        },
    ]

    return (
        <ChartSettingPanel
            icon={<Settings/>}
            title={'Node History Setting'}
            settings={settings}
            onSettingChange={onSettingChange}
        />
    )
}

const ChartSettingPanel = ({
    defaultOpenState = false,
    icon,
    title,
    showDivider = true,
    settings,
    onSettingChange,
}) => (
    <ListCollapsePanel
        defaultOpenState={defaultOpenState}
        icon={icon}
        title={title}
        showDivider={showDivider}
    >
        <Stack spacing={2} sx={{ mt: 2, mb: 2, px: 2 }}>
            {settings.map((setting, index) => (
                <Fragment key={setting.id}>
                    <SettingInput
                        value={setting.value}
                        handleValueChange={onSettingChange}
                        valueName={setting.name}
                        id={setting.id}
                        type={setting.type}
                        title={setting.title}
                    />
                    {index < settings.length - 1 && <Divider/>}
                </Fragment>
            ))}
        </Stack>
    </ListCollapsePanel>
)

const StyledGeneChip = styled(Chip, {
    shouldForwardProp: (prop) => prop !== 'customColor',
})(({ customColor }) => ({
    color: customColor,
    borderColor: customColor,
    margin: 4,
}))

const SearchFieldSwitchList = ({ fields, handleSwitchChange }) => {

    return (
        <Flex
            vertical
            gap={1}
            style={{
                background: '#FFFFFF',
                borderRadius: '8px',
                boxShadow: 'rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px',
                padding: '4px'
            }}
        >
            {
                fields.map(
                    field => (
                        <Flex
                            key={field.value}
                            justify="space-between"
                            align="center"
                            gap={24}
                            style={{
                                padding: '2px 6px'
                            }}
                        >
                            <Typography sx={{ fontSize: '14px' }}>{field.text}</Typography>
                            <Switch
                                size="small"
                                checked={field.checked}
                                onChange={() => handleSwitchChange(field.value)}
                            />
                        </Flex>
                    )
                )
            }
        </Flex>
    )
}

const initializeDataSettingState = (metaInfo) => {
    const defaultDiseaseType = Object.keys(metaInfo)[0]
    const defaultPrimarySite = Object.keys(metaInfo[defaultDiseaseType])[0]
    const defaultWorkflowType = metaInfo[defaultDiseaseType][defaultPrimarySite][0]

    return {
        diseaseType: defaultDiseaseType,
        primarySite: defaultPrimarySite,
        workflowType: defaultWorkflowType,
        valueType: "Total",
        cluster: 5,
    }
}

const useDataSetting = (metaInfo) => {
    const defaultDataSetting = useMemo(() => initializeDataSettingState(metaInfo), [metaInfo])
    const [dataSetting, setDataSetting] = useState(defaultDataSetting)

    const handleDiseaseTypeChange = (newDiseaseType) => {
        const newPrimarySite = Object.keys(metaInfo[newDiseaseType])[0]
        const newWorkflowType = metaInfo[newDiseaseType][newPrimarySite][0]
        setDataSetting({
            diseaseType: newDiseaseType,
            primarySite: newPrimarySite,
            workflowType: newWorkflowType,
            valueType: "Total",
            cluster: 5,
        })
    }

    const handlePrimarySiteChange = (newPrimarySite) => {
        const newWorkflowType = metaInfo[dataSetting.diseaseType][newPrimarySite][0]
        setDataSetting((prev) => ({
            ...prev,
            primarySite: newPrimarySite,
            workflowType: newWorkflowType,
        }))
    }

    const handleWorkflowTypeChange = (newWorkflowType) => {
        setDataSetting((prev) => ({
            ...prev,
            workflowType: newWorkflowType,
        }))
    }

    const handleValueTypeChange = (newValueType) => {
        setDataSetting((prev) => ({
            ...prev,
            valueType: newValueType,
        }))
    }

    const handleClusterChange = (newCluster) => {
        setDataSetting((prev) => ({
            ...prev,
            cluster: newCluster,
        }))
    }

    return {
        dataSetting,
        handleDiseaseTypeChange,
        handlePrimarySiteChange,
        handleWorkflowTypeChange,
        handleValueTypeChange,
        handleClusterChange,
    }
}

const useChartDynamicSetting = (initialState, customHandler) => {
    const [chartSetting, setChartSetting] = useState(initialState)

    const handleChartSettingChange = (event) => {
        const { name, value } = event.target
        const numericValue = parseFloat(value)

        setChartSetting((prev) => {
            if (customHandler) {
                return customHandler(prev, name, numericValue)
            }
            return { ...prev, [name]: numericValue }
        })
    }

    return [chartSetting, handleChartSettingChange]
}

const getFilters = (data, mapFn) => {
    const uniqueItems = [...new Set(data.map(mapFn))]

    return uniqueItems.map(uniqueItem => ({
        text: uniqueItems,
        value: uniqueItems,
    }))
}

const calculateCNVBaseline = (cnvType, workflowType, valueType) => {
    let cnvBaseline
    if (cnvType === 'Allele-specific Copy Number Segment') {
        if (valueType === 'Total') {
            cnvBaseline = 2
        } else {
            cnvBaseline = 1
        }
    } else if (cnvType === 'Copy Number Segment') {
        if (workflowType === 'AscatNGS') {
            if (valueType === 'Total') {
                cnvBaseline = 2
            } else {
                cnvBaseline = 1
            }
        } else {
            cnvBaseline = 0
        }
    } else if (cnvType === 'Masked Copy Number Segment') {
        cnvBaseline = 0
    }

    return cnvBaseline
}

export default HeatMapPanel
