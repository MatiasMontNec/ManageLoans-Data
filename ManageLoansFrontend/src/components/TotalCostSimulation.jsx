import React, { useState } from 'react';
import { Box, Button, FormControl, TextField, Typography, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import manageService from "../services/user-registration.js";
import creditEvaluationsService from "../services/credit-simulator.js";

const TotalCostSimulation = () => {
    const [desiredAmount, setDesiredAmount] = useState("");
    const [propertyValue, setPropertyValue] = useState("");
    const [timeLimit, setTimeLimit] = useState("");
    const [interestRate, setInterestRate] = useState("");
    const [typeLoan, setTypeLoan] = useState("");
    const [calculationResult, setCalculationResult] = useState(null);
    const [calculationResult2, setCalculationResult2] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const handleCalculate = (e) => {
        e.preventDefault();
        const interestRatePercentage = interestRate / 100;

        manageService.checkTotalCostCalculation(
            desiredAmount,
            propertyValue,
            timeLimit,
            interestRatePercentage,
            typeLoan
        )
            .then((response) => {
                if (response.data === -1) {
                    setErrorMessage("Por favor, vuelva a reingresar los datos, ya que el cálculo fue erróneo respecto a lo solicitado");
                    setCalculationResult(null);
                } else {
                    setErrorMessage("");
                    setCalculationResult(response.data);
                }
            })
            .catch((error) => {
                console.error("Error al calcular el costo total:", error);
                setErrorMessage("Hubo un problema al procesar su solicitud. Intente nuevamente.");
            });
    };

    const handleCalculate2 = (e) => {
        e.preventDefault();
        const interestRatePercentage = interestRate / 100;

        creditEvaluationsService.calculateMonthlyFee(
            desiredAmount,
            propertyValue,
            timeLimit,
            interestRatePercentage,
            typeLoan
        )
            .then((response) => {
                if(response.data === -1){
                    setErrorMessage("Por favor, vuelva a reingresar los datos, ya que el cálculo fue erróneo respecto a lo solicitado");
                    setCalculationResult2(null);
                } else {
                    setErrorMessage("");
                    setCalculationResult2(response.data);
                }
            })
            .catch((error) => {
                console.error("Error al calcular el costo mensual:", error);
                setErrorMessage("Hubo un problema al procesar su solicitud. Intente nuevamente.");
            });
    };

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <Typography variant="h4">Simulación de Costos!</Typography>
            <hr />

            <TableContainer component={Paper} style={{ marginBottom: "20px" }}>
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
            <hr />
            <form onSubmit={handleCalculate}>
                <FormControl fullWidth margin="normal">
                    <TextField
                        id="desiredAmount"
                        label="Monto Deseado"
                        variant="standard"
                        value={desiredAmount}
                        onChange={(e) => setDesiredAmount(e.target.value)}
                    />
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <TextField
                        id="propertyValue"
                        label="Valor de la Propiedad"
                        variant="standard"
                        value={propertyValue}
                        onChange={(e) => setPropertyValue(e.target.value)}
                    />
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <TextField
                        id="timeLimit"
                        label="Plazo Máximo"
                        variant="standard"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(e.target.value)}
                    />
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <TextField
                        id="interestRate"
                        label="Tasa Interés Anual"
                        variant="standard"
                        value={interestRate}
                        type="number"
                        inputProps={{ min: 3.5, max: 7, step: 0.1 }}
                        onChange={(e) => setInterestRate(e.target.value)}
                        helperText="Debe estar entre 3.5% y 7%"
                    />
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <Select
                        id="typeLoan"
                        label="Tipo de Crédito"
                        value={typeLoan}
                        displayEmpty
                        onChange={(e) => setTypeLoan(e.target.value)}
                    >
                        <MenuItem value="" disabled>Tipo de Crédito</MenuItem>
                        <MenuItem value={1}>1</MenuItem>
                        <MenuItem value={2}>2</MenuItem>
                        <MenuItem value={3}>3</MenuItem>
                        <MenuItem value={4}>4</MenuItem>
                    </Select>
                </FormControl>

                <FormControl margin="normal">
                    <Button
                        variant="contained"
                        color="info"
                        type="submit"
                        startIcon={<CalculateIcon />}
                    >
                        Calcular Costo Total
                    </Button>
                </FormControl>

                <FormControl margin="normal">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCalculate2}
                        startIcon={<CalculateIcon />}
                    >
                        Calcular Costo Mensual
                    </Button>
                </FormControl>
            </form>

            {errorMessage && (
                <Box mt={2}>
                    <Typography color="error">{errorMessage}</Typography>
                </Box>
            )}

            {calculationResult && (
                <Box marginTop={4}>
                    <Typography variant="h6">Resultado del costo total:</Typography>
                    <Typography>{calculationResult}</Typography>
                </Box>
            )}

            {calculationResult2 && (
                <Box marginTop={4}>
                    <Typography variant="h6">Resultado del Costo Mensual:</Typography>
                    <Typography>{calculationResult2}</Typography>
                </Box>
            )}
        </Box>
    );
};

export default TotalCostSimulation;
