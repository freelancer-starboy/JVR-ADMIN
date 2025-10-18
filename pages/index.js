import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Menu,
  MenuItem,
  AppBar,
  Toolbar,
  InputBase,
  Badge,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  AttachMoney,
  People,
  Inventory,
  Search,
  Notifications,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

const Dashboard = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (period) => {
    if (period) setSelectedPeriod(period);
    setAnchorEl(null);
  };

  // Sample data
  const salesData = [
    { month: 'Jan', sales: 4000, orders: 240, revenue: 2400 },
    { month: 'Feb', sales: 3000, orders: 198, revenue: 2210 },
    { month: 'Mar', sales: 5000, orders: 380, revenue: 2290 },
    { month: 'Apr', sales: 4500, orders: 308, revenue: 2000 },
    { month: 'May', sales: 6000, orders: 420, revenue: 2181 },
    { month: 'Jun', sales: 5500, orders: 380, revenue: 2500 },
  ];

  const categoryData = [
    { name: 'Electronics', value: 35, color: '#3f51b5' },
    { name: 'Fashion', value: 25, color: '#f50057' },
    { name: 'Home', value: 20, color: '#ff9800' },
    { name: 'Beauty', value: 12, color: '#4caf50' },
    { name: 'Sports', value: 8, color: '#9c27b0' },
  ];

  const topProducts = [
    { id: 1, name: 'Wireless Headphones', sales: 1234, revenue: '$49,360', trend: 12.5, stock: 85 },
    { id: 2, name: 'Smart Watch Pro', sales: 987, revenue: '$39,480', trend: -3.2, stock: 42 },
    { id: 3, name: 'Laptop Stand', sales: 856, revenue: '$25,680', trend: 8.7, stock: 120 },
    { id: 4, name: 'Bluetooth Speaker', sales: 743, revenue: '$22,290', trend: 15.3, stock: 95 },
    { id: 5, name: 'Phone Case Set', sales: 698, revenue: '$13,960', trend: 5.1, stock: 200 },
  ];

  const recentOrders = [
    { id: '#ORD-001', customer: 'John Doe', product: 'Wireless Headphones', amount: '$299', status: 'Delivered', date: '2 hours ago' },
    { id: '#ORD-002', customer: 'Jane Smith', product: 'Smart Watch', amount: '$399', status: 'Processing', date: '5 hours ago' },
    { id: '#ORD-003', customer: 'Bob Johnson', product: 'Laptop Stand', amount: '$79', status: 'Shipped', date: '1 day ago' },
    { id: '#ORD-004', customer: 'Alice Brown', product: 'Bluetooth Speaker', amount: '$149', status: 'Pending', date: '1 day ago' },
  ];

  const StatCard = ({ title, value, change, icon: Icon, color, subtitle }) => (
    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`, border: `1px solid ${color}30` }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              {value}
            </Typography>
            <Box display="flex" alignItems="center" gap={0.5}>
              {change > 0 ? (
                <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
              ) : (
                <ArrowDownward sx={{ fontSize: 16, color: 'error.main' }} />
              )}
              <Typography
                variant="body2"
                color={change > 0 ? 'success.main' : 'error.main'}
                fontWeight="medium"
              >
                {Math.abs(change)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            </Box>
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            <Icon />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Processing': return 'info';
      case 'Shipped': return 'primary';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* AppBar */}
      {/* <AppBar position="static" color="default" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 0, fontWeight: 'bold', mr: 4, color: '#3f51b5' }}>
            E-Shop Dashboard
          </Typography>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', bgcolor: '#f5f5f5', borderRadius: 1, px: 2, py: 0.5, maxWidth: 400 }}>
            <Search sx={{ color: 'text.secondary', mr: 1 }} />
            <InputBase placeholder="Search products, orders..." fullWidth />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
            <IconButton>
              <Badge badgeContent={4} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            <Avatar sx={{ bgcolor: '#3f51b5' }}>AD</Avatar>
          </Box>
        </Toolbar>
      </AppBar> */}

      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Dashboard Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome back! Here's what's happening with your store today.
            </Typography>
          </Box>
          <Chip
            label={selectedPeriod}
            onClick={handleMenuOpen}
            sx={{ px: 1 }}
          />
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => handleMenuClose()}>
            <MenuItem onClick={() => handleMenuClose('Today')}>Today</MenuItem>
            <MenuItem onClick={() => handleMenuClose('This Week')}>This Week</MenuItem>
            <MenuItem onClick={() => handleMenuClose('This Month')}>This Month</MenuItem>
            <MenuItem onClick={() => handleMenuClose('This Year')}>This Year</MenuItem>
          </Menu>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Revenue"
              value="$54,239"
              change={12.5}
              icon={AttachMoney}
              color="#4caf50"
              subtitle="vs last month"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Orders"
              value="2,456"
              change={8.2}
              icon={ShoppingCart}
              color="#3f51b5"
              subtitle="vs last month"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Customers"
              value="1,893"
              change={-2.4}
              icon={People}
              color="#f50057"
              subtitle="vs last month"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Products Sold"
              value="8,524"
              change={15.7}
              icon={Inventory}
              color="#ff9800"
              subtitle="vs last month"
            />
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Sales Overview
                  </Typography>
                  <IconButton size="small">
                    <MoreVert />
                  </IconButton>
                </Box>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3f51b5" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3f51b5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip />
                    <Area type="monotone" dataKey="sales" stroke="#3f51b5" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Sales by Category
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Box mt={2}>
                  {categoryData.map((cat, i) => (
                    <Box key={i} display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: cat.color }} />
                        <Typography variant="body2">{cat.name}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">{cat.value}%</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tables */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={7}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Top Selling Products
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Sales</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                        <TableCell align="right">Trend</TableCell>
                        <TableCell align="right">Stock</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topProducts.map((product) => (
                        <TableRow key={product.id} hover>
                          <TableCell>{product.name}</TableCell>
                          <TableCell align="right">{product.sales}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>{product.revenue}</TableCell>
                          <TableCell align="right">
                            <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                              {product.trend > 0 ? (
                                <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                              ) : (
                                <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                              )}
                              <Typography variant="body2" color={product.trend > 0 ? 'success.main' : 'error.main'}>
                                {Math.abs(product.trend)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ width: 60 }}>
                              <LinearProgress
                                variant="determinate"
                                value={(product.stock / 200) * 100}
                                color={product.stock < 50 ? 'error' : 'success'}
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Recent Orders
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">{order.id}</Typography>
                            <Typography variant="caption" color="text.secondary">{order.date}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{order.customer}</Typography>
                            <Typography variant="caption" color="text.secondary">{order.product}</Typography>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>{order.amount}</TableCell>
                          <TableCell>
                            <Chip label={order.status} size="small" color={getStatusColor(order.status)} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;