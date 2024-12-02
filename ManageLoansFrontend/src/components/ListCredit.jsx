import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import creditEvaluationsService from "../services/credit-simulator.js";
import manageService from "../services/user-registration.js";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import customersService from "../services/credit-application.js";

const ListCredit = () => {
    const [creditEvaluations, setCreditEvaluations] = useState([]);
    const [customer, setCustomer] = useState(null);
    const { customerId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCreditEvaluations();
    }, [customerId]);

    const fetchCreditEvaluations = () => {
        creditEvaluationsService
            .getCreditEvaluationsById(customerId)
            .then((response) => {
                setCreditEvaluations(response.data);
                customersService.getCustomerById(customerId)
                    .then((response2) => {
                        setCustomer(response2.data);
                    })
                    .catch((error) => {
                        console.error("Error al obtener el cliente asociado", error);
                    })
            })
            .catch((error) => {
                console.error("Error al obtener las evaluaciones de crédito", error);
            });
    };

    const handleNavigateToEvaluation = (creditId) => {
        navigate(`/creditEvaluation/${customer.id}/${creditId}`);
    };

    const handleCancelCredit = (creditEvaluationsEntity) => {
        const date = new Date().toISOString().split('T')[0];
        const customerHistory2 = {
            content: "Credito evaluado cancelado por cliente",
            date
        };
        const customerRequest = {
            workHistoryEntities: null,
            savingAccountEntity: null,
            creditEvaluationsEntities: null,
            customerHistoryEntities: customerHistory2,
        };
        customersService.updateCustomer(id, customerRequest);
        const manageRequest = {
            creditEvaluations: creditEvaluationsEntity,
            customers: customer
        }
        manageService
            .checkCustomerCancellation(manageRequest)
            .then(() => {
                fetchCreditEvaluations();
            })
            .catch((error) => {
                console.error("Error al cancelar la evaluación de crédito", error);
            });
    };

    const getStatusReviewText = (status_review) => {
        return status_review === 1 ? "CUMPLIENDO" : status_review === -1 ? "RECHAZADA" : "";
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
            case 6:
                return "Rechazada";
            case 7:
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
                        <TableCell align="left" sx={{ fontWeight: "bold" }}>Estado de Revisión</TableCell>
                        <TableCell align="left" sx={{ fontWeight: "bold" }}>Seguimiento</TableCell>
                        <TableCell align="left" sx={{ fontWeight: "bold" }}>Ejecutivo Trabajando</TableCell>
                        <TableCell align="right" sx={{ fontWeight: "bold" }}>Monto</TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold" }}>Operación</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {creditEvaluations.map((credit) => (
                        <TableRow key={credit.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                            <TableCell align="left">{getStatusReviewText(credit.status_review)}</TableCell>
                            <TableCell align="left">{getFollowUpText(credit.follow_up)}</TableCell>
                            <TableCell align="left">{getExecutiveWorkingText(credit.executiveWorking)}</TableCell>
                            <TableCell align="right">{credit.amount}</TableCell>
                            <TableCell align="center">
                                {credit.status_review === 1 && credit.follow_up !== 8 &&(
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
                                {(credit.status_review === -1 || credit.follow_up === 6) && (
                                    <>
                                        <div>
                                            Operaciones no disponible
                                        </div>
                                        para créditos rechazados
                                    </>
                                )}
                                {credit.follow_up === 8 && (
                                    <>
                                        <div>
                                            Operaciones no disponible para créditos aceptados y
                                        </div>
                                        han empezado el proceso de desembolso
                                    </>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ListCredit;
