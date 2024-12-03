import httpClient from "../http-common";

// Obtiene el historial laboral de un cliente por su ID
const getWorkHistoriesByCustomerId = (customerId) => {
    return httpClient.get(`/credit-evaluation/customer/${customerId}`);
};

// Filtra historiales laborales de los últimos 2 años
const getWorkHistoriesPast2Years = (workHistoryEntities) => {
    return httpClient.post(`/credit-evaluation/past-2-years`, workHistoryEntities);
};

// Guarda un nuevo historial laboral
const saveWorkHistory = (workHistoryEntity) => {
    return httpClient.post(`/credit-evaluation/save`, workHistoryEntity);
};

// Elimina un historial laboral por su ID
const deleteWorkHistory = (id) => {
    return httpClient.delete(`/credit-evaluation/${id}`);
};

// Obtiene el historial laboral más reciente de una lista
const getMostRecentWorkHistory = (workHistoryEntities) => {
    return httpClient.post(`/credit-evaluation/most-recent`, workHistoryEntities);
};

// Evalúa la relación cuota-ingreso
const evaluateFeeIncome = (monthlyFee, monthlyIncome) => {
    return httpClient.get(`/credit-evaluation/fee-income`, {
        params: { monthlyFee, monthlyIncome }
    });
};

// Evalúa la relación deuda-ingreso
const evaluateDebtIncome = (income, debt, monthlyFee) => {
    return httpClient.get(`/credit-evaluation/debt-income`, {
        params: { income, debt, monthlyFee }
    });
};

// Evalúa la antigüedad laboral
const evaluateJobSeniority = (antique) => {
    return httpClient.get(`/credit-evaluation/job-seniority`, {
        params: { antique }
    });
};

// Evalúa la edad del solicitante al finalizar el crédito
const evaluateApplicantAge = (yearBirth, timeLimit) => {
    return httpClient.get(`/credit-evaluation/applicant-age`, {
        params: { yearBirth, timeLimit }
    });
};

// Evalúa la capacidad de ahorro del cliente (R7)
const evaluateCapacitySavings = (amount, antique, desiredAmount, customerId, workHistoryRecently) => {
    return httpClient.post(
        `/credit-evaluation/r7-capacity-savings`,
        workHistoryRecently,
        {
            params: {
                amount,
                antique,
                desiredAmount,
                customerId,
            },
        }
    );
};

export default {
    getWorkHistoriesByCustomerId,
    getWorkHistoriesPast2Years,
    saveWorkHistory,
    deleteWorkHistory,
    getMostRecentWorkHistory,
    evaluateCapacitySavings,
    evaluateFeeIncome,
    evaluateDebtIncome,
    evaluateJobSeniority,
    evaluateApplicantAge
};
