import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Link as MuiLink,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { toast } from "react-toastify";
import PageHeader from "@/components/common/PageHeader";
import StatusChip, { LEAD_STATUS } from "@/components/common/StatusChip";
import ColorSwatch from "@/components/common/ColorSwatch";
import ProductThumb from "@/components/common/ProductThumb";
import { EmptyState, ErrorState } from "@/components/common/States";
import LeadAvatar from "@/components/leads/LeadAvatar";
import { errorMessage } from "@/utils/api/baseApi";
import { useGetLeadQuery, useUpdateLeadMutation } from "@/utils/api/LeadsApi";
import { formatCurrency, formatDate, formatNumber, formatRelative, whatsappLink } from "@/utils/format";

const SOURCE_LABEL = { cart: "From cart", product: "From product page", wishlist: "From wishlist" };

function enquiryTotal(enquiry) {
  if (Number.isFinite(enquiry.totalAmount)) return enquiry.totalAmount;
  return (enquiry.items || []).reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
}

function EnquiryCard({ enquiry, number }) {
  const items = enquiry.items || [];
  return (
    <Card>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        sx={{ px: 2.5, py: 1.75, borderBottom: "1px solid", borderColor: "divider", bgcolor: "#FAFAFD" }}
      >
        <Box>
          <Typography variant="subtitle2">
            Enquiry #{number} · {formatDate(enquiry.createdAt, { withTime: true })}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatRelative(enquiry.createdAt)}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip size="small" variant="outlined" label={SOURCE_LABEL[enquiry.source] || enquiry.source || "Unknown source"} />
          {enquiry.pageUrl && (
            <Button
              size="small"
              href={enquiry.pageUrl}
              target="_blank"
              rel="noreferrer"
              endIcon={<OpenInNewIcon sx={{ fontSize: "14px !important" }} />}
            >
              Open page
            </Button>
          )}
        </Stack>
      </Stack>
      <TableContainer>
        <Table size="small" sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Colour</TableCell>
              <TableCell>Size</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary">
                    No products recorded for this enquiry.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => {
                const quantity = Number(item.quantity) || 1;
                return (
                  <TableRow key={`${item.productId}-${item.color}-${item.size}-${index}`}>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <ProductThumb src={item.productImage} alt={item.productName} size={48} />
                        <Typography variant="body2" fontWeight={500}>
                          {item.productId ? (
                            <MuiLink href={`/products/${item.productId}`} underline="hover" color="inherit">
                              {item.productName || "Product"}
                            </MuiLink>
                          ) : (
                            item.productName || "Product"
                          )}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{item.color ? <ColorSwatch color={item.color} size={14} showLabel /> : "—"}</TableCell>
                    <TableCell>{item.size || "—"}</TableCell>
                    <TableCell align="right">{quantity}</TableCell>
                    <TableCell align="right">{item.price != null ? formatCurrency(item.price) : "—"}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {item.price != null ? formatCurrency((Number(item.price) || 0) * quantity) : "—"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ px: 2.5, py: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
        <Typography variant="body2" color="text.secondary">
          Enquiry total
        </Typography>
        <Typography variant="body2" fontWeight={700}>
          {formatCurrency(enquiryTotal(enquiry))}
        </Typography>
      </Stack>
    </Card>
  );
}

function FollowUpCard({ lead }) {
  const [updateLead, { isLoading }] = useUpdateLeadMutation();
  const [status, setStatus] = useState(lead.followUpStatus || "new");
  const [notes, setNotes] = useState(lead.followUpNotes || "");

  useEffect(() => {
    setStatus(lead.followUpStatus || "new");
    setNotes(lead.followUpNotes || "");
  }, [lead._id, lead.followUpStatus, lead.followUpNotes]);

  const dirty = status !== (lead.followUpStatus || "new") || notes !== (lead.followUpNotes || "");

  const save = async () => {
    try {
      await updateLead({ id: lead._id, followUpStatus: status, followUpNotes: notes }).unwrap();
      toast.success("Follow-up saved");
    } catch (error) {
      toast.error(errorMessage(error, "Could not save the follow-up"));
    }
  };

  return (
    <Card>
      <CardHeader title="Follow-up" subheader={lead.updatedAt ? `Last updated ${formatRelative(lead.updatedAt)}` : null} />
      <CardContent sx={{ pt: 1 }}>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
          Status
        </Typography>
        <ToggleButtonGroup
          exclusive
          value={status}
          onChange={(event, value) => value && setStatus(value)}
          size="small"
          sx={{ flexWrap: "wrap", gap: 0.75, "& .MuiToggleButton-root": { border: "1px solid !important", borderColor: "divider", borderRadius: "8px !important", px: 1.5 } }}
        >
          {Object.entries(LEAD_STATUS).map(([value, config]) => (
            <ToggleButton
              key={value}
              value={value}
              sx={{
                "&.Mui-selected, &.Mui-selected:hover": {
                  bgcolor: `${config.color}1F`,
                  color: config.color,
                  borderColor: `${config.color} !important`,
                },
              }}
            >
              {config.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <TextField
          label="Notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="e.g. Called on Monday, wants size M in maroon. Send photos."
          multiline
          minRows={4}
          fullWidth
          sx={{ mt: 2.5 }}
          inputProps={{ maxLength: 5000 }}
          helperText={`${notes.length}/5000`}
        />

        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
          {dirty && (
            <Button
              color="inherit"
              onClick={() => {
                setStatus(lead.followUpStatus || "new");
                setNotes(lead.followUpNotes || "");
              }}
              disabled={isLoading}
            >
              Discard
            </Button>
          )}
          <Button
            variant="contained"
            onClick={save}
            disabled={!dirty || isLoading}
            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isLoading ? "Saving…" : "Save follow-up"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ContactRow({ icon: Icon, children }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 0.75 }}>
      <Icon fontSize="small" sx={{ color: "text.secondary" }} />
      <Typography variant="body2" component="div" sx={{ wordBreak: "break-all" }}>
        {children}
      </Typography>
    </Stack>
  );
}

export default function LeadDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { data, isLoading, error, refetch } = useGetLeadQuery(id, { skip: !id, refetchOnMountOrArgChange: true });
  const lead = data?.lead;
  const enquiries = lead?.enquiries || [];
  const displayName = lead ? (lead.isGuest ? "Guest" : lead.name || "Unnamed customer") : "Lead";
  const waLink = !lead?.isGuest ? whatsappLink(lead?.phone) : null;
  const totalValue = enquiries.reduce((sum, enquiry) => sum + enquiryTotal(enquiry), 0);

  return (
    <>
      <PageHeader
        title={displayName}
        subtitle={lead ? `${formatNumber(lead.totalEnquiries || enquiries.length)} WhatsApp enquiries · last ${formatRelative(lead.lastEnquiryAt)}` : null}
        breadcrumbs={[{ label: "WhatsApp Leads", href: "/leads" }, { label: displayName }]}
        actions={
          waLink && (
            <Button variant="contained" color="whatsapp" href={waLink} target="_blank" rel="noreferrer" startIcon={<WhatsAppIcon />}>
              Message on WhatsApp
            </Button>
          )
        }
      />

      {error ? (
        <Card>
          <ErrorState error={error} onRetry={refetch} title="Couldn't load this lead" />
        </Card>
      ) : isLoading || !lead ? (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={4}>
            <Skeleton variant="rounded" height={240} sx={{ mb: 3 }} />
            <Skeleton variant="rounded" height={260} />
          </Grid>
          <Grid item xs={12} lg={8}>
            <Skeleton variant="rounded" height={220} sx={{ mb: 3 }} />
            <Skeleton variant="rounded" height={220} />
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={4}>
            <Stack spacing={3} sx={{ position: { lg: "sticky" }, top: { lg: 88 } }}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <LeadAvatar lead={lead} size={52} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h6" noWrap>
                        {displayName}
                      </Typography>
                      <StatusChip status={lead.followUpStatus} />
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  {lead.isGuest ? (
                    <Typography variant="body2" color="text.secondary">
                      This visitor wasn&apos;t logged in, so no contact details were captured. They may message you on WhatsApp
                      directly.
                    </Typography>
                  ) : (
                    <>
                      <ContactRow icon={MailOutlineIcon}>
                        {lead.email ? (
                          <MuiLink href={`mailto:${lead.email}`} underline="hover">
                            {lead.email}
                          </MuiLink>
                        ) : (
                          "No email"
                        )}
                      </ContactRow>
                      <ContactRow icon={PhoneOutlinedIcon}>
                        {lead.phone ? (
                          <MuiLink href={`tel:${lead.phone}`} underline="hover">
                            {lead.phone}
                          </MuiLink>
                        ) : (
                          "No phone number"
                        )}
                      </ContactRow>
                    </>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    {[
                      ["Enquiries", formatNumber(lead.totalEnquiries || enquiries.length)],
                      ["Enquiry value", formatCurrency(totalValue)],
                      ["First seen", formatDate(lead.createdAt)],
                      ["Last enquiry", formatDate(lead.lastEnquiryAt)],
                    ].map(([label, value]) => (
                      <Grid item xs={6} key={label}>
                        <Typography variant="caption" color="text.secondary">
                          {label}
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {value}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>

              <FollowUpCard lead={lead} />
            </Stack>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Enquiry history
            </Typography>
            {enquiries.length === 0 ? (
              <Card>
                <EmptyState icon={ShoppingBagOutlinedIcon} title="No enquiries recorded" />
              </Card>
            ) : (
              <Stack spacing={2.5}>
                {enquiries.map((enquiry, index) => (
                  <EnquiryCard key={enquiry._id || index} enquiry={enquiry} number={enquiries.length - index} />
                ))}
              </Stack>
            )}
          </Grid>
        </Grid>
      )}
    </>
  );
}
