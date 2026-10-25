import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Avatar, Box, Card, Chip, Skeleton, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ReplyIcon from "@mui/icons-material/Reply";
import PageHeader from "@/components/common/PageHeader";
import SearchField from "@/components/common/SearchField";
import { EmptyState, ErrorState } from "@/components/common/States";
import { useGetContactsQuery } from "@/utils/api/ContactsApi";
import { formatNumber, formatRelative, initials } from "@/utils/format";

export default function Enquiries() {
  const router = useRouter();
  const filter = router.query.filter === "unread" ? "unread" : "all";
  const [q, setQ] = useState("");
  const { data, isLoading, isFetching, error, refetch } = useGetContactsQuery(
    { filter, q },
    { skip: !router.isReady, pollingInterval: 120000 }
  );
  const contacts = data?.contactDetails || [];

  const setFilter = (value) => {
    const query = { ...router.query };
    if (value === "unread") query.filter = "unread";
    else delete query.filter;
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  };

  return (
    <>
      <PageHeader title="Enquiries" subtitle="Messages sent through the storefront contact form." />

      <Card>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          alignItems={{ md: "center" }}
          justifyContent="space-between"
          sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Stack direction="row" spacing={0.75}>
            <Chip
              label={`All · ${formatNumber(data?.total || 0)}`}
              color={filter === "all" ? "primary" : "default"}
              variant={filter === "all" ? "filled" : "outlined"}
              onClick={() => setFilter("all")}
            />
            <Chip
              label={`Unread · ${formatNumber(data?.unreadLength || 0)}`}
              color={filter === "unread" ? "primary" : "default"}
              variant={filter === "unread" ? "filled" : "outlined"}
              onClick={() => setFilter("unread")}
            />
          </Stack>
          <SearchField value={q} onChange={setQ} placeholder="Search name, email, subject or message" />
        </Stack>

        {error ? (
          <ErrorState error={error} onRetry={refetch} title="Couldn't load enquiries" />
        ) : isLoading || !router.isReady ? (
          <Box sx={{ p: 2 }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} height={64} />
            ))}
          </Box>
        ) : contacts.length === 0 ? (
          <EmptyState
            icon={MailOutlineIcon}
            title={q || filter === "unread" ? "Nothing here" : "No enquiries yet"}
            description={
              q ? "No messages match your search." : filter === "unread" ? "You're all caught up." : "Contact-form messages will appear here."
            }
          />
        ) : (
          <Box sx={{ opacity: isFetching ? 0.6 : 1, transition: "opacity 150ms ease" }}>
            {contacts.map((contact) => {
              const unread = !contact.isOpened;
              return (
                <Box
                  key={contact._id}
                  component={Link}
                  href={`/enquiries/${contact._id}`}
                  sx={(theme) => ({
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    px: 2,
                    py: 1.75,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: unread ? alpha(theme.palette.primary.main, 0.03) : "transparent",
                    transition: "background-color 120ms ease",
                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                    "&:last-of-type": { borderBottom: 0 },
                  })}
                >
                  <Box sx={{ width: 8, flexShrink: 0 }}>
                    {unread && <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main" }} />}
                  </Box>
                  <Avatar sx={{ width: 38, height: 38, fontSize: 14, bgcolor: unread ? "primary.main" : "#C5C8D6" }}>
                    {initials(contact.name)}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="baseline">
                      <Typography variant="body2" fontWeight={unread ? 700 : 500} noWrap>
                        {contact.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: { xs: "none", sm: "block" } }}>
                        {contact.email}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" noWrap color={unread ? "text.primary" : "text.secondary"}>
                      <Box component="span" sx={{ fontWeight: unread ? 600 : 400 }}>
                        {contact.subject}
                      </Box>
                      <Box component="span" sx={{ color: "text.secondary" }}>
                        {" — "}
                        {contact.message}
                      </Box>
                    </Typography>
                  </Box>
                  <Stack alignItems="flex-end" spacing={0.5} sx={{ flexShrink: 0 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={unread ? 600 : 400}>
                      {formatRelative(contact.createdAt)}
                    </Typography>
                    {contact.replies?.length > 0 && (
                      <Chip size="small" icon={<ReplyIcon />} label={contact.replies.length} variant="outlined" sx={{ height: 20 }} />
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Box>
        )}
      </Card>
    </>
  );
}
