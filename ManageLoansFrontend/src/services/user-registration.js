import httpClient from "../http-common";

// Obtener un cliente por ID
const getCustomerById = (customerId) => {
    return httpClient.get(`/user-registration/${customerId}`);
};

// Obtener todos los clientes
const getAllCustomers = () => {
    return httpClient.get(`/user-registration/get-all`);
};

// Eliminar un cliente por ID
const deleteCustomer = (customerId) => {
    return httpClient.delete(`/user-registration/${customerId}`);
};

// Guardar un cliente completo
const saveCustomer = (customer) => {
    return httpClient.post(`/user-registration/save_c`, customer);
};

// Obtener historial de un cliente por ID
const getCustomerHistoryById = (id) => {
    return httpClient.get(`/user-registration/${id}`);
};

// Guardar un nuevo historial de cliente
const saveCustomerHistory = (customerHistoryEntity) => {
    return httpClient.post(`/user-registration/save_ch`, customerHistoryEntity);
};

// Eliminar un historial de cliente
const deleteCustomerHistory = (customerHistoryEntity) => {
    return httpClient.delete(`/user-registration/delete`, { data: customerHistoryEntity });
};

export default {
    getCustomerById,
    getAllCustomers,
    deleteCustomer,
    saveCustomer,
    getCustomerHistoryById,
    saveCustomerHistory,
    deleteCustomerHistory,
};
