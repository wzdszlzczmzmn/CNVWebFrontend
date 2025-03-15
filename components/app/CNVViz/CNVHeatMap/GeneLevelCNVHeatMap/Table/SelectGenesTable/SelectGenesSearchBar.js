import React, { useState } from "react"
import Stack from "@mui/material/Stack"
import { Button, Input, Popover } from "antd"
import { MenuOutlined } from "@ant-design/icons"
import TableSearchFieldSwitchList from "../TableSearchFieldSwitchList"

const SelectGenesSearchBar = ({ setSearchInfo }) => {
    const [searchText, setSearchText] = useState('')
    const [searchField, setSearchField] = useState([
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

    const handleSearchTextChange = (e) => {
        setSearchText(e.target.value)
    }

    const onSearch = () => {
        setSearchInfo({
            searchText: searchText,
            searchField: searchField.filter(field => field.checked === true)
        })
    }

    const onClear = () => {
        setSearchText('')
        setSearchInfo({
            searchText: '',
            searchField: searchField.filter(field => field.checked === true)
        })
    }

    const handleSwitchChange = (value) => {
        const updateSearchField = searchField.map(field => {
            if (field.value === value) {
                return {
                    ...field,
                    checked: !field.checked
                }
            }
            return field
        })

        setSearchField(updateSearchField)
        setSearchInfo({
            searchText: searchText,
            searchField: updateSearchField.filter(field => field.checked === true)
        })
    }

    return (
        <Stack direction="row" spacing={1}>
            <Input.Search
                placeholder="Search..."
                allowClear
                value={searchText}
                onChange={handleSearchTextChange}
                onSearch={onSearch}
                onClear={onClear}
                style={{
                    width: 200,
                }}
            />
            <Popover
                placement="bottom"
                content={<TableSearchFieldSwitchList fields={searchField} handleSwitchChange={handleSwitchChange}/>}
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

export default SelectGenesSearchBar
