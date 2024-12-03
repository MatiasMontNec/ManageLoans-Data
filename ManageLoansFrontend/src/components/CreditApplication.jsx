import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import creditApplication from "../services/credit-application.js";
import userRegistration from "../services/user-registration.js";
import trackingRequests from "../services/tracking-requests.js";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {LoanTypesTable} from "../services/credit-application.js"
import creditEvaluation from "../services/credit-evaluation.js";

const CreditApplication = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [antique,setAntique] = useState(0);
    const [amount,setAmount] = useState(0);
    const [drafts, setDrafts] = useState([]);
    const [workHistories, setWorkHistories] = useState([]);
    const [errors, setErrors] = useState([]);

    const [interestRate, setInterestRate] = useState(0);
    const [typeloan, setTypeLoan] = useState(0);
    const [timeLimit, setTimeLimit] = useState(0);
    const [amount2, setAmount2] = useState(0);
    const [amountMax, setAmountMax] = useState(0);
    const [pdfFile1, setPdfFile1] = useState(null);
    const [pdfFile2, setPdfFile2] = useState(null);
    const [pdfFile3, setPdfFile3] = useState(null);
    const [pdfFile4, setPdfFile4] = useState(null);

    const [creditId, setCreditId] = useState(null);
    const [isCreditCreated, setIsCreditCreated] = useState(false);
    const [yearBirth, setYearBirth] = useState(0);

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await creditApplication.getCustomerById(id);
                console.log("Datos a enviar:", JSON.stringify(response.data, null, 2));
                setYearBirth(response.data.yearBirth);
                //Cargamos el savingAccount
                trackingRequests.getSavingAccountByCustomerId(id)
                    .then((response) => {
                        setDrafts(response.data.drafts);
                        setAntique(response.data.antique);
                        setAmount(response.data.amount);
                    });
                creditEvaluation.getWorkHistoriesByCustomerId(id)
                    .then(response => {
                        setWorkHistories(response.data);
                    });
            } catch (error) {
                console.error("Error al obtener el cliente", error);
            }
        };
        fetchCustomer();
    }, [id]);

    const validateYearBirth = () => {
        if (!yearBirth) return "La fecha de nacimiento del cliente no ha sido configurada, por favor defínala.";
        return null;
    };

    const validateDrafts = () => {
        if (!drafts || drafts.length === 0) return "No hay giros definidos en la cuenta de ahorro, por favor ingrese al menos uno.";
        for (const draft of drafts) {
            if (draft.amountAtThatTime === undefined || draft.amountAtThatTime === null) {
                return "Existen giros en la cuenta de ahorro sin monto definido, este cliente no puede hacer créditos.";
            }
        }
        return null;
    };

    const validateAntiqueAndAmount = () => {
        if (antique === undefined) return "Antigüedad de la cuenta de ahorro no configurada.";
        if (amount === undefined) return "Monto de la cuenta de ahorro no configurado.";
        return null;
    };

    const validateWorkHistories = () => {
        if (!workHistories || workHistories.length === 0) return "El historial de trabajo no ha sido configurado.";
        return null;
    };

    const validateCustomerData = () => {
        const validations = [
            validateYearBirth,
            validateDrafts,
            validateAntiqueAndAmount,
            validateWorkHistories,
        ];

        const errors = validations.map((validation) => validation()).filter((error) => error !== null);
        setErrors(errors);
        return errors.length === 0;
    };

    const createCreditEvaluation = (typeloan, pdfFiles) => {
        return {
            customerId: id,
            follow_up: 0,
            executiveWorking: 0,
            amountWanted: amount2,
            amountMax: amountMax,
            interestRate: interestRate/100,
            typeloan,
            timeLimit: timeLimit,
            pdfFilePath1: pdfFiles[0]?.name || null,
            pdfFilePath2: pdfFiles[1]?.name || null,
            pdfFilePath3: pdfFiles[2]?.name || null,
            pdfFilePath4: pdfFiles[3]?.name || null,
        };
    };

    const handleCreditCreation = async () => {
        const isValid = validateCustomerData();
        if (!isValid || !amount2 || !amountMax || !interestRate || !typeloan) return;

        const pdfFiles = [pdfFile1, pdfFile2, pdfFile3, pdfFile4];
        const creditEvaluation = createCreditEvaluation(typeloan, pdfFiles);

        try {
            const saveResponse = await creditApplication.saveCredit(creditEvaluation);
            const date = new Date().toISOString().split('T')[0];
            const customerHistory2 = {
                customerId: id,
                content: "El cliente ha creado un crédito",
                date,
            };
            await userRegistration.saveCustomerHistory(customerHistory2);

            setCreditId(saveResponse.data.id);

            for (const pdf of pdfFiles) {
                if (pdf) {
                    await creditApplication.uploadPdf(saveResponse.data.id, pdf, typeloan);
                }
            }
            setIsCreditCreated(true);
        } catch (error) {
            console.error("Error al crear el crédito", error);
            alert("Hubo un error al crear el crédito. Por favor, inténtelo de nuevo.");
        }
    };

    const handleNavigateToCreditEvaluation = () => {
        if (creditId) {
            navigate(`/listCredit/${id}`);
        }
    };

    return (
        <div>
            <h2>Aplicación de Crédito para el Cliente</h2>
            <LoanTypesTable />
            {errors.length > 0 && (
                <div>
                    {errors.map((message, index) => (
                        <p key={index} style={{ color: "red" }}>{message}</p>
                    ))}
                    <Button variant="contained" color="primary" onClick={() => navigate(`/editCustomer/${id}`)}>
                        Ir a configurar el cliente
                    </Button>
                </div>
            )}

            {errors.length === 0 && (
                <>
                    <Typography variant="h6">Ingrese los detalles para crear el crédito:</Typography>

                    <TextField
                        label="Rango de interés (%)"
                        variant="outlined"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        type="number"
                        required
                        fullWidth
                        style={{ marginBottom: "10px" }}
                    />

                    <TextField
                        label="Plazo (años)"
                        variant="outlined"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(e.target.value)}
                        type="number"
                        required
                        fullWidth
                        style={{ marginBottom: "10px" }}
                    />

                    <TextField
                        label="Monto deseado"
                        variant="outlined"
                        value={amount2}
                        onChange={(e) => setAmount2(e.target.value)}
                        type="number"
                        required
                        fullWidth
                        style={{ marginBottom: "10px" }}
                    />

                    <TextField
                        label="Monto de la propiedad"
                        variant="outlined"
                        value={amountMax}
                        onChange={(e) => setAmountMax(e.target.value)}
                        type="number"
                        required
                        fullWidth
                        style={{ marginBottom: "10px" }}
                    />

                    <Typography variant="h6">Seleccione el tipo de préstamo:</Typography>
                    <select
                        value={typeloan}
                        onChange={(e) => setTypeLoan(Number(e.target.value))}
                        required
                        style={{
                            display: "block",
                            marginBottom: "10px",
                            padding: "10px",
                            fontSize: "16px",
                            width: "100%",
                        }}
                    >
                        <option value={0} disabled>
                            Seleccione un tipo de préstamo
                        </option>
                        <option value={1}>1: Préstamo personal</option>
                        <option value={2}>2: Préstamo hipotecario</option>
                        <option value={3}>3: Préstamo empresarial</option>
                        <option value={4}>4: Préstamo para remodelación</option>
                    </select>

                    {typeloan > 0 && (
                        <div>
                            <Typography variant="h6">Suba los documentos necesarios:</Typography>

                            {(typeloan === 1 || typeloan === 2 || typeloan === 3 || typeloan === 4) && (
                                <div style={{ marginBottom: "10px" }}>
                                    <label>Comprobante de ingresos:</label>
                                    <input type="file" accept="application/pdf" onChange={(e) => setPdfFile1(e.target.files[0])} required />
                                </div>
                            )}
                            {(typeloan === 1 || typeloan === 2 || typeloan === 3 || typeloan === 4) && (
                                <div style={{ marginBottom: "10px" }}>
                                    <label>Certificado de avalúo:</label>
                                    <input type="file" accept="application/pdf" onChange={(e) => setPdfFile2(e.target.files[0])} required />
                                </div>
                            )}
                            {(typeloan === 1 || typeloan === 2 || typeloan === 3) && (
                                <div style={{ marginBottom: "10px" }}>
                                    <label>Historial crediticio:</label>
                                    <input type="file" accept="application/pdf" onChange={(e) => setPdfFile3(e.target.files[0])} required />
                                </div>
                            )}
                            {typeloan === 2 && (
                                <div style={{ marginBottom: "10px" }}>
                                    <label>Escritura de la primera vivienda:</label>
                                    <input type="file" accept="application/pdf" onChange={(e) => setPdfFile4(e.target.files[0])} required />
                                </div>
                            )}
                            {typeloan === 3 && (
                                <div style={{ marginBottom: "10px" }}>
                                    <label>Plan de negocios:</label>
                                    <input type="file" accept="application/pdf" onChange={(e) => setPdfFile4(e.target.files[0])} required />
                                </div>
                            )}
                            {typeloan === 4 && (
                                <div style={{ marginBottom: "10px" }}>
                                    <label>Presupuesto de la remodelación:</label>
                                    <input type="file" accept="application/pdf" onChange={(e) => setPdfFile2(e.target.files[0])} required />
                                </div>
                            )}
                        </div>
                    )}

                    <div style={{ marginTop: "10px" }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreditCreation}
                        >
                            Crear Crédito
                        </Button>
                    </div>

                    {isCreditCreated && (
                        <div>
                            <Typography style={{ color: "green", marginTop: "10px" }}>
                                El crédito ha sido creado con éxito con el PDF subido. Ahora está listo para ser revisado por el ejecutivo.
                            </Typography>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleNavigateToCreditEvaluation}
                                style={{ marginTop: "10px" }}
                            >
                                Ir a mi lista de créditos
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CreditApplication;
