import { useEffect, useState } from "react";
import {useNavigate, useParams} from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import userRegistration from "../services/user-registration.js";
import Button from "@mui/material/Button";

const ListActions = () => {
    const { customerId } = useParams();
    const [customerHistory, setCustomerHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(0); // Página actual
    const [actionsPerPage] = useState(18); // Acciones por página
    const navigate = useNavigate();

    useEffect(() => {
        userRegistration.getCustomerHistoryById(customerId)
            .then(response => {
                console.log("Datos a enviar:", JSON.stringify(response.data, null, 2));
                const sortedHistory = response.data.sort((a, b) => b.id - a.id);
                setCustomerHistory(sortedHistory);
            })
            .catch(error => {
                console.log("Error al obtener el historial del cliente", error);
            });
    }, [customerId]);

    // Calcula las acciones de la página actual
    const currentActions = customerHistory.slice(
        currentPage * actionsPerPage,
        (currentPage + 1) * actionsPerPage
    );

    // Avanzar a la siguiente página
    const handleNextPage = () => {
        if ((currentPage + 1) * actionsPerPage < customerHistory.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Retroceder a la página anterior
    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleReturn = () => {
        navigate(`/listCustomer`);
    };

    return (
        <div>
            <TableContainer component={Paper}>
                <h3>Historial de Acciones</h3>
                <hr />
                <Table sx={{ minWidth: 650 }} size="small" aria-label="customer history table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="right" sx={{ fontWeight: "bold" }}>ID</TableCell>
                            <TableCell align="right" sx={{ fontWeight: "bold" }}>Contenido</TableCell>
                            <TableCell align="right" sx={{ fontWeight: "bold" }}>Fecha</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {currentActions.map((history) => (
                            <TableRow key={history.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                <TableCell align="right">{history.id}</TableCell>
                                <TableCell align="right">{history.content}</TableCell>
                                <TableCell align="right">{formatDate(history.date)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Contenedor para los botones de paginación */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0} // Deshabilitar si estamos en la primera página
                    style={{ marginRight: "1rem" }}
                >
                    Anterior
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleNextPage}
                    disabled={(currentPage + 1) * actionsPerPage >= customerHistory.length} // Deshabilitar si no hay más páginas
                >
                    Siguiente
                </Button>
            </div>

            {/* Contenedor para el botón de regresar */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem" }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleReturn}
                >
                    Regresar a la Lista de Clientes
                </Button>
            </div>
        </div>
    );
};

export default ListActions;
