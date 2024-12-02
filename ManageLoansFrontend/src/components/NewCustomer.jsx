import React, { useState } from "react";
import { Box, TextField, Button, FormControl } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import customersService from "../services/credit-application.js";

const NewCustomer = () => {
    const [savingAccountEntity, setSavingAccountEntity] = useState({
        antique: 0,
        self_employed_worker: 0,
        amount: 0
    });

    const [birthDate, setBirthDate] = useState("1");
    const [name, setName] = useState("");
    const [drafts, setDrafts] = useState([]);
    const [draftAmount, setDraftAmount] = useState(0);
    const [amountAtThatTime, setAmountAtThatTime] = useState("");
    const [draftDate, setDraftDate] = useState("1");
    const [workHistories, setWorkHistories] = useState([]);
    const [errors, setErrors] = useState([]);
    const [income, setIncome] = useState(0);
    const [debt, setDebt] = useState(0);
    const [date, setdate] = useState("1");
    const [creditHistory, setCreditHistory] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleChange = (e) => {
        setSavingAccountEntity({ ...savingAccountEntity, [e.target.name]: e.target.value });
    };

    const addDraft = () => {
        const newDraft = { date: draftDate, drafts: draftAmount, amountAtThatTime: amountAtThatTime};
        setDrafts([...drafts, newDraft]);
        setDraftAmount(0);
        setDraftDate("1");
    };

    const addWorkHistories = () => {
        const newWorkHistory = {income: income, debt: debt, creditHistory: creditHistory, date: date}
        setWorkHistories([...workHistories, newWorkHistory]);
        setIncome(0);
        setDebt(0);
        setCreditHistory("");
        setdate("1");
    };

    const handleSelfEmployedToggle = (e) => {
        setSavingAccountEntity({ ...savingAccountEntity, selfEmployedWorker: e.target.checked ? 1 : 0 });
    };

    const validateForm = () => {
        const currentYear = new Date().getFullYear();
        const birthYear = new Date(birthDate).getFullYear();
        const age = currentYear - birthYear;

        const newErrors = [];

        if (!birthDate) {
            newErrors.push("La fecha de nacimiento es obligatoria.");
        } else if (age < 18) {
            newErrors.push("El cliente debe tener al menos 18 años.");
        }

        workHistories.forEach((history, index) => {
            if (!history.income || !history.debt || !history.creditHistory || !history.date) {
                newErrors.push(`WorkHistory #${index + 1} tiene campos vacíos.`);
            } else {
                if(history.income < 500){
                    newErrors.push("El ingreso mínimo es de 500 mil pesos.");
                }
                if(history.income < 0){
                    newErrors.push("El ingreso no puede ser negativo.");
                }
                if(history.debt < 0){
                    newErrors.push("La deuda no puede ser negativa.");
                }
            }
        });

        drafts.forEach((draft, index) => {
            const draftYear = new Date(draft.date).getFullYear();
            if (draft.drafts < 0) {
                newErrors.push(`El giro #${index + 1} no puede tener un monto negativo.`);
            }
            if (draft.amountAtThatTime < 0) {
                newErrors.push(`El monto en la cuenta en el giro #${index + 1} no puede ser negativo.`);
            }
            if (savingAccountEntity.antique && draftYear < currentYear - savingAccountEntity.antique) {
                newErrors.push(`El giro #${index + 1} no puede haberse realizado antes de la creación de la cuenta.`);
            }
        });

        if (savingAccountEntity.amount < 0) {
            newErrors.push("El monto de la cuenta no puede ser negativo.");
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                console.log("Se empieza a crear el cliente");
                const date = new Date().toISOString().split('T')[0];
                const customerHistory2 = {
                    content: "El cliente ha sido creado",
                    date
                };
                const savingAccount = {
                    drafts: drafts,
                    antique: savingAccountEntity.antique,
                    self_employed_worker: savingAccountEntity.self_employed_worker,
                    amount: savingAccountEntity.amount
                };
                const customerRequest = {
                    creditEvaluations: [],
                    customerHistory: [customerHistory2],
                    workHistory: workHistories,
                    savingAccount: savingAccount,
                    yearBirth: new Date(birthDate).getFullYear(),
                    name
                };
                await customersService.saveCustomer(customerRequest);
                console.log("Cliente guardado con exito");
                setSuccessMessage("Usuario creado con éxito! Vaya a la lista de usuarios para verlo.");
            } catch (error) {
                console.error("Error al guardar el cliente:", error);
                setErrors(["Error al guardar el cliente. Intenta de nuevo más tarde."]);
            }
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
            <h2>Crear Nuevo Cliente</h2>

            <FormControl fullWidth>
                <TextField
                    id="name"
                    label="Nombre"
                    value={name}
                    variant="standard"
                    onChange={(e) => setName(e.target.value)}
                />
            </FormControl>

            <FormControl fullWidth>
                <TextField
                    id="birthDate"
                    label="Fecha de Nacimiento"
                    type="date"
                    value={birthDate}
                    variant="standard"
                    onChange={(e) => setBirthDate(e.target.value)}
                />
            </FormControl>

            <h4>Registrar datos en la cuenta de ahorro</h4>

            <FormControl fullWidth>
                <TextField
                    id="antique"
                    name="antique"
                    label="Antigüedad (Años)"
                    type="number"
                    value={savingAccountEntity.antique}
                    variant="standard"
                    onChange={handleChange}
                />
            </FormControl>

            <FormControl fullWidth>
                <TextField
                    id="amount"
                    name="amount"
                    label="Monto de la Cuenta"
                    type="number"
                    value={savingAccountEntity.amount}
                    variant="standard"
                    onChange={handleChange}
                />
            </FormControl>

            <FormControl fullWidth>
                <label>
                    <input
                        type="checkbox"
                        checked={savingAccountEntity.selfEmployedWorker === 1}
                        onChange={handleSelfEmployedToggle}
                    />
                    Soy trabajador autónomo
                </label>
            </FormControl>

            <h4>Registrar historiales de trabajo</h4>

            <FormControl fullWidth>
                <TextField
                    id="income"
                    name="income"
                    label="Ingreso en miles"
                    type="number"
                    value={income}
                    variant="standard"
                    onChange={(e) => setIncome(e.target.value)}
                />
            </FormControl>

            <FormControl fullWidth>
                <TextField
                    id="debt"
                    name="debt"
                    label="Deuda en miles"
                    type="number"
                    value={debt}
                    variant="standard"
                    onChange={(e) => setDebt(e.target.value)}
                />
            </FormControl>

            <FormControl fullWidth>
                <TextField
                    id="creditHistory"
                    name="creditHistory"
                    label="Historial crediticio de la informacion que proporciona"
                    variant="standard"
                    value={creditHistory}
                    onChange={(e) => setCreditHistory(e.target.value)}
                />
            </FormControl>

            <FormControl fullWidth>
                <TextField
                    id="date"
                    label="Fecha en la cual se hizo este historial de trabajo"
                    type="date"
                    value={date}
                    variant="standard"
                    onChange={(e) => setdate(e.target.value)}
                />
            </FormControl>

            <Button variant="contained" color="secondary" onClick={addWorkHistories}>
                Agregar historial de trabajo
            </Button>

            <h4>Registrar giros hechos en la cuenta de ahorro</h4>
            <FormControl fullWidth>
                <TextField
                    id="draftAmount"
                    label="Monto del giro hecho en la cuenta de ahorro"
                    type="number"
                    value={draftAmount}
                    variant="standard"
                    onChange={(e) => setDraftAmount(e.target.value)}
                />
            </FormControl>

            <FormControl fullWidth>
                <TextField
                    id="draftDate"
                    label="Fecha en la cual realizo el giro en la cuenta de ahorro"
                    type="date"
                    value={draftDate}
                    variant="standard"
                    onChange={(e) => setDraftDate(e.target.value)}
                />
            </FormControl>

            <FormControl fullWidth>
                <TextField
                    id="amountAtThatTime"
                    label="monto que tenia la cuenta de ahorro en ese momento"
                    type="number"
                    value={amountAtThatTime}
                    variant="standard"
                    onChange={(e) => setAmountAtThatTime(e.target.value)}
                />
            </FormControl>

            <Button variant="contained" color="secondary" onClick={addDraft}>
                Agregar giro hecho
            </Button>
            <h5>Historial de trabajo guardado:</h5>
            <ul>
                {workHistories.map((draft, index) => (
                    <li key={index}>
                        {draft.date}: Deuda: {draft.debt} Ingreso: {draft.income} Historia crediticia:
                        {draft.creditHistory}
                    </li>
                ))}
            </ul>
            <h5>Giros en la cuenta de ahorro agregados:</h5>
            <ul>
                {drafts.map((draft, index) => (
                    <li key={index}>
                        {draft.date}: Monto en ese momento: {draft.amountAtThatTime} Giro hecho: {draft.drafts}
                    </li>
                ))}
            </ul>

            {errors.length > 0 && (
                <Box sx={{color: "red"}}>
                    <h4>Errores:</h4>
                    <ul>
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </Box>
            )}

            <Button variant="contained" type="submit" startIcon={<SaveIcon/>}>
                Guardar Cliente
            </Button>

            {successMessage && (
                <Box sx={{ color: "green", mb: 2 }}>
                    <p>{successMessage}</p>
                </Box>
            )}
        </Box>
    );
};

export default NewCustomer;
