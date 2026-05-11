import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import theme from "./style/theme";
import { NotifProvider } from "./state/notificationContext";
import Navbar from "./component/Navbar";
import AllNotificationsPage from "./page/AllNotificationsPage";
import PriorityInboxPage from "./page/PriorityInboxPage";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NotifProvider>
          <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
            <Navbar />
            <Routes>
              <Route path="/" element={<AllNotificationsPage />} />
              <Route path="/priority" element={<PriorityInboxPage />} />
            </Routes>
          </Box>
        </NotifProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
