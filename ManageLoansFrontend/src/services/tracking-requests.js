import httpClient from "../http-common";

// Obtiene una cuenta de ahorro por el customerId
const getSavingAccountByCustomerId = (customerId) => {
    return httpClient.get(`/saving-accounts/customer/${customerId}`);
};

// Guarda una cuenta de ahorro
const saveSavingAccount = (savingAccount) => {
    return httpClient.post(`/tracking-requests/save`, savingAccount);
};

// Elimina una cuenta de ahorro
const deleteSavingAccount = (savingAccount) => {
    return httpClient.delete(`/tracking-requests/delete`, { data: savingAccount });
};

// Marca un crédito como "en trabajo por ejecutivo"
const setExecutiveWorking = (creditId) => {
    return httpClient.put(`/tracking-requests/executive-working/${creditId}`);
};

// Modifica el seguimiento de un crédito por su ID
const modifyFollowUp = (creditId, followUp) => {
    return httpClient.put(`/tracking-requests/modify-follow-up/${creditId}`, null, {
        params: { followUp },
    });
};

// Modifica el seguimiento y el ID de cliente asociados a un crédito
const modifyFollowUpAndCustomerId = (creditId, followUp, customerId) => {
    return httpClient.put(`/tracking-requests/modify-follow-up-customer/${creditId}`, null, {
        params: { followUp, customerId },
    });
};

export default {
    saveSavingAccount,
    deleteSavingAccount,
    setExecutiveWorking,
    modifyFollowUp,
    modifyFollowUpAndCustomerId,
    getSavingAccountByCustomerId
};
