import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EventNoteIcon from "@mui/icons-material/EventNote";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import userRegistration from "../services/user-registration.js";

const ListCustomer = () => {
    const [customers, setCustomers] = useState([]);
    const navigate = useNavigate();

    const init = () => {
        userRegistration.getAllCustomers()
            .then((response) => {
                console.log("Mostrando listado de todos los clientes.", response.data);
                setCustomers(response.data);
            })
            .catch((error) => {
                console.log("Error al cargar el listado de clientes", error);
            });
    };

    useEffect(() => {
        init();
    }, []);

    const handleEdit = (id) => {
        navigate(`/editCustomer/${id}`);
    };

    const handleViewCredits = (customerId) => {
        navigate(`/listCredit/${customerId}`);
    };

    const handleViewActions = (customerId) => {
        navigate(`/listActions/${customerId}`);
    };

    const handleCreateCreditApplication = (customerId) => {
        navigate(`/creditApplication/${customerId}`);
    };

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                <TableHead>
                    <TableRow>
                        <TableCell align="left" sx={{ fontWeight: "bold" }}>Nombre</TableCell>
                        <TableCell align="left" sx={{ fontWeight: "bold" }}>Año de nacimiento</TableCell>
                        <TableCell align="left" sx={{ fontWeight: "bold" }}>Operaciones chile</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {customers.map((customer) => (
                        <TableRow key={customer.id}>
                            <TableCell align="left">{customer.name}</TableCell>
                            <TableCell align="left">{customer.yearBirth}</TableCell>
                            <TableCell>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={() => handleEdit(customer.id)}
                                    style={{ marginRight: "0.5rem" }}
                                    startIcon={<EditIcon />}
                                >
                                    Ver o modificar datos del cliente
                                </Button>
                                <Button
                                    variant="contained"
                                    color="info"
                                    size="small"
                                    onClick={() => handleViewCredits(customer.id)}
                                    style={{ marginRight: "0.5rem" }}
                                    startIcon={<VisibilityIcon />}
                                >
                                    Ver créditos asociados
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    size="small"
                                    onClick={() => handleViewActions(customer.id)}
                                    style={{ marginRight: "0.5rem" }}
                                    startIcon={<EventNoteIcon />}
                                >
                                    Ver acciones en ManageLoans
                                </Button>
                                <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    onClick={() => handleCreateCreditApplication(customer.id)}
                                    startIcon={<CreditCardIcon />}
                                >
                                    Crear crédito con este cliente
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ListCustomer;
