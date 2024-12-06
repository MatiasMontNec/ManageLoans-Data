import httpClient from "../http-common";

// Guarda un nuevo crédito
const saveCredit = (creditEntity) => {
    return httpClient.post('/credit-application/save', creditEntity);
};

const uploadPdf = (creditEvaluationId, file, type) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type); // Agregar el parámetro `type` al FormData

    return httpClient.post(`/credit-application/uploadPdf/${creditEvaluationId}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data", // Este encabezado lo manejará axios automáticamente
        },
    });
};

const downloadPdf = (creditEvaluationId, type) => {
    return httpClient
        .get(`/credit-application/downloadPdf/${creditEvaluationId}?type=${type}`, {
            responseType: "blob",
        })
        .then((response) => {
            // Crear un enlace para descargar el archivo
            const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `credit_evaluation_${creditEvaluationId}_${type}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        })
        .catch((error) => {
            console.error("Error al descargar el archivo PDF:", error);
        });
};

const getCreditEvaluationById = (id) => {
    return httpClient.get(`/credit-application/creditEvaluation/${id}`);
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
    getCreditEvaluationById
};
