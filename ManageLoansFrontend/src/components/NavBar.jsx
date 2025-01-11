import { useState , useEffect} from "react";
import { AppBar, Box, IconButton, Toolbar, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, Popover, Fade} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Sidemenu from "./Sidemenu";
import { useLocation } from "react-router-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MenuIcon from '@mui/icons-material/Menu';


export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false); // Nuevo estado para el Dialog
    const [isSummary, setIsSummary] = useState(false);
    const location = useLocation();
    const [popoverAnchor, setPopoverAnchor] = useState(null);
    const [timeSpent, setTimeSpent] = useState(0);
    const [showScrollArrow, setShowScrollArrow] = useState(false);
    const [popoverShown, setPopoverShown] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            // Detectar si el usuario llegó al final de la vista
            if (scrollTop + windowHeight >= documentHeight) {
                setShowScrollArrow(false);
            } else {
                setShowScrollArrow(true);
            }
        };

        // Añadir evento de scroll
        window.addEventListener("scroll", handleScroll);

        // Mostrar la flecha al cambiar de vista (reiniciar scroll)
        setShowScrollArrow(true);

        return () => window.removeEventListener("scroll", handleScroll); // Limpieza
    }, [location.pathname]);

    useEffect(() => {
        setTimeSpent(0);
        const interval = setInterval(() => {
            setTimeSpent((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [location.pathname]);

    useEffect(() => {
        if (timeSpent >= 60 && !popoverShown) {
            setPopoverAnchor(document.body); // Muestra el Popover
            setPopoverShown(true); // Marca el Popover como mostrado
        }
    }, [timeSpent, popoverShown]);

    const toggleDrawer = (open) => (event) => {
        setOpen(open);
    };

    const toggleHelpDialog = () => {
        setHelpOpen(!helpOpen); // Abre o cierra el Dialog
    };

    const toggleSummary = () => {
        setIsSummary(!isSummary); // Alterna entre resumen y texto completo
    };

    const getHelpText = () => {
        const path = location.pathname;

        if (/^\/creditEvaluation\/\d+\/\d+$/.test(path)) {
            if (isSummary) {
                return (
                    <>
                        <Typography variant="h6">Evaluación de Crédito</Typography>
                        <Typography variant="body1" fontSize="h6.fontSize">
                            Sigue estos pasos para completar la evaluación de tu crédito:
                        </Typography>
                        <ul style={{fontSize: '1.5rem'}}>
                            <li>Revisa la información de tu crédito y presiona [Evaluar crédito].</li>
                            <li>Si es rechazado, verifica los datos y errores posibles.</li>
                            <li>Si la revisión es exitosa, el ejecutivo evaluará manualmente.</li>
                            <li>Si se aprueba, puedes reafirmar o rechazar el crédito.</li>
                            <li>Después de aceptar, se hace una revisión final antes de aprobar o rechazar.</li>
                            <li>Si es aprobado, se planifica el desembolso y se ejecuta el proceso.</li>
                            <li>¡Evaluación completada tras el desembolso!</li>
                        </ul>
                    </>
                );
            } else {
                return (
                    <>
                        <Typography variant="h6">Evaluación de Crédito</Typography>
                        <Typography variant="body1">
                            Este proceso contiene varias etapas. A continuación, te explicamos paso a paso lo que debes hacer:
                        </Typography>
                        <ol>
                            <li>
                                Se te informará lo que contiene tu crédito. Revisa la información y presiona el botón <b>[Evaluar crédito]</b> para continuar.
                            </li>
                            <li>
                                Si tu crédito es rechazado, puede deberse a errores en los datos proporcionados.
                                Por ejemplo, documentos incompletos o inconsistencias detectadas en la validación inicial.
                                Si todo parece estar en orden, es posible que nuestro ejecutivo haya identificado incoherencias en tus datos.
                            </li>
                            <li>
                                Si la primera revisión automática es exitosa, podrás acceder como ejecutivo para realizar una evaluación manual.
                                En esta etapa, verifica que toda la información sea correcta y no haya inconsistencias.
                                Desde aquí también puedes:
                                <ul>
                                    <li>Cancelar el crédito como cliente.</li>
                                    <li>Descargar los documentos asociados al crédito.</li>
                                    <li>Aprobar o rechazar la solicitud de crédito.</li>
                                </ul>
                            </li>
                            <li>
                                Si tu crédito es aprobado en la evaluación manual, como cliente tendrás la opción de:
                                <ul>
                                    <li>Reafirmar que deseas continuar con el crédito.</li>
                                    <li>Rechazar el crédito, lo cual lo cancela automáticamente.</li>
                                </ul>
                            </li>
                            <li>
                                Tras aceptar las condiciones, se realizará una revisión final.
                                Si todo está en orden, el crédito será aprobado. De lo contrario, será rechazado.
                                Durante este proceso, como cliente todavía puedes cancelar el crédito si lo deseas.
                            </li>
                            <li>
                                Una vez aprobado el crédito, se planifica el desembolso.
                                Pulsa el botón correspondiente para iniciar esta operación.
                            </li>
                            <li>
                                Finalmente, se ejecutará el proceso de desembolso.
                                ¡Has completado la evaluación de tu crédito!
                            </li>
                        </ol>
                    </>
                );
            }
        }

        if (/^\/creditApplication\/\d+$/.test(path)) {
            if (isSummary) {
                return (
                    <>
                        <Typography variant="h6">Creación de Crédito</Typography>
                        <Typography variant="body1" fontSize="h6.fontSize">
                            Crea tu crédito fácilmente siguiendo estos pasos:
                        </Typography>
                        <ul style={{fontSize: '1.5rem'}}>
                            <li>Selecciona el tipo de crédito y el valor de la propiedad.</li>
                            <li>Indica el plazo y la tasa de interés.</li>
                            <li>Súbelo documentos necesarios.</li>
                            <li>Presiona el botón [Crear crédito].</li>
                        </ul>
                        <Typography variant="body1" fontSize="h6.fontSize">
                            Al presionar [Crear crédito], puedes obtener un crédito exitoso o resolver problemas con la información.
                        </Typography>
                    </>
                );
            } else {
                return (
                    <>
                        <Typography variant="h6">Creación de Crédito</Typography>
                        <Typography variant="body1">
                            ¡Bienvenido al proceso de creación de crédito! Aquí te explicamos paso a paso cómo solicitar tu crédito:
                        </Typography>
                        <ul>
                            <li>
                                Comienza seleccionando el tipo de crédito que deseas.
                                Luego, indica el valor de la propiedad y el monto deseado en miles de pesos
                                (por ejemplo, si ingresas [1], se traducirá a $1,000).
                            </li>
                            <li>
                                Selecciona el plazo máximo en años que prefieres y la tasa de interés que más te convenga.
                            </li>
                            <li>
                                Sube los documentos necesarios para la solicitud de tu crédito.
                            </li>
                            <li>
                                Presiona el botón <b>[Crear crédito]</b> para continuar.
                            </li>
                        </ul>
                        <Typography variant="body1">
                            Una vez que presiones <b>[Crear crédito]</b>, pueden ocurrir dos cosas:
                        </Typography>
                        <ol>
                            <li>
                                Si no podemos crear tu crédito, te informaremos de las razones, como datos faltantes
                                o inconsistencias. Para solucionarlo, utiliza el botón que te redirigirá a modificar la información del cliente.
                            </li>
                            <li>
                                Si todo está correcto, tu crédito será creado exitosamente.
                                ¡Ahora puedes continuar a la evaluación de tu crédito! Usa el botón de atajo para dirigirte a esa etapa.
                            </li>
                        </ol>
                    </>
                );
            }
        }

        if (/^\/editCustomer\/\d+$/.test(path)) {
            if (isSummary) {
                return (
                    <>
                        <Typography variant="h6">Edición de Cliente</Typography>
                        <Typography variant="body1" fontSize="h6.fontSize">
                            Edita los datos del cliente fácilmente. Registra información clave, como la cuenta de ahorro, las historias de trabajo y los giros realizados.
                        </Typography>
                        <ul style={{fontSize: '1.5rem'}}>
                            <li><strong>Cuenta de ahorro:</strong> Registra antigüedad, monto y tipo de trabajador.</li>
                            <li><strong>Historias de trabajo:</strong> Añade trabajo, deuda, ingreso y fecha de inicio.</li>
                            <li><strong>Giros en cuenta:</strong> Registra depósitos, retiros, saldos finales y fechas.</li>
                        </ul>
                        <Typography variant="body1" fontSize="h6.fontSize">
                            Siempre podrás corregir cualquier error usando los botones de eliminación y deshacer.
                        </Typography>
                    </>
                );
            } else {
                return (
                    <>
                        <Typography variant="h6">Edición de Cliente</Typography>
                        <Typography variant="body1">
                            ¿Hubo un error? ¡Déjame ayudarte a corregirlo! Aquí tienes una guía detallada para editar los datos del cliente:
                        </Typography>
                        <ol>
                            <li>
                                Comienza escribiendo tu nombre y tu fecha de nacimiento. Esto desplegará nuevos apartados en los que podrás ingresar información adicional.
                            </li>
                            <li>
                                Registra tu cuenta de ahorro incluyendo:
                                <ul>
                                    <li>La antigüedad de la cuenta.</li>
                                    <li>El monto actual que tienes en tu cuenta de ahorro.</li>
                                    <li>Si eres trabajador autónomo o no.</li>
                                </ul>
                            </li>
                            <li>
                                En el apartado de *Historias de trabajo*:
                                <ul>
                                    <li>Registra al menos un historial de trabajo.</li>
                                    <li>Indica la deuda y el ingreso que tenías durante ese periodo.</li>
                                    <li>Opcionalmente, agrega un comentario para que quien revise tu crédito considere información adicional sobre tu trabajo.</li>
                                    <li>Registra la fecha en que iniciaste tu primer día de trabajo.</li>
                                </ul>
                            </li>
                            <li>
                                En el apartado de *Giros realizados en tu cuenta de ahorro*:
                                <ul>
                                    <li>Registra al menos un giro hecho en tu cuenta.</li>
                                    <li>Indica el monto depositado o retirado (usa valores negativos para retiros y positivos para depósitos).</li>
                                    <li>Especifica el saldo final de tu cuenta después de cada giro.</li>
                                    <li>Registra la fecha en que realizaste cada giro.</li>
                                </ul>
                            </li>
                            <li>
                                Si cometiste un error al ingresar datos, no te preocupes:
                                <ul>
                                    <li>Usa el botón de eliminar para borrar los datos incorrectos, ya sea en las historias de trabajo o en los giros.</li>
                                    <li>Si eliminaste un dato por error, también puedes deshacer la eliminación desde el mismo campo.</li>
                                </ul>
                            </li>
                        </ol>
                        <Typography variant="body1">
                            Recuerda que para avanzar, debes completar al menos una historia de trabajo y un giro en la cuenta de ahorro. Si no puedes continuar, verifica los campos resaltados en rojo o revisa si falta alguna información obligatoria.
                        </Typography>
                    </>
                );
            }
        }

        if (/^\/listCredit\/\d+$/.test(path)) {
            if (isSummary) {
                return (
                    <>
                        <Typography variant="h6">Listado de Créditos</Typography>
                        <Typography variant="body1" fontSize="h6.fontSize">
                            Visualiza tus créditos registrados y navega por la lista utilizando los botones [Siguiente] y [Anterior].
                        </Typography>
                        <ul style={{fontSize: '1.5rem'}}>
                            <li><strong>Monitorea tu evaluación.</strong></li>
                            <li><strong>Cancelar un crédito y deshacer la cancelación.</strong></li>
                            <li><strong>Eliminar créditos rechazados o en desembolso.</strong></li>
                        </ul>
                        <Typography variant="body1" fontSize="h6.fontSize">
                            Siempre podrás deshacer cualquier error con los botones proporcionados.
                        </Typography>
                    </>
                );
            } else {
                return (
                    <>
                        <Typography variant="h6">Listado de Créditos</Typography>
                        <Typography variant="body1">
                            Aquí puedes ver todos tus créditos registrados. Si no encuentras uno en particular, utiliza los botones [Siguiente] y [Anterior] para navegar por la lista.
                        </Typography>
                        <Typography variant="body1">
                            Por cada crédito disponible, tienes las siguientes opciones:
                        </Typography>
                        <ul>
                            <li>
                                <strong>Seguir su evaluación:</strong> Puedes monitorear el progreso de tu crédito y los pasos necesarios para completarlo.
                            </li>
                            <li>
                                <strong>Cancelar el crédito:</strong> Si decides cancelar un crédito, tendrás la opción de eliminarlo. Para mayor flexibilidad, se incluye un botón emergente que te permitirá deshacer la cancelación en caso de que te equivoques.
                            </li>
                            <li>
                                <strong>Eliminar créditos rechazados o en proceso de desembolso:</strong> Si un crédito fue rechazado durante la evaluación o ya entró en proceso de desembolso, también puedes eliminarlo. Al igual que con los créditos cancelados, tendrás disponible un botón para deshacer la eliminación si cambias de opinión.
                            </li>
                        </ul>
                        <Typography variant="body1">
                            ¡No te preocupes! Si cometes un error al eliminar un crédito, siempre podrás deshacerlo con los botones proporcionados.
                        </Typography>
                    </>
                );
            }
        }

        switch (location.pathname) {
            case "/newCustomer":
                if (isSummary) {
                    return (
                        <>
                            <Typography variant="h6">Nuevo Cliente</Typography>
                            <Typography variant="body1" fontSize="h6.fontSize">
                                Registra tus datos fácilmente en estos pasos:
                            </Typography>
                            <ul style={{fontSize: '1.5rem'}}>
                                <li>Escribe tu nombre y fecha de nacimiento.</li>
                                <li>Registra tu cuenta de ahorro: antigüedad, monto y si eres autónomo.</li>
                                <li>Agrega tu historial de trabajo, incluyendo deuda, ingresos y fecha de inicio.</li>
                                <li>Registra tus giros en la cuenta de ahorro: monto, saldo final y fecha.</li>
                                <li>Si cometes un error, puedes eliminar y deshacer la eliminación de datos.</li>
                            </ul>
                            <Typography variant="body1" fontSize="h6.fontSize">
                                Asegúrate de completar una historia de trabajo y un giro para continuar.
                            </Typography>
                        </>
                    );
                } else {
                    return (
                        <>
                            <Typography variant="h6">Nuevo Cliente</Typography>
                            <Typography variant="body1">
                                ¡Bienvenido! A continuación te guiaré para que registres todos tus datos de manera fácil. Sigue los siguientes pasos:
                            </Typography>
                            <ol>
                                <li>
                                    Comienza escribiendo tu nombre y tu fecha de nacimiento. Esto desplegará nuevos apartados para que puedas ingresar más información.
                                </li>
                                <li>
                                    En el apartado de <strong>Cuenta de ahorro</strong>:
                                    <ul>
                                        <li>Registra la antigüedad de tu cuenta de ahorro. (Si tu edad es de 17 o 18 años no podrás establecer la antiguedad, debido a que
                                            aun no portas por suficiente tiempo la cuenta de ahorro que asumimos que obtienes a los 18 años en adelante)</li>
                                        <li>Indica el monto actual que tienes en la cuenta.</li>
                                        <li>Especifica si eres trabajador autónomo o no.</li>
                                    </ul>
                                </li>
                                <li>
                                    En el apartado de <strong>Historias de trabajo</strong>:
                                    <ul>
                                        <li>Registra al menos un historial de trabajo.</li>
                                        <li>Incluye la deuda y el ingreso que tenías en ese momento.</li>
                                        <li>Opcionalmente, agrega un comentario para que la persona que revise tu crédito pueda considerar información adicional sobre tu trabajo.</li>
                                        <li>Registra la fecha en que comenzaste a trabajar.</li>
                                    </ul>
                                </li>
                                <li>
                                    En el apartado de <strong>Giros realizados en tu cuenta de ahorro</strong>:
                                    <ul>
                                        <li>Registra al menos un giro en tu cuenta.</li>
                                        <li>Indica el monto depositado o retirado (usa números negativos para retiros y positivos para depósitos).</li>
                                        <li>Especifica el saldo final de tu cuenta después de cada giro.</li>
                                        <li>Registra la fecha en que se hizo cada giro.</li>
                                    </ul>
                                </li>
                                <li>
                                    Si cometiste un error al ingresar información, ¡no te preocupes!:
                                    <ul>
                                        <li>Puedes eliminar los datos incorrectos con el botón de eliminar en el apartado correspondiente.</li>
                                        <li>Si eliminaste algo por error, también puedes deshacer la eliminación usando el mismo botón.</li>
                                    </ul>
                                </li>
                            </ol>
                            <Typography variant="body1">
                                Recuerda que para continuar, debes completar al menos una historia de trabajo y un giro en tu cuenta de ahorro. Si no puedes avanzar, verifica los campos resaltados en rojo o asegúrate de haber ingresado toda la información necesaria.
                            </Typography>
                        </>
                    );
                }
            case "/listCustomer":
                if (isSummary) {
                    return (
                        <>
                            <Typography variant="h6">Lista de Clientes</Typography>
                            <Typography variant="body1" fontSize="h6.fontSize">
                                Visualiza todos los clientes y realiza las siguientes acciones:
                            </Typography>
                            <ul style={{fontSize: '1.5rem'}}>
                                <li>Editar datos.</li>
                                <li>Ver créditos asociados.</li>
                                <li>Consultar acciones en ManageLoans.</li>
                                <li>Crear o eliminar créditos.</li>
                                <li>Eliminar clientes si es necesario.</li>
                            </ul>
                            <Typography variant="body1" fontSize="h6.fontSize">
                                Si no encuentras un cliente, usa los botones [Regresar] y [Ver más].
                            </Typography>
                        </>
                    );
                }else{
                    return (
                        <>
                            <Typography variant="h6">Lista de Clientes</Typography>
                            <Typography variant="body1">
                                Aquí puedes visualizar todos los clientes registrados. Con cada cliente, puedes realizar las siguientes acciones:
                            </Typography>
                            <ul>
                                <li>Editar los datos del cliente.</li>
                                <li>Ver los créditos asociados a cada cliente.</li>
                                <li>Consultar las acciones del cliente en <strong>ManageLoans</strong>.</li>
                                <li>Crear un crédito para el cliente que elijas.</li>
                                <li>Eliminar al cliente si es necesario.</li>
                            </ul>
                            <Typography variant="body1">
                                Si no encuentras el cliente que buscas porque hay demasiados, ¡no te preocupes!
                                Puedes navegar usando los botones de [Regresar] y [Ver más] para ver todos los clientes disponibles.
                            </Typography>
                        </>
                    );
                }
            case "/totalCostSimulation":
                if (isSummary) {
                    return (
                        <>
                            <Typography variant="h6">Simulación de Costo Total del Crédito</Typography>
                            <Typography variant="body1" fontSize="h6.fontSize">
                                Simula tu crédito de forma rápida. Selecciona el tipo de crédito, ingresa el valor de la propiedad y el monto deseado. Luego, elige el plazo y la tasa de interés, y presiona el botón para calcular el costo total en miles de pesos.
                            </Typography>
                        </>
                    );
                } else {
                    return (
                        <>
                            <Typography variant="h6">Simulación de Costo Total del Crédito</Typography>
                            <Typography variant="body1">
                                ¡Bienvenido a la simulación de tus créditos! Aquí no necesitas añadir archivos como en un registro real, así que comenzamos de inmediato.
                            </Typography>
                            <Typography variant="body1">
                                Te presentamos la tabla que te guiará al pedir tu crédito. Sigue estos pasos:
                            </Typography>
                            <ul>
                                <li>Selecciona el tipo de crédito que deseas.</li>
                                <li>Ingresa el valor de la propiedad y el monto deseado en miles de pesos (por ejemplo, si ingresas 1, se traduce a 1000).</li>
                                <li>Elige el plazo máximo en años y la tasa de interés que mejor se ajuste a tus necesidades.</li>
                            </ul>
                            <Typography variant="body1">
                                Una vez que hayas completado los campos, presiona el botón que prefieras para obtener el resultado del cálculo. El resultado te mostrará el costo total del crédito en miles de pesos.
                            </Typography>
                        </>
                    );
                }
        }

        return (
            <>
                <Typography variant="h6">Ayuda General</Typography>
                {isSummary ? (
                    <Typography variant="body1" fontSize="h6.fontSize">
                        Este apartado es para textos resumidos y grandes. Usa el menú lateral para navegar entre las diferentes secciones.
                    </Typography>
                ) : (
                    <Typography variant="body1">
                        Este apartado es para textos explayados en la explicación de uso. Usa el menú lateral para navegar entre las diferentes secciones.
                    </Typography>
                )}
            </>
        );
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick={toggleDrawer(true)}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Manage Loans
                    </Typography>

                    <IconButton color="inherit" onClick={toggleHelpDialog}>
                        <HelpOutlineIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Sidemenu open={open} toggleDrawer={toggleDrawer} />

            {/* Dialog para mostrar ayuda */}
            <Dialog open={helpOpen} onClose={toggleHelpDialog} fullWidth maxWidth="sm">
                <DialogTitle>Ayuda</DialogTitle>
                <DialogContent>
                    {getHelpText()}
                    <Box mt={2}>
                        <Button
                            variant="contained"
                            color="inherit"
                            onClick={toggleSummary}
                            fullWidth
                        >
                            {isSummary ? "Explayar y Achicar Texto" : "Resumir y Acercar Texto"}
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={toggleHelpDialog} color="primary">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Popover */}
            <Popover
                open={Boolean(popoverAnchor)}
                anchorEl={popoverAnchor}
                onClose={() => setPopoverAnchor(null)}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                <Box p={2}>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        ¿Te quedaste atascado? Consulta el botón de ayuda.
                        <br />
                        Está en la esquina derecha de la barra azul.
                        <br />
                        Presiona el símbolo de interrogación para obtener la ayuda.
                        <br/>
                        Recuerde verificar si visualizo toda la página navegando con el boton a la esquina inferior derecha.
                    </Typography>
                    <Button
                        variant="contained"
                        color="inherit"
                        onClick={() => setPopoverAnchor(null)}
                        sx={{
                            marginTop: 1,
                        }}
                    >
                        Cerrar
                    </Button>
                </Box>
            </Popover>

            <Fade in={showScrollArrow}>
                <Box
                    sx={{
                        position: "fixed",
                        right: 16,
                        bottom: 32,
                        zIndex: 1000,
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        borderRadius: "50%",
                        padding: "8px",
                        cursor: "pointer",
                    }}
                    onClick={() => {
                        // Desplazar hacia abajo
                        window.scrollBy({ top: window.innerHeight / 2, behavior: "smooth" });
                    }}
                >
                    <KeyboardArrowDownIcon sx={{ color: "white", fontSize: "2rem" }} />
                </Box>
            </Fade>
        </Box>
    );
}