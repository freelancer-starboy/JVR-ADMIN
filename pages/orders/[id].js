import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Skeleton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { toast } from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import StatusChip from "@/components/common/StatusChip";
import ColorSwatch from "@/components/common/ColorSwatch";
import ProductThumb from "@/components/common/ProductThumb";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { ErrorState } from "@/components/common/States";
import { errorMessage } from "@/utils/api/baseApi";
import { useGetOrderQuery, useUpdateOrderStatusMutation } from "@/utils/api/OrdersApi";
import { formatCurrency, formatDate, shortId, whatsappLink } from "@/utils/format";

const STEPS = ["Processing", "Packed", "Dispatched", "Delivered"];

function InfoRow({ label, children }) {
  return (
    <Stack direction="row" spacing={2} sx={{ py: 0.75 }}>
      <Typography variant="body2" color="text.secondary" sx={{ width: 120, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ wordBreak: "break-word", minWidth: 0 }}>
        {children || "—"}
      </Typography>
    </Stack>
  );
}

export default function OrderDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { data, isLoading, error, refetch } = useGetOrderQuery(id, { skip: !id, refetchOnMountOrArgChange: true });
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const order = data?.order;
  const currentStep = STEPS.indexOf(order?.orderStatus);
  const nextStatus = currentStep >= 0 && currentStep < STEPS.length - 1 ? STEPS[currentStep + 1] : currentStep === -1 ? STEPS[0] : null;
  const items = order?.cartItems || [];
  const address = order?.shippingAddress || {};
  const itemsTotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const waLink = whatsappLink(address.phone);

  const handleUpdate = async () => {
    try {
      await updateStatus({ id, status: nextStatus }).unwrap();
      toast.success(`Order marked as ${nextStatus}`);
      setConfirmOpen(false);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update status"));
    }
  };

  return (
    <>
      <PageHeader
        title={order ? `Order #${shortId(order._id)}` : "Order"}
        subtitle={order ? `Placed ${formatDate(order.createdAt, { withTime: true })}` : null}
        breadcrumbs={[{ label: "Orders", href: "/orders" }, { label: order ? `#${shortId(order._id)}` : "Details" }]}
        actions={order && <StatusChip type="order" status={order.orderStatus} size="medium" />}
      />

      {error ? (
        <Card>
          <ErrorState error={error} onRetry={refetch} title="Couldn't load this order" />
        </Card>
      ) : isLoading || !order ? (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Skeleton variant="rounded" height={160} sx={{ mb: 3 }} />
            <Skeleton variant="rounded" height={280} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <Skeleton variant="rounded" height={300} />
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              <Card>
                <CardHeader
                  title="Delivery progress"
                  action={
                    nextStatus && (
                      <Button
                        variant="contained"
                        startIcon={<LocalShippingOutlinedIcon />}
                        onClick={() => setConfirmOpen(true)}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Mark as {nextStatus}
                      </Button>
                    )
                  }
                />
                <CardContent>
                  <Stepper activeStep={currentStep + 1} alternativeLabel>
                    {STEPS.map((step) => (
                      <Step key={step}>
                        <StepLabel>{step}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                  {order.updatedAt && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 2 }}>
                      Last updated {formatDate(order.updatedAt, { withTime: true })}
                    </Typography>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader title={`Items (${items.length})`} />
                <TableContainer>
                  <Table sx={{ minWidth: 560 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Colour / size</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Qty</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={`${item.productId}-${item.color}-${item.size}-${index}`}>
                          <TableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <ProductThumb src={item.productImage} alt={item.productName} size={48} />
                              <Typography variant="body2" fontWeight={500}>
                                {item.productName}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <ColorSwatch color={item.color} size={14} />
                              <Typography variant="body2">{item.size || "—"}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600}>
                              {formatCurrency((Number(item.price) || 0) * (Number(item.quantity) || 1))}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ p: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
                  <Stack spacing={0.75} sx={{ ml: "auto", maxWidth: 280 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Items
                      </Typography>
                      <Typography variant="body2">{formatCurrency(itemsTotal)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={700}>Order total</Typography>
                      <Typography fontWeight={700}>{formatCurrency(order.orderTotal)}</Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Card>
            </Stack>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              <Card>
                <CardHeader title="Customer & shipping" />
                <CardContent sx={{ pt: 1 }}>
                  <InfoRow label="Name">{address.fullName}</InfoRow>
                  <InfoRow label="Phone">
                    {address.phone}
                    {waLink && (
                      <Button size="small" href={waLink} target="_blank" rel="noreferrer" sx={{ ml: 1, minWidth: 0, py: 0 }}>
                        WhatsApp
                      </Button>
                    )}
                  </InfoRow>
                  <InfoRow label="Address">
                    {[address.addressLine1, address.addressLine2].filter(Boolean).join(", ")}
                  </InfoRow>
                  <InfoRow label="City">{address.city}</InfoRow>
                  <InfoRow label="State / PIN">{[address.state, address.postalCode].filter(Boolean).join(" - ")}</InfoRow>
                  <InfoRow label="Country">{address.country}</InfoRow>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Payment" />
                <CardContent sx={{ pt: 1 }}>
                  <InfoRow label="Method">
                    <Box component="span" sx={{ textTransform: "capitalize" }}>
                      {order.paymentDetails?.method}
                    </Box>
                  </InfoRow>
                  <InfoRow label="Status">
                    <Box component="span" sx={{ textTransform: "capitalize" }}>
                      {order.paymentDetails?.status}
                    </Box>
                  </InfoRow>
                  <InfoRow label="Transaction ID">{order.paymentDetails?.transactionId}</InfoRow>
                  <InfoRow label="Order ID">{order._id}</InfoRow>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={`Mark order as ${nextStatus}?`}
        description="The customer will see the new status on their orders page."
        confirmLabel={`Mark as ${nextStatus}`}
        loading={updating}
        onConfirm={handleUpdate}
        onClose={() => setConfirmOpen(false)}
      />
    </>
  );
}
