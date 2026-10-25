import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import CheckroomOutlinedIcon from "@mui/icons-material/CheckroomOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

function safeNext(next) {
  // Only same-site paths; never back to the login page itself
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return "/dashboard";
  }
  if (next === "/" || next.startsWith("/?") || next.startsWith("/login")) return "/dashboard";
  return next;
}

const HIGHLIGHTS = [
  { icon: CheckroomOutlinedIcon, text: "Upload and manage your collection" },
  { icon: WhatsAppIcon, text: "Follow up on WhatsApp order requests" },
  { icon: ReceiptLongOutlinedIcon, text: "Track orders and customer enquiries" },
];

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError("Enter your username and password");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.message || "Login failed");
        setSubmitting(false);
        return;
      }
      // Full navigation so every request starts with the new session cookie
      window.location.assign(safeNext(router.query.next));
    } catch {
      setError("Network error - check your connection and try again");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Log in · JVR Admin</title>
      </Head>
      <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "background.default" }}>
        {/* Brand panel (hidden on small screens) */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "space-between",
            width: "44%",
            maxWidth: 560,
            p: 6,
            color: "#fff",
            background:
              "radial-gradient(circle at 20% 15%, rgba(255,255,255,0.14), transparent 45%), linear-gradient(150deg, #312E81 0%, #4F46E5 55%, #7C3AED 100%)",
          }}
        >
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: 3,
              px: 2,
              py: 1.25,
              alignSelf: "flex-start",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            }}
          >
            <Box component="img" src="/images/logo.png" alt="JVR" sx={{ height: 44, display: "block" }} />
          </Box>

          <Box>
            <Typography variant="h4" sx={{ fontSize: "2rem", lineHeight: 1.25, mb: 2 }}>
              Welcome back to SRI JVR TEXTILES admin
            </Typography>
            <Stack spacing={1.5}>
              {HIGHLIGHTS.map(({ icon: Icon, text }) => (
                <Stack key={text} direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "rgba(255,255,255,0.14)",
                    }}
                  >
                    <Icon fontSize="small" />
                  </Box>
                  <Typography sx={{ opacity: 0.92 }}>{text}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            © {new Date().getFullYear()} SRI JVR TEXTILES
          </Typography>
        </Box>

        {/* Form */}
        <Box sx={{ flexGrow: 1, display: "grid", placeItems: "center", p: { xs: 2.5, sm: 4 } }}>
          <Box className="page-enter" sx={{ width: "100%", maxWidth: 400 }}>
            <Box
              component="img"
              src="/images/logo.png"
              alt="JVR"
              sx={{ height: 52, display: { xs: "block", md: "none" }, mb: 3 }}
            />
            <Typography variant="h4" component="h1">
              Sign in
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75, mb: 3.5 }}>
              Use the admin username and password provided to you.
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2.25}>
                {error && (
                  <Alert severity="error" variant="outlined" sx={{ bgcolor: "#fff" }}>
                    {error}
                  </Alert>
                )}
                <TextField
                  label="Username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  autoFocus
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((show) => !show)}
                          edge="end"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <VisibilityOffOutlinedIcon fontSize="small" />
                          ) : (
                            <VisibilityOutlinedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
                  sx={{ py: 1.4 }}
                >
                  {submitting ? "Signing in…" : "Sign in"}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

Login.bareLayout = true;
