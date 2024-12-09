import axios from "axios";

const manageLoansBackendServer = import.meta.env.VITE_MANAGELOANS_BACKEND_SERVER;
const manageLoansBackendPort = import.meta.env.VITE_MANAGELOANS_BACKEND_PORT;

export default axios.create({
    baseURL: `http://${manageLoansBackendServer}:${manageLoansBackendPort}`,
    headers: {
        'Content-Type': 'application/json'
    }
});
console.log(`http://${manageLoansBackendServer}:${manageLoansBackendPort}`)