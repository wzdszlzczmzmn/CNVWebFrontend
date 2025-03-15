import React, { useState } from "react"
import { Flex, message, Table } from "antd"
import Chip from "@mui/material/Chip"
import SelectedGenesButtonGroup from "./SelectedGenesButtonGroup"
import SelectedGenesSearchBar from "./SelectedGenesSearchBar"
import DeleteGeneButton from "../../Button/DeleteGeneButton"
import GenesStyledTable from "../GenesStyledTable"

const getFilters = (data, mapFn) => {
    const uniqueItems = [...new Set(data.map(mapFn))]

    return uniqueItems.map(uniqueItem => ({
        text: uniqueItem,
        value: uniqueItem,
    }))
}

const SelectedGenesTable = ({ selectedGenes, setSelectedGenes }) => {
    const [filteredInfo, setFilteredInfo] = useState({})
    const [sortedInfo, setSortedInfo] = useState({})
    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [messageApi, contextHolder] = message.useMessage()

    const handleGeneDelete = (geneRemove) => {
        setSelectedGenes(selectedGenes.filter(gene => gene.gene_id !== geneRemove.gene_id))
    }

    const handleChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        setSortedInfo(sorter);
    }

    const clearFilters = () => {
        setFilteredInfo({});
    }

    const clearSorter = () => {
        setSortedInfo({})
    }

    const deleteSelected = () => {
        if (selectedRowKeys.length !== 0) {
            setSelectedGenes(selectedGenes.filter(gene => !selectedRowKeys.includes(gene.gene_id)))

            messageApi.open({
                type: 'success',
                content: `Successfully Delete ${selectedRowKeys.length} Selected Genes!`
            })

            setSelectedRowKeys([])
        }
    }

    const rowSelection = {
        selectedRowKeys,
        columnWidth: '56px',
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys([...new Set([...newSelectedRowKeys])])
        },
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE
        ]
    }

    const geneTableColumns = [
        {
            title: 'Gene ID',
            dataIndex: 'gene_id',
            key: 'gene_id',
            align: 'center',
            sorter: (a, b) => a.gene_id.localeCompare(b.gene_id),
            sortOrder: sortedInfo.columnKey === 'gene_id' ? sortedInfo.order : null,
        },
        {
            title: 'Gene Name',
            dataIndex: 'gene_name',
            key: 'gene_name',
            align: 'center',
            sorter: (a, b) => a.gene_name.localeCompare(b.gene_name),
            sortOrder: sortedInfo.columnKey === 'gene_name' ? sortedInfo.order : null,
        },
        {
            title: 'Chromosome',
            dataIndex: 'chromosome',
            key: 'chromosome',
            align: 'center',
            sorter: (a, b) => a.chromosome.localeCompare(b.chromosome),
            sortOrder: sortedInfo.columnKey === 'chromosome' ? sortedInfo.order : null,
            filters: getFilters(selectedGenes, (item) => item.chromosome),
            filteredValue: filteredInfo.chromosome || null,
            onFilter: (value, record) => record.chromosome === value,
        },
        {
            title: 'Start',
            dataIndex: 'start',
            key: 'start',
            align: 'center',
            sorter: (a, b) => a.start - b.start,
            sortOrder: sortedInfo.columnKey === 'start' ? sortedInfo.order : null,
        },
        {
            title: 'End',
            dataIndex: 'end',
            key: 'end',
            align: 'center',
            sorter: (a, b) => a.end - b.end,
            sortOrder: sortedInfo.columnKey === 'end' ? sortedInfo.order : null,
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
            filters: [
                {
                    text: 'Cancer Census Gene',
                    value: 'Cancer Census Gene'
                },
                {
                    text: 'Other',
                    value: 'Other'
                }
            ],
            filteredValue: filteredInfo.tag || null,
            onFilter: (value, record) => record.tag === value,
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            render: (_, gene) => (
                <DeleteGeneButton handleDelete={() => handleGeneDelete(gene)}/>
            )
        }
    ]

    return (
        <div style={{ width: '96%', margin: 'auto', minHeight: '500px' }}>
            {contextHolder}
            <Flex justify="space-between" style={{ margin: '8px 0px 16px 0px' }}>
                <SelectedGenesButtonGroup
                    clearSorter={clearSorter}
                    clearFilter={clearFilters}
                    deleteSelected={deleteSelected}
                    selectedCount={selectedRowKeys.length}
                />
                <SelectedGenesSearchBar
                    selectedGenes={selectedGenes}
                    setSelectedGenes={setSelectedGenes}
                />
            </Flex>
            <GenesStyledTable
                columns={geneTableColumns}
                dataSource={selectedGenes}
                rowKey="gene_id"
                onChange={handleChange}
                rowSelection={rowSelection}
                pagination={{
                    defaultPageSize: 5,
                    showQuickJumper: true,
                    pageSizeOptions: [5, 10, 30, 50, 100],
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} genes`
                }}
                scroll={{
                    y: 55 * 6,
                }}
            />
        </div>
    )
}

export default SelectedGenesTable
