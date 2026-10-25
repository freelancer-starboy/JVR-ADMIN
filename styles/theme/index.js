import { alpha, createTheme } from "@mui/material/styles";

const ink = "#1C2033";
const muted = "#6B7086";
const border = "#E7E9F2";
const primary = "#4F46E5";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: primary, light: "#7C75F0", dark: "#3B33C4", contrastText: "#fff" },
    secondary: { main: "#0F766E", contrastText: "#fff" },
    success: { main: "#16A34A" },
    info: { main: "#0284C7" },
    warning: { main: "#D97706" },
    error: { main: "#DC2626" },
    whatsapp: { main: "#25D366", dark: "#128C7E", contrastText: "#fff" },
    text: { primary: ink, secondary: muted },
    divider: border,
    background: { default: "#F5F6FA", paper: "#FFFFFF" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    h4: { fontWeight: 700, fontSize: "1.6rem", letterSpacing: "-0.02em" },
    h5: { fontWeight: 700, fontSize: "1.3rem", letterSpacing: "-0.01em" },
    h6: { fontWeight: 600, fontSize: "1.05rem" },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
    overline: { fontWeight: 600, letterSpacing: "0.08em" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: "#F5F6FA" },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 9, paddingInline: 16 },
        sizeLarge: { paddingBlock: 10 },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: `1px solid ${border}`,
          borderRadius: 14,
          boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: { rounded: { borderRadius: 12 } },
    },
    MuiCardHeader: {
      defaultProps: { titleTypographyProps: { variant: "h6" } },
      styleOverrides: { root: { padding: "18px 20px 8px" } },
    },
    MuiCardContent: {
      styleOverrides: { root: { padding: 20, "&:last-child": { paddingBottom: 20 } } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 }, sizeSmall: { fontSize: 12 } },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: border, paddingTop: 12, paddingBottom: 12 },
        head: {
          fontSize: 12,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: muted,
          backgroundColor: "#FAFAFD",
          whiteSpace: "nowrap",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background-color 120ms ease",
          "&.MuiTableRow-hover:hover": { backgroundColor: alpha(primary, 0.035) },
          "&:last-child td": { borderBottom: 0 },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: "#fff", borderRadius: 9 },
      },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 16 } },
    },
    MuiListItemButton: {
      styleOverrides: { root: { borderRadius: 9 } },
    },
    MuiSkeleton: {
      defaultProps: { animation: "wave" },
    },
  },
});

export default theme;
