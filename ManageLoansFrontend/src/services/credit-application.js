import httpClient from "../http-common";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";

// Guarda un nuevo crédito
const saveCredit = (creditEntity) => {
    return httpClient.post('/credit-application/save', creditEntity);
};

// Sube un archivo PDF asociado a un crédito
const uploadPdf = (creditEvaluationId, file, type) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    return httpClient.post(`/credit-application/uploadPdf/${creditEvaluationId}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

// Descarga un archivo PDF asociado a un crédito
const downloadPdf = (creditEvaluationId, type) => {
    return httpClient.get(`/credit-application/downloadPdf/${creditEvaluationId}`, {
        params: { type },
        responseType: 'blob', // Para manejar archivos binarios
    });
};

// Calcula la cuota mensual de un crédito
const calculateMonthlyFee = (creditEntity) => {
    return httpClient.post('/credit-application/monthly-fee', creditEntity);
};

// Obtiene todos los créditos de un cliente por su ID
const getCreditsByCustomerId = (customerId) => {
    return httpClient.get(`/credit-application/customer/${customerId}`);
};

// Obtiene un crédito por su ID
const getCreditById = (creditId) => {
    return httpClient.get(`/credit-application/${creditId}`);
};

// Elimina un crédito
const deleteCredit = (creditEntity) => {
    return httpClient.delete('/credit-application/delete', {
        data: creditEntity,
    });
};

// Calcula el costo total de un crédito
const calculateTotalCost = (creditEntity) => {
    return httpClient.post('/credit-application/total-cost-calculation', creditEntity);
};

// Modifica un crédito existente
const modifyCredit = (creditId, creditEntity) => {
    return httpClient.put(`/credit-application/modifyCredit/${creditId}`, creditEntity);
};

export const LoanTypesTable = () => (
    <TableContainer component={Paper} style={{marginBottom: "20px"}}>
        <Table aria-label="tabla de tipos de préstamo">
            <TableHead>
                <TableRow>
                    <TableCell>Tipo de Préstamo</TableCell>
                    <TableCell>Plazo Máximo</TableCell>
                    <TableCell>Tasa Interés Anual</TableCell>
                    <TableCell>Monto Máximo de Financiamiento</TableCell>
                    <TableCell>Requerimientos documentales</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>Primera vivienda</TableCell>
                    <TableCell>30 años</TableCell>
                    <TableCell>3.5% - 5%</TableCell>
                    <TableCell>80% del valor de la propiedad</TableCell>
                    <TableCell>Comprobante de ingresos, certificado de avalúo e historial crediticio</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Segunda vivienda</TableCell>
                    <TableCell>20 años</TableCell>
                    <TableCell>4% - 6%</TableCell>
                    <TableCell>70% del valor de la propiedad</TableCell>
                    <TableCell>Comprobante de ingresos, certificado de avalúo, escritura de primera vivienda e historial crediticio</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Propiedades comerciales</TableCell>
                    <TableCell>25 años</TableCell>
                    <TableCell>5% - 7%</TableCell>
                    <TableCell>60% del valor de la propiedad</TableCell>
                    <TableCell>Estado financiero del negocio, comprobante de ingresos, certificado de avalúo y plan de negocios</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Remodelación</TableCell>
                    <TableCell>15 años</TableCell>
                    <TableCell>4.5% - 6%</TableCell>
                    <TableCell>50% del valor de la propiedad</TableCell>
                    <TableCell>Comprobante de ingresos, presupuesto de remodelación y certificado de avalúo actualizado</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </TableContainer>
);

export default {
    saveCredit,
    uploadPdf,
    downloadPdf,
    calculateMonthlyFee,
    getCreditsByCustomerId,
    getCreditById,
    deleteCredit,
    calculateTotalCost,
    modifyCredit,
    LoanTypesTable,
};
