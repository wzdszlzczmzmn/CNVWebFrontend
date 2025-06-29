import {createTheme, responsiveFontSizes} from "@mui/material/styles";
import {orange, blue} from "@mui/material/colors";

// Create a theme instance.
let theme = createTheme({
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, \'Noto Sans\', sans-serif, \'Apple Color Emoji\', \'Segoe UI Emoji\', \'Segoe UI Symbol\', \'Noto Color Emoji\''
    },
    palette: {
        primary: blue,
        secondary: orange,
        grass: '#838A2D'
    },
});

theme = responsiveFontSizes(theme);

export default theme;
