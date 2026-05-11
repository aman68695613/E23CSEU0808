import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import StarIcon from "@mui/icons-material/Star";
import useMediaQuery from "@mui/material/useMediaQuery";

const links = [
  { label: "All Notifications", path: "/", icon: <NotificationsActiveIcon /> },
  { label: "Priority Inbox", path: "/priority", icon: <StarIcon /> },
];

function Navbar() {
  const nav = useNavigate();
  const loc = useLocation();
  const mobile = useMediaQuery("(max-width:768px)");
  const [open, setOpen] = useState(false);

  function isActive(path) {
    return loc.pathname === path;
  }

  if (mobile) {
    return (
      <>
        <AppBar position="sticky" elevation={0}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={function () { setOpen(true); }} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontSize: "1.1rem" }}>
              NotifHub
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer anchor="left" open={open} onClose={function () { setOpen(false); }}
          PaperProps={{ sx: { backgroundColor: "background.paper", width: 260 } }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "primary.main" }}>Menu</Typography>
          </Box>
          <List>
            {links.map(function (link) {
              return (
                <ListItem key={link.path} disablePadding>
                  <ListItemButton
                    onClick={function () { nav(link.path); setOpen(false); }}
                    selected={isActive(link.path)}
                    sx={{
                      "&.Mui-selected": {
                        backgroundColor: "rgba(124, 77, 255, 0.15)",
                        borderRight: "3px solid",
                        borderColor: "primary.main",
                      },
                    }}>
                    <Box sx={{ mr: 1.5, display: "flex", color: "primary.light" }}>{link.icon}</Box>
                    <ListItemText primary={link.label} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Drawer>
      </>
    );
  }

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar>
        <Typography variant="h6" sx={{
          flexGrow: 1, cursor: "pointer", fontWeight: 700,
          background: "linear-gradient(135deg, #7c4dff, #00e5ff)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }} onClick={function () { nav("/"); }}>
          NotifHub
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {links.map(function (link) {
            return (
              <Button key={link.path} startIcon={link.icon}
                onClick={function () { nav(link.path); }}
                variant={isActive(link.path) ? "contained" : "text"}
                color="primary"
                sx={{
                  px: 2,
                  ...(isActive(link.path) && {
                    background: "linear-gradient(135deg, #7c4dff, #651fff)",
                  }),
                }}>
                {link.label}
              </Button>
            );
          })}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
