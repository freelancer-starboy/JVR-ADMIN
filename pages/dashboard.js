import React from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CheckroomOutlinedIcon from "@mui/icons-material/CheckroomOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PageHeader from "@/components/common/PageHeader";
import StatusChip from "@/components/common/StatusChip";
import ProductThumb from "@/components/common/ProductThumb";
import { EmptyState, ErrorState } from "@/components/common/States";
import LeadAvatar from "@/components/leads/LeadAvatar";
import { useGetDashboardSummaryQuery, useGetMeQuery } from "@/utils/api/DashboardApi";
import { formatCurrency, formatNumber, formatRelative } from "@/utils/format";

function StatCard({ title, value, hint, icon: Icon, color, href, loading }) {
  const content = (
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.75 }}>
            {loading ? <Skeleton width={70} /> : value}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
            {loading ? <Skeleton width={120} /> : hint}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            color,
            bgcolor: alpha(color, 0.12),
          }}
        >
          <Icon />
        </Box>
      </Stack>
    </CardContent>
  );

  return (
    <Card
      sx={{
        height: "100%",
        transition: "box-shadow 200ms ease, transform 200ms ease",
        "&:hover": href ? { boxShadow: "0 10px 24px rgba(16,24,40,0.08)", transform: "translateY(-2px)" } : undefined,
      }}
    >
      {href ? (
        <Box component={Link} href={href} sx={{ display: "block", height: "100%" }}>
          {content}
        </Box>
      ) : (
        content
      )}
    </Card>
  );
}

function EnquiryChart({ data = [], loading }) {
  const max = Math.max(1, ...data.map((day) => day.count));
  return (
    <Box sx={{ height: 190, display: "flex", alignItems: "flex-end", gap: { xs: 0.5, sm: 1 }, pt: 2 }}>
      {(loading ? Array.from({ length: 14 }, (_, i) => ({ date: String(i), count: 0 })) : data).map((day) => {
        const label = loading
          ? ""
          : new Date(`${day.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        return (
          <Tooltip key={day.date} title={loading ? "" : `${label}: ${day.count} enquir${day.count === 1 ? "y" : "ies"}`}>
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
              {loading ? (
                <Skeleton variant="rounded" width="100%" height={`${20 + ((Number(day.date) * 37) % 60)}%`} />
              ) : (
                <Box
                  sx={(theme) => ({
                    width: "100%",
                    maxWidth: 28,
                    height: `${Math.max(3, (day.count / max) * 100)}%`,
                    borderRadius: "6px 6px 2px 2px",
                    bgcolor: day.count ? theme.palette.whatsapp.main : alpha(theme.palette.text.secondary, 0.12),
                    transition: "height 400ms ease",
                  })}
                />
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, fontSize: 10, whiteSpace: "nowrap", display: { xs: "none", sm: "block" } }}>
                {label.split(" ")[0]}
              </Typography>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { data, isLoading, error, refetch } = useGetDashboardSummaryQuery(undefined, {
    refetchOnMountOrArgChange: 30,
    pollingInterval: 120000,
  });
  const { data: me } = useGetMeQuery();
  const name = me?.admin?.name;

  const products = data?.products;
  const leads = data?.leads;
  const orders = data?.orders;
  const enquiries = data?.enquiries;

  return (
    <>
      <PageHeader
        title={name ? `${greeting()}, ${name.split(" ")[0]}` : "Dashboard"}
        documentTitle="Dashboard"
        subtitle="Here's what's happening at SRI JVR TEXTILES."
        actions={
          <>
            <Button component={Link} href="/leads?status=new" variant="outlined" startIcon={<WhatsAppIcon />}>
              New leads
            </Button>
            <Button component={Link} href="/products/new" variant="contained" startIcon={<AddIcon />}>
              Add product
            </Button>
          </>
        }
      />

      {error ? (
        <Card>
          <ErrorState error={error} onRetry={refetch} title="Couldn't load the dashboard" />
        </Card>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="WhatsApp leads"
              value={formatNumber(leads?.total)}
              hint={`${formatNumber(leads?.newCount)} new · ${formatNumber(leads?.enquiriesLast7Days)} enquiries this week`}
              icon={WhatsAppIcon}
              color="#16A34A"
              href="/leads"
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Products"
              value={formatNumber(products?.total)}
              hint={`${formatNumber(products?.totalStock)} pcs in stock · ${formatNumber(products?.outOfStock)} sold out`}
              icon={CheckroomOutlinedIcon}
              color="#4F46E5"
              href="/products"
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Unread enquiries"
              value={formatNumber(enquiries?.unread)}
              hint={`${formatNumber(enquiries?.total)} contact messages in total`}
              icon={MailOutlineIcon}
              color="#0284C7"
              href="/enquiries"
              loading={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Open orders"
              value={formatNumber(orders?.open)}
              hint={`${formatNumber(orders?.total)} orders · ${formatCurrency(orders?.revenue || 0)} paid online`}
              icon={ReceiptLongOutlinedIcon}
              color="#D97706"
              href="/orders"
              loading={isLoading}
            />
          </Grid>

          <Grid item xs={12} lg={7}>
            <Card sx={{ height: "100%" }}>
              <CardHeader
                title="WhatsApp enquiries"
                subheader={
                  isLoading ? "Last 14 days" : `${formatNumber(leads?.enquiriesInChart)} clicks on “Order on WhatsApp” in the last 14 days`
                }
              />
              <CardContent sx={{ pt: 0 }}>
                <EnquiryChart data={leads?.chart} loading={isLoading} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Card sx={{ height: "100%" }}>
              <CardHeader
                title="Recent WhatsApp leads"
                action={
                  <Button component={Link} href="/leads" size="small" endIcon={<ArrowForwardIcon />} sx={{ mt: 1, mr: 1 }}>
                    View all
                  </Button>
                }
              />
              {isLoading ? (
                <CardContent>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} height={52} />
                  ))}
                </CardContent>
              ) : leads?.recent?.length ? (
                <List dense sx={{ px: 1, pb: 1 }}>
                  {leads.recent.map((lead) => (
                    <ListItemButton key={lead._id} component={Link} href={`/leads/${lead._id}`} sx={{ gap: 1.5, py: 1 }}>
                      <LeadAvatar lead={lead} size={36} />
                      <ListItemText
                        primary={lead.isGuest ? "Guest" : lead.name || "Unnamed customer"}
                        secondary={`${lead.lastEnquiry?.items?.[0]?.productName || "Enquiry"}${
                          (lead.lastEnquiry?.items?.length || 0) > 1 ? ` +${lead.lastEnquiry.items.length - 1}` : ""
                        } · ${formatRelative(lead.lastEnquiryAt)}`}
                        primaryTypographyProps={{ fontWeight: 600, noWrap: true }}
                        secondaryTypographyProps={{ noWrap: true }}
                        sx={{ minWidth: 0 }}
                      />
                      <StatusChip status={lead.followUpStatus} />
                    </ListItemButton>
                  ))}
                </List>
              ) : (
                <EmptyState compact icon={WhatsAppIcon} title="No leads yet" description="WhatsApp order requests from the storefront will appear here." />
              )}
            </Card>
          </Grid>

          <Grid item xs={12} lg={7}>
            <Card sx={{ height: "100%" }}>
              <CardHeader
                title="Low stock"
                subheader="Products with 5 or fewer pieces left"
                action={
                  <Button component={Link} href="/products" size="small" endIcon={<ArrowForwardIcon />} sx={{ mt: 1, mr: 1 }}>
                    All products
                  </Button>
                }
              />
              {isLoading ? (
                <CardContent>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} height={52} />
                  ))}
                </CardContent>
              ) : products?.lowStock?.length ? (
                <List dense sx={{ px: 1, pb: 1 }}>
                  {products.lowStock.map((product) => (
                    <ListItemButton key={product._id} component={Link} href={`/products/${product._id}/edit`} sx={{ gap: 1.5 }}>
                      <ProductThumb src={product.image} alt={product.productName} size={40} />
                      <ListItemText
                        primary={product.productName}
                        secondary={product.productType}
                        primaryTypographyProps={{ fontWeight: 600, noWrap: true }}
                        sx={{ minWidth: 0 }}
                      />
                      <Typography variant="body2" fontWeight={700} color={product.stock ? "warning.main" : "error.main"}>
                        {product.stock ? `${product.stock} left` : "Sold out"}
                      </Typography>
                    </ListItemButton>
                  ))}
                </List>
              ) : (
                <EmptyState compact icon={Inventory2OutlinedIcon} title="All stocked up" description="No product is running low." />
              )}
            </Card>
          </Grid>

          <Grid item xs={12} lg={5}>
            <Card sx={{ height: "100%" }}>
              <CardHeader title="Lead follow-up" subheader="Where your WhatsApp leads stand" />
              <CardContent sx={{ pt: 1 }}>
                {[
                  ["new", "New"],
                  ["contacted", "Contacted"],
                  ["converted", "Converted"],
                  ["not_interested", "Not interested"],
                ].map(([key, label]) => {
                  const count = leads?.statusCounts?.[key] || 0;
                  const percent = leads?.total ? Math.round((count / leads.total) * 100) : 0;
                  return (
                    <Box key={key} component={Link} href={`/leads?status=${key}`} sx={{ display: "block", mb: 2 }}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                        <StatusChip status={key} />
                        <Typography variant="body2" fontWeight={600}>
                          {isLoading ? "…" : `${formatNumber(count)} (${percent}%)`}
                        </Typography>
                      </Stack>
                      <Box sx={{ height: 6, borderRadius: 3, bgcolor: "#EEF0F6", overflow: "hidden" }}>
                        <Box sx={{ width: `${percent}%`, height: "100%", bgcolor: "primary.main", borderRadius: 3, transition: "width 400ms ease" }} />
                      </Box>
                    </Box>
                  );
                })}
                {!isLoading && !leads?.total && (
                  <Typography variant="body2" color="text.secondary">
                    No leads yet.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </>
  );
}
