import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { toHumanString } from "../humanize";
import { StyledTooltipFontSize12 } from "components/styledAntdComponent/StyledTooltip"

export const ProgramChip = ({ program }) => {
    return <Chip color="secondary" size="small" label={program} variant="outlined"/>
}

const experimentalStrategyColor = {
    'Genotyping Array': '#0043A4',
    'WGS': '#7C0072'
}

const getExperimentalStrategyColor = (experimentalStrategy) => {
    if (experimentalStrategyColor.hasOwnProperty(experimentalStrategy)) {
        return experimentalStrategyColor[experimentalStrategy]
    } else {
        return '#ff9800'
    }
}

export const ExperimentalStrategyChip = ({ experimentalStrategy }) => {
    return <Chip size={"small"} label={experimentalStrategy}
                 sx={{ color: 'white', bgcolor: getExperimentalStrategyColor(experimentalStrategy) }}></Chip>
}

export const ProjectText = ({ record }) => {
    return <StyledTooltipFontSize12 title={record.project_name}>
        <Typography color="#757575" sx={{ fontStyle: 'italic' }}>{record.project_id}</Typography>
    </StyledTooltipFontSize12>
}


export const StatsText = ({ count, unit }) => {
    return <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>

        <Typography variant="h5">{toHumanString(count)}</Typography>
        <Typography variant="caption" fontSize={14} sx={{ ml: 0.5 }}>{unit}</Typography>
    </Box>
}

export const PrimarySiteChipWithTooltip = ({ primarySites, tooltipPlacement }) => {
    const primarySiteDescription = (
        <ul style={{ paddingLeft: 12, margin: 0 }}>
            {primarySites.map((primarySite, index) => (
                <li key={index}>{primarySite === '' ? 'Null' : primarySite}</li>
            ))}
        </ul>
    )

    return <StyledTooltipFontSize12 title={primarySiteDescription} placement={tooltipPlacement}>
        <Chip size="small" label={primarySites.length === 1 ? primarySites[0] : primarySites.length + ' Primary Sites'}
              variant="outlined"
        ></Chip>
    </StyledTooltipFontSize12>
}

export const DiseaseTypeChipWithTooltip = ({ diseaseTypes, tooltipPlacement }) => {
    const diseaseTypeDescription = (
        <ul style={{ paddingLeft: 12, margin: 0 }}>
            {diseaseTypes.map((diseaseType, index) => (
                <li key={index}>{diseaseType === '' ? 'Null' : diseaseType}</li>
            ))}
        </ul>
    )

    return <StyledTooltipFontSize12 title={diseaseTypeDescription} placement={tooltipPlacement}>
        <Chip size='small' label={diseaseTypes.length === 1 ? diseaseTypes[0] : diseaseTypes.length + ' Disease Types'}
              variant='outlined' color='error'></Chip>
    </StyledTooltipFontSize12>
}
