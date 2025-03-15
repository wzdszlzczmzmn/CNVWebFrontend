import { Badge, Button, Flex } from "antd"
import SorterCancelIcon from "../../../../../../icons/SorterCancel"
import FilterCancelIcon from "../../../../../../icons/FilterCancel"
import React from "react"

const SelectGenesButtonGroup = ({ clearSorterInfo, clearFilterInfo, addSelectedGenes, selectedCount }) => {
    return (
        <Flex gap={15}>
            <Button icon={<SorterCancelIcon/>} onClick={clearSorterInfo}>Clear Sorter</Button>
            <Button icon={<FilterCancelIcon/>} onClick={clearFilterInfo}>Clear Filter</Button>
            <Button
                icon={<Badge count={selectedCount} showZero/>}
                iconPosition="end"
                onClick={addSelectedGenes}
            >
                Add Selected
            </Button>
        </Flex>
    )
}

export default SelectGenesButtonGroup
