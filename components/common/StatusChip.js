import React from "react";
import { Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";

export const LEAD_STATUS = {
  new: { label: "New", color: "#16A34A" },
  contacted: { label: "Contacted", color: "#0284C7" },
  converted: { label: "Converted", color: "#7C3AED" },
  not_interested: { label: "Not interested", color: "#6B7086" },
};

export const ORDER_STATUS = {
  Processing: { label: "Processing", color: "#D97706" },
  Packed: { label: "Packed", color: "#0284C7" },
  Dispatched: { label: "Dispatched", color: "#4F46E5" },
  Delivered: { label: "Delivered", color: "#16A34A" },
};

const FALLBACK = { color: "#6B7086" };

// Soft, tinted status pill.
export default function StatusChip({ status, type = "lead", size = "small", sx }) {
  const map = type === "order" ? ORDER_STATUS : LEAD_STATUS;
  // Leads without a status are new (storefront default)
  const resolved =
    map[status] || (type === "lead" && !status ? LEAD_STATUS.new : { ...FALLBACK, label: status || "Unknown" });

  return (
    <Chip
      size={size}
      label={resolved.label}
      sx={{
        bgcolor: alpha(resolved.color, 0.12),
        color: resolved.color,
        border: `1px solid ${alpha(resolved.color, 0.25)}`,
        ...sx,
      }}
    />
  );
}
