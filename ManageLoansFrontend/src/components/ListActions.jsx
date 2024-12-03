import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import userRegistration from "../services/user-registration.js";

const ListActions = () => {
    const { customerId } = useParams();
    const [customerHistory, setCustomerHistory] = useState([]);

    useEffect(() => {
        userRegistration.getCustomerHistoryById(customerId)
            .then(response => {
                console.log("Datos a enviar:", JSON.stringify(response.data, null, 2));
                setCustomerHistory(response.data);
            })
            .catch(error => {
                console.log("Error al obtener el historial del cliente", error);
            });
    }, [customerId]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
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
                    {customerHistory.map((history) => (
                        <TableRow key={history.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                            <TableCell align="right">{history.id}</TableCell>
                            <TableCell align="right">{history.content}</TableCell>
                            <TableCell align="right">{formatDate(history.date)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ListActions;
