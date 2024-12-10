import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {Box, Button, ButtonGroup, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, CardContent, Grid, Divider} from "@mui/material";
import CalculateIcon from '@mui/icons-material/Calculate';
import creditEvaluation from "../services/credit-evaluation.js";
import creditApplication from "../services/credit-application.js";
import trackingRequests from "../services/tracking-requests.js";
import creditSimulator from "../services/credit-simulator.js";
import {LoanTypesTable} from "./functions.jsx"
import userRegistration from "../services/user-registration.js";

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
                break;
            case 6:
                await messageFailed();
                break;
            case 7:
                await messageCancel();
                break;
            case 8:
                await messageSuccess();
                break;
            default:
                break;
        }
    };


    const evaluation = () => {
        if (costoMensual === -1) {
            console.log("No evaluo correctamente en el calculo para monthlyFee");
            setFollowUp(-6);
            trackingRequests.modifyFollowUp(creditId, -6)
                .then(() => {
                    setErrorMessage("Hubo un problema al checkear el monto financiado máximo.");
                });
            return -1;
        }

        Promise.all([
            creditEvaluation.evaluateFeeIncome(costoMensual, mostRecentedWork.income),
            creditEvaluation.evaluateJobSeniority(savingAccountEntity.antique),
            creditEvaluation.evaluateDebtIncome(mostRecentedWork.income, mostRecentedWork.debt, costoMensual),
            creditEvaluation.evaluateApplicantAge(customer.yearBirth, credit.timeLimit),
            creditEvaluation.evaluateCapacitySavings(savingAccountEntity.amount, savingAccountEntity.antique, credit.amountWanted, id, mostRecentedWork)
        ])
            .then(([feeIncomeRes, jobSeniorityRes, debtIncomeRes, ageRes, capacitySavingsRes]) => {
                if (feeIncomeRes.data === 0 || jobSeniorityRes.data === 0 || debtIncomeRes.data === 0 || ageRes.data === 0 || capacitySavingsRes.data <= 2) {
                    if(feeIncomeRes.data === 0){
                        console.log("Fallo en relacion cuota/ingreso");
                        console.log(costoMensual);
                        console.log(mostRecentedWork.income);
                    }
                    if(jobSeniorityRes.data === 0){
                        console.log("Fallo en antiguedad cuenta de ahorro");
                        console.log(savingAccountEntity.antique);
                    }
                    if(debtIncomeRes.data === 0){
                        console.log("Fallo en relacion deuda/ingreso");
                        console.log(mostRecentedWork.income);
                        console.log(mostRecentedWork.debt);
                        console.log(costoMensual);
                    }
                    if(ageRes.data === 0){
                        console.log("Fallo en la edad");
                        console.log(customer.yearBirth);
                        console.log(credit.timeLimit);
                    }
                    if(capacitySavingsRes.data === 0){
                        console.log("Fallo en la capacidad de ahorro");
                        console.log(savingAccountEntity.amount);
                        console.log(savingAccountEntity.antique);
                        console.log(credit.amountWanted);
                        console.log(id);
                        console.log(mostRecentedWork);
                    }
                    setFollowUp(-6);
                    trackingRequests.modifyFollowUp(creditId, -6)
                        .then(() => {
                            setErrorMessage("Rechazado en una de las evaluaciones.");
                        });
                } else {
                    setFollowUp(2);
                    trackingRequests.modifyFollowUp(creditId, 2)
                        .then(async () => {
                            await trackingRequests.setExecutiveWorking(creditId);
                        });
                }
            })
            .catch(() => {
                setFollowUp(-6);
                setErrorMessage("Hubo un error al realizar las evaluaciones.");
            });
    };

    const handleEvaluation = async () => {
        setErrorMessage("");
        try {
            const result = evaluation();
            if (result === -1) {
                await messageFailed();
            }
        } catch (error) {
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


    return (
        <Box sx={{ padding: '20px', maxWidth: '600px', margin: 'auto', border: '1px solid #ddd', borderRadius: '8px' }}>
            <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: '20px' }}>
                Evaluación de Crédito
            </Typography>
            <LoanTypesTable />

            {credit ? (
                (followUp === 0 || followUp === 1) ? (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleEvaluation}
                            startIcon={<CalculateIcon />}
                        >
                            Evaluar Crédito
                        </Button>
                    </Box>
                </>
                )   :  null
            ) : (
                <Typography variant="body1">Cargando información de crédito...</Typography>
            )}

            {credit && savingAccountEntity && workHistoryList && customer && accountDrafts ? (
                followUp === 2 ? (
                    <Grid container spacing={3}>
                        {/* Datos del solicitante */}
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Datos del Solicitante
                                    </Typography>
                                    <Divider sx={{ marginBottom: 2 }} />
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
                                    <Divider sx={{ marginBottom: 2 }} />
                                    <TableContainer component={Paper}>
                                        <Table size="small" aria-label="work history table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                        Ingreso
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                        Deuda
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                        Historia crediticia
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
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
                                    <Divider sx={{ marginBottom: 2 }} />
                                    <Typography variant="body1">Antigüedad: {savingAccountEntity.antique}</Typography>
                                    {savingAccountEntity.self_employed_worker === 1 && (
                                        <Typography variant="body1">Trabajador autónomo</Typography>
                                    )}
                                    <Typography variant="body1">
                                        Monto de la cuenta: {savingAccountEntity.amount}
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
                                    <Divider sx={{ marginBottom: 2 }} />
                                    <TableContainer component={Paper}>
                                        <Table size="small" aria-label="drafts history table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                        Giro
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                        Monto en ese momento
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
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

                        {/* Información del crédito solicitado */}
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Información del Crédito Solicitado
                                    </Typography>
                                    <Divider sx={{ marginBottom: 2 }} />
                                    <ul>
                                        <li>Tipo de crédito: {getCreditType(credit.typeLoan)}</li>
                                        <li>Monto solicitado: {credit.amountWanted}</li>
                                        <li>Monto de la propiedad: {credit.amountMax}</li>
                                        <li>Rango de interés solicitado: {credit.interestRate}</li>
                                        <li>Tiempo designado: {credit.timeLimit}</li>
                                        <li>Costo mensual: {costoMensual}</li>
                                        <li>Costo total: {costoTotal}</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Botones de descarga */}
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Documentos Relacionados
                                    </Typography>
                                    <Divider sx={{ marginBottom: 2 }} />
                                    <ButtonGroup orientation="vertical" fullWidth>
                                        {getDocumentButtons(credit.typeLoan, creditApplication, creditId)}
                                    </ButtonGroup>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Botones de seguimiento */}
                        <Grid item xs={12}>
                            <Button variant="contained" color="primary" onClick={() => handleFollowUp(3)}>
                                Aprobar solicitud de crédito
                            </Button>
                            <Button
                                variant="contained"
                                color="secondary"
                                sx={{ marginLeft: 2 }}
                                onClick={() => handleFollowUp(-6)}
                            >
                                Rechazar solicitud de crédito
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                sx={{ marginLeft: 2 }}
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
                            banco, por lo que ha sido pre-aprobada. En este estado, se presentan las condiciones
                            iniciales del crédito al cliente.
                        </Typography>
                        {/* Información del crédito solicitado */}
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Información del Crédito Solicitado
                                    </Typography>
                                    <Divider sx={{ marginBottom: 2 }} />
                                    <ul>
                                        <li>Tipo de crédito: {getCreditType(credit.typeLoan)}</li>
                                        <li>Monto solicitado: {credit.amountWanted}</li>
                                        <li>Monto de la propiedad: {credit.amountMax}</li>
                                        <li>Rango de interés solicitado: {credit.interestRate}</li>
                                        <li>Tiempo designado: {credit.timeLimit}</li>
                                        <li>Costo mensual: {costoMensual}</li>
                                        <li>Costo total: {costoTotal}</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleFollowUp(4)}
                            style={{ marginTop: '20px' }}
                        >
                            Aceptar condiciones
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleFollowUp(-7)}
                            style={{ marginTop: '20px' }}
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
                                        <Divider sx={{ marginBottom: 2 }} />
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
                                        <Divider sx={{ marginBottom: 2 }} />
                                        <TableContainer component={Paper}>
                                            <Table size="small" aria-label="work history table">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Ingreso
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Deuda
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Historia crediticia
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
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
                                        <Divider sx={{ marginBottom: 2 }} />
                                        <Typography variant="body1">Antigüedad: {savingAccountEntity.antique}</Typography>
                                        {savingAccountEntity.self_employed_worker === 1 && (
                                            <Typography variant="body1">Trabajador autónomo</Typography>
                                        )}
                                        <Typography variant="body1">
                                            Monto de la cuenta: {savingAccountEntity.amount}
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
                                        <Divider sx={{ marginBottom: 2 }} />
                                        <TableContainer component={Paper}>
                                            <Table size="small" aria-label="drafts history table">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Giro
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Monto en ese momento
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
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

                            {/* Información del crédito solicitado */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Información del Crédito Solicitado
                                        </Typography>
                                        <Divider sx={{ marginBottom: 2 }} />
                                        <ul>
                                            <li>Tipo de crédito: {getCreditType(credit.typeLoan)}</li>
                                            <li>Monto solicitado: {credit.amountWanted}</li>
                                            <li>Monto de la propiedad: {credit.amountMax}</li>
                                            <li>Rango de interés solicitado: {credit.interestRate}</li>
                                            <li>Tiempo designado: {credit.timeLimit}</li>
                                            <li>Costo mensual: {costoMensual}</li>
                                            <li>Costo total: {costoTotal}</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Botones de descarga */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Documentos Relacionados
                                        </Typography>
                                        <Divider sx={{ marginBottom: 2 }} />
                                        <ButtonGroup orientation="vertical" fullWidth>
                                            {getDocumentButtons(credit.typeLoan, creditApplication, creditId)}
                                        </ButtonGroup>
                                    </CardContent>
                                </Card>
                            </Grid>


                        </Grid>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleFollowUp(5)}
                            style={{ marginTop: '20px' }}
                        >
                            Aceptar tras las últimas verificaciones
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleFollowUp(-6)}
                            style={{ marginTop: '20px' }}
                        >
                            Rechazar
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleFollowUp(-7)}
                            style={{ marginTop: '20px' }}
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
                            color="primary"
                            onClick={() => handleFollowUp(8)}
                            style={{ marginTop: '20px' }}
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
                    <Typography
                        variant="body1"
                        color="primary"
                        component="div"
                        style={{ marginTop: '20px' }}
                    >
                        {/* Mensaje inicial explicando el rechazo y las recomendaciones */}
                        La solicitud ha sido rechazada tras no pasar las verificaciones para ser considerada, aquí tiene lo que debe saber para mejorar su próxima solicitud de crédito:
                        <br /><br />

                        {/* Reglas explicadas en secciones con títulos destacados */}
                        <strong>R1. Relación Cuota/Ingreso</strong>
                        <ul>
                            <li>La relación cuota/ingreso no debe ser mayor al 35%.</li>
                            <li>Si excede este umbral, la solicitud será rechazada.</li>
                        </ul>

                        <strong>R2. Historial Crediticio del Cliente</strong>
                        <ul>
                            <li>Se revisa el historial crediticio en DICOM.</li>
                            <li>Un historial con morosidad reciente resultará en rechazo.</li>
                        </ul>

                        <strong>R3. Antigüedad Laboral y Estabilidad</strong>
                        <ul>
                            <li>Se evalúa la antigüedad en el empleo actual (mínimo 1-2 años).</li>
                            <li>Para trabajadores independientes, se revisan ingresos de los últimos 2 años.</li>
                        </ul>

                        <strong>R4. Relación Deuda/Ingreso</strong>
                        <ul>
                            <li>El total de deudas no debe superar el 50% de los ingresos mensuales.</li>
                        </ul>

                        <strong>R5. Monto Máximo de Financiamiento</strong>
                        <ul>
                            <li>El porcentaje financiable depende del tipo de propiedad (ej. 80% para primera vivienda).</li>
                        </ul>

                        <strong>R6. Edad del Solicitante</strong>
                        <ul>
                            <li>La edad máxima permitida al finalizar el crédito es de 75 años.</li>
                        </ul>

                        {/* Detalle ampliado del historial crediticio */}
                        <strong>R7. Historial Crediticio del Cliente</strong>
                        <ul>
                            <li>Se evalúa la capacidad de ahorro a través de reglas específicas:</li>

                            {/* Subreglas del historial crediticio */}
                            <ul>
                                <li>
                                    <strong>R71: Saldo Mínimo Requerido</strong>
                                    <ul>
                                        <li>Debe tener un saldo mínimo del 10% del préstamo solicitado.</li>
                                    </ul>
                                </li>

                                <li>
                                    <strong>R72: Historial de Ahorro Consistente</strong>
                                    <ul>
                                        <li>Debe mantener saldo positivo en los últimos 12 meses sin retiros significativos.</li>
                                    </ul>
                                </li>

                                <li>
                                    <strong>R73: Depósitos Periódicos</strong>
                                    <ul>
                                        <li>Depósitos regulares deben representar al menos el 5% de sus ingresos mensuales.</li>
                                    </ul>
                                </li>

                                <li>
                                    <strong>R74: Relación Saldo/Años de Antigüedad</strong>
                                    <ul>
                                        <li>Saldo acumulado del 20% (menos de 2 años) o del 10% (más de 2 años).</li>
                                    </ul>
                                </li>

                                <li>
                                    <strong>R75: Retiros Recientes</strong>
                                    <ul>
                                        <li>Retiros mayores al 30% del saldo en los últimos 6 meses se consideran negativos.</li>
                                    </ul>
                                </li>
                            </ul>

                            {/* Resultado de la evaluación */}
                            <strong>Resultado de la Evaluación</strong>
                            <ul>
                                <li><strong>Aprobación:</strong> Cumple con todas las reglas.</li>
                                <li><strong>Revisión Adicional:</strong> Cumple con 3 o 4 reglas.</li>
                                <li><strong>Rechazo:</strong> Cumple con menos de 2 reglas.</li>
                            </ul>
                        </ul>
                    </Typography>
                ) : null
            ) : (
                // Mensaje de carga mientras se obtiene la información de crédito
                <Typography variant="body1">Cargando información de crédito...</Typography>
            )}

            {credit ? (
                followUp === -7 ? (
                    <Typography variant="body1" color="textSecondary">
                        Cancelada por el cliente
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

            <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleNavigateToEvaluation()}
                >
                    Ir a la lista de créditos
                </Button>
            </Box>

            {errorMessage && (
                <Box sx={{marginTop: '20px', color: 'red'}}>
                    <Typography variant="body2">{errorMessage}</Typography>
                </Box>
            )}
        </Box>
    );
};
export default CreditEvaluation;