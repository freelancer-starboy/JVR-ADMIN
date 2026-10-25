import React from "react";
import Head from "next/head";
import Link from "next/link";
import { Box, Breadcrumbs, Stack, Typography } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

// Page title + breadcrumbs + action buttons. Also sets the browser tab title.
export default function PageHeader({ title, subtitle, breadcrumbs = [], actions, documentTitle }) {
  const tabTitle = documentTitle || (typeof title === "string" ? title : null);

  return (
    <>
      {tabTitle && (
        <Head>
          <title>{`${tabTitle} · JVR Admin`}</title>
        </Head>
      )}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "flex-end" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box sx={{ minWidth: 0 }}>
          {breadcrumbs.length > 0 && (
            <Breadcrumbs
              separator={<NavigateNextIcon sx={{ fontSize: 16 }} />}
              sx={{ mb: 0.75, "& .MuiBreadcrumbs-li": { fontSize: 13 } }}
            >
              {breadcrumbs.map((crumb) =>
                crumb.href ? (
                  <Typography
                    key={crumb.label}
                    component={Link}
                    href={crumb.href}
                    variant="body2"
                    color="text.secondary"
                    sx={{ "&:hover": { color: "primary.main" } }}
                  >
                    {crumb.label}
                  </Typography>
                ) : (
                  <Typography key={crumb.label} variant="body2" color="text.primary">
                    {crumb.label}
                  </Typography>
                )
              )}
            </Breadcrumbs>
          )}
          <Typography variant="h4" component="h1" sx={{ wordBreak: "break-word" }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ flexShrink: 0 }}>
            {actions}
          </Stack>
        )}
      </Stack>
    </>
  );
}
