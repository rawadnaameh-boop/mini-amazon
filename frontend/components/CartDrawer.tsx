"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Button from "@mui/material/Button";

export default function CartDrawer() {
    const { cart, isDrawerOpen, setDrawerOpen, addToCart, updateCartItem } = useCart();
    const router = useRouter();

    const handleIncrement = async (productId: number) => {
        await addToCart(productId, 1);
    };

    const handleDecrement = async (productId: number, currentQty: number) => {
        if (currentQty > 1) {
            await updateCartItem(productId, currentQty - 1);
        }
    };

    const handleProceedToCheckout = () => {
        setDrawerOpen(false);
        router.push("/checkout");
    };

    return (
        <Drawer anchor="right" open={isDrawerOpen} onClose={() => setDrawerOpen(false)}>
            <Box sx={{ width: 360, padding: "20px", display: "flex", flexDirection: "column", height: "100%" }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                    Your Shopping Cart
                </Typography>
                <Divider />

                {/* If the cart is empty */}
                {!cart || cart.items.length === 0 ? (
                    <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Typography color="textSecondary">Your cart is empty.</Typography>
                    </Box>
                ) : (
                    <>
                        {/* Scrollable list of items fetched from C# Database */}
                        <List sx={{ flexGrow: 1, overflowY: "auto", mt: 1 }}>
                            {cart.items.map((item) => (
                                <ListItem 
                                    key={item.productId}
                                    secondaryAction = {
                                        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                            {/* Decrement Button */}
                                            <IconButton size="small" onClick={() => handleDecrement(item.productId, item.quantity)}>
                                                <RemoveIcon fontSize="small" />
                                            </IconButton>
                                            
                                            <Typography sx={{ fontWeight: "bold", minWidth: "20px", textAlign: "center" }}>
                                                {item.quantity}
                                            </Typography>
                                            
                                            {/* Increment Button - triggers backend validation interceptor */}
                                            <IconButton size="small" onClick={() => handleIncrement(item.productId)}>
                                                <AddIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    }
                                >
                                    <ListItemText 
                                        primary={item.productName}
                                        secondary={`$${item.unitPrice.toFixed(2)} each`}
                                        sx={{ pr: 6 }}
                                    />
                                </ListItem>
                            ))}
                        </List>

                        <Divider />

                        {/* BUSINESS LOGIC CRITERIA: Displays backend calculated pricing without trusting client numbers */}
                        <Box sx={{ pt: 2, pb: 2 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>Total:</Typography>
                                <Typography variant="h6" sx={{ color: "#B12704", fontWeight: "bold" }}>
                                    ${cart.cartTotal.toFixed(2)}
                                </Typography>
                            </Box>
                            
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleProceedToCheckout}
                                sx={{ backgroundColor: "#FFD814", color: "#0F1111", '&:hover': { backgroundColor: "#F7CA00" }, borderRadius: "8px", fontWeight: "bold" }}
                            >
                                Proceed to Checkout
                            </Button>
                        </Box>
                    </>
                )}
            </Box>
        </Drawer>
    );
}