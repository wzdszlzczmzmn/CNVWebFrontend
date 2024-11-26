import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import {createTheme, ThemeProvider} from "@mui/material/styles";

const StatisticSelectButtonColor = createTheme({
    palette: {
        TiffanyBlue: {
            main: '#41B3A2',
            light: '#BDE8CA',
            dark: '#009689',
            contrastText: '#ffffff'
        }
    }
})

export const StatisticSelectButton = ({buttonText, selected, clickHandler}) => {
    return(
        <ThemeProvider theme={StatisticSelectButtonColor}>
            <Button
                variant={selected ? 'contained' : 'outlined'}
                onClick={clickHandler}
                color='TiffanyBlue'
                size='medium'
                sx={{textTransform: 'none'}}
            >
                {buttonText}
            </Button>
        </ThemeProvider>
    )
}
