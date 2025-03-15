import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { StyledTooltipFontSize12 } from "../../../../styledAntdComponent/StyledTooltip"
import Box from "@mui/material/Box"
import { Button } from "antd"
import React from "react"
import { styled } from "@mui/material/styles"
import Chip from "@mui/material/Chip"

export default function GeneSelector({
    selectedGenes,
    sortedGenes,
    showModal,
    resetSelectedGenes,
    renderHeatMap
}) {

    return (
        <>
            <GeneChips selectedGenes={selectedGenes} sortedGenes={sortedGenes} showModal={showModal} />
            <ButtonGroup showModal={showModal} resetSelectedGenes={resetSelectedGenes} renderHeatMap={renderHeatMap} />
        </>
    )
}

const GeneChips = ({ selectedGenes, sortedGenes, showModal }) => (
    <Stack sx={{ mt: 2, mb: 2, px: 2 }}>
        <Typography sx={{ fontWeight: '500', mb: 1 }}>
            Selected Genes:
        </Typography>
        <Stack direction='row' sx={{ flexWrap: 'wrap', width: '100%' }}>
            {
                selectedGenes.length === 0 ? (
                    <TooltipGeneChip title="No Selected Genes" label="No Selected Genes" color="#A80C05"/>
                ) : (
                    sortedGenes.slice(0, 9).map((gene, index) => (
                        <TooltipGeneChip
                            key={gene['gene_id']}
                            title={<GeneTooltipContent gene={gene}/>}
                            label={gene['gene_name']}
                            color={geneChipColors[index]}
                        />
                    ))
                )
            }

            {
                selectedGenes.length > 9 ? (
                    <TooltipGeneChip
                        title="Click to see all selected genes."
                        label={`+${selectedGenes.length - 9} Genes`}
                        color="#000000"
                        handleClick={showModal}
                    />
                ) : (
                    <></>
                )
            }
        </Stack>
    </Stack>
)

const ButtonGroup = ({ showModal, resetSelectedGenes, renderHeatMap }) => (
    <Stack spacing={1} sx={{ mt: 2, mb: 2, px: '6px' }}>
        <Stack direction='row' sx={{ justifyContent: 'space-between' }}>
            <Button
                style={{
                    width: '120px',
                    backgroundColor: '#41B3A2',
                    color: '#FFFFFF',
                    borderColor: '#41B3A2'
                }}
                onClick={showModal}
            >
                Select
            </Button>
            <Button
                style={{
                    width: '120px',
                    color: '#41B3A2',
                    borderColor: '#41B3A2'
                }}
                onClick={resetSelectedGenes}
            >
                Reset
            </Button>
        </Stack>
        <Button
            style={{
                backgroundColor: '#41B3A2',
                color: '#FFFFFF',
                borderColor: '#41B3A2'
            }}
            onClick={renderHeatMap}
        >
            Render
        </Button>
    </Stack>
)

const StyledGeneChip = styled(Chip, {
    shouldForwardProp: (prop) => prop !== 'customColor',
})(({ customColor }) => ({
    color: customColor,
    borderColor: customColor,
    margin: 4,
}))

const geneChipColors = [
    '#5470c6',
    '#91cc75',
    '#fac858',
    '#ee6666',
    '#73c0de',
    '#3ba272',
    '#fc8452',
    '#9a60b4',
    '#ea7ccc',
]

const GeneTooltipContent = ({ gene }) => (
    <Box>
        <div>ID: <i>{gene['gene_id']}</i></div>
        <div>Name: <i>{gene['gene_name']}</i></div>
        <div>Chromosome: <i>{gene['chromosome']}</i>
        </div>
        <div>Start: <i>{gene['start']}</i></div>
        <div>End: <i>{gene['end']}</i></div>
    </Box>
)

const TooltipGeneChip = ({ title, label, color, handleClick=null }) => (
    <StyledTooltipFontSize12
        title={title}
        placement="top"
    >
        <StyledGeneChip
            label={label}
            customColor={color}
            variant="outlined"
            size="small"
            onClick={handleClick}
        />
    </StyledTooltipFontSize12>
)
