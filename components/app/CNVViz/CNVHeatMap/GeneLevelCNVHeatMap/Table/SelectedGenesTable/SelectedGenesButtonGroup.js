import { Badge, Button, Flex } from "antd"
import SorterCancelIcon from "../../../../../../icons/SorterCancel"
import FilterCancelIcon from "../../../../../../icons/FilterCancel"
import React from "react"

const SelectedGenesButtonGroup = ({ clearSorter, clearFilter, deleteSelected, selectedCount }) => (
    <Flex gap={15}>
        <Button icon={<SorterCancelIcon/>} onClick={clearSorter}>Clear Sorter</Button>
        <Button icon={<FilterCancelIcon/>} onClick={clearFilter}>Clear Filter</Button>
        <Button
            icon={<Badge count={selectedCount} showZero/>}
            onClick={deleteSelected}
            iconPosition="end"
        >
            Delete Selected
        </Button>
    </Flex>
)

export default SelectedGenesButtonGroup
