import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#7c4dff", light: "#b47cff", dark: "#3f1dcb" },
    secondary: { main: "#00e5ff" },
    background: { default: "#0a0a1a", paper: "#141428" },
    text: { primary: "#e8e8f0", secondary: "#9090a8" },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(20, 20, 40, 0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(124, 77, 255, 0.15)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(20, 20, 40, 0.7)",
          border: "1px solid rgba(124, 77, 255, 0.12)",
          backdropFilter: "blur(8px)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
  },
});

export default theme;
