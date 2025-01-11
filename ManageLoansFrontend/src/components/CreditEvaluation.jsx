import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {List, ListItem, ListItemText, Box, Button, ButtonGroup, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, CardContent, Grid, Divider} from "@mui/material";
import CalculateIcon from '@mui/icons-material/Calculate';
import creditEvaluation from "../services/credit-evaluation.js";
import creditApplication from "../services/credit-application.js";
import trackingRequests from "../services/tracking-requests.js";
import creditSimulator from "../services/credit-simulator.js";
import {LoanTypesTable} from "./functions.jsx"
import userRegistration from "../services/user-registration.js";
import Lottie from "lottie-react";
import successAnimationData from "../animations/fail-animation.json";
import moneyAnimation from "../animations/money-animation.json";
import carAnimation from "../animations/car-animation.json";

const CreditEvaluation = () => {
    const { id , creditId} = useParams();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");
    const [followUp, setFollowUp] = useState(0);
    const [workHistoryList,setWorkHistoryList] = useState([]);
    const [accountDrafts, setAccountDrafts] = useState([]);
    const [mostRecentedWork, setMostRcentedWork] = useState(null);
    const [savingAccountEntity, setSavingAccountEntity] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [credit, setCredit] = useState(null);
    const [costoMensual, setCostoMensual] = useState(0);
    const [costoTotal, setCostoTotal] = useState(0);
    const [showAnimation, setShowAnimation] = useState(false);
    const [showAnimation2, setShowAnimation2] = useState(false);
    const [showAnimation3, setShowAnimation3] = useState(false);
    const creditCriteria = [
        "La relación cuota/ingreso no debe ser mayor al 35%.",
        "Un historial con morosidad reciente resultará en rechazo.",
        "Se evaluará la antigüedad en el empleo actual (mínimo 1-2 años).",
        "Para trabajadores independientes, se revisan los ingresos de los últimos 2 años.",
        "El total de deudas no debe superar el 50% de los ingresos mensuales.",
        "El porcentaje financiable depende del tipo de propiedad (ej. 80% para primera vivienda).",
        "La edad máxima permitida al finalizar el crédito es de 75 años.",
        "Si la evaluación de capacidad de ahorro falla."
    ];

    const savingsCapacityCriteria = [
        "Debe tener un saldo mínimo del 10% del préstamo solicitado.",
        "Debe mantener saldo positivo en los últimos 12 meses sin retiros significativos.",
        "Los depósitos regulares deben representar al menos el 5% de sus ingresos mensuales.",
        "El saldo acumulado debe ser del 20% (menos de 2 años) o del 10% (más de 2 años).",
        "Retiros mayores al 30% del saldo en los últimos 6 meses se consideran negativos."
    ];

    useEffect(() => {
        //Cargamos el workHistory
        creditEvaluation.getWorkHistoriesByCustomerId(id)
            .then(response => {
                setWorkHistoryList(response.data);
                creditEvaluation.getMostRecentWorkHistory(response.data)
                    .then((response) => {
                        setMostRcentedWork(response.data);
                    })
            })
            .catch(error => {
                console.log("Error al obtener el historial del trabajo", error);
            });
        //Cargamos el savingAccount
        trackingRequests.getSavingAccountByCustomerId(id)
            .then((response) => {
                setSavingAccountEntity(response.data);
                creditSimulator.getAccountDraftsBySavingAccountId(response.data.id)
                    .then((response) => {
                        setAccountDrafts(response.data);
                    })
            })
        //Cargamos el customer
        userRegistration.getCustomerById(id)
            .then((response) => {
                setCustomer(response.data);
            })
        //Cargamos el credito en cuestion
        creditApplication.getCreditById(creditId)
            .then((response) => {
                console.log("Credito:", JSON.stringify(response.data, null, 2));
                setCredit(response.data);
                setFollowUp(response.data.followUp);
                creditApplication.calculateMonthlyFee(response.data)
                    .then((response) => {
                        setCostoMensual(response.data);
                    })
                creditApplication.calculateTotalCost(response.data)
                    .then((response) => {
                        setCostoTotal(response.data);
                    })
            })
            .catch((error) => {
                console.error("Error al obtener la evaluación de crédito:", error);
                setErrorMessage("Hubo un problema al obtener la evaluación de crédito. Intente nuevamente.");
            });
    }, [creditId, id]);

    const handleNavigateToEvaluation = () => {
        navigate(`/listCredit/${id}`);
    };

    const handleFollowUp = async (status) => {
        await trackingRequests.modifyFollowUp(creditId, status);
        setFollowUp(status);
        switch (status) {
            case 3:
                break;
            case 4:
                break;
            case 5:
                console.log("Resultado: evaluación fallida");
                setShowAnimation2(true);

                console.log("Animación activada");
                // Ocultar la animación después de 3 segundos
                setTimeout(() => {
                    setShowAnimation2(false);
                    console.log("Animación desactivada");
                }, 3000);
                break;
            case 6:
                await messageFailed();
                break;
            case 7:
                await messageCancel();
                break;
            case 8:
                await messageSuccess();
                console.log("Resultado: evaluación fallida");
                setShowAnimation3(true);

                console.log("Animación activada");
                // Ocultar la animación después de 3 segundos
                setTimeout(() => {
                    setShowAnimation3(false);
                    console.log("Animación desactivada");
                }, 3000);
                break;
            default:
                break;
        }
    };

    const evaluation = async () => {
        if (costoMensual === -1) {
            console.log("No evaluo correctamente en el calculo para monthlyFee");
            setFollowUp(-6);
            trackingRequests.modifyFollowUp(creditId, -6).then(() => {
                setErrorMessage("Hubo un problema al checkear el monto financiado máximo.");
            });
            return -1;
        }

        try {
            const feeIncomeRes = await creditEvaluation
                .evaluateFeeIncome(costoMensual, mostRecentedWork.income)
                .catch((err) => {
                    console.error("Error en evaluateFeeIncome:", err);
                    throw err;
                });

            const jobSeniorityRes = await creditEvaluation
                .evaluateJobSeniority(savingAccountEntity.antique)
                .catch((err) => {
                    console.error("Error en evaluateJobSeniority:", err);
                    throw err;
                });

            const debtIncomeRes = await creditEvaluation
                .evaluateDebtIncome(mostRecentedWork.income, mostRecentedWork.debt, costoMensual)
                .catch((err) => {
                    console.error("Error en evaluateDebtIncome:", err);
                    throw err;
                });

            const ageRes = await creditEvaluation
                .evaluateApplicantAge(customer.yearBirth, credit.timeLimit)
                .catch((err) => {
                    console.error("Error en evaluateApplicantAge:", err);
                    throw err;
                });

            console.log("Resultados de las evaluaciones:", {
                feeIncomeRes,
                jobSeniorityRes,
                debtIncomeRes,
                ageRes,
            });

            const capacitySavingsRes = await creditEvaluation
                .evaluateCapacitySavings(
                    savingAccountEntity.amount,
                    savingAccountEntity.antique,
                    credit.amountWanted,
                    id,
                    mostRecentedWork
                )
                .catch((err) => {
                    console.log("Monto cuenta de ahorro:", savingAccountEntity.amount);
                    console.log("Antique:", savingAccountEntity.antique);
                    console.log("cuanto quiero:", credit.amountWanted);
                    console.log("id del cliente:", id);
                    console.log("trabajo mas reciente:", mostRecentedWork);
                    console.error("Error en evaluateCapacitySavings:", err);
                    throw err;
                });

            console.log("Resultados de las evaluaciones:", {
                feeIncomeRes,
                jobSeniorityRes,
                debtIncomeRes,
                ageRes,
                capacitySavingsRes,
            });

            if (
                feeIncomeRes.data === 0 ||
                jobSeniorityRes.data === 0 ||
                debtIncomeRes.data === 0 ||
                ageRes.data === 0 ||
                capacitySavingsRes.data <= 2
            ) {
                // Manejo de fallos específicos (como en el código original)
                if (feeIncomeRes.data === 0) {
                    setErrorMessage("La relación cuota/ingreso es mayor al 35%.");
                    console.log("Fallo en relacion cuota/ingreso", costoMensual, mostRecentedWork.income);
                }
                if (jobSeniorityRes.data === 0) {
                    setErrorMessage("La antiguedad con su empleo actual no cumple con el mínimo establecido.");
                    console.log("Fallo en antiguedad cuenta de ahorro", savingAccountEntity.antique);
                }
                if (debtIncomeRes.data === 0) {
                    setErrorMessage("El total de deudas supera el 50% de los ingresos mensuales.");
                    console.log("Fallo en relacion deuda/ingreso", mostRecentedWork.income, mostRecentedWork.debt, costoMensual);
                }
                if (ageRes.data === 0) {
                    setErrorMessage("Tu edad no cumple con los términos de ManageLoans.");
                    console.log("Fallo en la edad", customer.yearBirth, credit.timeLimit);
                }
                if (capacitySavingsRes.data <= 2) {
                    setErrorMessage("Fallaste en la capacidad de ahorro.");
                    console.log(
                        "Fallo en la capacidad de ahorro",
                        savingAccountEntity.amount,
                        savingAccountEntity.antique,
                        credit.amountWanted,
                        id,
                        mostRecentedWork
                    );
                }

                setFollowUp(-6);
                await trackingRequests.modifyFollowUp(creditId, -6);
                console.log("Resultado: evaluación fallida");
                setShowAnimation(true);
                setTimeout(() => setShowAnimation(false), 3000);
            } else {
                setFollowUp(2);
                await trackingRequests.modifyFollowUp(creditId, 2);
                await trackingRequests.setExecutiveWorking(creditId);
            }
        } catch (error) {
            console.error("Error en la evaluación:", error);
            setFollowUp(-6);
            setErrorMessage("Hubo un error al realizar las evaluaciones.");
        }
    };

    const handleEvaluation = async () => {
        setErrorMessage("");
        try {
            const result = evaluation();
            if (result === -1) {
                await messageFailed();
            }
        } catch{
            setErrorMessage("Ocurrió un error en la evaluación.");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const message = async (content) => {
        const date = new Date().toISOString().split('T')[0];
        const customerHistory2 = { customerId: id, content, date };
        await userRegistration.saveCustomerHistory(customerHistory2);
    };

    const messageSuccess = async () => await message("Credito evaluado aprobado");
    const messageCancel = async () => await message("Credito evaluado cancelado por cliente");
    const messageFailed = async () => await message("Credito evaluado rechazado");

    // Helper functions
    const getCreditType = (type) => {
        switch (type) {
            case 1:
                return "Crédito de primera vivienda";
            case 2:
                return "Crédito de segunda vivienda";
            case 3:
                return "Crédito de propiedades comerciales";
            case 4:
                return "Crédito de remodelación";
            default:
                return "Tipo desconocido";
        }
    };

    const getDocumentButtons = (typeLoan) => {
        const buttons = [];

        // Mapear los textos de los botones según el typeLoan
        const loanDocuments = {
            1: ["Comprobante de ingresos", "Certificado de avalúo", "Historial crediticio"],
            2: ["Comprobante de ingresos", "Certificado de avalúo", "Escritura de primera vivienda", "Historial crediticio"],
            3: ["Estado financiero del negocio", "Comprobante de ingresos", "Certificado de avalúo", "Plan de negocios"],
            4: ["Comprobante de ingresos", "Presupuesto de remodelación", "Certificado de avalúo actualizado"]
        };
        // Obtener los textos correspondientes al typeLoan
        const documents = loanDocuments[typeLoan] || [];
        // Verificar los archivos PDF disponibles
        const pdfFiles = [
            credit.pdfFilePath1,
            credit.pdfFilePath2,
            credit.pdfFilePath3,
            credit.pdfFilePath4
        ];
        // Generar botones para los documentos disponibles
        documents.forEach((doc, index) => {
            if (pdfFiles[index]) { // Si el archivo PDF existe para este documento
                buttons.push(
                    <Button
                        key={index}
                        onClick={() => creditApplication.downloadPdf(creditId, index + 1)}
                        sx={{ marginBottom: 1 }}
                    >
                        Descargar {doc}
                    </Button>
                );
            }
        });
        // Si no hay ningún documento disponible, mostrar un mensaje
        if (buttons.length === 0) {
            buttons.push(
                <Typography key="no-pdf" variant="body1">
                    No hay documentos disponibles.
                </Typography>
            );
        }
        return buttons;
    };

    const CriteriaList = ({ title, items }) => {
        return (
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            {title}
                        </Typography>
                        <Divider sx={{ marginBottom: 2 }} />
                        <List>
                            {items.map((item, index) => (
                                <ListItem key={index}>
                                    <ListItemText primary={item} />
                                </ListItem>
                            ))}
                        </List>
                    </CardContent>
                </Card>
            </Grid>
        );
    };

    const CreditInformation = ({ credit, costoMensual, costoTotal }) => {
        return (
            <Grid item xs={12}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Información del Crédito Solicitado
                        </Typography>
                        <Divider sx={{ marginBottom: 2 }} />
                        <ul>
                            <li>
                                <Typography variant="body2">Tipo de crédito: {getCreditType(credit.typeLoan)}</Typography>
                            </li>
                            <li>
                                <Typography variant="body2">Monto solicitado: {credit.amountWanted} mil pesos</Typography>
                            </li>
                            <li>
                                <Typography variant="body2">Monto de la propiedad: {credit.amountMax} mil pesos</Typography>
                            </li>
                            <li>
                                <Typography variant="body2">Rango de interés solicitado: {credit.interestRate}%</Typography>
                            </li>
                            <li>
                                <Typography variant="body2">Tiempo designado: {credit.timeLimit} años</Typography>
                            </li>
                            <li>
                                <Typography variant="body2">Costo mensual: {costoMensual} mil pesos</Typography>
                            </li>
                            <li>
                                <Typography variant="body2">Costo total: {costoTotal} mil pesos</Typography>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </Grid>
        );
    };

    return (
        <Box sx={{padding: '20px', maxWidth: '600px', margin: 'auto', border: '1px solid #ddd', borderRadius: '8px'}}>
            {showAnimation && (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                        position: "fixed", // Cambiado a fixed para superponer todo
                        top: 0,
                        left: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semitransparente
                        zIndex: 1000, // Asegúrate de que esté en el nivel superior
                    }}
                >
                    <Lottie
                        animationData={successAnimationData}
                        loop={false}
                        style={{ width: "80%", height: "80%" }}
                    />
                </Box>
            )}
            {showAnimation2 && (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                        position: "fixed", // Cambiado a fixed para superponer todo
                        top: 0,
                        left: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semitransparente
                        zIndex: 1000, // Asegúrate de que esté en el nivel superior
                    }}
                >
                    <Lottie
                        animationData={moneyAnimation}
                        loop={false}
                        style={{ width: "80%", height: "80%" }}
                    />
                </Box>
            )}
            {showAnimation3 && (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                        position: "fixed", // Cambiado a fixed para superponer todo
                        top: 0,
                        left: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo semitransparente
                        zIndex: 1000, // Asegúrate de que esté en el nivel superior
                    }}
                >
                    <Lottie
                        animationData={carAnimation}
                        loop={false}
                        style={{ width: "80%", height: "80%" }}
                    />
                </Box>
            )}

            <Typography variant="h4" sx={{textAlign: 'center', marginBottom: '20px'}}>
                Evaluación de Crédito
            </Typography>
            <LoanTypesTable/>

            {credit ? (
                (followUp === 0 || followUp === 1) ? (
                    <>
                        {/* Información del Crédito */}
                        <Typography variant="body1" paragraph>
                            Con la información proporcionada sobre el crédito, evaluaremos si cumple con los requisitos establecidos por ManageLoans para verificar que todo esté en orden.
                            Para continuar, haga clic en el botón [Evaluar Crédito]. Este proceso verificará automáticamente si el crédito cumple con los criterios.
                            Sin embargo, para mayor seguridad, más adelante le mostraremos la información del cliente junto con los detalles del crédito, de modo que pueda confirmar si todo
                            lo solicitado por el cliente está en regla antes de tomar una decisión final sobre si otorgar o no el crédito.
                        </Typography>

                        <Grid container spacing={12}>
                            {/* Otro contenido */}
                            <CreditInformation
                                credit={credit}
                                costoMensual={costoMensual}
                                costoTotal={costoTotal}
                            />
                            {/* Otro contenido */}
                        </Grid>

                        {/* Botón para Evaluar Crédito */}
                        <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleEvaluation}
                                startIcon={<CalculateIcon />}
                            >
                                Evaluar Crédito
                            </Button>
                        </Box>
                    </>
                ) : null
            ) : (
                <Typography variant="body1">Cargando información de crédito...</Typography>
            )}

            {credit && savingAccountEntity && workHistoryList && customer && accountDrafts ? (
                followUp === 2 ? (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Grid item xs={12}>
                                <Typography variant="body1" paragraph>
                                    Para evaluar, tome en cuenta lo siguiente. Si alguno de estos puntos no se cumple o si los datos no son coherentes, rechace la solicitud inmediatamente:
                                </Typography>
                            </Grid>

                            {/* Lista de criterios */}
                            <Grid container spacing={3}>
                                <CriteriaList title="Criterios para Evaluar el Crédito" items={creditCriteria} />
                                <CriteriaList title="Evaluación de la Capacidad de Ahorro" items={savingsCapacityCriteria} />
                                <Grid item xs={12}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="body1" paragraph>
                                                ¿Cumplo con la capacidad de ahorro?
                                            </Typography>
                                            <Typography variant="body2" paragraph>
                                                <strong>Aprobación:</strong> Cumple con todas las reglas.
                                            </Typography>
                                            <Typography variant="body2" paragraph>
                                                <strong>Rechazo:</strong> Cumple con menos de 2 reglas.
                                            </Typography>
                                            <Typography variant="body2" paragraph>
                                                Recuerda que aunque apruebes la capacidad de ahorro, pueden desaprobarte por los otros criterios de evaluación.
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Datos del Solicitante
                                    </Typography>
                                    <Divider sx={{marginBottom: 2}}/>
                                    <Typography variant="body1">Nombre: {customer.name}</Typography>
                                    <Typography variant="body1">Año de nacimiento: {customer.yearBirth}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Historial de trabajo */}
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Historial de Trabajo
                                    </Typography>
                                    <Divider sx={{marginBottom: 2}}/>
                                    <TableContainer component={Paper}>
                                        <Table size="small" aria-label="work history table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="right" sx={{fontWeight: "bold"}}>
                                                        Ingreso
                                                    </TableCell>
                                                    <TableCell align="right" sx={{fontWeight: "bold"}}>
                                                        Deuda
                                                    </TableCell>
                                                    <TableCell align="right" sx={{fontWeight: "bold"}}>
                                                        Historia crediticia
                                                    </TableCell>
                                                    <TableCell align="right" sx={{fontWeight: "bold"}}>
                                                        Fecha
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {workHistoryList.map((history) => (
                                                    <TableRow key={history.id}>
                                                        <TableCell align="right">{history.income}</TableCell>
                                                        <TableCell align="right">{history.debt}</TableCell>
                                                        <TableCell align="right">{history.creditHistory}</TableCell>
                                                        <TableCell align="right">{formatDate(history.date)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Cuenta de ahorro */}
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Cuenta de Ahorro
                                    </Typography>
                                    <Divider sx={{marginBottom: 2}}/>
                                    <Typography variant="body1">Antigüedad: {savingAccountEntity.antique} años</Typography>
                                    {savingAccountEntity.self_employed_worker === 1 && (
                                        <Typography variant="body1">Trabajador autónomo</Typography>
                                    )}
                                    {savingAccountEntity.self_employed_worker === 0 && (
                                        <Typography variant="body1">No es trabajador autónomo</Typography>
                                    )}
                                    <Typography variant="body1">
                                        Monto de la cuenta: {savingAccountEntity.amount} mil pesos
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Historial de giros */}
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Historial de Giros
                                    </Typography>
                                    <Divider sx={{marginBottom: 2}}/>
                                    <TableContainer component={Paper}>
                                        <Table size="small" aria-label="drafts history table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="right" sx={{fontWeight: "bold"}}>
                                                        Giro
                                                    </TableCell>
                                                    <TableCell align="right" sx={{fontWeight: "bold"}}>
                                                        Monto en ese momento
                                                    </TableCell>
                                                    <TableCell align="right" sx={{fontWeight: "bold"}}>
                                                        Fecha
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {accountDrafts.map((history) => (
                                                    <TableRow key={history.id}>
                                                        <TableCell align="right">{history.drafts}</TableCell>
                                                        <TableCell align="right">{history.amountAtThatTime}</TableCell>
                                                        <TableCell align="right">{formatDate(history.date)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid container spacing={12}>
                            {/* Otro contenido */}
                            <CreditInformation
                                credit={credit}
                                costoMensual={costoMensual}
                                costoTotal={costoTotal}
                            />
                            {/* Otro contenido */}
                        </Grid>

                        {/* Botones de descarga */}
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Documentos Relacionados
                                    </Typography>
                                    <Divider sx={{marginBottom: 2}}/>
                                    <ButtonGroup orientation="vertical" fullWidth>
                                        {getDocumentButtons(credit.typeLoan, creditApplication, creditId)}
                                    </ButtonGroup>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Botones de seguimiento */}
                        <Grid item xs={12}>
                            <Button variant="contained" color="secondary" onClick={() => handleFollowUp(3)}>
                                Aprobar solicitud de crédito
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                sx={{marginLeft: 2}}
                                onClick={() => handleFollowUp(-6)}
                            >
                                Rechazar solicitud de crédito
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                sx={{marginLeft: 2}}
                                onClick={() => handleFollowUp(-7)}
                            >
                                Rechazar como cliente
                            </Button>
                        </Grid>
                    </Grid>
                ) : null
            ) : (
                <Typography variant="body1">Cargando información...</Typography>
            )}

            {credit ? (
                followUp === 3 ? (
                    <>
                        <Typography variant="body1" color="textSecondary">
                            La solicitud ha sido evaluada y cumple con los criterios básicos del
                            banco, por lo que ha sido pre-aprobada. En este estado, usted decide si cancelar el crédito o proseguir.
                        </Typography>
                        <Grid container spacing={12}>
                            {/* Otro contenido */}
                            <CreditInformation
                                credit={credit}
                                costoMensual={costoMensual}
                                costoTotal={costoTotal}
                            />
                            {/* Otro contenido */}
                        </Grid>

                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleFollowUp(4)}
                            style={{marginTop: '20px'}}
                        >
                            Aceptar condiciones
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleFollowUp(-7)}
                            style={{marginTop: '20px'}}
                        >
                            Rechazar
                        </Button>
                    </>
                ) : null
            ) : (
                <Typography variant="body1">Cargando información de crédito...</Typography>
            )}

            {(credit && savingAccountEntity && workHistoryList && customer && accountDrafts) ? (
                followUp === 4 ? (
                    <>
                        <Typography variant="body1" color="textSecondary">
                            La solicitud se encuentra en proceso de aprobación final. Aquí se revisan los detalles
                            finales, se emiten los contratos y se preparan los documentos legales.
                        </Typography>
                        <Grid container spacing={3}>
                            {/* Datos del solicitante */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Datos del Solicitante
                                        </Typography>
                                        <Divider sx={{marginBottom: 2}}/>
                                        <Typography variant="body1">Nombre: {customer.name}</Typography>
                                        <Typography variant="body1">Año de nacimiento: {customer.yearBirth}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Historial de trabajo */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Historial de Trabajo
                                        </Typography>
                                        <Divider sx={{marginBottom: 2}}/>
                                        <TableContainer component={Paper}>
                                            <Table size="small" aria-label="work history table">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell align="right" sx={{fontWeight: "bold"}}>
                                                            Ingreso
                                                        </TableCell>
                                                        <TableCell align="right" sx={{fontWeight: "bold"}}>
                                                            Deuda
                                                        </TableCell>
                                                        <TableCell align="right" sx={{fontWeight: "bold"}}>
                                                            Historia crediticia
                                                        </TableCell>
                                                        <TableCell align="right" sx={{fontWeight: "bold"}}>
                                                            Fecha
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {workHistoryList.map((history) => (
                                                        <TableRow key={history.id}>
                                                            <TableCell align="right">{history.income}</TableCell>
                                                            <TableCell align="right">{history.debt}</TableCell>
                                                            <TableCell align="right">{history.creditHistory}</TableCell>
                                                            <TableCell
                                                                align="right">{formatDate(history.date)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Cuenta de ahorro */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Cuenta de Ahorro
                                        </Typography>
                                        <Divider sx={{marginBottom: 2}}/>
                                        <Typography
                                            variant="body1">Antigüedad: {savingAccountEntity.antique} años</Typography>
                                        {savingAccountEntity.self_employed_worker === 1 && (
                                            <Typography variant="body1">Trabajador autónomo</Typography>
                                        )}
                                        {savingAccountEntity.self_employed_worker === 0 && (
                                            <Typography variant="body1">No es trabajador autónomo</Typography>
                                        )}
                                        <Typography variant="body1">
                                            Monto de la cuenta: {savingAccountEntity.amount} mil pesos
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Historial de giros */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Historial de Giros
                                        </Typography>
                                        <Divider sx={{marginBottom: 2}}/>
                                        <TableContainer component={Paper}>
                                            <Table size="small" aria-label="drafts history table">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell align="right" sx={{fontWeight: "bold"}}>
                                                            Giro
                                                        </TableCell>
                                                        <TableCell align="right" sx={{fontWeight: "bold"}}>
                                                            Monto en ese momento
                                                        </TableCell>
                                                        <TableCell align="right" sx={{fontWeight: "bold"}}>
                                                            Fecha
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {accountDrafts.map((history) => (
                                                        <TableRow key={history.id}>
                                                            <TableCell align="right">{history.drafts}</TableCell>
                                                            <TableCell
                                                                align="right">{history.amountAtThatTime}</TableCell>
                                                            <TableCell
                                                                align="right">{formatDate(history.date)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid container spacing={12}>
                                {/* Otro contenido */}
                                <CreditInformation
                                    credit={credit}
                                    costoMensual={costoMensual}
                                    costoTotal={costoTotal}
                                />
                                {/* Otro contenido */}
                            </Grid>

                            {/* Botones de descarga */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Documentos Relacionados
                                        </Typography>
                                        <Divider sx={{marginBottom: 2}}/>
                                        <ButtonGroup orientation="vertical" fullWidth>
                                            {getDocumentButtons(credit.typeLoan, creditApplication, creditId)}
                                        </ButtonGroup>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleFollowUp(5)}
                            style={{marginTop: '20px'}}
                        >
                            Aceptar tras las últimas verificaciones
                        </Button>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleFollowUp(-6)}
                            style={{marginTop: '20px'}}
                        >
                            Rechazar
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleFollowUp(-7)}
                            style={{marginTop: '20px'}}
                        >
                            Rechazar como cliente
                        </Button>
                    </>
                ) : null
            ) : (
                <Typography variant="body1">Cargando información de crédito...</Typography>
            )}

            {credit ? (
                followUp === 5 ? (
                    <>
                        <Typography variant="body1" color="textSecondary">
                            La solicitud ha sido aprobada y está lista para el desembolso. El cliente
                            recibe la confirmación y se programa la firma del contrato.
                        </Typography>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleFollowUp(8)}
                            style={{marginTop: '20px'}}
                        >
                            Programar desembolso
                        </Button>
                    </>
                ) : null
            ) : (
                <Typography variant="body1">Cargando información de crédito...</Typography>
            )}


            {credit ? (
                followUp === -6 ? (
                    // Mensaje principal en caso de rechazo del crédito
                    <Grid item xs={12}>
                        <Grid item xs={12}>
                            <Typography variant="body1" paragraph>
                                Su crédito fue rechazado. Para su conocimiento, aqui tiene los criterios que se utilizan para evaluar los créditos. Si no vee errores,
                                el ejecutivo rechazo su crédito por incoherencias en los datos ingresados aunque haya pasado todas las pruebas necesarias.
                            </Typography>
                        </Grid>

                        <Grid container spacing={3}>
                            <CriteriaList title="Criterios para Evaluar el Crédito" items={creditCriteria} />
                            <CriteriaList title="Evaluación de la Capacidad de Ahorro" items={savingsCapacityCriteria} />
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="body1" paragraph>
                                            ¿Cumplo con la capacidad de ahorro?
                                        </Typography>
                                        <Typography variant="body2" paragraph>
                                            <strong>Aprobación:</strong> Cumple con todas las reglas.
                                        </Typography>
                                        <Typography variant="body2" paragraph>
                                            <strong>Rechazo:</strong> Cumple con menos de 2 reglas.
                                        </Typography>
                                        <Typography variant="body2" paragraph>
                                            Recuerda que aunque apruebes la capacidad de ahorro, pueden desaprobarte por los otros criterios de evaluación.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>
                ) : null
            ) : (
                // Mensaje de carga mientras se obtiene la información de crédito
                <Typography variant="body1">Cargando información de crédito...</Typography>
            )}

            {credit ? (
                followUp === -7 ? (
                    <Typography variant="body1" color="textSecondary">
                        EL crédito ha sido eliminado directamente por el cliente.
                    </Typography>
                ) : null
            ) : (
                <Typography variant="body1">Cargando información de crédito...</Typography>
            )}

            {credit ? (
                followUp === 8 ? (
                    <>
                        <Typography variant="body1" color="textSecondary">
                            La solicitud ha sido aprobada y se está ejecutando el proceso de
                            desembolso del monto aprobado. Esto incluye la transferencia de fondos al cliente o al
                            vendedor de la propiedad.
                        </Typography>
                    </>
                ) : null
            ) : (
                <Typography variant="body1">Cargando información de crédito...</Typography>
            )}
                <div style={{display: "flex", justifyContent: "center", marginTop: "0.5rem"}}>
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleNavigateToEvaluation()}
                        >
                            Ir a la lista de créditos
                        </Button>
                    </Box>
                </div>

                <div style={{display: "flex", justifyContent: "center", marginTop: "0.5rem"}}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate(`/listCustomer`)}
                    >
                        Regresar a la Lista de Clientes
                    </Button>
                </div>

                {errorMessage && (
                    <Box sx={{marginTop: '20px', color: 'red'}}>
                        <Typography variant="body2">{errorMessage}</Typography>
                    </Box>
                )}
        </Box>
);
};
export default CreditEvaluation;