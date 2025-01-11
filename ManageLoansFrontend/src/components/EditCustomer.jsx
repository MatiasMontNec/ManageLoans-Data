import { useState, useEffect } from "react";
import {useNavigate, useParams} from "react-router-dom";
import {
    Box,
    TextField,
    Button,
    FormControl,
    Grid,
    Card,
    CardContent,
    Typography,
    Divider,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Slider,
    FormControlLabel, Checkbox
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import userRegistration from "../services/user-registration.js";
import trackingRequests from "../services/tracking-requests.js";
import creditEvaluation from "../services/credit-evaluation.js";
import creditSimulator from "../services/credit-simulator.js";
import {DatePicker} from "./functions.jsx";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Lottie from "lottie-react";
import successAnimationData from '../animations/success2-animation.json';

const EditCustomer = () => {
    const { id } = useParams();
    useEffect(() => {
        fetchCustomerData();
    }, [id]);

    const fetchCustomerData = async () => {
        try {
            const response = await userRegistration.getCustomerById(id);
            setName(response.data.name);
            const yearBirth = response.data.yearBirth;
            const birthDate = new Date(yearBirth, 0, 1);
            setBirthDate(birthDate.toISOString().split('T')[0]);
            const response2 = await trackingRequests.getSavingAccountByCustomerId(id);
            setIdSavingAccount(response2.data.id);
            setSelf_employed_worker(response2.data.self_employed_worker);
            setAmount(response2.data.amount);
            setAntique(response2.data.antique);
            const response3 = await creditEvaluation.getWorkHistoriesByCustomerId(id);
            setWorkHistories(response3.data);
            setInitialWorkHistoriesLength(response3.data.length);
            const response4 = await creditSimulator.getAccountDraftsBySavingAccountId(response2.data.id);
            setDrafts(response4.data);
            setInitialDraftsLength(response4.data.length);
        } catch (error) {
            console.error("Error al cargar los datos del cliente:", error);
        }
    };

    const [showAnimation, setShowAnimation] = useState(false);
    const [idSavingAccount,setIdSavingAccount] = useState();
    const [initialWorkHistoriesLength, setInitialWorkHistoriesLength] = useState(0);
    const [initialDraftsLength, setInitialDraftsLength] = useState(0);
    const [name, setName] = useState("");
    const [birthDate, setBirthDate] = useState("-1");
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
    const MAX_VALUE = 1000000000000000000;
    const MIN_VALUE = -1000000000000000000;
    const MAX_CHARACTERS = 200;
    const [markedForDeletion, setMarkedForDeletion] = useState([]);
    const navigate = useNavigate();
    const [caso, setCaso] = useState(4);
    const [shakeButton, setShakeButton] = useState(false);
    const [shakeButton2, setShakeButton2] = useState(false);
    const [shakeButton3, setShakeButton3] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarShown, setSnackbarShown] = useState(false);
    const handleInvalidInput = (button) => {
        if (button === 1) {
            setShakeButton(true);
            setTimeout(() => setShakeButton(false), 300);
        }else if(button === 2){
            setShakeButton2(true);
            setTimeout(() => setShakeButton2(false), 300);
        }else if(button === 3){
            setShakeButton3(true);
            setTimeout(() => setShakeButton3(false), 300);
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

    const isNextDisabled = () => {
        switch (caso) {
            case 0:
                return !name || name.length >= MAX_CHARACTERS || !birthDate || birthDate === "-1";

            case 1:
                return amount < 0 || amount > MAX_VALUE;

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

    const handleSelfEmployedToggle = (e) => {
        setSelf_employed_worker(e.target.checked ? 1 : 0);
    };

    const validateForm = () => {
        console.log("Iniciando validación del formulario...");

        // Validar que el nombre no esté vacío y no supere el máximo de caracteres
        if (!name || name.length >= MAX_CHARACTERS) {
            console.error("Error: El nombre está vacío o supera el máximo de caracteres.");
            handleInvalidInput(3); // Vibrar el botón si falla
            return false;
        }

        // Validar que la fecha de nacimiento sea válida
        if (!birthDate || birthDate === "-1") {
            console.error("Error: La fecha de nacimiento no es válida.");
            handleInvalidInput(3);
            return false;
        }

        // Validar que el monto de la cuenta sea válido
        if (amount < 0 || amount > MAX_VALUE) {
            console.error("Error: El monto de la cuenta no es válido.");
            handleInvalidInput(3);
            return false;
        }

        // Validar que haya al menos un historial de trabajo
        if (workHistories.length === 0) {
            console.error("Error: No hay ningún historial de trabajo.");
            handleInvalidInput(3);
            return false;
        }

        console.log("WorkHistories IDs:", workHistories.map(workHistory => workHistory.id));
        console.log("MarkedForDeletion:", markedForDeletion);

        // Validar que no todos los workHistories estén marcados para eliminación
        const allMarkedForDeletion =
            workHistories.length > 0 &&
            workHistories.every((_, index) =>
                markedForDeletion.includes(index)
            );

        if (allMarkedForDeletion) {
            console.error("Error: Todos los workHistories están marcados para eliminación.");
            handleInvalidInput(3); // Vibrar el botón si falla
            return false;
        }

        // Validar que haya al menos un giro
        if (drafts.length === 0) {
            console.error("Error: No hay ningún draft.");
            handleInvalidInput(3);
            return false;
        }

        // Validar que no todos los drafts estén marcados para eliminación
        const allDraftsMarkedForDeletion =
            drafts.length > 0 &&
            drafts.every(draft =>
                markedDraftsForDeletion.includes(draft.id)
            );

        if (allDraftsMarkedForDeletion) {
            console.error("Error: Todos los drafts están marcados para eliminación.");
            handleInvalidInput(3);
            return false;
        }

        console.log("Validación del formulario completada con éxito.");
        return true; // Si todas las validaciones pasan
    };

    const handleModify = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        try {
            // Actualizar cliente
            const customer = {
                id: id,
                yearBirth: new Date(birthDate).getFullYear(),
                name,
            };
            await userRegistration.saveCustomer(customer);

            // Crear Saving Account
            const savingAccount = {
                id: idSavingAccount,
                customerId: id,
                antique: antique,
                self_employed_worker: self_employed_worker,
                amount: amount,
            };
            await trackingRequests.saveSavingAccount(savingAccount);

            // Procesar drafts
            for (const [index, draft] of drafts.entries()) {
                const isMarked = markedDraftsForDeletion.includes(draft.id);
                if (index < initialDraftsLength && isMarked) {
                    // Draft existente marcado: eliminar
                    await creditSimulator.deleteAccountDraft(draft.id);
                } else if (index >= initialDraftsLength && isMarked) {
                    // Draft nuevo marcado: no guardar (filtrar)
                    continue;
                } else if (index >= initialDraftsLength) {
                    // Guardar el draft nuevo
                    const accountDraft = {
                        savingAccountId: idSavingAccount,
                        date: draft.date,
                        drafts: draft.drafts,
                        amountAtThatTime: draft.amountAtThatTime,
                    };
                    await creditSimulator.saveAccountDraft(accountDraft);
                }
            }

            // Procesar workHistories
            for (const [index, workHistory] of workHistories.entries()) {
                const isMarked = markedForDeletion.includes(index);
                if (index < initialWorkHistoriesLength && isMarked) {
                    // Work history existente marcado: eliminar
                    await creditEvaluation.deleteWorkHistory(workHistory.id);
                } else if (index >= initialWorkHistoriesLength && isMarked) {
                    // Work history nuevo marcado: no guardar (filtrar)
                    continue;
                } else if (index >= initialWorkHistoriesLength) {
                    // Guardar work history
                    const workHistoryEntity = {
                        customerId: id,// Asociado al cliente creado
                        income: workHistory.income,
                        debt: workHistory.debt,
                        creditHistory: workHistory.creditHistory,
                        date: workHistory.date,
                    };
                    await creditEvaluation.saveWorkHistory(workHistoryEntity);
                }
            }

            // Guardar customer history
            const date = new Date().toISOString().split("T")[0];
            const customerHistory2 = {
                customerId: id,
                content: "El cliente ha sido modificado",
                date,
            };
            await userRegistration.saveCustomerHistory(customerHistory2);
            fetchCustomerData();
            setSnackbarOpen(true);
            setSnackbarShown(true);
            setShowAnimation(true);

            // Ocultar la animación después de 3 segundos
            setTimeout(() => {
                setShowAnimation(false);
            }, 3000);
        } catch (error) {
            console.error("Error al guardar el cliente:", error);
            setErrors(["Error al guardar el cliente. Intenta de nuevo más tarde."]);
        }
    };


    const handleSliderChange = (event, newValue) => {
        setAntique(newValue);
        // Aquí también puedes hacer cualquier validación extra si es necesario.
    };

    const getYearFromDate = (birthDate) => {
        const currentYear = new Date().getFullYear();
        const birthYear = parseInt(birthDate.split("-")[0]); // Asumiendo que birthDate es en formato "YYYY-MM-DD"
        return currentYear - birthYear;
    };

    const handleReturn = () => {
        navigate(`/listCustomer`);
    };

    return (
        <Box component="form" onSubmit={handleModify} noValidate autoComplete="off">
            <h2>Editar Cliente</h2>
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
                                Registra la antigüedad en su cuenta de ahorro, el monto actual de la cuenta de ahorro y si eres trabajador autónomo.
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <Typography gutterBottom>Antigüedad en su cuenta de ahorro</Typography>
                                <Slider
                                    value={antique}
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
                                    value={amount}
                                    variant="standard"
                                    onChange={(e) => setAmount(e.target.value)}
                                    helperText={
                                        amount < 0
                                            ? "Su monto no puede ser negativo"
                                            : amount > MAX_VALUE
                                                ? "No puedes colocar un número más alto"
                                                : ""
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "." || e.key === ",") {
                                            e.preventDefault();
                                        }
                                    }}
                                    error={amount < 0 || amount > MAX_VALUE}
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
                                            checked={self_employed_worker === 1}
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
                        <Grid container spacing={1} justifyContent="center">
                            {workHistories.length === 0 ||
                            workHistories.every((_, index) =>
                                markedForDeletion.includes(index)) ? (
                                <Typography color="error" sx={{ textAlign: "center", marginTop: 2 }}>
                                    Debes dejar al menos una historia de trabajo registrada
                                </Typography>
                            ) : null}
                        </Grid>
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
                        <Grid container spacing={1} justifyContent="center">
                            {drafts.every(draft =>
                                markedDraftsForDeletion.includes(draft.id)) ? (
                                <Typography color="error" sx={{ textAlign: "center", marginTop: 2 }}>
                                    Debes dejar al menos un giro registrado
                                </Typography>
                            ) : null}
                        </Grid>
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
                                            Antigüedad en su cuenta de ahorro: {antique} años
                                        </Typography>
                                        {amount === 0 && (
                                            <Typography variant="h5" sx={{ fontSize: "1.7rem", fontWeight: "bold" }}>
                                                Monto de la cuenta de ahorro: {amount} pesos
                                            </Typography>
                                        )}
                                        {amount !== 0 && (
                                            <Typography variant="h5" sx={{ fontSize: "1.7rem", fontWeight: "bold" }}>
                                                Monto de la cuenta de ahorro: {amount} miles de pesos
                                            </Typography>
                                        )}
                                        {self_employed_worker === 0 && (
                                            <Typography variant="h5" sx={{ fontSize: "1.7rem", fontWeight: "bold" }}>
                                                No es Trabajador autónomo
                                            </Typography>
                                        )}
                                        {self_employed_worker === 1 && (
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

                        <Grid container spacing={1} justifyContent="center">
                            {workHistories.length === 0 ||
                            workHistories.every((_, index) =>
                                markedForDeletion.includes(index)) ? (
                                <Typography color="error" sx={{ textAlign: "center", marginTop: 2 }}>
                                    Debes dejar al menos una historia de trabajo registrada
                                </Typography>
                            ) : drafts.length === 0 ||
                            drafts.every(draft =>
                                markedDraftsForDeletion.includes(draft.id)) ? (
                                <Typography color="error" sx={{ textAlign: "center", marginTop: 2 }}>
                                    Debes dejar al menos un giro registrado
                                </Typography>
                            ) : null}
                        </Grid>
                        <Grid container spacing={1} justifyContent="center">
                            {/* Botones principales en dos filas */}
                            <Grid item xs={12} sm={6} sx={{ display: "flex", justifyContent: "center" }}>
                                <Button
                                    variant="contained"
                                    onClick={() => setCaso(0)}
                                    sx={{ padding: "10px 20px", fontSize: "1rem" }}
                                    color="secondary"
                                >
                                    Ir a editar nombre o fecha de nacimiento
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} sx={{ display: "flex", justifyContent: "center" }}>
                                <Button
                                    variant="contained"
                                    onClick={() => setCaso(2)}
                                    sx={{ padding: "10px 20px", fontSize: "1rem" }}
                                    color="secondary"
                                >
                                    Crear nuevas historias de trabajo
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} sx={{ display: "flex", justifyContent: "center" }}>
                                <Button
                                    variant="contained"
                                    onClick={() => setCaso(1)}
                                    sx={{ padding: "10px 20px", fontSize: "1rem" }}
                                    color="secondary"
                                >
                                    Ir a editar la cuenta de ahorro
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={6} sx={{ display: "flex", justifyContent: "center" }}>
                                <Button
                                    variant="contained"
                                    onClick={() => setCaso(3)}
                                    sx={{ padding: "10px 20px", fontSize: "1rem" }}
                                    color="secondary"
                                >
                                    Crear nuevos giros
                                </Button>
                            </Grid>
                            <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
                                <Button
                                    variant="contained"
                                    type="submit"
                                    startIcon={<SaveIcon />}
                                    sx={{ padding: "10px 20px", fontSize: "1rem" }}
                                    disabled={
                                        (workHistories.length === 0 ||
                                            workHistories.every((_, index) =>
                                                markedForDeletion.includes(index))) ||
                                        (drafts.length === 0 ||
                                            drafts.every(draft =>
                                                markedDraftsForDeletion.includes(draft.id)))
                                    }
                                >
                                    Establecer cambios
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </>
            )}

            {caso !== 4 && (
                <>
                    <br/>
                    <Grid item xs={12} sx={{display: "flex", justifyContent: "center"}}>
                        <Button
                            variant="contained"
                            onClick={() => setCaso(4)}
                            disabled={isNextDisabled()}
                            sx={{padding: "10px 20px", fontSize: "1rem"}}
                        >
                            Volver a visualizar mis datos
                        </Button>
                    </Grid>
                </>
            )}

            <Grid container spacing={2}>
                {/* Errores */}
                {errors.length > 0 && (
                    <Grid item xs={12}>
                        <Box sx={{color: "red"}}>
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
            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={7000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="info" sx={{width: "100%"}}>
                    Usuario modificado con éxito!
                </Alert>
            </Snackbar>
            <br/>
            {caso === 4 && (
                <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleReturn}
                        sx={{ padding: "10px 20px", fontSize: "1rem" }}
                    >
                        Volver a la Lista de Clientes
                    </Button>
                </Grid>
            )}
        </Box>
    );
};

export default EditCustomer;
