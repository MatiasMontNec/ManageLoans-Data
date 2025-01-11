import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import creditApplication from "../services/credit-application.js";
import userRegistration from "../services/user-registration.js";
import trackingRequests from "../services/tracking-requests.js";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const ListCredit = () => {
    const [creditEvaluations, setCreditEvaluations] = useState([]);
    const [customer, setCustomer] = useState(null);
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [deletedCredit, setDeletedCredit] = useState(null); // Crédito eliminado temporalmente
    const [deletedCreditIndex, setDeletedCreditIndex] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false); // Control del Snackbar
    const [currentPage, setCurrentPage] = useState(0); // Página actual
    const [actionsPerPage] = useState(12); // Créditos por página
    const [cancelledCredit, setCancelledCredit] = useState(null); // Crédito cancelado temporalmente
    const [cancelledCreditIndex, setCancelledCreditIndex] = useState(null); // Índice del crédito cancelado
    const [cancelSnackbarOpen, setCancelSnackbarOpen] = useState(false); // Control del Snackbar para cancelaciones


    useEffect(() => {
        fetchCreditEvaluations();
    }, [customerId]);

    const fetchCreditEvaluations = () => {
        creditApplication.getCreditsByCustomerId(customerId)
            .then((response) => {
                setCreditEvaluations(response.data.reverse()); // Invierte la lista aquí
            })
            .catch((error) => {
                console.error("Error al obtener las evaluaciones de crédito", error);
            });
        userRegistration.getCustomerById(customerId)
            .then((response) => {
                setCustomer(response.data);
            });
    };

    const handleDeleteCredit = (credit) => {
        const index = creditEvaluations.findIndex((item) => item.id === credit.id);

        // Guarda el crédito eliminado en una variable local
        const deletedCreditLocal = credit;

        // Guarda el crédito eliminado y su índice en el estado
        setDeletedCredit(deletedCreditLocal);
        setDeletedCreditIndex(index);

        // Elimina temporalmente el crédito de la lista
        setCreditEvaluations((prev) =>
            prev.filter((item) => item.id !== credit.id)
        );

        // Mostrar Snackbar
        setSnackbarOpen(true);

        // Si no se deshace dentro de 7 segundos, eliminarlo permanentemente
        setTimeout(async () => {
            console.log("Empieza la función para eliminar el crédito con deletedCreditLocal en: ", deletedCreditLocal);
            if (deletedCreditLocal) {
                console.log("Procedemos a eliminar el crédito");
                await creditApplication.deleteCredit(deletedCreditLocal).catch((error) => {
                    console.error("Error al eliminar el crédito permanentemente:", error);
                });
                // Limpia el estado después de eliminarlo permanentemente
                setDeletedCredit(null);
                setDeletedCreditIndex(null);
            }
        }, 7000);
    };

    const handleUndoDelete = () => {
        if (deletedCredit !== null && deletedCreditIndex !== null) {
            // Reinsertar el crédito en su posición original
            setCreditEvaluations((prev) => {
                const updatedCredits = [...prev];
                updatedCredits.splice(deletedCreditIndex, 0, deletedCredit);
                return updatedCredits;
            });
            setDeletedCredit(null);
            setDeletedCreditIndex(null);
            setSnackbarOpen(false);
        }
    };

    const handleUndoCancel = () => {
        if (cancelledCredit !== null && cancelledCreditIndex !== null) {
            // Revertir el seguimiento del crédito al estado original
            setCreditEvaluations((prev) =>
                prev.map((item) =>
                    item.id === cancelledCredit.id ? cancelledCredit : item
                )
            );

            // Limpia los estados de cancelación
            setCancelledCredit(null);
            setCancelledCreditIndex(null);
            setCancelSnackbarOpen(false);
        }
    };


    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleCancelSnackbarClose = () => {
        setCancelSnackbarOpen(false);
    };

    const getDeleteButtonText = (followUp) => {
        switch (followUp) {
            case -6:
                return "Eliminar crédito rechazado";
            case -7:
                return "Eliminar crédito cancelado";
            case 8:
                return "Eliminar crédito terminado";
            default:
                return "";
        }
    };

    // Funciones de paginación
    const handleNextPage = () => {
        if ((currentPage + 1) * actionsPerPage < creditEvaluations.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const currentCredits = creditEvaluations.slice(
        currentPage * actionsPerPage,
        (currentPage + 1) * actionsPerPage
    );

    const handleNavigateToEvaluation = (creditId) => {
        navigate(`/creditEvaluation/${customer.id}/${creditId}`);
    };

    const handleCancelCredit = async (credit) => {
        const index = creditEvaluations.findIndex((item) => item.id === credit.id);

        // Guarda el crédito cancelado y su índice en el estado
        setCancelledCredit(credit);
        setCancelledCreditIndex(index);

        // Actualiza temporalmente el seguimiento del crédito en la lista
        setCreditEvaluations((prev) =>
            prev.map((item) =>
                item.id === credit.id ? { ...item, followUp: -7 } : item
            )
        );

        // Mostrar Snackbar
        setCancelSnackbarOpen(true);

        // Si no se deshace dentro de 7 segundos, realiza la cancelación permanentemente
        setTimeout(async () => {
            if (cancelledCredit && cancelledCredit.id === credit.id) {
                try {
                    const date = new Date().toISOString().split('T')[0];
                    const customerHistory2 = {
                        customerId: customerId,
                        content: "Crédito cancelado por el cliente.",
                        date,
                    };
                    await userRegistration.saveCustomerHistory(customerHistory2);
                    await trackingRequests.modifyFollowUp(credit.id, -7);
                } catch (error) {
                    console.error("Error al cancelar la evaluación de crédito:", error);
                }
                // Limpia el estado después de hacer la cancelación permanente
                setCancelledCredit(null);
                setCancelledCreditIndex(null);
            }
        }, 7000);
    };


    const getFollowUpText = (follow_up) => {
        switch (follow_up) {
            case 0:
                return "En revisión inicial";
            case 1:
                return "Pendiente de documentación";
            case 2:
                return "En evaluación";
            case 3:
                return "Pre-Aprobada";
            case 4:
                return "En aprobación final";
            case 5:
                return "Aprobada";
            case -6:
                return "Rechazada";
            case -7:
                return "Cancelada por el cliente";
            case 8:
                return "En desembolso";
            default:
                return "";
        }
    };

    const getExecutiveWorkingText = (executiveWorking) => {
        return executiveWorking === 1
            ? "Ejecutivo trabajando en el crédito"
            : "Aún no hay ejecutivo trabajando en el crédito";
    };

    return (
        <TableContainer component={Paper}>
            <h3>Evaluaciones de Crédito del Cliente</h3>
            <Table sx={{ minWidth: 650 }} size="small" aria-label="credit evaluations table">
                <TableHead>
                    <TableRow>
                        <TableCell align="left" sx={{ fontWeight: "bold" }}>Seguimiento</TableCell>
                        <TableCell align="left" sx={{ fontWeight: "bold" }}>Ejecutivo Trabajando</TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>Monto</TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold" }}>Operación</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {currentCredits.map((credit) => (
                        <TableRow key={credit.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                            <TableCell align="left">{getFollowUpText(credit.followUp)}</TableCell>
                            <TableCell align="left">{getExecutiveWorkingText(credit.executiveWorking)}</TableCell>
                            <TableCell align="right">{credit.amountWanted}</TableCell>
                            <TableCell align="center">
                                {credit.followUp !== 8 && credit.followUp !== -7 && credit.followUp !== -6 && (
                                    <>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleNavigateToEvaluation(credit.id)}
                                        >
                                            Seguir Evaluación y Evaluar Crédito
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            onClick={() => handleCancelCredit(credit)}
                                            sx={{ marginLeft: 1 }}
                                        >
                                            Cancelar
                                        </Button>
                                    </>
                                )}
                                {[-6, -7, 8].includes(credit.followUp) && (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => handleDeleteCredit(credit)}
                                    >
                                        {getDeleteButtonText(credit.followUp)}
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 0}
                    style={{ marginRight: "1rem" }}
                >
                    Anterior
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleNextPage}
                    disabled={(currentPage + 1) * actionsPerPage >= creditEvaluations.length}
                >
                    Siguiente
                </Button>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem" }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/listCustomer`)}
                >
                    Regresar a la Lista de Clientes
                </Button>
            </div>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={7000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity="info"
                    action={
                        <Button color="secondary" size="small" onClick={handleUndoDelete}>
                            Deshacer
                        </Button>
                    }
                >
                    Crédito eliminado. ¿Deshacer?
                </Alert>
            </Snackbar>
            <Snackbar
                open={cancelSnackbarOpen}
                autoHideDuration={7000}
                onClose={handleCancelSnackbarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={handleCancelSnackbarClose}
                    severity="info"
                    action={
                        <Button color="secondary" size="small" onClick={handleUndoCancel}>
                            Deshacer
                        </Button>
                    }
                >
                    Crédito cancelado. ¿Deshacer?
                </Alert>
            </Snackbar>

        </TableContainer>
    );
};

export default ListCredit;