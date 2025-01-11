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
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from "@mui/icons-material/Visibility";
import EventNoteIcon from "@mui/icons-material/EventNote";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import userRegistration from "../services/user-registration.js";
import creditApplication from "../services/credit-application.js";
import creditEvaluation from "../services/credit-evaluation.js";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import creditSimulator from "../services/credit-simulator.js";
import trackingRequests from "../services/tracking-requests.js";
import {Typography} from "@mui/material";

const ListCustomer = () => {
    const [customers, setCustomers] = useState([]); // Lista completa de clientes
    const [currentPage, setCurrentPage] = useState(0); // Página actual
    const [customersPerPage] = useState(8); // Clientes por página
    const navigate = useNavigate();
    const [snackbarOpen, setSnackbarOpen] = useState(false); // Control del snackbar
    const [deletedCustomer, setDeletedCustomer] = useState(null); // Cliente eliminado temporalmente

    const init = () => {
        userRegistration.getAllCustomers()
            .then((response) => {
                console.log("Mostrando listado de todos los clientes.", response.data);
                const sortedCustomers = response.data.sort((a, b) => b.id - a.id);
                setCustomers(sortedCustomers);
            })
            .catch((error) => {
                console.log("Error al cargar el listado de clientes", error);
            });
    };


    useEffect(() => {
        init();
    }, []);

    // Calcula los clientes de la página actual
    const currentCustomers = customers.slice(
        currentPage * customersPerPage,
        (currentPage + 1) * customersPerPage
    );

    // Avanzar a la siguiente página
    const handleNextPage = () => {
        if ((currentPage + 1) * customersPerPage < customers.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Retroceder a la página anterior
    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

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

    const handleDeleteCustomer = async (customerId) => {
        try {
            // Primero obtenemos las entidades relacionadas
            const customerHistory = await userRegistration.getCustomerHistoryById(customerId);
            const credits = await creditApplication.getCreditsByCustomerId(customerId);
            const workHistories = await creditEvaluation.getWorkHistoriesByCustomerId(customerId);
            const savingAccount = await trackingRequests.getSavingAccountByCustomerId(customerId);

            // Obtener drafts asociados al savingAccount
            let drafts = [];
            if (savingAccount.data) {
                drafts = await creditSimulator.getAccountDraftsBySavingAccountId(savingAccount.data.id);
            }

            // Guardamos todos los datos asociados al cliente para restaurarlos si el usuario hace "Deshacer"
            const tempDeletedCustomer = {
                customerId,
                customerHistory: customerHistory.data,
                credits: credits.data,
                workHistories: workHistories.data,
                savingAccount: savingAccount.data,
                drafts: drafts.data, // Guardar drafts temporalmente
            };

            // Almacenamos el cliente y sus datos asociados temporalmente
            setDeletedCustomer(tempDeletedCustomer);

            // Actualizamos la vista para simular que el cliente ha sido eliminado
            setCustomers(customers.filter((customer) => customer.id !== customerId));

            // Mostramos el snackbar con la opción de "Deshacer"
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Error al eliminar el cliente y sus datos:", error);
        }
    };

    const handleUndoDelete = async () => {
        if (deletedCustomer) {
            try {
                // Restaurar el cliente y sus datos asociados
                setCustomers([deletedCustomer, ...customers]); // Añadir el cliente de vuelta a la lista

                // Restaurar sus datos asociados
                for (const history of deletedCustomer.customerHistory) {
                    await userRegistration.saveCustomerHistory(history);
                }
                for (const credit of deletedCustomer.credits) {
                    await creditApplication.saveCredit(credit);
                }
                for (const workHistory of deletedCustomer.workHistories) {
                    await creditEvaluation.saveWorkHistory(workHistory);
                }
                if (deletedCustomer.savingAccount) {
                    await trackingRequests.saveSavingAccount(deletedCustomer.savingAccount);
                }

                // Restaurar drafts de cuenta de ahorros
                if (deletedCustomer.drafts && deletedCustomer.drafts.length > 0) {
                    for (const draft of deletedCustomer.drafts) {
                        await creditSimulator.saveAccountDraft(draft); // Restaurar draft
                    }
                }

                // Limpiar el estado del cliente eliminado temporalmente
                setDeletedCustomer(null);
                setSnackbarOpen(false); // Cerrar el snackbar

                // Recargar la lista de clientes después de restaurar los datos
                init(); // Llamar a la función init para refrescar los datos

            } catch (error) {
                console.error("Error al restaurar el cliente y sus datos:", error);
            }
        }
    };

    const handleSnackbarClose = async () => {
        if (deletedCustomer) {
            try {
                // Eliminar permanentemente el cliente y sus datos asociados
                await userRegistration.deleteCustomer(deletedCustomer.customerId);
                for (const history of deletedCustomer.customerHistory) {
                    await userRegistration.deleteCustomerHistory(history);
                }
                for (const credit of deletedCustomer.credits) {
                    await creditApplication.deleteCredit(credit);
                }
                for (const workHistory of deletedCustomer.workHistories) {
                    await creditEvaluation.deleteWorkHistory(workHistory.id);
                }
                if (deletedCustomer.savingAccount) {
                    await trackingRequests.deleteSavingAccount(deletedCustomer.savingAccount);
                }

                // Eliminar borradores de cuenta asociados al savingAccount
                if (deletedCustomer.drafts && deletedCustomer.drafts.length > 0) {
                    for (const draft of deletedCustomer.drafts) {
                        await creditSimulator.deleteAccountDraft(draft.id); // Eliminar borrador
                    }
                }

                // Actualizar la lista de clientes
                init();
                setDeletedCustomer(null);
            } catch (error) {
                console.error("Error al eliminar permanentemente el cliente:", error);
            }
        }
        setSnackbarOpen(false); // Cerrar snackbar
    };

    return (
        <div>
            <TableContainer component={Paper}>
                <br/>
                <Typography variant="h5" sx={{textAlign: 'center', marginBottom: '20px'}}>
                    Interactua con el cliente.
                </Typography>
                <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="left" sx={{ fontWeight: "bold" }}>Nombre</TableCell>
                            <TableCell align="left" sx={{ fontWeight: "bold" }}>Año de nacimiento</TableCell>
                            <TableCell align="left" sx={{ fontWeight: "bold" }}>Operaciones posibles</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {currentCustomers.map((customer) => (
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
                                        Modificar datos
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        size="small"
                                        onClick={() => handleCreateCreditApplication(customer.id)}
                                        startIcon={<CreditCardIcon />}
                                    >
                                        Crear crédito
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="info"
                                        size="small"
                                        onClick={() => handleViewCredits(customer.id)}
                                        style={{ marginRight: "0.5rem" }}
                                        startIcon={<VisibilityIcon />}
                                    >
                                        Créditos asociados
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        size="small"
                                        onClick={() => handleViewActions(customer.id)}
                                        style={{ marginRight: "0.5rem" }}
                                        startIcon={<EventNoteIcon />}
                                    >
                                        Historial
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        onClick={() => handleDeleteCustomer(customer.id)} // Se agrega el handler
                                        startIcon={<DeleteIcon />} // Icono de eliminar
                                    >
                                        Eliminar cliente
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Botones de paginación */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0} // Deshabilitar si estamos en la primera página
                    style={{ marginRight: "1rem" }}
                >
                    Regresar
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNextPage}
                    disabled={(currentPage + 1) * customersPerPage >= customers.length} // Deshabilitar si no hay más páginas
                >
                    Ver más
                </Button>
            </div>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={7000} // Mostrar por 20 segundos
                onClose={handleSnackbarClose} // Llamar a la función para eliminar permanentemente si no se deshace
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity="info"
                    sx={{ width: "100%" }}
                    action={
                        <Button color="secondary" size="small" onClick={handleUndoDelete}>
                            Deshacer
                        </Button>
                    }
                >
                    ¿Deshacer la eliminación del cliente?
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ListCustomer;
