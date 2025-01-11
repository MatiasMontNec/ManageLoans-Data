import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import { useState, useEffect } from "react";
import { Button, MenuItem, Select, FormControl, InputLabel, TextField } from "@mui/material";


export const LoanTypesTable = ({ highlightedRow }) => {
    const rows = [
        {
            id: 1,
            name: "Primera vivienda",
            maxYears: "30 años",
            interestRate: "3.5% - 5%",
            maxFinancing: "80% del valor de la propiedad",
            requirements: "Comprobante de ingresos, certificado de avalúo e historial crediticio",
        },
        {
            id: 2,
            name: "Segunda vivienda",
            maxYears: "20 años",
            interestRate: "4% - 6%",
            maxFinancing: "70% del valor de la propiedad",
            requirements: "Comprobante de ingresos, certificado de avalúo, escritura de primera vivienda e historial crediticio",
        },
        {
            id: 3,
            name: "Propiedades comerciales",
            maxYears: "25 años",
            interestRate: "5% - 7%",
            maxFinancing: "60% del valor de la propiedad",
            requirements: "Estado financiero del negocio, comprobante de ingresos, certificado de avalúo y plan de negocios",
        },
        {
            id: 4,
            name: "Remodelación",
            maxYears: "15 años",
            interestRate: "4.5% - 6%",
            maxFinancing: "50% del valor de la propiedad",
            requirements: "Comprobante de ingresos, presupuesto de remodelación y certificado de avalúo actualizado",
        },
    ];

    return (
        <TableContainer component={Paper} style={{ marginBottom: "20px" }}>
            <Table aria-label="tabla de tipos de préstamo">
                <TableHead>
                    <TableRow>
                        <TableCell
                            sx={{
                                fontWeight: "bold",
                                color: "secondary.main",
                                backgroundColor: "#f5f5f5",
                            }}
                        >
                            Tipo de Préstamo
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: "bold",
                                color: "secondary.main",
                                backgroundColor: "#f5f5f5",
                            }}
                        >
                            Plazo Máximo
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: "bold",
                                color: "secondary.main",
                                backgroundColor: "#f5f5f5",
                            }}
                        >
                            Tasa Interés Anual
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: "bold",
                                color: "secondary.main",
                                backgroundColor: "#f5f5f5",
                            }}
                        >
                            Monto Máximo de Financiamiento
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: "bold",
                                color: "secondary.main",
                                backgroundColor: "#f5f5f5",
                            }}
                        >
                            Requerimientos documentales
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.id} style={{ backgroundColor: highlightedRow === row.id ? "#c6f1ee" : "inherit" }}>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>{row.maxYears}</TableCell>
                            <TableCell>{row.interestRate}</TableCell>
                            <TableCell>{row.maxFinancing}</TableCell>
                            <TableCell>{row.requirements}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export const generateYears = (type) => {
    const currentYear = new Date().getFullYear();

    if (type === 0) {
        // Años desde el actual menos 17 hasta el actual menos 120
        const minYear = currentYear - 120;
        const maxYear = currentYear - 17;
        return Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
    } else if (type > 0) {
        // Rango dinámico basado en la edad del usuario
        const minYear = currentYear - type +17;
        const maxYear = currentYear;
        return minYear <= maxYear
            ? Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i)
            : []; // Devuelve vacío si el rango es inválido
    } else {
        return []; // Inicialmente vacío si no hay información suficiente
    }
};


// Función para generar meses
export const generateMonths = (year, currentYear) => {
    const currentMonth = new Date().getMonth() + 1; // Mes actual
    if (year === currentYear) {
        return Array.from({ length: currentMonth }, (_, i) => i + 1); // Solo meses hasta el actual
    } else {
        return Array.from({ length: 12 }, (_, i) => i + 1);
    }
};

// Función para generar días según el año y mes
export const generateDays = (year, month, currentYear, currentMonth) => {
    const currentDay = new Date().getDate(); // Día actual
    const daysInMonth = new Date(year, month, 0).getDate();

    if (year === currentYear && month === currentMonth) {
        return Array.from({ length: currentDay }, (_, i) => i + 1); // Solo días hasta el actual
    } else {
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    }
};

// Componente DatePicker
export const DatePicker = ({ label, selectedDate, setSelectedDate, type }) => {
    const [years, setYears] = useState([]);
    const [months, setMonths] = useState([]);
    const [days, setDays] = useState([]);

    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);

    const [formattedDate, setFormattedDate] = useState("");

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    useEffect(() => {
        const generatedYears = generateYears(type);
        if (generatedYears.length > 0) {
            setYears(generatedYears);
        } else {
            console.warn("La lista de años está vacía. Revisa el type.");
            setYears([]);
        }
    }, [type]);

    useEffect(() => {
        if (selectedYear) {
            setMonths(generateMonths(selectedYear, currentYear));
        } else {
            setMonths([]);
        }
    }, [selectedYear]);

    useEffect(() => {
        if (selectedYear && selectedMonth) {
            setDays(generateDays(selectedYear, selectedMonth, currentYear, currentMonth));
        } else {
            setDays([]);
        }
    }, [selectedYear, selectedMonth]);

    const handleDateChange = () => {
        const date = getFormattedDate(selectedYear, selectedMonth, selectedDay);
        setSelectedDate(date);
        setFormattedDate(date);
    };

    const getFormattedDate = (year, month, day) => {
        if (!year || !month || !day) return null;
        return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
    };

    return (
        <div style={{display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center'}}>
            {type !== -1 && (
                <>
                    {/* Año */}
                    <FormControl sx={{minWidth: 120}}>
                        <InputLabel>Año</InputLabel>
                        <Select
                            value={selectedYear || ""}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            label="Año"
                        >
                            <MenuItem value="">Año</MenuItem>
                            {years.map((year, index) => (
                                <MenuItem key={index} value={year}>
                                    {year}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Mes */}
                    <FormControl sx={{minWidth: 120}} disabled={!selectedYear}>
                        <InputLabel>Mes</InputLabel>
                        <Select
                            value={selectedMonth || ""}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            label="Mes"
                        >
                            <MenuItem value="">Mes</MenuItem>
                            {months.map((month, index) => (
                                <MenuItem key={index} value={month}>
                                    {month}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Día */}
                    <FormControl sx={{minWidth: 120}} disabled={!selectedYear || !selectedMonth}>
                        <InputLabel>Día</InputLabel>
                        <Select
                            value={selectedDay || ""}
                            onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                            label="Día"
                        >
                            <MenuItem value="">Día</MenuItem>
                            {days.map((day, index) => (
                                <MenuItem key={index} value={day}>
                                    {day}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Botón */}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleDateChange}
                        sx={{marginTop: '10px'}}
                    >
                        Seleccionar {label}
                    </Button>
                    {formattedDate && <p>Fecha seleccionada: {formattedDate}</p>}
                </>
            )}
        </div>
    );
};

export default {
    LoanTypesTable, DatePicker
};