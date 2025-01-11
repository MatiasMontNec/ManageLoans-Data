import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import creditApplication from "../services/credit-application.js";
import userRegistration from "../services/user-registration.js";
import trackingRequests from "../services/tracking-requests.js";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {LoanTypesTable} from "./functions.jsx"
import creditEvaluation from "../services/credit-evaluation.js";
import creditSimulator from "../services/credit-simulator.js";
import {Box, FormControl, Grid, MenuItem, Select} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Lottie from "lottie-react";
import successAnimationData from '../animations/success2-animation.json';

const CreditApplication = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showAnimation, setShowAnimation] = useState(false);
    const [antique,setAntique] = useState(0);
    const [amount,setAmount] = useState(0);
    const [drafts, setDrafts] = useState([]);
    const [workHistories, setWorkHistories] = useState([]);
    const [errors, setErrors] = useState([]);
    const [highlightedRow, setHighlightedRow] = useState(null);
    const [interestRate, setInterestRate] = useState(3.5);
    const [typeloan, setTypeLoan] = useState("");
    const [timeLimit, setTimeLimit] = useState(15);
    const [amount2, setAmount2] = useState(800);
    const [amountMax, setAmountMax] = useState(1000);
    const MAX_VALUE = 1000000000000000000;
    const [pdfFile1, setPdfFile1] = useState(null);
    const [pdfFile2, setPdfFile2] = useState(null);
    const [pdfFile3, setPdfFile3] = useState(null);
    const [pdfFile4, setPdfFile4] = useState(null);
    const [shakeButton, setShakeButton] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false); // Controla si el Snackbar está visible
    const [snackbarMessage, setSnackbarMessage] = useState(""); // Mensaje del Snackbar
    const [snackbarSeverity, setSnackbarSeverity] = useState("info"); // Tipo de alerta ("error", "success", etc.)
    const [snackbarAction, setSnackbarAction] = useState(null); // Acción del botón dentro del Snackbar
    const [creditId, setCreditId] = useState(null);
    const [yearBirth, setYearBirth] = useState(0);

    // Muestra el Snackbar con mensaje, severidad y acción
    const handleSnackbarOpen = (message, severity, action = null) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarAction(action);
        setSnackbarOpen(true);
    };

    // Cierra el Snackbar
    const handleSnackbarClose = (event, reason) => {
        if (reason === "clickaway") {
            return; // Evita cerrar si el usuario hace clic fuera del Snackbar
        }
        setSnackbarOpen(false);
    };

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await userRegistration.getCustomerById(id);
                console.log("Datos a enviar:", JSON.stringify(response.data, null, 2));
                setYearBirth(response.data.yearBirth);
                //Cargamos el savingAccount
                trackingRequests.getSavingAccountByCustomerId(id)
                    .then((response) => {
                        creditSimulator.getAccountDraftsBySavingAccountId(response.data.id)
                            .then((response) => {
                                setDrafts(response.data);
                            })
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

    const handleInvalidInput = (button) => {
        if (button === 1) {
            setShakeButton(true);
            setTimeout(() => setShakeButton(false), 300);
        }
    };

    const loanRestrictions = {
        1: { // Primera vivienda
            maxYears: 30,
            interestRateRange: { min: 3.5, max: 5 },
            maxFinancing: 0.8, // 80% del valor de la propiedad
        },
        2: { // Segunda vivienda
            maxYears: 20,
            interestRateRange: { min: 4, max: 6 },
            maxFinancing: 0.7, // 70% del valor de la propiedad
        },
        3: { // Propiedades comerciales
            maxYears: 25,
            interestRateRange: { min: 5, max: 7 },
            maxFinancing: 0.6, // 60% del valor de la propiedad
        },
        4: { // Remodelación
            maxYears: 15,
            interestRateRange: { min: 4.5, max: 6 },
            maxFinancing: 0.5, // 50% del valor de la propiedad
        },
    };

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

        const validationErrors = validations
            .map((validation) => validation())
            .filter((error) => error !== null);

        setErrors(validationErrors); // Actualizar los errores en el estado

        return validationErrors.length === 0;
    };

    const createCreditEvaluation = (typeloan, pdfFiles) => {
        return {
            customerId: id,
            follow_up: 0,
            executiveWorking: 0,
            amountWanted: amount2,
            amountMax: amountMax,
            interestRate: interestRate,
            typeLoan: typeloan,
            timeLimit: timeLimit,
            pdfFilePath1: pdfFiles[0]?.name || null,
            pdfFilePath2: pdfFiles[1]?.name || null,
            pdfFilePath3: pdfFiles[2]?.name || null,
            pdfFilePath4: pdfFiles[3]?.name || null,
        };
    };

    const handleCreditCreation = async () => {
        const isValid = validateCustomerData();
        setErrors([]);
        const errors = [];
        if (!isValid || !amount2 || !amountMax || !interestRate || !typeloan) {
            if (!amount2) errors.push("El monto solicitado no ha sido definido.");
            if (!amountMax) errors.push("El monto máximo permitido no ha sido definido.");
            if (!interestRate) errors.push("La tasa de interés no ha sido definida.");
            if (!typeloan) errors.push("No se ha seleccionado un tipo de crédito.");
            setErrors(errors); // Actualizar los errores
            handleInvalidInput(1);
            return;
        }

        if (amountMax > MAX_VALUE || amount2 > MAX_VALUE) {
            errors.push("El monto ingresado excede el límite permitido.");
            setErrors(errors);
            handleInvalidInput(1);
            return;
        }

        if ((typeloan === 1 || typeloan === 2 || typeloan === 3 || typeloan === 4) && !pdfFile1) {
            errors.push("Debe cargar un comprobante de ingresos.");
            setErrors(errors);
            handleInvalidInput(1);
            return;
        }

        if ((typeloan === 1 || typeloan === 2 || typeloan === 3 || typeloan === 4) && !pdfFile2) {
            errors.push("Debe cargar un certificado de avalúo.");
        }

        if ((typeloan === 1 || typeloan === 2 || typeloan === 3) && !pdfFile3) {
            errors.push("Debe cargar un historial crediticio.");
        }

        if (typeloan === 2 && !pdfFile4) {
            errors.push("Debe cargar la escritura de la primera vivienda.");
        }

        if (typeloan === 3 && !pdfFile4) {
            errors.push("Debe cargar un plan de negocios.");
        }

        if (typeloan === 4 && !pdfFile2) {
            errors.push("Debe cargar un presupuesto de la remodelación.");
        }

        if (errors.length > 0) {
            setErrors(errors);
            handleInvalidInput(1);
            return;
        }

        if((typeloan && (interestRate < loanRestrictions[typeloan]?.interestRateRange.min ||
            interestRate > loanRestrictions[typeloan]?.interestRateRange.max))){
            errors.push("El interés deseado no cumple con el limite presentado por el tipo de crédito.");
            setErrors(errors);
            handleInvalidInput(1);
            return;
        }

        if((typeloan && timeLimit > loanRestrictions[typeloan]?.maxYears)){
            errors.push("El tiempo limite no cumple con el limite presentado por el tipo de crédito.");
            setErrors(errors);
            handleInvalidInput(1);
            return;
        }

        if(typeloan && amount2 > (amountMax*0.8)){
            console.log("Monto deseado: ", amount2);
            console.log("Limite: ", (amountMax*0.8));
            console.log("valor de la propiedad: ", amountMax);
            errors.push("El monto deseado no cumple con el limite presentado por el tipo de crédito.");
            setErrors(errors);
            handleInvalidInput(1);
            return;
        }

        if(interestRate <= 0){
            errors.push("La tasa de interés no puede ser negativa.");
            setErrors(errors);
            handleInvalidInput(1);
            return;
        }

        if(timeLimit <= 0){
            errors.push("El tiempo limite no puede ser negativo.");
            setErrors(errors);
            handleInvalidInput(1);
            return;
        }

        if(amountMax <= 0){
            errors.push("El valor de la propiedad no puede ser negativa.");
            setErrors(errors);
            handleInvalidInput(1);
            return;
        }

        if(amount2 <= 0){
            errors.push("El monto deseado no puede ser negativo.");
            setErrors(errors);
            handleInvalidInput(1);
            return;
        }

        const pdfFiles = [pdfFile1, pdfFile2, pdfFile3, pdfFile4];
        const creditEvaluation = createCreditEvaluation(typeloan, pdfFiles);
        console.log("PDFS entran como: ", creditEvaluation);

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
            setShowAnimation(true);

            // Ocultar la animación después de 3 segundos
            setTimeout(() => {
                setShowAnimation(false);
            }, 3000);

            handleSnackbarOpen(
                "El crédito ha sido creado con éxito. Ahora está listo para ser revisado por el ejecutivo.",
                "success",
                <Button
                    color="secondary"
                    size="small"
                    onClick={() => navigate(`/listCredit/${id}`)}
                >
                    Ir a mi lista de créditos
                </Button>
            );
        } catch (error) {
            console.error("Error al crear el crédito", error);
            handleSnackbarOpen(
                "Hubo un error al crear el crédito. Por favor, inténtelo de nuevo.",
                "error"
            );
            alert("Hubo un error al crear el crédito. Por favor, inténtelo de nuevo.");
        }
    };

    const handleReturn = () => {
        navigate(`/listCustomer`);
    };

    const handleTypeLoanChange = (loanType) => {
        setTypeLoan(loanType);
        setHighlightedRow(loanType); // Resalta la fila correspondiente
        setAmount2(0);
        setAmountMax(0);
        setTimeLimit(0);
        setInterestRate(0);
    };

    return (
        <div>
            <h2>Creación de Crédito</h2>
            {showAnimation && (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100vw",
                        height: "100vh",
                        position: "absolute",
                        top: "0",
                        left: "0",
                        marginBottom: "0"
                    }}
                >
                    <Lottie
                        animationData={successAnimationData}
                        loop={false}
                        style={{ width: "80%", height: "80%" }} // Ajusta el tamaño de la animación
                    />
                </Box>

            )}
            <LoanTypesTable highlightedRow={highlightedRow} />
            <Grid container spacing={2} direction="column" justifyContent="center" alignItems="center">
                {/* Mostrar errores si hay */}
                {errors.map((error, index) => (
                    <Grid item key={index}>
                        <Typography color="error" sx={{ textAlign: "center" }}>
                            {error}
                        </Typography>
                    </Grid>
                ))}
            </Grid>

            {/* Tipo de Préstamo */}
            <Grid container spacing={2}>
                <Grid item xs={12} >
                    <FormControl fullWidth margin="normal">
                        <Select
                            id="typeloan"
                            label="Tipo de Crédito"
                            value={typeloan}
                            displayEmpty
                            onChange={(e) => handleTypeLoanChange(e.target.value)}
                            error={!typeloan} // Indica error si no se selecciona un tipo de crédito
                        >
                            <MenuItem value="" disabled>Tipo de Crédito</MenuItem>
                            <MenuItem value={1}>Primera vivienda</MenuItem>
                            <MenuItem value={2}>Segunda vivienda</MenuItem>
                            <MenuItem value={3}>Propiedades comerciales</MenuItem>
                            <MenuItem value={4}>Remodelación</MenuItem>
                        </Select>
                        {!typeloan && (
                            <Typography color="error" variant="caption">
                                Por favor, seleccione un tipo de crédito.
                            </Typography>
                        )}
                    </FormControl>
                </Grid>


            {typeloan && (
                <>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <TextField
                                id="amountMax"
                                label="Valor de la Propiedad en Miles"
                                variant="standard"
                                value={amountMax}
                                type={"number"}
                                onChange={(e) => setAmountMax(e.target.value)}
                                helperText={
                                    amountMax <= 0
                                        ? "Debe ser un valor positivo"
                                        : amountMax > MAX_VALUE
                                            ? "No puedes colocar un número más alto"
                                            : ""
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "." || e.key === ",") {
                                        e.preventDefault();
                                    }
                                }}
                                error={amountMax <= 0 || amountMax > MAX_VALUE}
                            />
                        </FormControl>
                    </Grid>

                    {/* Monto Deseado */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <TextField
                                id="amount2"
                                label="Monto Deseado en Miles"
                                variant="standard"
                                value={amount2}
                                type={"number"}
                                onChange={(e) => setAmount2(e.target.value)}
                                helperText={
                                    amount2 <= 0
                                        ? "Debe ser un valor positivo"
                                        : amount2 > MAX_VALUE
                                            ? "No puedes colocar un número más alto"
                                            : typeloan
                                                ? `Máximo valor a ingresar ${amountMax * loanRestrictions[typeloan]?.maxFinancing}`
                                                : ""
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "." || e.key === ",") {
                                        e.preventDefault();
                                    }
                                }}
                                error={
                                    amount2 <= 0 ||
                                    amount2 > MAX_VALUE ||
                                    (typeloan && amount2 > amountMax * loanRestrictions[typeloan]?.maxFinancing)
                                }
                            />
                        </FormControl>
                    </Grid>

                    {/* Plazo Máximo */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <TextField
                                id="timeLimit"
                                label="Plazo Máximo en Años"
                                variant="standard"
                                value={timeLimit}
                                type={"number"}
                                onChange={(e) => setTimeLimit(e.target.value)}
                                helperText={
                                    timeLimit <= 0
                                        ? "Debe ser un valor positivo"
                                        : typeloan
                                            ? `Máximo ${loanRestrictions[typeloan]?.maxYears} años`
                                            : ""
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "." || e.key === ",") {
                                        e.preventDefault();
                                    }
                                }}
                                error={timeLimit <= 0 || (typeloan && timeLimit > loanRestrictions[typeloan]?.maxYears)}
                            />
                        </FormControl>
                    </Grid>

                    {/* Tasa de Interés */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <TextField
                                id="interestRate"
                                label="Tasa Interés Anual en Porcentual"
                                variant="standard"
                                value={interestRate}
                                type="number"
                                inputProps={{
                                    min: loanRestrictions[typeloan]?.interestRateRange?.min || 0,
                                    max: loanRestrictions[typeloan]?.interestRateRange?.max || 100,
                                    step: 0.1,
                                }}
                                onChange={(e) => setInterestRate(e.target.value)}
                                helperText={
                                    typeloan
                                        ? `Entre ${loanRestrictions[typeloan]?.interestRateRange.min}% y ${loanRestrictions[typeloan]?.interestRateRange.max}%. No agregue el simbolo de %.`
                                        : ""
                                }
                                error={
                                    typeloan &&
                                    (interestRate < loanRestrictions[typeloan]?.interestRateRange.min ||
                                        interestRate > loanRestrictions[typeloan]?.interestRateRange.max)
                                }
                            />
                        </FormControl>
                    </Grid>
                </>
            )}
            </Grid>

            {typeloan > 0 && (
                <div>
                    <Typography variant="h6">Suba los documentos necesarios:</Typography>

                    <div
                        style={{
                            display: "flex",          // Flexbox para alinear los botones en fila
                            flexWrap: "wrap",         // Permite que los botones salten de línea si no caben
                            gap: "15px",              // Espaciado entre botones
                            marginTop: "15px",        // Espacio superior para separación
                            justifyContent: "center", // Centra horizontalmente los botones
                        }}
                    >
                        {(typeloan === 1 || typeloan === 2 || typeloan === 3 || typeloan === 4) && (
                            <div>
                                <Typography variant="body1">Comprobante de ingresos:</Typography>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    color="primary"
                                >
                                    Seleccionar archivo
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        hidden
                                        onChange={(e) => setPdfFile1(e.target.files[0])}
                                        required
                                    />
                                </Button>
                                {pdfFile1 && (
                                    <Typography variant="body2" color="textSecondary">
                                        {pdfFile1.name}
                                    </Typography>
                                )}
                            </div>
                        )}

                        {(typeloan === 1 || typeloan === 2 || typeloan === 3 || typeloan === 4) && (
                            <div>
                                <Typography variant="body1">Certificado de avalúo:</Typography>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    color="primary"
                                >
                                    Seleccionar archivo
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        hidden
                                        onChange={(e) => setPdfFile2(e.target.files[0])}
                                        required
                                    />
                                </Button>
                                {pdfFile2 && (
                                    <Typography variant="body2" color="textSecondary">
                                        {pdfFile2.name}
                                    </Typography>
                                )}
                            </div>
                        )}

                        {(typeloan === 1 || typeloan === 2 || typeloan === 3) && (
                            <div>
                                <Typography variant="body1">Historial crediticio:</Typography>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    color="primary"
                                >
                                    Seleccionar archivo
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        hidden
                                        onChange={(e) => setPdfFile3(e.target.files[0])}
                                        required
                                    />
                                </Button>
                                {pdfFile3 && (
                                    <Typography variant="body2" color="textSecondary">
                                        {pdfFile3.name}
                                    </Typography>
                                )}
                            </div>
                        )}

                        {typeloan === 2 && (
                            <div>
                                <Typography variant="body1">Escritura de la primera vivienda:</Typography>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    color="primary"
                                >
                                    Seleccionar archivo
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        hidden
                                        onChange={(e) => setPdfFile4(e.target.files[0])}
                                    />
                                </Button>
                                {pdfFile4 && (
                                    <Typography variant="body2" color="textSecondary">
                                        {pdfFile4.name}
                                    </Typography>
                                )}
                            </div>
                        )}

                        {typeloan === 3 && (
                            <div>
                                <Typography variant="body1">Plan de negocios:</Typography>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    color="primary"
                                >
                                    Seleccionar archivo
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        hidden
                                        onChange={(e) => setPdfFile4(e.target.files[0])}
                                    />
                                </Button>
                                {pdfFile4 && (
                                    <Typography variant="body2" color="textSecondary">
                                        {pdfFile4.name}
                                    </Typography>
                                )}
                            </div>
                        )}

                        {typeloan === 4 && (
                            <div>
                                <Typography variant="body1">Presupuesto de la remodelación:</Typography>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    color="primary"
                                >
                                    Seleccionar archivo
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        hidden
                                        onChange={(e) => setPdfFile3(e.target.files[0])}
                                    />
                                </Button>
                                {pdfFile3 && (
                                    <Typography variant="body2" color="textSecondary">
                                        {pdfFile3.name}
                                    </Typography>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {typeloan && (
                <div style={{marginTop: "10px"}}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreditCreation}
                        className={shakeButton ? "shake" : ""}
                    >
                        Crear Crédito
                    </Button>
                </div>
            )}

            {/* Contenedor para el botón de regresar */}
            <div style={{display: "flex", justifyContent: "center", marginTop: "0.5rem"}}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleReturn}
                >
                    Regresar a la Lista de Clientes
                </Button>
            </div>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={7000}
                onClose={handleSnackbarClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
            >
                <Alert
                    severity={snackbarSeverity}
                    sx={{ width: "100%" }}
                    action={
                        snackbarAction
                    }
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>


        </div>
    );
};

export default CreditApplication;
