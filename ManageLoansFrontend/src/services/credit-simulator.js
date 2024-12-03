import httpClient from "../http-common";

// Función para obtener los drafts de la cuenta de ahorro por savingAccountId
const getAccountDraftsBySavingAccountId = (savingAccountId) => {
    return httpClient.get(`/account-drafts/saving-account/${savingAccountId}`);
};

// Calcula la cuota mensual de un crédito
const getMonthlyFee = (creditEntity) => {
    return httpClient.post('/credit-simulator/monthly-fee', creditEntity);
};

// Calcula el costo total de un crédito
const getTotalCost = (creditEntity) => {
    return httpClient.post('/credit-simulator/total-cost', creditEntity);
};

// Obtiene borradores del último año para un cliente específico
const getDraftsYear = (customerId) => {
    return httpClient.get(`/credit-simulator/last-year/${customerId}`);
};

// Obtiene borradores de los últimos seis meses para un cliente específico
const getDraftsLastSixMonths = (customerId) => {
    return httpClient.get(`/credit-simulator/last-six-months/${customerId}`);
};

// Guarda un nuevo borrador de cuenta
const saveAccountDraft = (accountDraft) => {
    return httpClient.post('/credit-simulator/save', accountDraft);
};

// Elimina un borrador de cuenta por su ID
const deleteAccountDraft = (draftId) => {
    return httpClient.delete(`/credit-simulator/delete/${draftId}`);
};

export default {
    getMonthlyFee,
    getTotalCost,
    getDraftsYear,
    getDraftsLastSixMonths,
    saveAccountDraft,
    deleteAccountDraft,
    getAccountDraftsBySavingAccountId
};
