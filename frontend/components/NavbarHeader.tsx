"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Link from "next/link";
import VisualSearchUpload from "./VisualSearchUpload";
import SearchIcon from "@mui/icons-material/Search";
import InputBase from "@mui/material/InputBase";
import { useRouter } from "next/navigation";
interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  customerTier: string | null;
}

export default function NavbarHeader() {
  const { cart, setDrawerOpen } = useCart();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  // --- Hydration & Simulation States ---
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api").replace(
    /\/$/,
    "",
  );
  useEffect(() => {
    setMounted(true);

    const fetchIdentities = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/Users`);
        if (response.ok) {
          const data: UserProfile[] = await response.json();
          setUsers(data);

          const savedUserId = localStorage.getItem("simulated_user_id");
          if (savedUserId) {
            const matchedUser = data.find(
              (u) => u.id === parseInt(savedUserId),
            );
            if (matchedUser) setCurrentUser(matchedUser);
          } else if (data.length > 0) {
            setCurrentUser(data[0]);
            localStorage.setItem("simulated_user_id", data[0].id.toString());
          }
        }
      } catch (err) {
        console.error("Simulation engine failed to sync user context:", err);
      }
    };

    fetchIdentities();
  }, []);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSwitchUser = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem("simulated_user_id", user.id.toString());
    handleCloseMenu();
    window.location.reload();
  };
  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedSearch = searchTerm.trim();

    if (!trimmedSearch) {
      return;
    }

    router.push(`/search-results?query=${encodeURIComponent(trimmedSearch)}`);
  };
  const totalItemsCount =
    cart?.items.reduce(
      (sum: number, item: { quantity: number }) => sum + item.quantity,
      0,
    ) ?? 0;

  // HYDRATION FIX: Render pure HTML matching the exact visual footprint on server pass
  if (!mounted) {
    return (
      <header
        style={{
          backgroundColor: "#131921",
          height: "64px",
          display: "flex",
          alignItems: "center",
          padding: "0 26px",
        }}
      >
        <span
          style={{
            color: "#fff",
            fontSize: "1.25rem",
            fontWeight: "bold",
            fontFamily: "sans-serif",
          }}
        >
          Mini Amazon
        </span>
      </header>
    );
  }

  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: "#131921", padding: "0 10px" }}
    >
      <Toolbar>
        {/* Brand Navigation Header */}
        {/* <Link
          href="/"
          style={{ textDecoration: "none", color: "inherit", flexGrow: 1 }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: "bold", cursor: "pointer" }}
          >
            Mini-Amazon
          </Typography>
        </Link> */}
        {/* Brand Navigation Header */}
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "inherit",
            marginRight: "20px",
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: "bold", cursor: "pointer" }}
          >
            Mini-Amazon
          </Typography>
        </Link>

        {/* Product Name Search Bar */}
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{
            display: "flex",
            alignItems: "center",
            flexGrow: 1,
            maxWidth: "520px",
            backgroundColor: "#fff",
            borderRadius: "4px",
            overflow: "hidden",
            marginRight: "20px",
            height: "40px",
          }}
        >
          <InputBase
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            sx={{
              flex: 1,
              paddingLeft: "12px",
              color: "#111",
            }}
          />

          <IconButton
            type="submit"
            sx={{
              backgroundColor: "#febd69",
              borderRadius: 0,
              height: "40px",
              width: "48px",
              "&:hover": {
                backgroundColor: "#f3a847",
              },
            }}
          >
            <SearchIcon sx={{ color: "#111" }} />
          </IconButton>
        </Box>
        {/* Visual Product Search Upload */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 8px",
            cursor: "pointer",
            marginRight: "20px",
            lineHeight: "1.2",
            borderRadius: "2px",
            border: "1px solid transparent",
            "&:hover": { borderColor: "#ccc" },
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "11px", color: "#ccc" }}>Search</span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                letterSpacing: "0.5px",
              }}
            >
              By Image
            </span>
          </Box>

          <VisualSearchUpload />
        </Box>
        {/* STANDARD RETAIL IDENTITY PANEL TRIGGER */}
        <Box
          onClick={handleOpenMenu}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 8px",
            cursor: "pointer",
            marginRight: "20px",
            lineHeight: "1.2",
            borderRadius: "2px",
            border: "1px solid transparent",
            "&:hover": { borderColor: "#ccc" },
          }}
        >
          <AccountCircleIcon sx={{ color: "#fff", fontSize: "1.5rem" }} />
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "11px", color: "#ccc" }}>
              Hello, {currentUser ? currentUser.firstName : "Sign In"}
            </span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                letterSpacing: "0.5px",
              }}
            >
              Account & Lists
            </span>
          </Box>
        </Box>

        {/* MATERIAL DROPDOWN MENU */}
        <Menu
          id="simulation-menu"
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleCloseMenu}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 240,
                boxShadow: "0px 4px 20px rgba(0,0,0,0.15)",
              },
            },
          }}
        >
          <Box sx={{ px: 2, py: 1, bgcolor: "grey.50" }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontWeight: 700 }}
            >
              SWITCH SIMULATED PROFILE
            </Typography>
          </Box>

          {users.map((user) => (
            <MenuItem
              key={user.id}
              onClick={() => handleSwitchUser(user)}
              selected={currentUser?.id === user.id}
              sx={{ py: 1.5 }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Menu>

        {/* ADMIN PANEL ENTRY PORTAL */}
        <Link
          href="/admin"
          style={{
            textDecoration: "none",
            color: "inherit",
            marginRight: "20px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              padding: "4px 8px",
              cursor: "pointer",
              lineHeight: "1.2",
              borderRadius: "2px",
              border: "1px solid transparent",
              "&:hover": { borderColor: "#38bdf8" },
            }}
          >
            <span
              style={{ fontSize: "11px", color: "#38bdf8", fontWeight: "bold" }}
            >
              System
            </span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                letterSpacing: "0.5px",
              }}
            >
              Control
            </span>
          </Box>
        </Link>

        {/* Returns & Historic Checkout Registry */}
        <Link
          href="/orders"
          style={{
            textDecoration: "none",
            color: "inherit",
            marginRight: "20px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              padding: "4px 8px",
              cursor: "pointer",
              lineHeight: "1.2",
            }}
          >
            <span style={{ fontSize: "11px", color: "#ccc" }}>Returns</span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                letterSpacing: "0.5px",
              }}
            >
              & Orders
            </span>
          </Box>
        </Link>

        {/* Global Cart Utility Anchor */}
        <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
          <Badge badgeContent={totalItemsCount} color="error">
            <ShoppingCartIcon sx={{ fontSize: "1.8rem" }} />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
