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
  Tooltip,
  Typography,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CheckroomOutlinedIcon from "@mui/icons-material/CheckroomOutlined";
import PageHeader from "@/components/common/PageHeader";
import SearchField from "@/components/common/SearchField";
import StatusChip, { LEAD_STATUS } from "@/components/common/StatusChip";
import { EmptyState, ErrorState } from "@/components/common/States";
import { MobileList, MobileRow, desktopOnly } from "@/components/common/MobileList";
import LeadAvatar from "@/components/leads/LeadAvatar";
import { useGetLeadsQuery } from "@/utils/api/LeadsApi";
import { formatDate, formatNumber, formatRelative } from "@/utils/format";

const FILTERS = [{ value: "", label: "All" }, ...Object.entries(LEAD_STATUS).map(([value, { label }]) => ({ value, label }))];

export default function Leads() {
  const router = useRouter();
  const status = typeof router.query.status === "string" && LEAD_STATUS[router.query.status] ? router.query.status : "";
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const { data, isLoading, isFetching, error, refetch } = useGetLeadsQuery(
    { page: page + 1, limit: rowsPerPage, status, q },
    { pollingInterval: 60000, skip: !router.isReady }
  );

  const leads = data?.leads || [];
  const counts = data?.statusCounts || {};
  const allCount = Object.values(counts).reduce((sum, count) => sum + count, 0);

  const setStatus = (value) => {
    setPage(0);
    const query = { ...router.query };
    if (value) query.status = value;
    else delete query.status;
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  return (
    <>
      <PageHeader
        title="WhatsApp Leads"
        subtitle="Customers who tapped “Order on WhatsApp” on the storefront. Follow up and track the outcome."
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
            {FILTERS.map((option) => {
              const count = option.value ? counts[option.value] || 0 : allCount;
              return (
                <Chip
                  key={option.label}
                  label={`${option.label} · ${formatNumber(count)}`}
                  color={status === option.value ? "primary" : "default"}
                  variant={status === option.value ? "filled" : "outlined"}
                  onClick={() => setStatus(option.value)}
                />
              );
            })}
          </Stack>
          <SearchField
            value={q}
            onChange={(value) => {
              setQ(value);
              setPage(0);
            }}
            placeholder="Name, email, phone or product"
          />
        </Stack>

        {error ? (
          <ErrorState error={error} onRetry={refetch} title="Couldn't load WhatsApp leads" />
        ) : (
          <>
            <MobileList loading={isLoading || !router.isReady}>
              {leads.map((lead) => {
                const items = lead.lastEnquiry?.items || [];
                return (
                  <MobileRow key={lead._id} onClick={() => router.push(`/leads/${lead._id}`)}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <LeadAvatar lead={lead} />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {lead.isGuest ? "Guest" : lead.name || "Unnamed customer"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                          {lead.isGuest ? "Not logged in" : [lead.phone, lead.email].filter(Boolean).join(" · ") || "No contact details"}
                        </Typography>
                      </Box>
                      <StatusChip status={lead.followUpStatus} />
                    </Stack>
                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mt: 1.5 }}>
                      <AvatarGroup max={3} sx={{ "& .MuiAvatar-root": { width: 30, height: 30, border: "2px solid #fff" } }}>
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
                            {" "}+{items.length - 1}
                          </Typography>
                        )}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                      {formatNumber(lead.totalEnquiries || 0)} enquir{lead.totalEnquiries === 1 ? "y" : "ies"} · last {formatRelative(lead.lastEnquiryAt)}
                    </Typography>
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
                    <TableCell>Customer</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Last enquiry</TableCell>
                    <TableCell align="center">Enquiries</TableCell>
                    <TableCell>Last enquiry on</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading || !router.isReady
                    ? Array.from({ length: 6 }).map((_, index) => (
                        <TableRow key={index}>
                          {Array.from({ length: 6 }).map((__, cell) => (
                            <TableCell key={cell}>
                              <Skeleton />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : leads.map((lead) => {
                        const items = lead.lastEnquiry?.items || [];
                        return (
                          <TableRow key={lead._id} hover onClick={() => router.push(`/leads/${lead._id}`)} sx={{ cursor: "pointer" }}>
                            <TableCell>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <LeadAvatar lead={lead} />
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 220 }}>
                                    {lead.isGuest ? "Guest" : lead.name || "Unnamed customer"}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", maxWidth: 220 }}>
                                    {lead.isGuest ? "Not logged in" : lead.email || "No email"}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{lead.isGuest ? "—" : lead.phone || "—"}</Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1.25} alignItems="center">
                                <AvatarGroup max={3} sx={{ "& .MuiAvatar-root": { width: 32, height: 32, border: "2px solid #fff" } }}>
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
                                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                  {items[0]?.productName || "—"}
                                  {items.length > 1 && (
                                    <Typography component="span" variant="caption" color="text.secondary">
                                      {" "}
                                      +{items.length - 1}
                                    </Typography>
                                  )}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell align="center">
                              <Chip size="small" label={lead.totalEnquiries || 0} variant="outlined" />
                            </TableCell>
                            <TableCell>
                              <Tooltip title={formatDate(lead.lastEnquiryAt, { withTime: true })}>
                                <Typography variant="body2" component="span">
                                  {formatRelative(lead.lastEnquiryAt)}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <StatusChip status={lead.followUpStatus} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                </TableBody>
              </Table>
            </TableContainer>

            {!isLoading && router.isReady && leads.length === 0 && (
              <EmptyState
                icon={WhatsAppIcon}
                title={status || q ? "No matching leads" : "No WhatsApp leads yet"}
                description={
                  status || q
                    ? "Try another status or search."
                    : "When customers tap “Order on WhatsApp” on the storefront, they'll show up here."
                }
              />
            )}

            <TablePagination
              component="div"
              count={data?.total || 0}
              page={page}
              onPageChange={(event, value) => setPage(value)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 20, 50]}
              sx={{ borderTop: "1px solid", borderColor: "divider" }}
            />
          </>
        )}
      </Card>
    </>
  );
}
