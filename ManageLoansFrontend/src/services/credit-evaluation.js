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

// Evalúa la cuota mensual basada en los ingresos (R1)
const evaluateIncomeFee = (creditId, monthlyFee, workHistoryEntity, customerId) => {
    return httpClient.put(
        `/credit-evaluation/r1-income-fee`,
        workHistoryEntity,
        { params: { creditId, monthlyFee, customerId } }
    );
};

// Evalúa la antigüedad laboral y estabilidad (R3)
const evaluateJobSeniority = (antique, creditId, customerId) => {
    return httpClient.put(`/credit-evaluation/r3-job-seniority-stability`, null, {
        params: { antique, creditId, customerId },
    });
};

// Evalúa la relación deuda-ingreso (R4)
const evaluateDebtIncomeRelation = (monthlyFee, workHistoryEntity, creditId, customerId) => {
    return httpClient.put(
        `/credit-evaluation/r4-relation-debt-income`,
        workHistoryEntity,
        { params: { monthlyFee, creditId, customerId } }
    );
};

// Evalúa el monto máximo de financiamiento (R5)
const evaluateMaximumFinancingAmount = (creditId, customerId, monthlyFee) => {
    return httpClient.put(`/credit-evaluation/r5-maximum-financing-amount`, null, {
        params: { creditId, customerId, monthlyFee },
    });
};

// Evalúa la edad del solicitante (R6)
const evaluateApplicantAge = (customerId, timeLimit, creditId, yearBirth) => {
    return httpClient.put(`/credit-evaluation/r6-applicant-age`, null, {
        params: { customerId, timeLimit, creditId, yearBirth },
    });
};

// Evalúa la capacidad de ahorro del cliente (R7)
const evaluateCapacitySavings = (amount, antique, desiredAmount, creditId, customerId, workHistoryRecently) => {
    return httpClient.put(
        `/credit-evaluation/r7-capacity-savings`,
        workHistoryRecently,
        { params: { amount, antique, desiredAmount, creditId, customerId } }
    );
};

export default {
    getWorkHistoriesByCustomerId,
    getWorkHistoriesPast2Years,
    saveWorkHistory,
    deleteWorkHistory,
    getMostRecentWorkHistory,
    evaluateIncomeFee,
    evaluateJobSeniority,
    evaluateDebtIncomeRelation,
    evaluateMaximumFinancingAmount,
    evaluateApplicantAge,
    evaluateCapacitySavings,
};
