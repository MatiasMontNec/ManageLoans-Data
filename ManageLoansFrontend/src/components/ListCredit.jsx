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


const ListCredit = () => {
    const [creditEvaluations, setCreditEvaluations] = useState([]);
    const [customer, setCustomer] = useState(null);
    const { customerId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchCreditEvaluations();
    }, [customerId]);

    const fetchCreditEvaluations = () => {
        creditApplication.getCreditsByCustomerId(customerId)
            .then((response) => {
                setCreditEvaluations(response.data);
            })
            .catch((error) => {
                console.error("Error al obtener las evaluaciones de crédito", error);
            });
        userRegistration.getCustomerById(customerId)
            .then((response) => {
                setCustomer(response.data);
            })
    };

    const handleNavigateToEvaluation = (creditId) => {
        navigate(`/creditEvaluation/${customer.id}/${creditId}`);
    };

    const handleCancelCredit = async (creditId) => {
        const date = new Date().toISOString().split('T')[0];
        const customerHistory2 = {
            customerId: customerId,
            content: "Credito evaluado cancelado por cliente",
            date
        };
        await userRegistration.saveCustomerHistory(customerHistory2);
        trackingRequests.modifyFollowUp(creditId,-7)
            .then(() => {
                fetchCreditEvaluations();
            })
            .catch((error) => {
                console.error("Error al cancelar la evaluación de crédito", error);
            });
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
                    {creditEvaluations.map((credit) => (
                        <TableRow key={credit.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                            <TableCell align="left">{getFollowUpText(credit.followUp)}</TableCell>
                            <TableCell align="left">{getExecutiveWorkingText(credit.executiveWorking)}</TableCell>
                            <TableCell align="right">{credit.amountWanted}</TableCell>
                            <TableCell align="center">
                                {credit.followUp !== 8 && credit.followUp !== -7 && credit.followUp !== -6 &&(
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
                                            onClick={() => handleCancelCredit(credit.id)}
                                            sx={{ marginLeft: 1 }}
                                        >
                                            Cancelar
                                        </Button>
                                    </>
                                )}
                                {(credit.followUp === -6) && (
                                    <>
                                        <div>
                                            Operaciones no disponible
                                        </div>
                                        para créditos rechazados
                                    </>
                                )}
                                {(credit.followUp === -7) && (
                                    <>
                                        <div>
                                            Operaciones no disponible
                                        </div>
                                        para créditos cancelados
                                    </>
                                )}
                                {credit.followUp === 8 && (
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
