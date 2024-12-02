import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#ffffff",
        },
        text: {
            primary: "#ffffff",
        },
        background: {
            default: "#333333",
            paper: "#444444",
        },
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    color: "#ffffff",
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    color: "#ffffff",
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: "#ffffff",
                },
            },
        },
    },
});

export default theme;
