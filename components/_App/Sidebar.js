import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Badge,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { NAV_SECTIONS } from "./navItems";
import { useGetNavCountsQuery } from "@/utils/api/DashboardApi";

export const SIDEBAR_WIDTH = 260;

function SidebarContent() {
  const router = useRouter();
  const { data: counts } = useGetNavCountsQuery(undefined, { pollingInterval: 60000 });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        component={Link}
        href="/dashboard"
        sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0.5, px: 3, pt: 3, pb: 2 }}
      >
        <Box component="img" src="/images/logo.png" alt="JVR" sx={{ height: 46, width: "auto" }} />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 10.5 }}
        >
          Sri JVR Textiles · Admin
        </Typography>
      </Box>

      <Box component="nav" sx={{ flexGrow: 1, overflowY: "auto", px: 1.5, pb: 2 }}>
        {NAV_SECTIONS.map((section, sectionIndex) => (
          <List
            key={section.title || `section-${sectionIndex}`}
            dense
            subheader={
              section.title ? (
                <ListSubheader
                  disableSticky
                  sx={{
                    bgcolor: "transparent",
                    lineHeight: "32px",
                    mt: 1,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "text.disabled",
                  }}
                >
                  {section.title}
                </ListSubheader>
              ) : null
            }
          >
            {section.items.map((item) => {
              const active = item.match(router.pathname);
              const Icon = item.icon;
              const badgeCount = item.badge ? counts?.[item.badge] || 0 : 0;
              return (
                <ListItemButton
                  key={item.href}
                  component={Link}
                  href={item.href}
                  selected={active}
                  sx={(theme) => ({
                    mb: 0.5,
                    py: 1,
                    color: "text.secondary",
                    "& .MuiListItemIcon-root": { color: "text.secondary", minWidth: 38 },
                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                    "&.Mui-selected": {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: "primary.main",
                      "& .MuiListItemIcon-root": { color: "primary.main" },
                      "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.14) },
                    },
                  })}
                >
                  <ListItemIcon>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 500 }}
                  />
                  {badgeCount > 0 && (
                    <Badge
                      badgeContent={badgeCount}
                      max={99}
                      color={item.badge === "newLeads" ? "success" : "primary"}
                      sx={{ mr: 1.5 }}
                    />
                  )}
                </ListItemButton>
              );
            })}
          </List>
        ))}
      </Box>
    </Box>
  );
}

const paperSx = {
  width: SIDEBAR_WIDTH,
  boxSizing: "border-box",
  borderRight: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
};

const Sidebar = ({ mobileOpen, onClose }) => (
  <>
    {/* Mobile / tablet: slide-in drawer */}
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ display: { xs: "block", lg: "none" }, "& .MuiDrawer-paper": paperSx }}
    >
      <SidebarContent />
    </Drawer>

    {/* Desktop: always visible */}
    <Drawer
      variant="permanent"
      open
      sx={{ display: { xs: "none", lg: "block" }, "& .MuiDrawer-paper": paperSx }}
    >
      <SidebarContent />
    </Drawer>
  </>
);

export default Sidebar;
