import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import { Box, Button, FormControl, TextField, Typography, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import manageService from "../services/user-registration.js";
import creditEvaluationsService from "../services/credit-simulator.js";
import customersService from "../services/credit-application.js";

const CreditEvaluation = () => {
    const { id , creditId} = useParams();
    const navigate = useNavigate();
    const [propertyValue, setPropertyValue] = useState(0);
    const [timeLimit, setTimeLimit] = useState(() => {
        return localStorage.getItem("timeLimit") || 0;
    });
    const [interestRate, setInterestRate] = useState(0);
    const [typeLoan, setTypeLoan] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [greatMessage, setGreatMessage] = useState([]);
    const [creditEvaluationsEntity, setCreditEvaluationsEntity] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [workHistoryList,setWorkHistoryList] = useState([]);
    const [savingAccountEntity, setSavingAccountEntity] = useState(null);
    const [costoMensual, setCostoMensual] = useState(() => {
        return localStorage.getItem("costoMensual") || 0;
    });

    const [costoTotal, setCostoTotal] = useState(() => {
        return localStorage.getItem("costoTotal") || 0;
    });

    useEffect(() => {
        const storedTimeLimit = localStorage.getItem("timeLimit");
        const storedCostoMensual = localStorage.getItem("costoMensual");
        const storedCostoTotal = localStorage.getItem("costoTotal");

        if (storedTimeLimit !== null) setTimeLimit(parseFloat(storedTimeLimit));
        if (storedCostoMensual !== null) setCostoMensual(parseFloat(storedCostoMensual));
        if (storedCostoTotal !== null) setCostoTotal(parseFloat(storedCostoTotal));
    }, []);


    useEffect(() => {
        //Cargamos el workHistory
        manageService.getWorkHistoryByCreditId(creditId)
            .then(response => {
                setWorkHistoryList(response.data);
            })
            .catch(error => {
                console.log("Error al obtener el historial del trabajo", error);
            });
        //Cargamos el credito en cuestion
        creditEvaluationsService.getCreditEvaluationById(creditId)
            .then((response) => {
                console.log("Credito:", JSON.stringify(response.data, null, 2));
                setCreditEvaluationsEntity(response.data);
            })
            .catch((error) => {
                console.error("Error al obtener la evaluación de crédito:", error);
                setErrorMessage("Hubo un problema al obtener la evaluación de crédito. Intente nuevamente.");
            });
        //cargamos el customer
        customersService.getCustomerById(id)
            .then((response) => {
                setCustomer(response.data);
                setSavingAccountEntity(response.data.savingAccount);
            })
            .catch((error) => {
                console.error("Error al obtener al customer:", error);
                setErrorMessage("Hubo un problema al obtener al customer. Intente nuevamente.");
            });
    }, [creditId, id]);

    const handleNavigateToEvaluation = () => {
        navigate(`/listCredit/${customer.id}`);
    };

    const loadCredit = async () => {
        return creditEvaluationsService.getCreditEvaluationById(creditId)
            .then(async (response) => {
                await setCreditEvaluationsEntity(response.data);
            });
    };

    const loadCustomer = async () => {
        return customersService.getCustomerById(id)
            .then(async (response) => {
                await setCustomer(response.data);
            });
    };

    const handleTo3 = async () => {
        await loadCredit();
        await loadCustomer();
        const manageRequest = {
            creditEvaluations: creditEvaluationsEntity,
            customers: customer
        };
        await manageService.checkExecutiveApproves(manageRequest);
    }

    const handleTo4 = async () => {
        await loadCredit();
        await loadCustomer();
        const manageRequest = {
            creditEvaluations: creditEvaluationsEntity,
            customers: customer
        };
        await manageService.checkPreAprovedNext(manageRequest);
    }

    const handleTo5 = async () => {
        await loadCredit();
        await loadCustomer();
        const manageRequest = {
            creditEvaluations: creditEvaluationsEntity,
            customers: customer
        };
        await manageService.checkFinalAproval(manageRequest);
    }

    const handleTo6 = async () => {
        await loadCredit();
        await loadCustomer();
        const manageRequest = {
            creditEvaluations: creditEvaluationsEntity,
            customers: customer
        };
        await manageService.setRejected(manageRequest);
        messageFailed();
        localStorage.removeItem("timeLimit");
        localStorage.removeItem("costoMensual");
        localStorage.removeItem("costoTotal");
    }

    const handleTo7 = async () => {
        await loadCredit();
        await loadCustomer();
        const manageRequest = {
            creditEvaluations: creditEvaluationsEntity,
            customers: customer
        };
        await manageService.checkCustomerCancellation(manageRequest);
        messageCancel();
        localStorage.removeItem("timeLimit");
        localStorage.removeItem("costoMensual");
        localStorage.removeItem("costoTotal");
    }

    const handleTo8 = async () => {
        await loadCredit();
        await loadCustomer();
        const manageRequest = {
            creditEvaluations: creditEvaluationsEntity,
            customers: customer
        };
        await manageService.checkAprovedNext(manageRequest);
        messageSuccess();
        localStorage.removeItem("timeLimit");
        localStorage.removeItem("costoMensual");
        localStorage.removeItem("costoTotal");
    }

    const evaluation = () => {
        const manageRequest = {
            creditEvaluations: creditEvaluationsEntity,
            customers: customer
        }
        manageService
            .checkMaximumFinancingAmount(manageRequest, creditEvaluationsEntity.amount, propertyValue, timeLimit, interestRate/100, typeLoan)
            .then((monthlyFee) => {
                setCostoMensual(monthlyFee.data);
                localStorage.setItem("costoMensual", monthlyFee.data);
                manageService.checkTotalCostCalculation(creditEvaluationsEntity.amount, propertyValue, timeLimit, interestRate/100, typeLoan)
                    .then((totalCost) => {
                        setCostoTotal(totalCost.data);
                        localStorage.setItem("costoTotal", totalCost.data);
                    })
                creditEvaluationsService.getCreditEvaluationById(creditId)
                    .then((response) => {
                        console.log("Credito MFA:", JSON.stringify(response.data, null, 2));
                        if(response.data.status_review === -1){
                            setErrorMessage("Hubo un problema al checkear el monto financiado maximo. Intente nuevamente.");
                            return -1;
                        }else{
                            greatMessage.push("Monto máximo de financiamiento en orden.");
                            //obtener el workHistory mas reciente
                            manageService.getMostRecentWorkHistory(customer.id)
                                .then((response2) => {
                                    const incomeFeeRequest = {
                                        creditEvaluationsEntity: response.data,
                                        workHistoryEntity: response2.data,
                                        customersEntity: customer,
                                        monthlyFee: monthlyFee.data
                                    };
                                    console.log("INCOMEFEEREQUEST:", JSON.stringify(incomeFeeRequest, null, 2));
                                    manageService.checkIncomeeFee(incomeFeeRequest)
                                        .then(() => {
                                            creditEvaluationsService.getCreditEvaluationById(creditId)
                                                .then((response) => {
                                                    console.log("Credito IF:", JSON.stringify(response.data, null, 2));
                                                    if(response.data.status_review === -1){
                                                        setErrorMessage("Hubo un problema al checkear la relacion cuota e ingreso. Intente nuevamente.");
                                                        return -1;
                                                    }else{
                                                        greatMessage.push("Relacion cuota e ingreso en orden.");
                                                        const jobStabilityRequest = {
                                                            creditEvaluationsEntity: response.data,
                                                            savingAccountEntity: savingAccountEntity,
                                                            customersEntity: customer
                                                        };
                                                        manageService.checkJobSeniorStability(jobStabilityRequest)
                                                            .then(() => {
                                                                creditEvaluationsService.getCreditEvaluationById(creditId)
                                                                    .then((response) => {
                                                                        console.log("Credito JST:", JSON.stringify(response.data, null, 2));
                                                                        if(response.data.status_review === -1){
                                                                            setErrorMessage("Hubo un problema al checkear la antiguedad laboral y estabilidad. Intente nuevamente.");
                                                                            return -1;
                                                                        }else{
                                                                            greatMessage.push("Antiguedad laboral y estabilidad en orden.");
                                                                            const relationDebtIncomeRequest = {
                                                                                creditEvaluationsEntity: response.data,
                                                                                workHistoryEntity: response2.data,
                                                                                customersEntity: customer
                                                                            };
                                                                            manageService.checkRelationDebIncome(relationDebtIncomeRequest, monthlyFee.data)
                                                                                .then(() => {
                                                                                    creditEvaluationsService.getCreditEvaluationById(creditId)
                                                                                        .then((response) => {
                                                                                            console.log("Credito RDI:", JSON.stringify(response.data, null, 2));
                                                                                            if(response.data.status_review === -1){
                                                                                                setErrorMessage("Denegada por relacion deuda e ingreso. Intente nuevamente.");
                                                                                                return -1;
                                                                                            }else{
                                                                                                greatMessage.push("Relacion deuda e ingreso en orden.");
                                                                                                const applicantAgeRequest = {
                                                                                                    customersEntity: customer,
                                                                                                    creditEvaluationsEntity: response.data,
                                                                                                    timeLimit: timeLimit
                                                                                                };
                                                                                                manageService.checkApplicantAge(applicantAgeRequest)
                                                                                                    .then(() => {
                                                                                                        creditEvaluationsService.getCreditEvaluationById(creditId)
                                                                                                            .then((response) => {
                                                                                                                console.log("Credito AA:", JSON.stringify(response.data, null, 2));
                                                                                                                if(response.data.status_review === -1){
                                                                                                                    setErrorMessage("Denegada por edad del solicitante. Intente nuevamente.");
                                                                                                                    return -1;
                                                                                                                }else{
                                                                                                                    greatMessage.push("Edad del solicitante en orden.");
                                                                                                                    const jobStabilityRequest2 = {
                                                                                                                        creditEvaluationsEntity: response.data,
                                                                                                                        savingAccountEntity: savingAccountEntity,
                                                                                                                        customersEntity: customer,
                                                                                                                        workHistoryEntity: response2.data
                                                                                                                    };
                                                                                                                    manageService.checkCapacitySavings(jobStabilityRequest2, creditEvaluationsEntity.amount)
                                                                                                                        .then(() => {
                                                                                                                            creditEvaluationsService.getCreditEvaluationById(creditId)
                                                                                                                                .then((response) => {
                                                                                                                                    console.log("Credito CS:", JSON.stringify(response.data, null, 2));
                                                                                                                                    if(response.data.status_review === -1){
                                                                                                                                        setErrorMessage("Denegada la capacidad de ahorro. Intente nuevamente.");
                                                                                                                                        return -1;
                                                                                                                                    }else{
                                                                                                                                        greatMessage.push("Capacidad de ahorro en orden.");
                                                                                                                                        //Tratamos de guardar el response en customer
                                                                                                                                        setCreditEvaluationsEntity(response.data);
                                                                                                                                    }
                                                                                                                                })
                                                                                                                        })
                                                                                                                        .catch((error) => {
                                                                                                                            console.error("Error al checkear la capacidad de ahorro:", error);
                                                                                                                        });
                                                                                                                }
                                                                                                            })
                                                                                                    })
                                                                                                    .catch((error) => {
                                                                                                        console.error("Error al checkear la edad del solicitante:", error);
                                                                                                    });
                                                                                            }
                                                                                        })
                                                                                })
                                                                                .catch((error) => {
                                                                                    console.error("Error al checkear la relacion deuda e ingreso:", error);
                                                                                });
                                                                        }
                                                                    })
                                                            })
                                                            .catch((error) => {
                                                                console.error("Error al checkear la antiguedad laboral y estabilidad:", error);
                                                            });
                                                    }
                                                })
                                        })
                                        .catch((error) => {
                                            console.error("Error al checkear la relacion cuota e ingreso:", error);
                                        });
                                })
                        }
                    })
            })
            .catch((error) => {
                console.error("Error al checkear el monto financiado maximo:", error);
            });
        return 1;
    }

    const isButtonDisabled = () => {
        return !propertyValue || !timeLimit || !interestRate || !typeLoan;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        if (name === 'propertyValue') setPropertyValue(value);
        if (name === 'timeLimit') {
            setTimeLimit(value);
            localStorage.setItem("timeLimit", value);
        }
        if (name === 'interestRate') setInterestRate(value);
        if (name === 'typeLoan') setTypeLoan(value);
    };

    const handleEvaluation = async () => {
        setErrorMessage("");
        setGreatMessage([]);

        const result = await evaluation();

        await creditEvaluationsService.getCreditEvaluationById(creditId)
            .then(async (response) => {
                await setCreditEvaluationsEntity(response.data);
                if (result === -1) {
                    messageFailed();
                    setGreatMessage([]);
                    localStorage.removeItem("timeLimit");
                    localStorage.removeItem("costoMensual");
                    localStorage.removeItem("costoTotal");
                }
            });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const messageSuccess = () => {
        const date = new Date().toISOString().split('T')[0];
        const customerHistory2 = {
            content: "Credito evaluado aprobado",
            date
        };
        const customerRequest = {
            workHistoryEntities: null,
            savingAccountEntity: null,
            creditEvaluationsEntities: null,
            customerHistoryEntities: customerHistory2,
        };
        customersService.updateCustomer(id, customerRequest);
    }

    const messageCancel = () => {
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
    }

    const messageFailed = () => {
        const date = new Date().toISOString().split('T')[0];
        const customerHistory2 = {
            content: "Credito evaluado rechazado",
            date
        };
        const customerRequest = {
            workHistoryEntities: null,
            savingAccountEntity: null,
            creditEvaluationsEntities: null,
            customerHistoryEntities: customerHistory2,
        };
        customersService.updateCustomer(id, customerRequest);
    }

    return (
        <Box sx={{ padding: '20px', maxWidth: '600px', margin: 'auto', border: '1px solid #ddd', borderRadius: '8px' }}>
            <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: '20px' }}>
                Evaluación de Crédito
            </Typography>
            <TableContainer component={Paper} style={{marginBottom: "20px"}}>
                <Table aria-label="tabla de tipos de préstamo">
                    <TableHead>
                        <TableRow>
                            <TableCell>Tipo de Préstamo</TableCell>
                            <TableCell>Plazo Máximo</TableCell>
                            <TableCell>Tasa Interés Anual</TableCell>
                            <TableCell>Monto Máximo de Financiamiento</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>1</TableCell>
                            <TableCell>30 años</TableCell>
                            <TableCell>3.5% - 5%</TableCell>
                            <TableCell>80% del valor de la propiedad</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>2</TableCell>
                            <TableCell>20 años</TableCell>
                            <TableCell>4% - 6%</TableCell>
                            <TableCell>70% del valor de la propiedad</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>3</TableCell>
                            <TableCell>25 años</TableCell>
                            <TableCell>5% - 7%</TableCell>
                            <TableCell>60% del valor de la propiedad</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>4</TableCell>
                            <TableCell>15 años</TableCell>
                            <TableCell>4.5% - 6%</TableCell>
                            <TableCell>50% del valor de la propiedad</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            <Typography variant="h5" sx={{ textAlign: 'center', marginBottom: '20px' }}>
                Monto deseado declarado en la creación del crédito: {creditEvaluationsEntity ? creditEvaluationsEntity.amount : 'Cargando...'}
            </Typography>

            {creditEvaluationsEntity ? (
                (creditEvaluationsEntity.follow_up === 0 || creditEvaluationsEntity.follow_up === 1) ? (
                    <>
                        <Box sx={{ marginBottom: '15px' }}>
                            <Typography variant="body1">Valor de la Propiedad:</Typography>
                            <TextField
                                fullWidth
                                type="number"
                                name="propertyValue"
                                value={propertyValue}
                                onChange={handleChange}
                                variant="outlined"
                                sx={{ marginTop: '5px' }}
                            />
                        </Box>

                        <Box sx={{ marginBottom: '15px' }}>
                            <Typography variant="body1">Plazo de Tiempo (en años):</Typography>
                            <TextField
                                fullWidth
                                type="number"
                                name="timeLimit"
                                value={timeLimit}
                                onChange={handleChange}
                                variant="outlined"
                                sx={{ marginTop: '5px' }}
                            />
                        </Box>

                        <Box sx={{ marginBottom: '15px' }}>
                            <Typography variant="body1">Tasa de Interés (%):</Typography>
                            <TextField
                                fullWidth
                                type="number"
                                name="interestRate"
                                value={interestRate}
                                inputProps={{ min: 3.5, max: 7, step: 0.1 }}
                                onChange={handleChange}
                                variant="outlined"
                                sx={{ marginTop: '5px' }}
                            />
                        </Box>

                        <Box sx={{ marginBottom: '20px' }}>
                            <Typography variant="body1">Tipo de Préstamo:</Typography>
                            <FormControl fullWidth variant="outlined" sx={{ marginTop: '5px' }}>
                                <Select
                                    name="typeLoan"
                                    value={typeLoan}
                                    onChange={handleChange}
                                    displayEmpty
                                >
                                    <MenuItem value={0} disabled>Seleccione el tipo de préstamo</MenuItem>
                                    <MenuItem value={1}>Tipo 1</MenuItem>
                                    <MenuItem value={2}>Tipo 2</MenuItem>
                                    <MenuItem value={3}>Tipo 3</MenuItem>
                                    <MenuItem value={4}>Tipo 4</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleEvaluation}
                                disabled={isButtonDisabled()}
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

            {creditEvaluationsEntity ? (
                creditEvaluationsEntity.follow_up === 2 ? (
                    <>
                        <TableContainer component={Paper}>
                            <h3>Historial de trabajo</h3>
                            <hr />
                            <Table sx={{ minWidth: 650 }} size="small" aria-label="customer history table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>Ingreso</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>Deuda</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>Historia crediticia</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>Fecha</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {workHistoryList.map((history) => (
                                        <TableRow key={history.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                            <TableCell align="right">{history.income}</TableCell>
                                            <TableCell align="right">{history.debt}</TableCell>
                                            <TableCell align="right">{history.creditHistory}</TableCell>
                                            <TableCell align="right">{formatDate(history.date)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => creditEvaluationsService.downloadPdf(creditId)}
                            style={{ marginTop: '20px' }}
                        >
                            Descargar PDF
                        </Button>
                        <Typography variant="body1" color="textSecondary">
                            Se revisa el historial crediticio del cliente en DICOM (Directorio de Información
                            Comercial). Si el cliente tiene un buen historial (sin morosidad o deudas impagas recientes),
                            puede avanzar en el proceso. Si existen morosidades graves o una alta cantidad de deudas pendientes,
                            la solicitud es rechazada.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleTo3}
                            style={{ marginTop: '20px' }}
                        >
                            Aprobar historial crediticio
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleTo6}
                            style={{ marginTop: '20px' }}
                        >
                            Rechazar historial crediticio
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleTo7}
                            style={{ marginTop: '20px' }}
                        >
                            Rechazar como cliente
                        </Button>
                    </>
                ) : null
            ) : (
                <Typography variant="body1">Cargando información de crédito...</Typography>
            )}


            {creditEvaluationsEntity ? (
                creditEvaluationsEntity.follow_up === 3 ? (
                    <>
                        <Typography variant="body1" color="textSecondary">
                            La solicitud ha sido evaluada y cumple con los criterios básicos del
                            banco, por lo que ha sido pre-aprobada. En este estado, se presentan las condiciones
                            iniciales del crédito al cliente.
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            Pago mensual: {costoMensual}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            Periodo de tiempo: {timeLimit}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            Costo total del crédito: {costoTotal}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleTo4}
                            style={{ marginTop: '20px' }}
                        >
                            Aceptar condiciones
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleTo7}
                            style={{ marginTop: '20px' }}
                        >
                            Rechazar
                        </Button>
                    </>
                ) : null
            ) : (
                <Typography variant="body1">Cargando información de crédito...</Typography>
            )}

            {creditEvaluationsEntity ? (
                creditEvaluationsEntity.follow_up === 4 ? (
                    <>
                        <Typography variant="body1" color="textSecondary">
                            La solicitud se encuentra en proceso de aprobación final. Aquí se revisan los detalles
                            finales, se emiten los contratos y se preparan los documentos legales.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => creditEvaluationsService.downloadPdf(creditId)}
                            style={{ marginTop: '20px' }}
                        >
                            Descargar PDF
                        </Button>
                        <Typography variant="body1" color="textSecondary">
                            Pago mensual: {costoMensual}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            Periodo de tiempo: {timeLimit}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                            Costo total del crédito: {costoTotal}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleTo5}
                            style={{ marginTop: '20px' }}
                        >
                            Aceptar tras las últimas verificaciones
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleTo6}
                            style={{ marginTop: '20px' }}
                        >
                            Rechazar
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleTo7}
                            style={{ marginTop: '20px' }}
                        >
                            Rechazar como cliente
                        </Button>
                    </>
                ) : null
            ) : (
                <Typography variant="body1">Cargando información de crédito...</Typography>
            )}

            {creditEvaluationsEntity ? (
                creditEvaluationsEntity.follow_up === 5 ? (
                    <>
                        <Typography variant="body1" color="textSecondary">
                            La solicitud ha sido aprobada y está lista para el desembolso. El cliente
                            recibe la confirmación y se programa la firma del contrato.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleTo8}
                            style={{ marginTop: '20px' }}
                        >
                            Programar desembolso
                        </Button>
                    </>
                ) : null
            ) : (
                <Typography variant="body1">Cargando información de crédito...</Typography>
            )}


            {creditEvaluationsEntity ? (
                creditEvaluationsEntity.follow_up === 6 ? (
                    <Typography variant="body1" color="primary" component="div" style={{ marginTop: '20px' }}>
                        La solicitud ha sido rechazada tras no pasar las verificaciones para ser considerada, aquí tiene lo
                        que debe de saber si quiere que esté completamente buena su próximo crédito a solicitar:
                        <br /><br />
                        <strong>R1. Relación Cuota/Ingreso</strong>
                        <ul>
                            <li>La relación cuota/ingreso es uno de los factores clave. Esta relación no debe ser mayor a un 35%.</li>
                            <li>Si la relación cuota/ingreso es mayor que el umbral establecido por el banco (35%), la solicitud se rechaza. Si está dentro del límite, se considera para aprobación.</li>
                        </ul>
                        <strong>R2. Historial Crediticio del Cliente</strong>
                        <ul>
                            <li>Se revisa el historial crediticio del cliente en DICOM (Directorio de Información Comercial).</li>
                            <li>Si el cliente tiene un buen historial (sin morosidad o deudas impagas recientes), puede avanzar en el proceso.</li>
                            <li>Si existen morosidades graves o una alta cantidad de deudas pendientes, la solicitud es rechazada.</li>
                        </ul>
                        <strong>R3. Antigüedad Laboral y Estabilidad</strong>
                        <ul>
                            <li>El banco evalúa la estabilidad laboral del cliente, revisando su antigüedad en el empleo actual y su historial de empleo en los últimos años.</li>
                            <li>Se requiere que el cliente tenga al menos 1 a 2 años de antigüedad en su empleo actual.</li>
                            <li>Si el cliente es un trabajador independiente, se revisan sus ingresos de los últimos 2 o más años para evaluar su estabilidad financiera.</li>
                        </ul>
                        <strong>R4. Relación Deuda/Ingreso</strong>
                        <ul>
                            <li>Además de la relación cuota/ingreso, el banco evalúa la relación total de deudas/ingreso, que considera todas las deudas actuales del cliente.</li>
                            <li>Si la suma de todas las deudas (incluyendo la cuota proyectada del nuevo crédito) supera el 50% de los ingresos mensuales, la solicitud debe ser rechazada.</li>
                        </ul>
                        <strong>R5. Monto Máximo de Financiamiento</strong>
                        <ul>
                            <li>El banco tiene reglas sobre el porcentaje máximo del valor de la propiedad que puede financiar (ver tabla más arriba), dependiendo del tipo de préstamo.</li>
                            <li>Por ejemplo, para una primera vivienda, se podría financiar hasta el 80% del valor de la propiedad.</li>
                            <li>Para una segunda vivienda o propiedades comerciales, el financiamiento podría reducirse al 70% o menos.</li>
                        </ul>
                        <strong>R6. Edad del solicitante</strong>
                        <ul>
                            <li>El banco considera la edad del solicitante para asegurarse de que el préstamo pueda pagarse antes de que el cliente llegue a la edad de jubilación.</li>
                            <li>La edad máxima permitida al momento de finalizar el préstamo suele ser 75 años. Si el solicitante es muy cercano a esta edad, el plazo del préstamo se rechaza.</li>
                        </ul>
                        <strong>R7. Historial Crediticio del Cliente</strong>
                        <ul>
                            <li> El banco puede revisar si el cliente ha demostrado capacidad de ahorro a través de una cuenta bancaria o inversiones.</li>
                            R71: Saldo Mínimo Requerido
                            <ul>
                                <li>El cliente debe tener un saldo mínimo en su cuenta de ahorros o inversiones que
                                    sea al menos el 10% del monto del préstamo solicitado.
                                </li>
                            </ul>
                            R72: Historial de Ahorro Consistente
                            <ul>
                                <li>El cliente debe haber mantenido un saldo positivo en su cuenta de ahorros por lo
                                    menos durante los últimos 12 meses, sin realizar retiros significativos (mayor a
                                    50% del saldo).
                                </li>
                            </ul>
                            R73: Depósitos Periódicos
                            <ul>
                                <li>
                                    El cliente debe realizar depósitos regulares en su cuenta de ahorros o
                                    inversión. Se consideran regulares aquellos realizados con una frecuencia
                                    mensual o trimestral.
                                </li>
                                <li>
                                    Monto Mínimo: Los depósitos deben sumar al menos el 5% de sus ingresos
                                    mensuales.
                                </li>
                                <li>
                                    Acción: Revisar el historial de depósitos de los últimos 12 meses. Si el
                                    cliente no cumple con esta regularidad o monto mínimo, marcarlo como
                                    negativo
                                </li>
                            </ul>

                            R74: Relación Saldo/Años de Antigüedad
                            <ul>
                                <li>
                                    Si el cliente tiene menos de 2 años en su cuenta de ahorros, debe tener un
                                    saldo acumulado que sea al menos el 20% del monto del préstamo
                                    solicitado.
                                </li>
                                <li>
                                    Si el cliente tiene 2 años o más con la cuenta, un saldo acumulado del 10%
                                    será suficiente.
                                </li>
                                <li>
                                    Acción: Revisar la antigüedad de la cuenta y el saldo acumulado. Si no
                                    cumple con los porcentajes requeridos según su antigüedad, marcarlo como
                                    negativo.
                                </li>
                            </ul>

                            R75: Retiros Recientes
                            <ul>
                                <li>
                                    Si el cliente ha realizado un retiro superior al 30% del saldo de su cuenta
                                    en los últimos 6 meses, marcar este punto como negativo, ya que indica
                                    una posible falta de estabilidad financiera.
                                </li>
                                <li>
                                    Acción: Revisar los movimientos de la cuenta para identificar retiros
                                    recientes y evaluar su impacto.
                                </li>
                            </ul>

                            Resultado de la Evaluación
                            <ul>
                                <li>
                                    Aprobación: Si el cliente cumple con las 5 reglas, marcar la capacidad de
                                    ahorro como “sólida” y continuar con la evaluación del crédito.
                                </li>
                                <li>
                                    Revisión Adicional: Si el cliente cumple con 3 o 4 de las 5 reglas, marcar
                                    la
                                    capacidad de ahorro como "moderada" e indicar que se requiere una
                                    revisión adicional.
                                </li>
                                <li>
                                    Rechazo: Si el cliente cumple con menos de 2 reglas, marcar la capacidad
                                    de ahorro como “insuficiente” y proceder a rechazar.
                                </li>
                            </ul>
                        </ul>
                    </Typography>
                ) : null
            ) : (
                <Typography variant="body1">Cargando información de crédito...</Typography>
            )}


            {creditEvaluationsEntity ? (
                creditEvaluationsEntity.follow_up === 7 ? (
                    <Typography variant="body1" color="textSecondary">
                        Cancelada por el cliente
                    </Typography>
                ) : null
            ) : (
                <Typography variant="body1">Cargando información de crédito...</Typography>
            )}

            {creditEvaluationsEntity ? (
                creditEvaluationsEntity.follow_up === 8 ? (
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

            {greatMessage.length > 0 && (
                <Box sx={{marginTop: '20px'}}>
                    {greatMessage.map((message, index) => (
                        <Typography key={index} variant="body1" sx={{color: 'green'}}>
                            {message}
                        </Typography>
                    ))}
                </Box>
            )}
        </Box>
    );
};
export default CreditEvaluation;