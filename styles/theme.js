import {createTheme, responsiveFontSizes} from "@mui/material/styles";
import {lightBlue, orange} from "@mui/material/colors";

// Create a theme instance.
let theme = createTheme({
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, \'Noto Sans\', sans-serif, \'Apple Color Emoji\', \'Segoe UI Emoji\', \'Segoe UI Symbol\', \'Noto Color Emoji\''
    },
    palette: {
        primary: orange,
        secondary: lightBlue,
        grass: '#838A2D'
    },
});

theme = responsiveFontSizes(theme);

export default theme;
