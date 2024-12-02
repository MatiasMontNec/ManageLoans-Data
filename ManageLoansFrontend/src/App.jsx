import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from "./components/Home.jsx";
import Navbar from "./components/NavBar.jsx";
import CreditEvaluation from "./components/CreditEvaluation.jsx";
import NewCustomer from "./components/NewCustomer.jsx";
import ListCustomer from "./components/ListCustomer.jsx";
import NotFound from "./components/NotFound.jsx";
import TotalCostSimulation from "./components/TotalCostSimulation.jsx";
import CreditApplication from "./components/CreditApplication.jsx";
import EditCustomer from "./components/EditCustomer.jsx";
import ListActions from "./components/ListActions.jsx";
import ListCredit from "./components/ListCredit.jsx";
import theme from "./theme";
import {ThemeProvider} from "@mui/material";

function App() {
    return (
        <Router>
            <ThemeProvider theme={theme}>
                <div className="container">
                    <Navbar></Navbar>
                    <Routes>
                        <Route path="" element={<Home/>}/>
                        <Route path="/newCustomer" element={<NewCustomer/>}/>
                        <Route path="/listActions/:customerId" element={<ListActions/>}/>
                        <Route path="/listCredit/:customerId" element={<ListCredit/>}/>
                        <Route path="/creditEvaluation/:id/:creditId" element={<CreditEvaluation/>}/>
                        <Route path="/listCustomer" element={<ListCustomer/>}/>
                        <Route path="/totalCostSimulation" element={<TotalCostSimulation/>}/>
                        <Route path="/creditApplication/:id" element={<CreditApplication/>}/>
                        <Route path="/editCustomer/:id" element={<EditCustomer/>}/>
                        <Route path="*" element={<NotFound/>}/>
                    </Routes>
                </div>
            </ThemeProvider>
        </Router>
    );
}

export default App;
