import React, { useEffect, useState } from "react"
import { Button, Flex, message, Table } from "antd"
import Chip from "@mui/material/Chip"
import axios from "axios"
import { postGenesURL } from "../../../../../../../data/post"
import { cancerGeneCensus } from "../../../../../../../const/CancerGeneCensus"
import DeleteGeneButton from "../../Button/DeleteGeneButton"
import SelectGenesSearchBar from "./SelectGenesSearchBar"
import SelectGenesButtonGroup from "./SelectGenesButtonGroup"
import GenesStyledTable from "../GenesStyledTable"

const chromosomeFilters = [
    {
        text: 'chr1',
        value: 'chr1'
    },
    {
        text: 'chr2',
        value: 'chr2'
    },
    {
        text: 'chr3',
        value: 'chr3'
    },
    {
        text: 'chr4',
        value: 'chr4'
    },
    {
        text: 'chr5',
        value: 'chr5'
    },
    {
        text: 'chr6',
        value: 'chr6'
    },
    {
        text: 'chr7',
        value: 'chr7'
    },
    {
        text: 'chr8',
        value: 'chr8'
    },
    {
        text: 'chr9',
        value: 'chr9'
    },
    {
        text: 'chr10',
        value: 'chr10'
    },
    {
        text: 'chr11',
        value: 'chr11'
    },
    {
        text: 'chr12',
        value: 'chr12'
    },
    {
        text: 'chr13',
        value: 'chr13'
    },
    {
        text: 'chr14',
        value: 'chr14'
    },
    {
        text: 'chr15',
        value: 'chr15'
    },
    {
        text: 'chr16',
        value: 'chr16'
    },
    {
        text: 'chr17',
        value: 'chr17'
    },
    {
        text: 'chr18',
        value: 'chr18'
    },
    {
        text: 'chr19',
        value: 'chr19'
    },
    {
        text: 'chr20',
        value: 'chr20'
    },
    {
        text: 'chr21',
        value: 'chr21'
    },
    {
        text: 'chr22',
        value: 'chr22'
    },
    {
        text: 'chrX',
        value: 'chrX'
    },
    {
        text: 'chrY',
        value: 'chrY'
    }
]

const geneTagFilters = [
    {
        text: 'Cancer Census Gene',
        value: 'Cancer Census Gene'
    },
    {
        text: 'Other',
        value: 'Other'
    }
]

const SelectGenesTable = ({ selectedGenes, setSelectedGenes }) => {
    const [data, setData] = useState([])
    const [selectedRowInfo, setSelectedRowInfo] = useState({
        rowKeys: [],
        rows: []
    })
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        showQuickJumper: true,
        pageSizeOptions: [5, 10, 30, 50, 100],
        showSizeChanger: true
    })
    const [filterInfo, setFilterInfo] = useState({})
    const [sorterInfo, setSorterInfo] = useState({})
    const [searchInfo, setSearchInfo] = useState({})

    const [loading, setLoading] = useState(false)
    const [messageApi, contextHolder] = message.useMessage()

    const columns = [
        {
            title: 'Gene ID',
            dataIndex: 'gene_id',
            key: 'gene_id',
            align: 'center',
            sorter: true
        },
        {
            title: 'Gene Name',
            dataIndex: 'gene_name',
            key: 'gene_name',
            align: 'center',
            sorter: true
        },
        {
            title: 'Chromosome',
            dataIndex: 'chromosome',
            key: 'chromosome',
            align: 'center',
            sorter: true,
            filters: chromosomeFilters
        },
        {
            title: 'Start',
            dataIndex: 'start',
            key: 'start',
            align: 'center',
            sorter: true
        },
        {
            title: 'End',
            dataIndex: 'end',
            key: 'end',
            align: 'center',
            sorter: true
        },
        {
            title: 'Gene Tag',
            dataIndex: 'tag',
            key: 'tag',
            align: 'center',
            render: (_, gene) => (
                gene.tag === 'Cancer Census Gene' ?
                    <Chip sx={{ backgroundColor: '#3BBBA4', color: '#FFFFFF' }} label="Cancer Census Gene"/>
                    :
                    <Chip sx={{ backgroundColor: '#E0E0E0', color: '#424242' }} label="Other"/>
            ),
            filters: geneTagFilters
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (_, gene) => (
                selectedGenes.find(selectedGene => selectedGene.gene_id === gene.gene_id) ?
                    <DeleteGeneButton handleDelete={() => handleGeneDelete(gene)}/>
                    :
                    <Button type="dashed" onClick={() => handleGeneAdd(gene)}>Add</Button>
            )
        }
    ]

    const rowSelection = {
        selectedRowKeys: selectedRowInfo.rowKeys,
        columnWidth: '56px',
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRowInfo({
                rowKeys: selectedRowKeys,
                rows: selectedRows
            })
        },
        preserveSelectedRowKeys: true,
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE
        ],
        getCheckboxProps: (record) => ({
            disabled: !!selectedGenes.find(selectedGene => selectedGene.gene_id === record.gene_id)
        }),
    }

    const handleGeneDelete = (geneRemove) => {
        setSelectedGenes(selectedGenes.filter(gene => gene.gene_id !== geneRemove.gene_id))
        setSelectedRowInfo({
            rowKeys: selectedGenes.filter(gene => gene.gene_id !== geneRemove.gene_id).map(gene => gene.gene_id),
            rows: selectedGenes.filter(gene => gene.gene_id !== geneRemove.gene_id)
        })
    }

    const handleGeneAdd = (geneAdded) => {
        setSelectedGenes([...selectedGenes, geneAdded])
        setSelectedRowInfo({
            rowKeys: [...selectedRowInfo.rowKeys, geneAdded.gene_id],
            rows: [...selectedRowInfo.rows, geneAdded]
        })
    }

    const fetchData = () => {
        setLoading(true)
        axios.post(postGenesURL, {
            pagination: pagination,
            filterInfo: filterInfo,
            sorterInfo: sorterInfo,
            searchInfo: searchInfo
        })
        .then((response) => response.data)
        .then(({ count, results }) => {
            results.forEach(
                gene => gene.tag = cancerGeneCensus.includes(gene.gene_name) ? 'Cancer Census Gene' : 'Other'
            )
            setData(results)
            setPagination({
                ...pagination,
                total: count,
                showTotal: (_, range) => `${range[0]}-${range[1]} of ${count} genes`
            })
            setLoading(false)
        })
    }

    useEffect(fetchData, [
        pagination?.current,
        pagination?.pageSize,
        sorterInfo,
        filterInfo,
        searchInfo
    ])

    const handleTableChange = (newPagination, filters, sorter) => {
        setPagination(newPagination)
        setSorterInfo({
            order: sorter.order,
            field: sorter.field
        })
        setFilterInfo(filters)

        if (newPagination.pageSize !== pagination.pageSize) {
            setData([])
        }
    }

    const clearSorterInfo = () => {
        setSorterInfo({})
    }

    const clearFilterInfo = () => {
        setFilterInfo({})
    }

    const addSelected = () => {
        if (selectedRowInfo.rowKeys.length > 100) {
            messageApi.open({
                type: 'warning',
                content: `Selecting more than 100 genes is not allowed.`
            })
        } else {
            if (selectedRowInfo.rowKeys.length - selectedGenes.length !== 0) {
                setSelectedGenes([...selectedRowInfo.rows])

                messageApi.open({
                    type: 'success',
                    content: `Successfully Add ${selectedRowInfo.rowKeys.length - selectedGenes.length} Selected Genes!`
                })
            } else {
                messageApi.open({
                    type: 'warning',
                    content: `At least one gene must be selected before adding.`
                })
            }
        }


    }

    return (
        <div style={{ width: '96%', margin: 'auto', minHeight: '500px' }}>
            {contextHolder}
            <Flex justify="space-between" style={{ margin: '8px 0px 16px 0px' }}>
                <SelectGenesButtonGroup
                    clearSorterInfo={clearSorterInfo}
                    clearFilterInfo={clearFilterInfo}
                    addSelectedGenes={addSelected}
                    selectedCount={selectedRowInfo.rowKeys.length - selectedGenes.length}
                />
                <SelectGenesSearchBar searchInfo={searchInfo} setSearchInfo={setSearchInfo}/>
            </Flex>
            <GenesStyledTable
                columns={columns}
                rowSelection={rowSelection}
                rowKey={(record => record['gene_id'])}
                dataSource={data}
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
                scroll={{
                    y: 55 * 6,
                }}
            />
        </div>
    )
}

export default SelectGenesTable
