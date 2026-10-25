import React, { useState } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  ButtonBase,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { baseApi } from "@/utils/api/baseApi";
import { useGetMeQuery, useGetNavCountsQuery } from "@/utils/api/DashboardApi";
import { initials } from "@/utils/format";

function ProfileMenu() {
  const dispatch = useDispatch();
  const { data } = useGetMeQuery();
  const admin = data?.admin;
  const [anchorEl, setAnchorEl] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      dispatch(baseApi.util.resetApiState());
      window.location.assign("/");
    }
  };

  return (
    <>
      <ButtonBase
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-controls={anchorEl ? "account-menu" : undefined}
        aria-haspopup="true"
        sx={{ borderRadius: 99, pl: 0.5, pr: { xs: 0.5, sm: 1.25 }, py: 0.5, gap: 1 }}
      >
        <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: 14, fontWeight: 600 }}>
          {initials(admin?.name || admin?.username)}
        </Avatar>
        <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "left", lineHeight: 1.2 }}>
          <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 160 }}>
            {admin?.name || admin?.username || "Admin"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Administrator
          </Typography>
        </Box>
        <KeyboardArrowDownIcon fontSize="small" sx={{ display: { xs: "none", sm: "block" }, color: "text.secondary" }} />
      </ButtonBase>

      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{ sx: { mt: 1, minWidth: 220, boxShadow: "0 12px 32px rgba(16,24,40,0.12)" } }}
      >
        <Box sx={{ px: 2, py: 1.25 }}>
          <Typography variant="subtitle2">{admin?.name || "Admin"}</Typography>
          <Typography variant="caption" color="text.secondary">
            @{admin?.username || "…"}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleLogout} disabled={loggingOut} sx={{ color: "error.main", mt: 0.5 }}>
          <ListItemIcon sx={{ color: "inherit" }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          {loggingOut ? "Logging out…" : "Log out"}
        </MenuItem>
      </Menu>
    </>
  );
}

const TopNavbar = ({ onMenuClick }) => {
  const { data: counts } = useGetNavCountsQuery(undefined, { pollingInterval: 60000 });

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        top: 0,
        bgcolor: "rgba(255,255,255,0.85)",
        backdropFilter: "saturate(180%) blur(10px)",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ gap: 1, minHeight: { xs: 60, sm: 64 }, px: { xs: 2, sm: 3, lg: 4 } }}>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          aria-label="Open navigation"
          sx={{ display: { lg: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={0.5} alignItems="center">
          <Tooltip title="New WhatsApp leads">
            <IconButton component={Link} href="/leads?status=new" aria-label="New WhatsApp leads">
              <Badge badgeContent={counts?.newLeads || 0} color="success" max={99}>
                <WhatsAppIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Unread enquiries">
            <IconButton component={Link} href="/enquiries?filter=unread" aria-label="Unread enquiries">
              <Badge badgeContent={counts?.unreadEnquiries || 0} color="primary" max={99}>
                <MailOutlineIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1.5 }} />
          <ProfileMenu />
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavbar;
