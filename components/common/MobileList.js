import React from "react";
import { Box, Divider, Skeleton, Stack } from "@mui/material";

// Phone layout for list pages: tables are hidden below the `md` breakpoint and these cards shown instead.
export const desktopOnly = { display: { xs: "none", md: "block" } };

export function MobileList({ loading, rows = 5, children }) {
  return (
    <Stack divider={<Divider />} sx={{ display: { xs: "flex", md: "none" }, borderTop: "1px solid", borderColor: "divider" }}>
      {loading
        ? Array.from({ length: rows }).map((_, index) => (
            <Box key={index} sx={{ p: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Skeleton variant="rounded" width={44} height={44} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="60%" />
                  <Skeleton width="40%" />
                </Box>
              </Stack>
            </Box>
          ))
        : children}
    </Stack>
  );
}

// One tappable card row.
export function MobileRow({ onClick, children, sx }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2,
        cursor: onClick ? "pointer" : "default",
        transition: "background-color 150ms ease",
        "&:active": onClick ? { bgcolor: "action.hover" } : undefined,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
