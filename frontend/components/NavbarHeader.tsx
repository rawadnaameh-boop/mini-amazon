"use client";

import React from "react";
import { useCart } from "@/context/CartContext"; 
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Link from "next/link"; // ✅ Added for client-side navigation

export default function NavbarHeader() {
    const { cart, setDrawerOpen } = useCart();

    // Fixed TypeScript strict rules by explicitly typing 'sum' and 'item'
    const totalItemsCount = cart?.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) ?? 0;

    return (
        <AppBar position="static" sx={{ backgroundColor: "#131921", padding: "0 10px" }}>
            <Toolbar>
                {/* Home navigation link wrapper */}
                <Link href="/" style={{ textDecoration: "none", color: "inherit", flexGrow: 1 }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: "bold", cursor: "pointer" }}>
                        Mini-Amazon
                    </Typography>
                </Link>
                
                {/* ✅ ADDED: Amazon-style "Returns & Orders" Link Block */}
                <Link href="/orders" style={{ textDecoration: "none", color: "inherit", marginRight: "20px" }}>
                    <div style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        padding: "4px 8px", 
                        cursor: "pointer",
                        lineHeight: "1.2"
                    }}>
                        <span style={{ fontSize: "11px", color: "#ccc" }}>Returns</span>
                        <span style={{ fontSize: "14px", fontWeight: "bold", letterSpacing: "0.5px" }}>& Orders</span>
                    </div>
                </Link>
                
                <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
                    <Badge badgeContent={totalItemsCount} color="error">
                        <ShoppingCartIcon sx={{ fontSize: "1.8rem" }} />
                    </Badge>
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}