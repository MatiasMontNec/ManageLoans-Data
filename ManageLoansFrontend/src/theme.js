import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "light", // Cambiamos a "light" para reflejar un diseño más claro y moderno.
        primary: {
            main: "#023047", // Azul oscuro para encabezados y elementos importantes.
        },
        secondary: {
            main: "#06D6A0", // Verde brillante para botones principales.
        },
        text: {
            primary: "#023047", // Texto principal en azul oscuro.
            secondary: "#5A5A5A", // Texto secundario en gris medio.
        },
        background: {
            default: "#E8F1F5", // Azul muy claro para el fondo principal.
            paper: "#F3F4F6", // Gris claro para tarjetas y contenedores.
        },
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    color: "#023047", // Azul oscuro para entradas de texto.
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    color: "#023047", // Azul oscuro para el texto dentro de los campos.
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: "#5A5A5A", // Etiquetas en gris medio.
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: "8px",
                    textTransform: "none", // Mantener el texto de los botones en su forma original.
                    fontWeight: "bold",
                    fontSize: "1rem",
                },
                containedPrimary: {
                    backgroundColor: "#06D6A0", // Botones principales en verde brillante.
                    color: "#FFFFFF",
                    "&:hover": {
                        backgroundColor: "#05C095", // Verde más oscuro para hover.
                    },
                },
                containedSecondary: {
                    backgroundColor: "#FFB703", // Botones secundarios en amarillo cálido.
                    color: "#023047",
                    "&:hover": {
                        backgroundColor: "#E8A202", // Amarillo más oscuro para hover.
                    },
                },
            },
        },
    },
});

export default theme;
