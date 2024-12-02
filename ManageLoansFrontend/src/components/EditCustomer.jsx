import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, TextField, Button, FormControl } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import customersService from "../services/credit-application.js";

const EditCustomer = () => {
    const { id } = useParams();
    useEffect(() => {
        const fetchCustomerData = async () => {
            try {
                const response = await customersService.getCustomerById(id);
                setDrafts(response.data.savingAccount.drafts);
                setAntique(response.data.savingAccount.antique);
                setSelf_employed_worker(response.data.savingAccount.self_employed_worker);
                setAmount(response.data.savingAccount.amount);
                setWorkHistories(response.data.workHistory);
                setName(response.data.name);

            } catch (error) {
                console.error("Error al cargar los datos del cliente:", error);
            }
        };
        fetchCustomerData();
    }, [id]);

    const [name, setName] = useState("");
    const [antique,setAntique] = useState(0);
    const [self_employed_worker,setSelf_employed_worker] = useState(0);
    const [amount,setAmount] = useState(0);
    const [drafts, setDrafts] = useState([]);
    const [draftAmount, setDraftAmount] = useState(0);
    const [amountAtThatTime, setAmountAtThatTime] = useState("");
    const [draftDate, setDraftDate] = useState("0");
    const [workHistories, setWorkHistories] = useState([]);
    const [errors, setErrors] = useState([]);
    const [income, setIncome] = useState(0);
    const [debt, setDebt] = useState(0);
    const [date, setdate] = useState("0");
    const [creditHistory, setCreditHistory] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const addDraft = () => {
        const newDraft = { date: draftDate, drafts: draftAmount, amountAtThatTime: amountAtThatTime};
        setDrafts([...drafts, newDraft]);
        setDraftAmount(0);
        setDraftDate("0");
    };

    const addWorkHistories = () => {
        const newWorkHistory = {income: income, debt: debt, creditHistory: creditHistory, date: date}
        setWorkHistories([...workHistories, newWorkHistory]);
        setIncome(0);
        setDebt(0);
        setCreditHistory("");
        setdate("0");
    };

    const handleSelfEmployedToggle = (e) => {
        setSelf_employed_worker(e.target.checked ? 1 : 0);
    };

    const validateForm = () => {
        const newErrors = [];

        workHistories.forEach((history, index) => {
            if (!history.income || !history.debt || !history.creditHistory || !history.date) {
                newErrors.push(`WorkHistory #${index + 1} tiene campos vacíos.`);
            }else{
                if(history.income < 500){
                    newErrors.push("No puedes registrar un sueldo menor al mínimo estipulado (500 mil pesos).");
                }
                if(history.income > Number.MAX_SAFE_INTEGER){
                    newErrors.push("No puedes registrar ese valor tan alto para el ingreso.");
                }
                if(history.debt > Number.MAX_SAFE_INTEGER){
                    newErrors.push("No puedes registrar ese valor tan alto para la deuda.");
                }
                if(history.creditHistory.length > 255){
                    newErrors.push("No puedes enviar un texto tan largo en el historial de crédito.");
                }
            }
        });

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleModify = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                console.log("Se empieza a crear el cliente");
                const date = new Date().toISOString().split('T')[0];
                const customerHistory2 = {
                    content: "El cliente ha sido modificado",
                    date
                };
                const savingAccount = {
                    drafts: drafts,
                    antique: antique,
                    self_employed_worker: self_employed_worker,
                    amount: amount
                };

                const customerRequest = {
                    workHistoryEntities: workHistories,
                    savingAccountEntity: savingAccount,
                    creditEvaluationsEntities: [],
                    customerHistoryEntities: customerHistory2,
                };

                console.log("Datos a enviar:", JSON.stringify(customerRequest, null, 2));
                const newCustomer = await customersService.updateCustomer(id, customerRequest);
                console.log("Cliente editado con exito:", JSON.stringify(newCustomer.data, null, 2));
                setSuccessMessage("Usuario editado con éxito! Vaya a la lista de usuarios para verlo.");
            } catch (error) {
                console.error("Error al guardar el cliente:", error);
                setErrors(["Error al guardar el cliente. Intenta de nuevo más tarde."]);
            }
        }
    };

    return (
        <Box component="form" onSubmit={handleModify} noValidate autoComplete="off">
            <h2>Editar cliente: {name}</h2>

            <h4>Modificar datos en la cuenta de ahorro</h4>

            <FormControl fullWidth>
                <TextField
                    id="antique"
                    name="antique"
                    label="Antigüedad (Años)"
                    type="number"
                    value={antique}
                    variant="standard"
                    onChange={(e) => setAntique(e.target.value)}
                />
            </FormControl>

            <FormControl fullWidth>
                <TextField
                    id="amount"
                    name="amount"
                    label="Monto de la Cuenta"
                    type="number"
                    value={amount}
                    variant="standard"
                    onChange={(e) => setAmount(e.target.value)}
                />
            </FormControl>

            <FormControl fullWidth>
                <label>
                    <input
                        type="checkbox"
                        checked={self_employed_worker === 1}
                        onChange={handleSelfEmployedToggle}
                    />
                    Soy trabajador autónomo
                </label>
            </FormControl>

            <h4>Registrar nuevos historiales de trabajo</h4>

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

            <h4>Registrar nuevos giros hechos en la cuenta de ahorro</h4>
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
            <h5>Historial de trabajo nuevos guardado:</h5>
            <ul>
                {workHistories.map((draft, index) => (
                    <li key={index}>
                        {draft.date}: Deuda: {draft.debt} Ingreso: {draft.income} Historia crediticia:
                        {draft.creditHistory}
                    </li>
                ))}
            </ul>
            <h5>Giros en la cuenta de ahorro nuevos agregados:</h5>
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
                Modificar Cliente
            </Button>

            {successMessage && (
                <Box sx={{ color: "green", mb: 2 }}>
                    <p>{successMessage}</p>
                </Box>
            )}
        </Box>
    );
};

export default EditCustomer;
