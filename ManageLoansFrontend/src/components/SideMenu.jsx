import React from 'react';
import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Drawer } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import PsychologyAltIcon from '@mui/icons-material/PsychologyAlt';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export default function Sidemenu({ open, toggleDrawer }) {
    const navigate = useNavigate();

    const listOptions = () => (
        <Box
            role="presentation"
            onClick={toggleDrawer(false)}
        >
            <List>
                <ListItemButton onClick={() => navigate("")}>
                    <ListItemIcon>
                        <HomeIcon />
                    </ListItemIcon>
                    <ListItemText primary="Inicio ᗜ˰ᗜ" />
                </ListItemButton>

                <Divider />

                <ListItemButton onClick={() => navigate("/newCustomer")}>
                    <ListItemIcon>
                        <AddCircleOutlineIcon />
                    </ListItemIcon>
                    <ListItemText primary="Nuevo Cliente ᗜˬᗜ" />
                </ListItemButton>

                <ListItemButton onClick={() => navigate("/listCustomer")}>
                    <ListItemIcon>
                        <FormatListBulletedIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Lista de Clientes ᗜ˰ᗜ"/>
                </ListItemButton>

                <ListItemButton onClick={() => navigate("/totalCostSimulation")}>
                    <ListItemIcon>
                        <PsychologyAltIcon />
                    </ListItemIcon>
                    <ListItemText primary="Simulación de Créditos ඞ" />
                </ListItemButton>
            </List>

            <Divider />
        </Box>
    );

    return (
        <div>
            <Drawer anchor={"left"} open={open} onClose={toggleDrawer(false)}>
                {listOptions()}
            </Drawer>
        </div>
    );
}
