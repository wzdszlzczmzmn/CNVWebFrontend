import { MainTitle } from "../Shared/Titles"
import Box from "@mui/material/Box"
import { Table, Tag, Typography } from 'antd'
import { styled } from "@mui/material/styles"

const { Text } = Typography

const CaseCNVFileWrapper = ({data}) => (
    <Box>
        <MainTitle>
            CNV Files
        </MainTitle>
        <CNVFileTable data={data}/>
    </Box>
)

const StyledTable = styled(Table)({
    '& .ant-table': {
        '& .ant-table-container': {
            '& .ant-table-body, & .ant-table-content': {
                scrollbarWidth: 'thin',
                scrollbarColor: '#eaeaea transparent',
                scrollbarGutter: 'stable',
            }
        }
    }
})

const CNVFileTable = ({data}) => {
    const { CNVFiles } = data

    return (
        <StyledTable
            columns={columns}
            dataSource={CNVFiles}
            rowKey="file_id"
            pagination={{ pageSize: 5 }}
            scroll={{ x: 'max-content' }}
        />
    )
}

const columns = [
    {
        title: 'File ID',
        dataIndex: 'file_id',
        key: 'file_id',
        align: 'center'
    },
    {
        title: 'File Name',
        dataIndex: 'file_name',
        key: 'file_name',
        align: 'center',
        render: (text) => <Text ellipsis>{text}</Text>,
    },
    {
        title: 'Data Type',
        dataIndex: 'data_type',
        key: 'data_type',
        align: 'center',
        filters: [
            { text: 'Allele-specific Copy Number Segment', value: 'Allele-specific Copy Number Segment' },
            { text: 'Copy Number Segment', value: 'Copy Number Segment' },
            { text: 'Gene Level Copy Number', value: 'Gene Level Copy Number' },
            { text: 'Masked Copy Number Segment', value: 'Masked Copy Number Segment' },
        ],
        onFilter: (value, record) => record.data_type === value,
        render: (value) => <Tag
            style={{
                borderRadius: '20px',
                padding: '2px 8px',
                cursor: 'default',
            }}
            color='gold'
        >
            {value}
        </Tag>
    },
    {
        title: 'Experimental Strategy',
        dataIndex: 'experimental_strategy',
        key: 'experimental_strategy',
        align: 'center',
        filters: [
            { text: 'Genotyping Array', value: 'Genotyping Array' },
            { text: 'WGS', value: 'WGS' },
        ],
        onFilter: (value, record) => record.experimental_strategy === value,
        render: (value) => <Tag
            style={{
                borderRadius: '20px',
                padding: '2px 8px',
                cursor: 'default',
            }}
            color='geekblue'
        >
            {value}
        </Tag>
    },
    {
        title: 'Platform',
        dataIndex: 'platform',
        key: 'platform',
        align: 'center',
        filters: [
            { text: 'Affymetrix SNP 6.0', value: 'Affymetrix SNP 6.0' },
            { text: 'Illumina', value: 'Illumina' },
        ],
        onFilter: (value, record) => record.platform === value,
    },
    {
        title: 'Workflow',
        dataIndex: 'workflow_type',
        key: 'workflow_type',
        align: 'center',
        render: (value) => <Tag
            style={{
                borderRadius: '20px',
                padding: '2px 8px',
                cursor: 'default',
            }}
            color='purple'
        >
            {value}
        </Tag>
    }
]

export default CaseCNVFileWrapper
