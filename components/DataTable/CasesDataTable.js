import { getCasesFilterInfoURL, fetcher } from 'data/get';
import { postCasesURL } from 'data/post';
import useSWR from "swr";
import ErrorView from 'components/StateViews/ErrorView';
import LoadingView from 'components/StateViews/LoadingView';
import { memo, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Table, Button } from 'antd';
import { styled } from "@mui/material/styles";
import { EyeOutlined } from "@ant-design/icons";
import Chip from "@mui/material/Chip";
import { Tooltip } from "@mui/material";
import Box from "@mui/material/Box";

const StyledTable = styled(Table)({
    '& .ant-table': {
        '& .ant-table-container': {
            minHeight: 65 * 11,
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

const DetailButton = () => (
    <Button
        color="primary"
        variant="dashed"
        icon={<EyeOutlined/>}>
        Detail
    </Button>
)

const genderColors = {
    "male": {
        "backgroundColor": "#4A90E2",
        "color": "#FFFFFFD9"
    },
    "female": {
        "backgroundColor": "#E57373",
        "color": "#FFFFFFD9"
    },
}

const raceColors = {
    "white": {
        "backgroundColor": "#E0E0E0",
        "color": "#424242FF"
    },
    "black or african american": {
        "backgroundColor": "#4A4A4A",
        "color": "#FFFFFFD9"
    },
    "asian": {
        "backgroundColor": "#FFB300",
        "color": "#FFFFFFD9"
    },
    "other": {
        "backgroundColor": "#B0C4DE",
        "color": "#FFFFFFD9"
    },
    "american indian or alaska native": {
        "backgroundColor": "#8B4513",
        "color": "#FFFFFFD9"
    },
    "native hawaiian or other pacific islander": {
        "backgroundColor": "#4682B4",
        "color": "#FFFFFFD9"
    }
}

const ethnicityColors = {
    "not hispanic or latino": {
        "backgroundColor": "#A0A0A0",
        "color": "#FFFFFFD9"
    },
    "hispanic or latino": {
        "backgroundColor": "#FF7043",
        "color": "#FFFFFFD9"
    }
}

const vitalStatusColors = {
    "Alive": {
        "backgroundColor": "#28a745",
        "color": "#FFFFFFD9"
    },
    "Dead": {
        "backgroundColor": "#dc3545",
        "color": "#FFFFFFD9"
    },
}

const chipColors =
    [
        '#3BBBA4', '#FEBE98', '#5C6FC3', '#E47443',
        '#F49DA4', '#50906D', '#5EA2BA', '#FAA80F',
        '#F1C543', '#276D8C', '#0E8F9A', '#227975',
        '#5E9213', '#A80C05', '#5F698C', '#E9A999',
        '#DD8292', '#C8AC64', '#818923', '#C64D3D',
        '#B15858', '#E07869', '#A61157', '#87928D',
    ]

const StyledChip = styled(Chip,{
    shouldForwardProp: (prop) => prop !== 'customColor',
})(({ text, colors }) => ({
    backgroundColor: colors?.[text]?.['backgroundColor'] ?? '#0000000A',
    color: colors?.[text]?.['color'] ?? '#00000040'
}))

const TableCellChip = ({ text, colors }) => {
    const displayText = text === undefined ? "missing" : text;

    return (
        <Tooltip
            title={displayText}
            placement="top"
            slotProps={{
                popper: {
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [0, -5],
                            },
                        },
                    ],
                },
            }}
            arrow
        >
            <StyledChip
                text={displayText}
                colors={colors}
                label={displayText}
                size='small'
            />
        </Tooltip>
    )
}

const formatDaysToYearsAndDays = (days) => {
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;

    return years > 0 ? `${years} years ${remainingDays} days` : `${remainingDays} days`;
};

const DaysToDeathTableCell = ({ text }) => {
    return (
        text ?
            formatDaysToYearsAndDays(text)
            :
            <TableCellChip/>
    )
}

const DataTable = ({
    projectId,
    filterInfo
}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });

    const columns = useMemo(() => {
        return [
            {
                title: 'Case ID',
                dataIndex: 'submitter_id',
                sorter: true,
                fixed: 'left',
                align: 'center',
            },
            {
                title: 'Case UUID',
                dataIndex: 'case_id',
                sorter: true,
                align: 'center',
            },
            {
                title: 'Primary Site',
                dataIndex: 'primary_site',
                sorter: true,
                align: 'center',
                filters: filterInfo['primarySite'].map((item) => (
                    {
                        text: item,
                        value: item,
                    }
                ))
            },
            {
                title: 'Disease Type',
                dataIndex: 'disease_type',
                sorter: true,
                align: 'center',
                filters: filterInfo['diseaseType'].map((item) => (
                    {
                        text: item,
                        value: item,
                    }
                ))
            },
            {
                title: 'Gender',
                dataIndex: ['demographics', '0', 'gender'],
                sorter: true,
                minWidth: '125px',
                align: 'center',
                filters: [...filterInfo['gender'].map((item) => (
                    {
                        text: item,
                        value: item,
                    }
                )), { text: 'missing', value: null, }],
                render: (text) => <TableCellChip
                    text={text}
                    colors={genderColors}
                />
            },
            {
                title: 'Race',
                dataIndex: ['demographics', '0', 'race'],
                sorter: true,
                align: 'center',
                minWidth: '125px',
                filters: [...filterInfo['race'].map((item) => (
                    {
                        text: item,
                        value: item,
                    }
                )), { text: 'missing', value: null, }],
                render: (text) => <TableCellChip
                    text={text}
                    colors={raceColors}
                />
            },
            {
                title: 'Ethnicity',
                dataIndex: ['demographics', '0', 'ethnicity'],
                sorter: true,
                minWidth: '125px',
                align: 'center',
                filters: [...filterInfo['ethnicity'].map((item) => (
                    {
                        text: item,
                        value: item,
                    }
                )), { text: 'missing', value: null, }],
                render: (text) => <TableCellChip
                    text={text}
                    colors={ethnicityColors}
                />
            },
            {
                title: 'Vital Status',
                dataIndex: ['demographics', '0', 'vital_status'],
                sorter: true,
                width: '150px',
                align: 'center',
                filters: [...filterInfo['vitalStatus'].map((item) => (
                    {
                        text: item,
                        value: item,
                    }
                )), { text: 'missing', value: null, }],
                render: (text) => <TableCellChip
                    text={text}
                    colors={vitalStatusColors}
                />
            },
            {
                title: 'Days To Death',
                dataIndex: ['demographics', '0', 'days_to_death'],
                sorter: true,
                width: '150px',
                align: 'center',
                render: (text) => <DaysToDeathTableCell text={text}/>
            },
            {
                title: 'Allele Specific Copy Number Segment File Number',
                dataIndex: 'allele_specific_copy_number_segment_file_num',
                sorter: true,
                width: '375px',
                align: 'center',
            },
            {
                title: 'Copy Number Segment File Number',
                dataIndex: 'copy_number_segment_file_num',
                sorter: true,
                width: '300px',
                align: 'center',
            },
            {
                title: 'Gene Level Copy Number File Number',
                dataIndex: 'gene_level_copy_number_file_num',
                sorter: true,
                width: '300px',
                align: 'center',
            },
            {
                title: 'Masked Copy Number Segment File Number',
                dataIndex: 'masked_copy_number_segment_file_num',
                sorter: true,
                width: '350px',
                align: 'center',
            },
            {
                title: 'Total Copy Number Segment File Number',
                dataIndex: 'total_copy_number_segment_file_num',
                sorter: true,
                width: '325px',
                align: 'center',
                render: (text, record) =>
                    record['allele_specific_copy_number_segment_file_num'] + record['copy_number_segment_file_num'] +
                    record['gene_level_copy_number_file_num'] + record['masked_copy_number_segment_file_num'],
            },
            {
                title: 'Action',
                key: 'operation',
                fixed: 'right',
                align: 'center',
                minWidth: '125px',
                render: () => <DetailButton/>
            }
        ];
    }, [filterInfo]);

    const fetchData = () => {
        setLoading(true);
        axios.post(postCasesURL, {
            projectId,
            ...tableParams
        })
        .then((response) => response.data)
        .then(({ count, results }) => {
            setData(results);
            setLoading(false);
            setTableParams({
                ...tableParams,
                pagination: {
                    ...tableParams.pagination,
                    total: count
                }
            });
        });

    };

    useEffect(fetchData, [
        tableParams.pagination?.current,
        tableParams.pagination?.pageSize,
        tableParams?.sortOrder,
        tableParams?.sortField,
        JSON.stringify(tableParams.filters),
    ]);

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
            sortField: Array.isArray(sorter) ? undefined : sorter.field,
        });

        // `dataSource` is useless since `pageSize` changed
        if (pagination.pageSize !== tableParams.pagination?.pageSize) {
            setData([]);
        }
    };

    return (
        <Box sx={{ minHeight: '780px' }}>
            <StyledTable
                columns={columns}
                rowKey={(record) => record['case_id']}
                dataSource={data}
                pagination={tableParams.pagination}
                loading={loading}
                onChange={handleTableChange}
                scroll={{
                    x: 'max-content',
                    y: 65 * 10 + 10
                }}
            />
        </Box>
    )
}

const CasesDataTable = ({ projectId }) => {
    const {
        data: filterInfo,
        error: error,
        isLoading: isLoading
    } = useSWR(`${getCasesFilterInfoURL}?projectId=${projectId}`, fetcher);

    if (error) {
        return <ErrorView/>;
    }

    if (isLoading) {
        return <LoadingView/>;
    }

    return <DataTable projectId={projectId} filterInfo={filterInfo}/>;
};

const MemoCasesDataTable = memo(CasesDataTable);

export default MemoCasesDataTable;
