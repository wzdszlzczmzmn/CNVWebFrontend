import Box from "@mui/material/Box"
import GeneIcon from "../../../../../icons/Gene"
import Typography from "@mui/material/Typography"
import DraggableModal from "../../../../../Layout/DraggableModal"
import { Tabs } from "antd"
import React from "react"
import SelectedGenesTable from "../Table/SelectedGenesTable/SelectedGenesTable"
import SelectGenesTable from "../Table/SelectGenesTable/SelectGenesTable"

const SelectGenesModal = ({ isModalOpen, handleModalCancel, selectedGenes, setSelectedGenes }) => {
    const titleContent = (
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
    )

    return (
        <DraggableModal
            titleContent={titleContent}
            open={isModalOpen}
            onCancel={handleModalCancel}
            footer={[]}
            width={1450}
            centered
        >
            <Tabs
                tabBarStyle={{ marginLeft: '16px' }}
                items={[
                    {
                        label: 'Selected Genes',
                        key: 'selected-genes',
                        children: <SelectedGenesTable
                            selectedGenes={selectedGenes}
                            setSelectedGenes={setSelectedGenes}
                        />
                    },
                    {
                        label: `Select Genes`,
                        key: 2,
                        children: <SelectGenesTable
                            selectedGenes={selectedGenes}
                            setSelectedGenes={setSelectedGenes}
                        />,
                    }
                ]}
            />
        </DraggableModal>

    )
}

export default SelectGenesModal
