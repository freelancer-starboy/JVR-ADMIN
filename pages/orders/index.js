import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  Avatar,
  AvatarGroup,
  Box,
  Card,
  Chip,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import PageHeader from "@/components/common/PageHeader";
import SearchField from "@/components/common/SearchField";
import StatusChip from "@/components/common/StatusChip";
import CheckroomOutlinedIcon from "@mui/icons-material/CheckroomOutlined";
import { EmptyState, ErrorState } from "@/components/common/States";
import { MobileList, MobileRow, desktopOnly } from "@/components/common/MobileList";
import { useGetOrdersQuery } from "@/utils/api/OrdersApi";
import { formatCurrency, formatDate, formatNumber, shortId } from "@/utils/format";

const STATUSES = ["Processing", "Packed", "Dispatched", "Delivered"];

export default function Orders() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isFetching, isLoading, error, refetch } = useGetOrdersQuery({
    page: page + 1,
    limit: rowsPerPage,
    status,
    searchQuery,
  });

  const orders = data?.orders || [];
  const counts = data?.statusCounts || {};
  const allCount = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle="Orders placed through the earlier online-payment checkout. Update their delivery status here."
      />

      <Card>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          alignItems={{ md: "center" }}
          justifyContent="space-between"
          sx={{ p: 2 }}
        >
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {[{ value: "", label: "All", count: allCount }, ...STATUSES.map((s) => ({ value: s, label: s, count: counts[s] || 0 }))].map(
              (option) => (
                <Chip
                  key={option.label}
                  label={`${option.label} · ${formatNumber(option.count)}`}
                  color={status === option.value ? "primary" : "default"}
                  variant={status === option.value ? "filled" : "outlined"}
                  onClick={() => {
                    setStatus(option.value);
                    setPage(0);
                  }}
                />
              )
            )}
          </Stack>
          <SearchField
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              setPage(0);
            }}
            placeholder="Order ID, customer, phone or product"
          />
        </Stack>

        {error ? (
          <ErrorState error={error} onRetry={refetch} title="Couldn't load orders" />
        ) : (
          <>
            <MobileList loading={isLoading}>
              {orders.map((order) => {
                const items = order.cartItems || [];
                return (
                  <MobileRow key={order._id} onClick={() => router.push(`/orders/${order._id}`)}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={700}>
                          #{shortId(order._id)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(order.createdAt, { withTime: true })}
                        </Typography>
                      </Box>
                      <StatusChip type="order" status={order.orderStatus} />
                    </Stack>
                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mt: 1.5 }}>
                      <AvatarGroup max={3} sx={{ "& .MuiAvatar-root": { width: 34, height: 34, border: "2px solid #fff" } }}>
                        {items.map((item, index) => (
                          <Avatar
                            key={`${item.productId}-${index}`}
                            src={item.productImage}
                            alt={item.productName}
                            sx={{ bgcolor: "#F1F2F8", color: "text.disabled" }}
                          >
                            <CheckroomOutlinedIcon fontSize="small" />
                          </Avatar>
                        ))}
                      </AvatarGroup>
                      <Typography variant="body2" noWrap sx={{ minWidth: 0, flex: 1 }}>
                        {items[0]?.productName || "—"}
                        {items.length > 1 && (
                          <Typography component="span" variant="caption" color="text.secondary">
                            {" "}+{items.length - 1} more
                          </Typography>
                        )}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-end" spacing={1} sx={{ mt: 1.5 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={500} noWrap>
                          {order.shippingAddress?.fullName || "—"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                          {order.shippingAddress?.phone}
                          {order.shippingAddress?.city ? ` · ${order.shippingAddress.city}` : ""}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {formatCurrency(order.orderTotal)}
                      </Typography>
                    </Stack>
                  </MobileRow>
                );
              })}
            </MobileList>

            <TableContainer
              sx={{ ...desktopOnly, opacity: isFetching && !isLoading ? 0.6 : 1, transition: "opacity 150ms ease" }}
            >
              <Table sx={{ minWidth: 860 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Order</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading
                    ? Array.from({ length: 6 }).map((_, index) => (
                        <TableRow key={index}>
                          {Array.from({ length: 6 }).map((__, cell) => (
                            <TableCell key={cell}>
                              <Skeleton />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : orders.map((order) => {
                        const items = order.cartItems || [];
                        return (
                          <TableRow
                            key={order._id}
                            hover
                            onClick={() => router.push(`/orders/${order._id}`)}
                            sx={{ cursor: "pointer" }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                #{shortId(order._id)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(order.createdAt, { withTime: true })}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {order.shippingAddress?.fullName || "—"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {order.shippingAddress?.phone}
                                {order.shippingAddress?.city ? ` · ${order.shippingAddress.city}` : ""}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1.25} alignItems="center">
                                <AvatarGroup max={3} sx={{ "& .MuiAvatar-root": { width: 34, height: 34, border: "2px solid #fff" } }}>
                                  {items.map((item, index) => (
                                    <Avatar
                                      key={`${item.productId}-${index}`}
                                      src={item.productImage}
                                      alt={item.productName}
                                      sx={{ bgcolor: "#F1F2F8", color: "text.disabled" }}
                                    >
                                      <CheckroomOutlinedIcon fontSize="small" />
                                    </Avatar>
                                  ))}
                                </AvatarGroup>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography variant="body2" noWrap sx={{ maxWidth: 220 }}>
                                    {items[0]?.productName || "—"}
                                  </Typography>
                                  {items.length > 1 && (
                                    <Typography variant="caption" color="text.secondary">
                                      +{items.length - 1} more item{items.length > 2 ? "s" : ""}
                                    </Typography>
                                  )}
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={600}>
                                {formatCurrency(order.orderTotal)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                                {order.paymentDetails?.method || "—"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                                {order.paymentDetails?.status || ""}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <StatusChip type="order" status={order.orderStatus} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </TableContainer>

            {!isLoading && orders.length === 0 && (
              <EmptyState
                icon={ReceiptLongOutlinedIcon}
                title={status || searchQuery ? "No matching orders" : "No orders yet"}
                description={status || searchQuery ? "Try another status or search." : "Orders placed on the storefront will appear here."}
              />
            )}

            <TablePagination
              component="div"
              count={data?.totalOrders || 0}
              page={page}
              onPageChange={(event, value) => setPage(value)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50]}
              sx={{ borderTop: "1px solid", borderColor: "divider" }}
            />
          </>
        )}
      </Card>
    </>
  );
}
