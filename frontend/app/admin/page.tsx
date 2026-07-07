'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  CircularProgress, 
  Alert,
  Chip,
  Card,
  CardContent,
  Divider
} from '@mui/material';

interface CustomerProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  customerTier: string | null;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<CustomerProfile[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:5191/api/Users';

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = selectedTier ? `${API_BASE_URL}?tier=${selectedTier}` : API_BASE_URL;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to retrieve optimized target demographics.');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [selectedTier]);

  // Dynamic Metrics Summary
  const totalCount = users.length;
  const tier1Count = users.filter(u => u.customerTier === 'Tier 1').length;
  const tier2Count = users.filter(u => u.customerTier === 'Tier 2').length;
  const tier3Count = users.filter(u => u.customerTier === 'Tier 3').length;

  const getChipProps = (tierName: string | null) => {
    switch (tierName) {
      case 'Tier 1': return { label: 'Tier 1', color: 'success' as const, variant: 'filled' as const };
      case 'Tier 2': return { label: 'Tier 2', color: 'primary' as const, variant: 'filled' as const };
      case 'Tier 3': return { label: 'Tier 3', color: 'warning' as const, variant: 'filled' as const };
      default: return { label: 'Unassigned', color: 'default' as const, variant: 'outlined' as const };
    }
  };

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        
        {/* HEADER SECTION */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.5px' }}>
            Customer Segmentation Center
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Enterprise cluster analytics loop linked to Python Isolation Forest intelligence frameworks.
          </Typography>
        </Box>

        {/* METRICS METRIC CARDS (Using Type-Safe CSS Grid) */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
          gap: 3, 
          mb: 4 
        }}>
          <Card variant="outlined" sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>Active Pool Size</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>{totalCount}</Typography>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 3, borderColor: 'success.light', bgcolor: '#f0fdf4' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography variant="caption" color="success.main" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Tier 1 (VIPs)</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: 'success.dark' }}>{tier1Count}</Typography>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 3, borderColor: 'primary.light', bgcolor: '#eff6ff' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Tier 2 (Regulars)</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: 'primary.dark' }}>{tier2Count}</Typography>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 3, borderColor: 'warning.light', bgcolor: '#fffbeb' }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography variant="caption" color="warning.main" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Tier 3 (Inactive)</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: 'warning.dark' }}>{tier3Count}</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* OPERATIONS WORKSPACE */}
        <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          
          {/* CONTROL STRIP (Using Type-Safe Flexbox) */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            p: 3, 
            bgcolor: 'background.paper' 
          }}>
            <FormControl size="small" sx={{ minWidth: 280 }}>
              <InputLabel id="tier-select-label">Target Market Cohort</InputLabel>
              <Select
                labelId="tier-select-label"
                id="tier-select"
                value={selectedTier}
                label="Target Market Cohort"
                onChange={(e) => setSelectedTier(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value=""><em>Show All Target Domains</em></MenuItem>
                <MenuItem value="Tier 1">Tier 1 (High Value Portfolio Users)</MenuItem>
                <MenuItem value="Tier 2">Tier 2 (Standard Core Frequency Users)</MenuItem>
                <MenuItem value="Tier 3">Tier 3 (Dormant Pipeline / At-Risk Users)</MenuItem>
              </Select>
            </FormControl>

            {loading && <CircularProgress size={22} thickness={4} />}
          </Box>

          <Divider />

          {error && (
            <Box sx={{ p: 3 }}>
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                <strong>Data Integration Interruption:</strong> {error}
              </Alert>
            </Box>
          )}

          {!loading && !error && (
            <TableContainer>
              <Table aria-label="customer profile layout table">
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.85rem' }}>User Reference</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.85rem' }}>Full Identity Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.85rem' }}>Corporate Email</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.85rem' }} align="right">Model Classification</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 8, color: 'text.secondary', fontStyle: 'italic' }}>
                        No records match the active behavioral filters selected.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>#{user.id}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{user.firstName} {user.lastName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell align="right">
                          <Chip size="small" {...getChipProps(user.customerTier)} sx={{ fontWeight: 700, borderRadius: 1.5, px: 0.5 }} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
}