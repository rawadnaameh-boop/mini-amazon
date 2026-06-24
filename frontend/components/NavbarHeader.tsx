"use client";

import React from "react";
import { useCart } from "@/context/CartContext"; 
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

export default function NavbarHeader() {
    const { cart, setDrawerOpen } = useCart();

    // Fixed TypeScript strict rules by explicitly typing 'sum' and 'item'
    const totalItemsCount = cart?.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) ?? 0;

    return (
        <AppBar position="static" sx={{ backgroundColor: "#131921", padding: "0 10px" }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: "bold" }}>
                    Mini-Amazon
                </Typography>
                
                <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
                    <Badge badgeContent={totalItemsCount} color="error">
                        <ShoppingCartIcon sx={{ fontSize: "1.8rem" }} />
                    </Badge>
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}