import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import { errorMessage } from "@/utils/api/baseApi";

export function EmptyState({ icon: Icon = InboxOutlinedIcon, title, description, action, compact = false }) {
  return (
    <Box sx={{ textAlign: "center", py: compact ? 4 : 8, px: 2 }}>
      <Box
        sx={(theme) => ({
          width: compact ? 48 : 64,
          height: compact ? 48 : 64,
          mx: "auto",
          mb: 2,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          color: "primary.main",
        })}
      >
        <Icon sx={{ fontSize: compact ? 24 : 30 }} />
      </Box>
      <Typography variant="subtitle1">{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 420, mx: "auto" }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2.5 }}>{action}</Box>}
    </Box>
  );
}

export function ErrorState({ error, onRetry, title = "Couldn't load this page" }) {
  return (
    <EmptyState
      icon={ErrorOutlineIcon}
      title={title}
      description={errorMessage(error, "Please try again in a moment.")}
      action={
        onRetry && (
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRetry}>
            Try again
          </Button>
        )
      }
    />
  );
}
