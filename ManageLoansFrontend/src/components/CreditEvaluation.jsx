import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import { Box, Button, FormControl, TextField, Typography, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import creditEvaluation from "../services/credit-evaluation.js";
import creditApplication from "../services/credit-application.js";
import trackingRequests from "../services/tracking-requests.js";
import creditSimulator from "../services/credit-simulator.js";
import {LoanTypesTable} from "../services/credit-application.js"

const CreditEvaluation = () => {
    const { id , creditId} = useParams();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");
    const [greatMessage, setGreatMessage] = useState([]);
    const [workHistoryList,setWorkHistoryList] = useState([]);
    const [savingAccountEntity, setSavingAccountEntity] = useState(null);
    const [costoMensual, setCostoMensual] = useState(0);
    const [costoTotal, setCostoTotal] = useState(0);

    useEffect(() => {
        //Cargamos el workHistory
        creditEvaluation.getWorkHistoriesByCustomerId(id)
            .then(response => {
                setWorkHistoryList(response.data);
            })
            .catch(error => {
                console.log("Error al obtener el historial del trabajo", error);
            });
        //Cargamos el credito en cuestion
        creditApplication.getCreditById(creditId)
            .then((response) => {
                console.log("Credito:", JSON.stringify(response.data, null, 2));
                creditSimulator.getMonthlyFee(response.data)
                    .then((response) => {
                        setCostoMensual(response.data);
                    })
                creditSimulator.getTotalCost(response.data)
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

    const handleTo3 = async () => {
        await trackingRequests.modifyFollowUp(creditId, 3);
    }

    const handleTo4 = async () => {
        await trackingRequests.modifyFollowUp(creditId, 4);
    }

    const handleTo5 = async () => {
        await trackingRequests.modifyFollowUp(creditId, 5);
    }

    const handleTo6 = async () => {
        await trackingRequests.modifyFollowUp(creditId, 6);
        messageFailed();
    }

    const handleTo7 = async () => {
        await trackingRequests.modifyFollowUp(creditId, 7);
        messageCancel();
    }

    const handleTo8 = async () => {
        await trackingRequests.modifyFollowUp(creditId, 8);
        messageSuccess();
    }

    const evaluation = () => {
        creditEvaluation.evaluateMaximumFinancingAmount(creditId,id,costoMensual)
            .then((result) => {
                if(result.data === -1){
                    return -1;
                }
            })

        //creditEvaluation.evaluateIncomeFee(creditId,costoMensual,,id)
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
            <LoanTypesTable />
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