import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Box, LinearProgress, Typography } from "@mui/material";
import Sidebar, { SIDEBAR_WIDTH } from "./Sidebar";
import TopNavbar from "./TopNavbar";

const Layout = ({ children }) => {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    const start = () => {
      setMobileOpen(false);
      setNavigating(true);
    };
    const done = () => setNavigating(false);
    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", done);
    router.events.on("routeChangeError", done);
    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", done);
      router.events.off("routeChangeError", done);
    };
  }, [router.events]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {navigating && (
        <LinearProgress sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 2000, height: 3 }} />
      )}

      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          ml: { lg: `${SIDEBAR_WIDTH}px` },
        }}
      >
        <TopNavbar onMenuClick={() => setMobileOpen(true)} />

        <Box
          component="main"
          key={router.pathname}
          className="page-enter"
          sx={{
            flexGrow: 1,
            width: "100%",
            maxWidth: 1440,
            mx: "auto",
            px: { xs: 2, sm: 3, lg: 4 },
            py: { xs: 2, sm: 3 },
          }}
        >
          {children}
        </Box>

        <Typography
          component="footer"
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: "center", py: 2.5 }}
        >
          © {new Date().getFullYear()} SRI JVR TEXTILES · Admin
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;
