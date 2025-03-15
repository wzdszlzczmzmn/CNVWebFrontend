import React, { useState } from "react"
import Fuse from "fuse.js"
import { produce } from "immer"
import Stack from "@mui/material/Stack"
import { Button, Input, Popover } from "antd"
import { MenuOutlined } from "@ant-design/icons"
import TableSearchFieldSwitchList from "../TableSearchFieldSwitchList"

const SelectedGenesSearchBar = ({ selectedGenes, setSelectedGenes }) => {
    const [searchText, setSearchText] = useState('')

    const handleSearchTextChange = (e) => {
        setSearchText(e.target.value)
    }

    const onSearch = () => {
        if (searchText === '') {
            setSelectedGenes(selectedGenes)
        } else {
            const fuseOptions = {
                threshold: 0.2,
                keys: [
                    ...fields.filter(field => field.checked).map(field => field.value)
                ]
            }
            const fuse = new Fuse(selectedGenes, fuseOptions)
            const searchedGeneIndexArray = fuse.search(searchText).map(record => record.refIndex)
            setSelectedGenes(selectedGenes.filter((_, index) => searchedGeneIndexArray.includes(index)))
        }
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
                placeholder="Search..."
                allowClear
                value={searchText}
                onChange={handleSearchTextChange}
                onSearch={(value) => onSearch(value)}
                style={{
                    width: 200,
                }}
            />
            <Popover
                placement="bottom"
                content={<TableSearchFieldSwitchList fields={fields} handleSwitchChange={handleSwitchChange}/>}
                trigger={['click']}
                overlayInnerStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    boxShadow: 'rgba(0, 0, 0, 0.08) 0px 6px 16px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 9px 28px 8px',
                    padding: '4px'
                }}
            >
                <Button icon={<MenuOutlined/>} style={{ color: '#276D8C', borderColor: '#276D8C' }}/>
            </Popover>
        </Stack>
    )
}

export default SelectedGenesSearchBar
