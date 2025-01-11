import React from "react";
import { Typography, Box, Link } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const Home = () => {
    return (
        <Box sx={{ textAlign: "center", p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
                Manage Loans
            </Typography>
            <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "bold", color: "primary.main" }}
            >
                Seleccione el icono del menú ({" "}
                <MenuIcon sx={{ verticalAlign: "middle", color: "primary.main" }} />{" "})
                para comenzar.
            </Typography>
            <Typography
                variant="h8"
                gutterBottom
                sx={{ fontWeight: "bold", color: "primary.main" }}
            >
                Si desea crear un crédito y evaluarlo, primero cree un cliente y acceda a él en el listado de clientes para generar créditos a partir de su perfil.
            </Typography>
            <Typography variant="body1">
                Tu manejador de créditos bancarios. Esta aplicación ha sido desarrollada usando tecnologías como{" "}
                <Link href="https://spring.io/projects/spring-boot" target="_blank" rel="noopener">
                    Spring Boot
                </Link>{" "}
                (para el backend),{" "}
                <Link href="https://reactjs.org/" target="_blank" rel="noopener">
                    React
                </Link>{" "}
                (para el frontend), y{" "}
                <Link href="https://www.pgadmin.org/" target="_blank" rel="noopener">
                    PgAdmin4
                </Link>{" "}
                (para la base de datos).
            </Typography>
        </Box>
    );
};

export default Home;

