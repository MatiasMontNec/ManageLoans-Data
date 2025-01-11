import { useState} from "react";
import {Box, TextField, Button, FormControl, Slider, FormControlLabel, Checkbox} from "@mui/material";
import {Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, CardContent, Grid, Divider} from "@mui/material";
import { DatePicker } from './functions';
import SaveIcon from "@mui/icons-material/Save";
import userRegistration from "../services/user-registration.js";
import creditEvaluation from "../services/credit-evaluation.js";
import trackingRequests from "../services/tracking-requests.js";
import creditSimulator from "../services/credit-simulator.js";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";
import successAnimationData from '../animations/success-animation.json';

const NewCustomer = () => {
    const [savingAccountEntity, setSavingAccountEntity] = useState({
        antique: 0,
        self_employed_worker: 0,
        amount: 0
    });

    const getYearFromDate = (birthDate) => {
        const currentYear = new Date().getFullYear();
        const birthYear = parseInt(birthDate.split("-")[0]); // Asumiendo que birthDate es en formato "YYYY-MM-DD"
        return currentYear - birthYear;
    };
    const [caso, setCaso] = useState(0);

    const [birthDate, setBirthDate] = useState("-1");
    const [draftDate, setDraftDate] = useState("1");
    const [date, setdate] = useState("1");
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [drafts, setDrafts] = useState([]);
    const [draftAmount, setDraftAmount] = useState(0);
    const [amountAtThatTime, setAmountAtThatTime] = useState("");
    const [workHistories, setWorkHistories] = useState([]);
    const [errors, setErrors] = useState([]);
    const [income, setIncome] = useState(0);
    const [debt, setDebt] = useState(0);
    const [creditHistory, setCreditHistory] = useState("");
    const MAX_VALUE = 1000000000000000000;
    const MIN_VALUE = -1000000000000000000;
    const MAX_CHARACTERS = 200;
    const [markedForDeletion, setMarkedForDeletion] = useState([]);

    const [shakeButton, setShakeButton] = useState(false);
    const [shakeButton2, setShakeButton2] = useState(false);
    const handleInvalidInput = (button) => {
        if (button === 1) {
            setShakeButton(true);
            setTimeout(() => setShakeButton(false), 300);
        }else if(button === 2){
            setShakeButton2(true);
            setTimeout(() => setShakeButton2(false), 300);
        }
    };

    const [markedDraftsForDeletion, setMarkedDraftsForDeletion] = useState([]);

    // Marcar un draft para eliminación
    const handleMarkDraftForDeletion = (id) => {
        setMarkedDraftsForDeletion((prev) => [...prev, id]);
    };

    // Deshacer la eliminación de un draft
    const handleUndoDraftDeletion = (id) => {
        setMarkedDraftsForDeletion((prev) => prev.filter((draftId) => draftId !== id));
    };


    const toggleMarkForDeletion = (index) => {
        if (markedForDeletion.includes(index)) {
            // Si ya está marcado, desmarcarlo
            setMarkedForDeletion(markedForDeletion.filter((i) => i !== index));
        } else {
            // Si no está marcado, agregarlo
            setMarkedForDeletion([...markedForDeletion, index]);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleChange = (e) => {
        setSavingAccountEntity({ ...savingAccountEntity, [e.target.name]: e.target.value });
    };

    const addDraft = () => {
        // Validar restricciones
        if (
            draftAmount < MIN_VALUE ||
            draftAmount > MAX_VALUE ||
            amountAtThatTime < 0 ||
            amountAtThatTime > MAX_VALUE ||
            draftDate === "1"
        ) {
            handleInvalidInput(2); // Hacer vibrar el botón
            return; // Evitar que se ejecute el resto de la función
        }

        // Si todas las validaciones pasan, agregar el giro
        const newDraft = { date: draftDate, drafts: draftAmount, amountAtThatTime: amountAtThatTime };
        setDrafts([...drafts, newDraft]);
        setDraftAmount(0);
        setAmountAtThatTime(0);
        setDraftDate("1");
    };

    const addWorkHistories = () => {
        if (
            income < 500 ||
            debt < 0 ||
            debt > MAX_VALUE ||
            creditHistory.length > MAX_CHARACTERS ||
            date === "1"
        ) {
            handleInvalidInput(1); // Hacer vibrar el botón
            return; // Evitar que se ejecute el resto de la función
        }
        const newWorkHistory = { income: income, debt: debt, creditHistory: creditHistory, date: date };
        setWorkHistories([...workHistories, newWorkHistory]);
        setIncome(0);
        setDebt(0);
        setCreditHistory("");
        setdate("1");
    };

    const handleReturn = () => {
        setCaso(caso - 1);
    }

    const handleNext = () => {
        setCaso(caso + 1);
        console.log(savingAccountEntity.self_employed_worker);
    }

    const handleSelfEmployedToggle = (e) => {
        const newValue = e.target.checked ? 1 : 0;
        console.log('Nuevo valor:', newValue);
        setSavingAccountEntity({
            ...savingAccountEntity,
            self_employed_worker: newValue
        });
    };

    const isNextDisabled = () => {
        switch (caso) {
            case 0:
                return !name || name.length >= MAX_CHARACTERS || !birthDate || birthDate === "-1";

            case 1:
                return savingAccountEntity.amount < 0 || savingAccountEntity.amount > MAX_VALUE;

            case 2:
                { if (workHistories.length === 0) return true;

                const allMarkedForDeletion = workHistories.every((_, index) =>
                    markedForDeletion.includes(index)
                );
                return allMarkedForDeletion; }

            case 3:
                { if (drafts.length === 0) return true;

                const allDraftsMarkedForDeletion = drafts.every(draft =>
                    markedDraftsForDeletion.includes(draft.id)
                );
                return allDraftsMarkedForDeletion; }

            default:
                return false;
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            console.log("Se empieza a crear el cliente");

            // Crear cliente
            const customer = {
                yearBirth: new Date(birthDate).getFullYear(),
                name,
            };
            const customerResponse = await userRegistration.saveCustomer(customer);
            const customerId = customerResponse.data.id; // ID del cliente creado

            console.log("Cliente creado con ID:", customerId);

            // Guardar Work Histories
            for (const [index, workHistory] of workHistories.entries()) {
                if (!markedForDeletion.includes(index)) {
                    const workHistoryEntity = {
                        customerId, // Asociado al cliente creado
                        income: workHistory.income,
                        debt: workHistory.debt,
                        creditHistory: workHistory.creditHistory,
                        date: workHistory.date,
                    };
                    await creditEvaluation.saveWorkHistory(workHistoryEntity);
                }
            }

            // Guardar Customer History
            const date = new Date().toISOString().split("T")[0];
            const customerHistory2 = {
                customerId,
                content: "El cliente ha sido creado",
                date,
            };
            await userRegistration.saveCustomerHistory(customerHistory2);

            // Crear Saving Account
            const savingAccount = {
                customerId, // Asociado al cliente creado
                antique: savingAccountEntity.antique,
                self_employed_worker: savingAccountEntity.self_employed_worker,
                amount: savingAccountEntity.amount,
            };
            const savingAccountResponse = await trackingRequests.saveSavingAccount(savingAccount);
            const savingAccountId = savingAccountResponse.data.id; // ID de la cuenta creada

            console.log("Cuenta de ahorro creada con ID:", savingAccountId);

            // Guardar Drafts (excluir los marcados para eliminación)
            for (const draft of drafts) {
                if (!markedDraftsForDeletion.includes(draft.id)) {
                    const accountDraft = {
                        savingAccountId, // Asociado a la cuenta de ahorro creada
                        date: draft.date,
                        drafts: draft.drafts,
                        amountAtThatTime: draft.amountAtThatTime,
                    };
                    await creditSimulator.saveAccountDraft(accountDraft);
                }
            }

            console.log("Cliente guardado con éxito");
            setName("");
            setBirthDate("-1");
            setSavingAccountEntity({antique: 0, amount: 0, self_employed_worker: 0});
            setdate("1");
            setDraftDate("1");
            setDrafts([]);
            setWorkHistories([]);
            handleNext()
        } catch (error) {
            console.error("Error al guardar el cliente:", error);
            setErrors(["Error al guardar el cliente. Intenta de nuevo más tarde."]);
        }
    };

    const handleSliderChange = (value) => {
        setSavingAccountEntity((prevState) => ({
            ...prevState,
            antique: value, // Actualiza la antigüedad directamente en el estado
        }));
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
            <h2>Crear Nuevo Cliente</h2>

            {caso === 0 && (
                <>
                    <Grid item xs={12}>
                        <Typography sx={{ marginBottom: 2, fontSize: "1.2rem" }}>
                            Registra tu nombre/alias en conjunto con tu fecha de nacimiento para
                            comenzar.
                        </Typography>
                    </Grid>
                    <FormControl fullWidth>
                        <TextField
                            id="name"
                            label="Nombre"
                            value={name}
                            variant="standard"
                            onChange={(e) => setName(e.target.value)}
                            inputProps={{
                                maxLength: MAX_CHARACTERS, // Limita los caracteres directamente
                            }}
                            helperText={
                                name.length >= MAX_CHARACTERS
                                    ? "Has alcanzado el límite máximo de caracteres"
                                    : `Te quedan ${MAX_CHARACTERS - name.length} caracteres disponibles`
                            }
                            error={name.length >= MAX_CHARACTERS}
                        />
                    </FormControl>
                    <br/>
                    <br/>
                    <DatePicker label="Fecha de Nacimiento" selectedDate={birthDate} setSelectedDate={setBirthDate}
                                type={0}/>
                </>

            )}

            {caso === 1 && (
                <>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <Typography sx={{ marginBottom: 2, fontSize: "1.2rem" }}>
                                Registra la antigüedad en tu cuenta de ahorro, el monto de tu cuenta de ahorro actual y si eres trabajador autónomo.
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <Typography gutterBottom>Antigüedad de tu cuenta de ahorro en Años</Typography>
                                <Slider
                                    value={savingAccountEntity.antique}
                                    onChange={(e, newValue) => handleSliderChange(newValue)} // Maneja el cambio
                                    min={0}
                                    max={getYearFromDate(birthDate) - 18}
                                    step={1}
                                    valueLabelDisplay="auto"
                                    valueLabelFormat={(value) => `${value} años`}
                                />

                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <TextField
                                    id="amount"
                                    name="amount"
                                    label="Monto de la Cuenta en miles"
                                    type="number"
                                    value={savingAccountEntity.amount}
                                    variant="standard"
                                    onChange={handleChange}
                                    helperText={
                                        savingAccountEntity.amount < 0
                                            ? "Su monto no puede ser negativo"
                                            : savingAccountEntity.amount > MAX_VALUE
                                                ? "No puedes colocar un número más alto"
                                                : ""
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "." || e.key === ",") {
                                            e.preventDefault();
                                        }
                                    }}
                                    error={savingAccountEntity.amount < 0 || savingAccountEntity.amount > MAX_VALUE}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}
                            >
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={savingAccountEntity.self_employed_worker === 1}
                                            onChange={handleSelfEmployedToggle}
                                            color="secondary"
                                        />
                                    }
                                    label="Soy trabajador autónomo"
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </>
            )}

            {caso === 2 && (
                <>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <Typography sx={{ marginBottom: 2, fontSize: "1.2rem" }}>
                                Registra el último día que trabajaste con el ingreso que recibías, la deuda que portaste e información opcional. Ej:
                                Ingreso: 500, Deuda 0, Fecha: hoy, Información opcional: Guardia de Abastible. Puedes agregar trabajos antiguos que
                                tuviste con la fecha del último día que lo ejerciste.
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <TextField
                                    id="income"
                                    name="income"
                                    label="Ingreso en miles"
                                    type="number"
                                    value={income}
                                    variant="standard"
                                    onChange={(e) => setIncome(e.target.value)}
                                    helperText={income > MAX_VALUE
                                                ? "No puedes colocar un número más alto"
                                                : "Debe ser un valor igual o superior a 500 mil"
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "." || e.key === ",") {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <TextField
                                    id="debt"
                                    name="debt"
                                    label="Deuda en miles"
                                    type="number"
                                    value={debt}
                                    variant="standard"
                                    onChange={(e) => setDebt(e.target.value)}
                                    helperText={
                                        debt < 0
                                            ? "No puede tener deudas negativas"
                                            : debt > MAX_VALUE
                                                ? "No puedes colocar un número más alto"
                                                : ""
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "." || e.key === ",") {
                                            e.preventDefault();
                                        }
                                    }}
                                    error={debt < 0 || debt > MAX_VALUE}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <TextField
                                    id="creditHistory"
                                    name="creditHistory"
                                    label="Información opcional"
                                    variant="standard"
                                    value={creditHistory}
                                    onChange={(e) => setCreditHistory(e.target.value)}
                                    inputProps={{
                                        maxLength: MAX_CHARACTERS,
                                    }}
                                    helperText={
                                        creditHistory.length >= MAX_CHARACTERS
                                            ? "Has alcanzado el límite máximo de caracteres"
                                            : `Te quedan ${MAX_CHARACTERS - creditHistory.length} caracteres disponibles. Puedes dejar esto vacío`
                                    }
                                    error={creditHistory.length >= MAX_CHARACTERS}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <DatePicker
                                label="Fecha del último día de su trabajo"
                                selectedDate={date}
                                setSelectedDate={setdate}
                                type={birthDate === "-1" ? -1 : getYearFromDate(birthDate)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={addWorkHistories}
                                className={shakeButton ? "shake" : ""}
                            >
                                Agregar historial de trabajo
                            </Button>
                        </Grid>
                        {workHistories.length > 0 && (
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography
                                            variant="h5"
                                            gutterBottom
                                            sx={{ fontWeight: "bold", color: "secondary.main" }}
                                        >
                                            Historial de Trabajo a Guardar
                                        </Typography>
                                        <Divider sx={{ marginBottom: 2 }} />
                                        <TableContainer component={Paper}>
                                            <Table size="small" aria-label="work history saved table">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Fecha
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Deuda
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Ingreso
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Historia crediticia
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Deje al menos uno, puede agregar mas si desea eliminar los actuales.
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {workHistories.map((workHistory, index) => (
                                                        <TableRow
                                                            key={index}
                                                            style={{
                                                                textDecoration: markedForDeletion.includes(index) ? "line-through" : "none",
                                                                opacity: markedForDeletion.includes(index) ? 0.5 : 1,
                                                            }}
                                                        >
                                                            <TableCell align="right">{formatDate(workHistory.date)}</TableCell>
                                                            {workHistory.debt === 0 && (
                                                                <TableCell align="right">{workHistory.debt} pesos</TableCell>
                                                            )}
                                                            {workHistory.debt !== 0 && (
                                                                <TableCell align="right">{workHistory.debt} miles de pesos</TableCell>
                                                            )}
                                                            <TableCell align="right">{workHistory.income} miles de pesos</TableCell>
                                                            <TableCell
                                                                align="right"
                                                                sx={{
                                                                    wordWrap: "break-word",
                                                                    whiteSpace: "pre-wrap",
                                                                    maxWidth: "500px", // Ajusta este valor según tu diseño
                                                                }}
                                                            >
                                                                {workHistory.creditHistory}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Button
                                                                    variant="text"
                                                                    color={markedForDeletion.includes(index) ? "primary" : "secondary"}
                                                                    onClick={() => toggleMarkForDeletion(index)}
                                                                >
                                                                    {markedForDeletion.includes(index) ? "Deshacer" : "Eliminar"}
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                    </Grid>
                </>
            )}

            {caso === 3 && (
                <>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <Typography sx={{ marginBottom: 2, fontSize: "1.2rem" }}>
                                Registra los giros realizados en tu cuenta de ahorro. Ingresa el monto del giro: usa un valor
                                negativo para indicar un retiro y un valor positivo para un depósito. Luego, especifica el saldo que tenía la cuenta
                                antes del giro y la fecha en que se realizó.
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <TextField
                                    id="draftAmount"
                                    label="Monto en miles del giro hecho en la cuenta de ahorro"
                                    type="number"
                                    value={draftAmount}
                                    variant="standard"
                                    onChange={(e) => setDraftAmount(e.target.value)}
                                    helperText={
                                        draftAmount < MIN_VALUE
                                            ? "No puedes colocar un retiro más bajo"
                                            : draftAmount > MAX_VALUE
                                                ? "No puedes colocar un deposito más alto"
                                                : "Puede colocarlo en negativo para indicar un retiro de la cuenta de ahorro o positivo para un depósito"
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "." || e.key === ",") {
                                            e.preventDefault();
                                        }
                                    }}
                                    error={draftAmount < MIN_VALUE || draftAmount > MAX_VALUE}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <TextField
                                    id="amountAtThatTime"
                                    label="Monto que tenía la cuenta de ahorro antes del giro"
                                    type="number"
                                    value={amountAtThatTime}
                                    variant="standard"
                                    onChange={(e) => setAmountAtThatTime(e.target.value)}
                                    helperText={
                                        amountAtThatTime < 0
                                            ? "Su cuenta de ahorro no puede dejarla negativa."
                                            : amountAtThatTime > MAX_VALUE
                                                ? "No puedes colocar un número más alto"
                                                : "Ejemplo: Si tras el giro de 50 mil pesos, su cuenta quedo en 100 mil pesos, aqui debe colocar 150 mil pesos."
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "." || e.key === ",") {
                                            e.preventDefault();
                                        }
                                    }}
                                    error={amountAtThatTime < 0 || amountAtThatTime > MAX_VALUE}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <DatePicker label="Fecha del Giro" selectedDate={draftDate} setSelectedDate={setDraftDate} type={birthDate === "-1" ? -1 : getYearFromDate(birthDate)} />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={addDraft}
                                className={shakeButton2 ? "shake" : ""}
                            >
                                Agregar giro hecho
                            </Button>
                        </Grid>
                        {drafts.length > 0 && (
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography
                                            variant="h5"
                                            gutterBottom
                                            sx={{ fontWeight: "bold", color: "secondary.main" }}
                                        >
                                            Giros en la cuenta de ahorro registrados
                                        </Typography>
                                        <Divider sx={{ marginBottom: 2 }} />
                                        <TableContainer component={Paper}>
                                            <Table size="small" aria-label="savings drafts table">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Fecha
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Monto en ese momento
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Giro hecho
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Deje al menos uno, puede agregar mas si desea eliminar los actuales.
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {drafts.map((draft, index) => {
                                                        const isMarked = markedDraftsForDeletion.includes(draft.id);
                                                        return (
                                                            <TableRow
                                                                key={index}
                                                                style={{
                                                                    textDecoration: isMarked ? "line-through" : "none",
                                                                    opacity: isMarked ? 0.5 : 1,
                                                                }}
                                                            >
                                                                <TableCell align="right">{formatDate(draft.date)}</TableCell>
                                                                <TableCell align="right">{draft.amountAtThatTime} miles de pesos</TableCell>
                                                                <TableCell align="right">{draft.drafts} miles de pesos</TableCell>
                                                                <TableCell align="center">
                                                                    {isMarked ? (
                                                                        <Button
                                                                            variant="text"
                                                                            color="primary"
                                                                            onClick={() => handleUndoDraftDeletion(draft.id)}
                                                                        >
                                                                            Deshacer
                                                                        </Button>
                                                                    ) : (
                                                                        <Button
                                                                            variant="text"
                                                                            color="secondary"
                                                                            onClick={() => handleMarkDraftForDeletion(draft.id)}
                                                                        >
                                                                            Eliminar
                                                                        </Button>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                    </Grid>
                </>
            )}

            {caso === 4 && (
                <>
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography
                                        variant="h5"
                                        gutterBottom
                                        sx={{ fontWeight: "bold", color: "secondary.main" }}
                                    >
                                        Información recabada de su registro
                                    </Typography>
                                    <Divider sx={{ marginBottom: 2 }} />
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            gap: 1,
                                        }}
                                    >
                                        <Typography variant="h5" sx={{ fontSize: "1.7rem", fontWeight: "bold" }}>
                                            Nombre: {name}
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontSize: "1.7rem", fontWeight: "bold" }}>
                                            Fecha de nacimiento: {birthDate}
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontSize: "1.7rem", fontWeight: "bold" }}>
                                            Antigüedad en tu cuenta de ahorro: {savingAccountEntity.antique} años
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontSize: "1.7rem", fontWeight: "bold" }}>
                                            Monto de la cuenta: {savingAccountEntity.amount} miles de pesos
                                        </Typography>
                                        {savingAccountEntity.self_employed_worker === 0 && (
                                            <Typography variant="h5" sx={{ fontSize: "1.7rem", fontWeight: "bold" }}>
                                                No es Trabajador autónomo
                                            </Typography>
                                        )}
                                        {savingAccountEntity.self_employed_worker === 1 && (
                                            <Typography variant="h5" sx={{ fontSize: "1.7rem", fontWeight: "bold" }}>
                                                Es Trabajador autónomo
                                            </Typography>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        {workHistories.length > 0 && (
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography
                                            variant="h5"
                                            gutterBottom
                                            sx={{ fontWeight: "bold", color: "secondary.main" }}
                                        >
                                            Historial de Trabajo a Guardar
                                        </Typography>
                                        <Divider sx={{ marginBottom: 2 }} />
                                        <TableContainer component={Paper}>
                                            <Table size="small" aria-label="work history saved table">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Fecha
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Deuda
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Ingreso
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Historia crediticia
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Deje al menos uno, puede agregar mas si desea eliminar los actuales.
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {workHistories.map((workHistory, index) => (
                                                        <TableRow
                                                            key={index}
                                                            style={{
                                                                textDecoration: markedForDeletion.includes(index) ? "line-through" : "none",
                                                                opacity: markedForDeletion.includes(index) ? 0.5 : 1,
                                                            }}
                                                        >
                                                            <TableCell align="right">{formatDate(workHistory.date)}</TableCell>
                                                            {workHistory.debt === 0 && (
                                                                <TableCell align="right">{workHistory.debt} pesos</TableCell>
                                                            )}
                                                            {workHistory.debt !== 0 && (
                                                                <TableCell align="right">{workHistory.debt} miles de pesos</TableCell>
                                                            )}
                                                            <TableCell align="right">{workHistory.income} miles de pesos</TableCell>
                                                            <TableCell
                                                                align="right"
                                                                sx={{
                                                                    wordWrap: "break-word",
                                                                    whiteSpace: "pre-wrap",
                                                                    maxWidth: "500px", // Ajusta este valor según tu diseño
                                                                }}
                                                            >
                                                                {workHistory.creditHistory}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Button
                                                                    variant="text"
                                                                    color={markedForDeletion.includes(index) ? "primary" : "secondary"}
                                                                    onClick={() => toggleMarkForDeletion(index)}
                                                                >
                                                                    {markedForDeletion.includes(index) ? "Deshacer" : "Eliminar"}
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                        {drafts.length > 0 && (
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Typography
                                            variant="h5"
                                            gutterBottom
                                            sx={{ fontWeight: "bold", color: "secondary.main" }}
                                        >
                                            Giros en la cuenta de ahorro registrados
                                        </Typography>
                                        <Divider sx={{ marginBottom: 2 }} />
                                        <TableContainer component={Paper}>
                                            <Table size="small" aria-label="savings drafts table">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Fecha
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Monto en ese momento
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Giro hecho
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                            Deje al menos uno, puede agregar mas si desea eliminar los actuales.
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {drafts.map((draft, index) => {
                                                        const isMarked = markedDraftsForDeletion.includes(draft.id);
                                                        return (
                                                            <TableRow
                                                                key={index}
                                                                style={{
                                                                    textDecoration: isMarked ? "line-through" : "none",
                                                                    opacity: isMarked ? 0.5 : 1,
                                                                }}
                                                            >
                                                                <TableCell align="right">{formatDate(draft.date)}</TableCell>
                                                                <TableCell align="right">{draft.amountAtThatTime} miles de pesos</TableCell>
                                                                <TableCell align="right">{draft.drafts} miles de pesos</TableCell>
                                                                <TableCell align="center">
                                                                    {isMarked ? (
                                                                        <Button
                                                                            variant="text"
                                                                            color="primary"
                                                                            onClick={() => handleUndoDraftDeletion(draft.id)}
                                                                        >
                                                                            Deshacer
                                                                        </Button>
                                                                    ) : (
                                                                        <Button
                                                                            variant="text"
                                                                            color="secondary"
                                                                            onClick={() => handleMarkDraftForDeletion(draft.id)}
                                                                        >
                                                                            Eliminar
                                                                        </Button>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <Typography sx={{ marginBottom: 2, fontSize: "1.2rem" }}>
                                Esta es toda la información con la que se registrará, si está todo en orden, haga clic en el botón de abajo para continuar.
                            </Typography>
                            <Button
                                variant="contained"
                                type="submit"
                                startIcon={<SaveIcon />}
                                sx={{ padding: "10px 20px", fontSize: "1rem" }}
                            >
                                Crear Cliente
                            </Button>
                        </Grid>
                    </Grid>
                </>
            )}
            {caso === 5 && (
                <>
                    <Grid container spacing={2} justifyContent="center" alignItems="center">
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            gap: 3,
                                            padding: 2,
                                        }}
                                    >
                                        <Typography
                                            variant="h4"
                                            sx={{ fontWeight: "bold", color: "secondary.main", textAlign: "center" }}
                                        >
                                            ¡Cliente creado con éxito! 🎉
                                        </Typography>
                                        {/* Animación de éxito */}
                                        <Box sx={{ width: "300px", height: "300px" }}>
                                            <Lottie
                                                animationData={successAnimationData}
                                                loop={false}
                                            />
                                        </Box>
                                        <Typography variant="h6" sx={{ textAlign: "center" }}>
                                            El cliente ha sido registrado correctamente. ¿Qué deseas hacer ahora?
                                        </Typography>
                                        <Box sx={{ display: "flex", gap: 2 }}>
                                            {/* Botón para crear otro cliente */}
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => setCaso(0)}
                                                sx={{ padding: "10px 20px", fontSize: "1rem" }}
                                            >
                                                Crear otro cliente
                                            </Button>
                                            {/* Botón para ir a ver el cliente recién creado */}
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => navigate("/listCustomer")}
                                                sx={{ padding: "10px 20px", fontSize: "1rem" }}
                                            >
                                                Ir a ver mi cliente
                                            </Button>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </>
            )}
            <br/>
            {caso !== 5 && (
                <>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleReturn()}
                        disabled={caso === 0} // Deshabilitado si es el primer caso
                    >
                        Regresar
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleNext()}
                        disabled={caso === 4 || isNextDisabled()} // Deshabilitado si es el último caso o no pasa las validaciones
                    >
                        Avanzar
                    </Button>
                </>
            )}

            <Grid container spacing={2}>
                {/* Errores */}
                {errors.length > 0 && (
                    <Grid item xs={12}>
                        <Box sx={{ color: "red" }}>
                            <h4>Errores:</h4>
                            <ul>
                                {errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default NewCustomer;
