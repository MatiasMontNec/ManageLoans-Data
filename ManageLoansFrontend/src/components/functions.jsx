import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";

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
    LoanTypesTable
};