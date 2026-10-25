import React from "react";
import { Box, Stack, Tooltip, Typography } from "@mui/material";

// Small circle showing a colour value (hex or CSS colour name) with an optional label.
export default function ColorSwatch({ color, size = 16, showLabel = false, selected = false }) {
  if (!color) return showLabel ? <Typography variant="body2">—</Typography> : null;

  const swatch = (
    <Box
      component="span"
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        display: "inline-block",
        bgcolor: color,
        border: "1px solid rgba(0,0,0,0.15)",
        boxShadow: selected ? (theme) => `0 0 0 2px #fff, 0 0 0 4px ${theme.palette.primary.main}` : "none",
        verticalAlign: "middle",
      }}
    />
  );

  if (!showLabel) {
    return (
      <Tooltip title={color}>
        {swatch}
      </Tooltip>
    );
  }

  return (
    <Stack direction="row" spacing={0.75} alignItems="center" component="span">
      {swatch}
      <Typography variant="body2" component="span" sx={{ textTransform: color.startsWith("#") ? "uppercase" : "capitalize" }}>
        {color}
      </Typography>
    </Stack>
  );
}
