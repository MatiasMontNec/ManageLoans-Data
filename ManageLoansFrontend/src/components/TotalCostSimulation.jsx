import { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    TextField,
    Typography,
    Select,
    MenuItem,
    Card,
    CardContent,
    Divider, Grid
} from '@mui/material';
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CalculateIcon from '@mui/icons-material/Calculate';
import creditApplication from "../services/credit-application.js";
import {LoanTypesTable} from "./functions.jsx"

const TotalCostSimulation = () => {
    const [desiredAmount, setDesiredAmount] = useState("");
    const [propertyValue, setPropertyValue] = useState("");
    const [timeLimit, setTimeLimit] = useState("");
    const [interestRate, setInterestRate] = useState("");
    const [typeLoan, setTypeLoan] = useState("");
    const [calculationResult, setCalculationResult] = useState(null);
    const [calculationResult2, setCalculationResult2] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [shakeButton, setShakeButton] = useState(false);
    const [shakeButton2, setShakeButton2] = useState(false);
    const MAX_VALUE = 1000000000000000000;
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarShown, setSnackbarShown] = useState(false);
    const [snackbarShown2, setSnackbarShown2] = useState(false);
    const [highlightedRow, setHighlightedRow] = useState(null);

    const handleInvalidInput = (button) => {
        if (button === 1) {
            setShakeButton(true);
            setTimeout(() => setShakeButton(false), 300);
        } else if (button === 2) {
            setShakeButton2(true);
            setTimeout(() => setShakeButton2(false), 300);
        }
    };
    const handleTypeLoanChange = (loanType) => {
        setTypeLoan(loanType);
        setHighlightedRow(loanType); // Resalta la fila correspondiente
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

    const handleCalculate = (e) => {
        e.preventDefault();
        if (propertyValue > MAX_VALUE || desiredAmount > MAX_VALUE) {
            handleInvalidInput(1);
            return;
        }
        if (!typeLoan) {  // Verificar que se haya seleccionado un tipo de crédito
            handleInvalidInput(1);
            return;  // Si no hay tipo de crédito, no hace nada
        }
        if (
            desiredAmount <= 0 ||
            propertyValue <= 0 ||
            timeLimit <= 0 ||
            interestRate <= 0 ||
            (typeLoan && desiredAmount > (propertyValue * loanRestrictions[typeLoan]?.maxFinancing)) ||
            (typeLoan && timeLimit > loanRestrictions[typeLoan]?.maxYears) ||
            (typeLoan && (interestRate < loanRestrictions[typeLoan]?.interestRateRange.min ||
                interestRate > loanRestrictions[typeLoan]?.interestRateRange.max))
        ) {
            handleInvalidInput(1);
            return; // No hace nada si los datos son inválidos
        }

        const credit = {
            id: 0,
            customerId: 0,
            follow_up: 0,
            executiveWorking: 0,
            amountWanted: desiredAmount,
            amountMax: propertyValue,
            interestRate: interestRate,
            typeLoan,
            timeLimit: timeLimit,
            pdfFilePath1: null,
            pdfFilePath2: null,
            pdfFilePath3: null,
            pdfFilePath4: null,
        }
        creditApplication.calculateMonthlyFee(credit)
            .then((response) => {
                if (response.data === -1) {
                    setErrorMessage("Por favor, vuelva a reingresar los datos, ya que el cálculo fue erróneo respecto a lo solicitado");
                    setCalculationResult(null);
                } else {
                    setErrorMessage("");
                    setCalculationResult(response.data);
                    if (!snackbarShown) {
                        setSnackbarOpen(true);
                        setSnackbarShown(true);
                    }
                }
            })
            .catch((error) => {
                console.error("Error al calcular el costo total:", error);
                setErrorMessage("Hubo un problema al procesar su solicitud. Intente nuevamente.");
            });
    };

    const handleCalculate2 = (e) => {
        e.preventDefault();
        if (propertyValue > MAX_VALUE || desiredAmount > MAX_VALUE) {
            handleInvalidInput(2);
            return;
        }
        if (!typeLoan) {  // Verificar que se haya seleccionado un tipo de crédito
            handleInvalidInput(2);
            return;  // Si no hay tipo de crédito, no hace nada
        }
        if (
            desiredAmount <= 0 ||
            propertyValue <= 0 ||
            timeLimit <= 0 ||
            interestRate <= 0 ||
            (typeLoan && desiredAmount > (propertyValue * loanRestrictions[typeLoan]?.maxFinancing)) ||
            (typeLoan && timeLimit > loanRestrictions[typeLoan]?.maxYears) ||
            (typeLoan && (interestRate < loanRestrictions[typeLoan]?.interestRateRange.min ||
                interestRate > loanRestrictions[typeLoan]?.interestRateRange.max))
        ) {
            handleInvalidInput(2);
            return; // No hace nada si los datos son inválidos
        }

        const credit = {
            id: 0,
            customerId: 0,
            follow_up: 0,
            executiveWorking: 0,
            amountWanted: desiredAmount,
            amountMax: propertyValue,
            interestRate: interestRate,
            typeLoan,
            timeLimit: timeLimit,
            pdfFilePath1: null,
            pdfFilePath2: null,
            pdfFilePath3: null,
            pdfFilePath4: null,
        }
        creditApplication.calculateTotalCost(credit)
            .then((response) => {
                if(response.data === -1){
                    setErrorMessage("Por favor, vuelva a reingresar los datos, ya que el cálculo fue erróneo respecto a lo solicitado");
                    setCalculationResult2(null);
                } else {
                    setErrorMessage("");
                    setCalculationResult2(response.data);
                    if (!snackbarShown2) {
                        setSnackbarOpen(true);
                        setSnackbarShown2(true);
                    }
                }
            })
            .catch((error) => {
                console.error("Error al calcular el costo mensual:", error);
                setErrorMessage("Hubo un problema al procesar su solicitud. Intente nuevamente.");
            });
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <Typography variant="h4">Simulación de Costos</Typography>
            <hr/>
            <LoanTypesTable highlightedRow={highlightedRow} />
            <hr/>
            <form>
                {/* Tipo de Préstamo */}
                <Grid container spacing={2}>
                    <Grid item xs={12} >
                        <FormControl fullWidth>
                            <Select
                                id="typeLoan"
                                value={typeLoan}
                                displayEmpty
                                onChange={(e) => handleTypeLoanChange(e.target.value)}
                                error={!typeLoan}
                            >
                                <MenuItem value="" disabled>
                                    Tipo de crédito
                                </MenuItem>
                                <MenuItem value={1}>Primera vivienda</MenuItem>
                                <MenuItem value={2}>Segunda vivienda</MenuItem>
                                <MenuItem value={3}>Propiedades comerciales</MenuItem>
                                <MenuItem value={4}>Remodelación</MenuItem>
                            </Select>
                            {!typeLoan && (
                                <Typography color="error" variant="caption">
                                    Por favor, seleccione un tipo de crédito para comenzar.
                                </Typography>
                            )}
                        </FormControl>
                    </Grid>

                    {typeLoan && (
                        <>
                            {/* Valor de la Propiedad */}
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <TextField
                                        id="propertyValue"
                                        label="Valor de la Propiedad en Miles"
                                        variant="standard"
                                        type={"number"}
                                        value={propertyValue}
                                        onChange={(e) => setPropertyValue(e.target.value)}
                                        helperText={
                                            propertyValue <= 0
                                                ? "Debe ser un valor positivo"
                                                : propertyValue > MAX_VALUE
                                                    ? "No puedes colocar un número más alto"
                                                    : ""
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "." || e.key === ",") {
                                                e.preventDefault();
                                            }
                                        }}
                                        error={propertyValue <= 0 || propertyValue > MAX_VALUE}
                                    />
                                </FormControl>
                            </Grid>

                            {/* Monto Deseado */}
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <TextField
                                        id="desiredAmount"
                                        label="Monto Deseado en Miles"
                                        variant="standard"
                                        type={"number"}
                                        value={desiredAmount}
                                        onChange={(e) => setDesiredAmount(e.target.value)}
                                        helperText={
                                            desiredAmount <= 0
                                                ? "Debe ser un valor positivo"
                                                : desiredAmount > MAX_VALUE
                                                    ? "No puedes colocar un número más alto"
                                                    : typeLoan
                                                        ? `Máximo valor a ingresar ${(propertyValue * loanRestrictions[typeLoan]?.maxFinancing)}`
                                                        : ""
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "." || e.key === ",") {
                                                e.preventDefault();
                                            }
                                        }}
                                        error={
                                            desiredAmount <= 0 ||
                                            desiredAmount > MAX_VALUE ||
                                            (typeLoan && desiredAmount > propertyValue * loanRestrictions[typeLoan]?.maxFinancing)
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
                                        type={"number"}
                                        value={timeLimit}
                                        onChange={(e) => setTimeLimit(e.target.value)}
                                        helperText={
                                            timeLimit <= 0
                                                ? "Debe ser un valor positivo"
                                                : typeLoan
                                                    ? `Máximo ${loanRestrictions[typeLoan]?.maxYears} años`
                                                    : ""
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "." || e.key === ",") {
                                                e.preventDefault();
                                            }
                                        }}
                                        error={timeLimit <= 0 || (typeLoan && timeLimit > loanRestrictions[typeLoan]?.maxYears)}
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
                                            min: loanRestrictions[typeLoan]?.interestRateRange?.min || 0,
                                            max: loanRestrictions[typeLoan]?.interestRateRange?.max || 100,
                                            step: 0.1,
                                        }}
                                        onChange={(e) => setInterestRate(e.target.value)}
                                        helperText={
                                            typeLoan
                                                ? `Entre ${loanRestrictions[typeLoan]?.interestRateRange.min}% y ${loanRestrictions[typeLoan]?.interestRateRange.max}%. No agregue el simbolo %.`
                                                : ""
                                        }
                                        error={
                                            typeLoan &&
                                            (interestRate < loanRestrictions[typeLoan]?.interestRateRange.min ||
                                                interestRate > loanRestrictions[typeLoan]?.interestRateRange.max)
                                        }
                                    />
                                </FormControl>
                            </Grid>
                        </>
                    )}
                </Grid>

                <br/>

                <Grid container spacing={2}>

                    {calculationResult && !calculationResult2 && (
                        <>
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography
                                            variant="h5"
                                            gutterBottom
                                            sx={{fontWeight: "bold", color: "secondary.main"}}
                                        >
                                            Resultados
                                        </Typography>
                                        <Divider sx={{marginBottom: 2}}/>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                gap: 1,
                                            }}
                                        >
                                            <Typography variant="h5" sx={{fontSize: "1.2rem", fontWeight: "bold"}}>
                                                Costo mensual: {calculationResult} mil pesos
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </>
                    )}

                    {calculationResult2 && calculationResult && (
                        <>
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography
                                            variant="h5"
                                            gutterBottom
                                            sx={{fontWeight: "bold", color: "secondary.main"}}
                                        >
                                            Resultados
                                        </Typography>
                                        <Divider sx={{marginBottom: 2}}/>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                gap: 1,
                                            }}
                                        >
                                            <Typography variant="h5" sx={{fontSize: "1.2rem", fontWeight: "bold"}}>
                                                Costo mensual: {calculationResult} mil pesos
                                            </Typography>
                                            <Typography variant="h5" sx={{fontSize: "1.2rem", fontWeight: "bold"}}>
                                                Costo total: {calculationResult2} mil pesos
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </>
                    )}

                    {calculationResult2 && !calculationResult && (
                        <>
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography
                                            variant="h5"
                                            gutterBottom
                                            sx={{fontWeight: "bold", color: "secondary.main"}}
                                        >
                                            Resultados
                                        </Typography>
                                        <Divider sx={{marginBottom: 2}}/>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                gap: 1,
                                            }}
                                        >
                                            <Typography variant="h5" sx={{fontSize: "1.2rem", fontWeight: "bold"}}>
                                                Costo total: {calculationResult2} mil pesos
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </>
                    )}

                </Grid>
                <br/>

                {typeLoan && (
                    <>
                        {/* Botones */}
                            <Grid item>
                                <Button
                                    variant="contained"
                                    color="info"
                                    onClick={handleCalculate}
                                    startIcon={<CalculateIcon/>}
                                    className={shakeButton ? "shake" : ""}
                                >
                                    Calcular Costo Mensual
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleCalculate2}
                                    startIcon={<CalculateIcon/>}
                                    className={shakeButton2 ? "shake" : ""}
                                >
                                    Calcular Costo Total
                                </Button>
                            </Grid>
                    </>
                )}
            </form>

            {errorMessage && (
                <Box mt={2}>
                    <Typography color="error">{errorMessage}</Typography>
                </Box>
            )}
        </Box>
    );
};

export default TotalCostSimulation;
