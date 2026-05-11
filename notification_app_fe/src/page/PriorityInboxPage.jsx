import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import RefreshIcon from "@mui/icons-material/Refresh";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import usePriority from "../hook/usePriority";
import NotificationList from "../component/NotificationList";

function PriorityInboxPage() {
  var { items, totalCount, loading, error, reload } = usePriority();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <EmojiEventsIcon sx={{
            fontSize: 36, color: "secondary.main",
            animation: "float 3s ease-in-out infinite",
            "@keyframes float": {
              "0%, 100%": { transform: "translateY(0)" },
              "50%": { transform: "translateY(-6px)" },
            },
          }} />
          <Typography variant="h4" sx={{
            background: "linear-gradient(135deg, #00e5ff, #7c4dff)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Priority Inbox
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Top 10 most important notifications, ranked by type and recency
        </Typography>
      </Box>

      <Box sx={{
        display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 3, p: 2,
        borderRadius: 2, backgroundColor: "rgba(26, 26, 46, 0.6)",
        border: "1px solid rgba(124, 77, 255, 0.1)",
      }}>
        <Typography variant="body2" sx={{ color: "text.secondary", mr: 1 }}>Priority ranking:</Typography>
        <Chip label="Placement (Highest)" size="small" sx={{ backgroundColor: "rgba(229, 57, 53, 0.2)", color: "#ff6f60" }} />
        <Typography variant="body2" sx={{ color: "text.secondary" }}>then</Typography>
        <Chip label="Result (Medium)" size="small" sx={{ backgroundColor: "rgba(251, 140, 0, 0.2)", color: "#ffbd45" }} />
        <Typography variant="body2" sx={{ color: "text.secondary" }}>then</Typography>
        <Chip label="Event (Standard)" size="small" sx={{ backgroundColor: "rgba(67, 160, 71, 0.2)", color: "#76d275" }} />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          {totalCount > 0 && (
            <Typography variant="body2" color="text.secondary">
              Showing top {items.length} out of {totalCount} notifications evaluated
            </Typography>
          )}
        </Box>
        <Button startIcon={<RefreshIcon />} onClick={reload} variant="outlined" size="small" color="primary">
          Refresh
        </Button>
      </Box>

      <Divider sx={{ mb: 3, borderColor: "rgba(124, 77, 255, 0.15)" }} />

      {error && (
        <Alert severity="error" sx={{ mb: 3, backgroundColor: "rgba(229, 57, 53, 0.1)", borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <NotificationList
        notifications={items}
        isLoading={loading}
        viewedIds={new Set()}
        showPriority={true}
      />

      {!loading && items.length > 0 && (
        <Box sx={{
          mt: 4, p: 2, borderRadius: 2,
          backgroundColor: "rgba(124, 77, 255, 0.05)",
          border: "1px dashed rgba(124, 77, 255, 0.2)",
          textAlign: "center",
        }}>
          <Typography variant="body2" color="text.secondary">
            Priority is calculated as: Placement (weight 30), Result (weight 20), Event (weight 10). Within the same tier, newer notifications rank higher.
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default PriorityInboxPage;
