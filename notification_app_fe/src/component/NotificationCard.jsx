import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import { PRIORITY_MAP } from "../config/constants";
import PriorityBadge from "./PriorityBadge";

function formatTime(raw) {
  if (!raw) return "-";
  var d = new Date(raw);
  if (isNaN(d.getTime())) return raw;

  var now = new Date();
  var diff = now - d;
  var mins = Math.floor(diff / 60000);
  var hrs = Math.floor(diff / 3600000);
  var days = Math.floor(diff / 86400000);

  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  if (hrs < 24) return hrs + "h ago";
  if (days < 7) return days + "d ago";

  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function NotificationCard({ notification, isNew, showPriority, index }) {
  var nType = notification.type || notification.Type || "Event";
  var nMsg = notification.message || notification.Message || "";
  var nTime = notification.timestamp || notification.Timestamp || "";
  var pLevel = notification._priorityLabel;
  var color = PRIORITY_MAP[nType] ? PRIORITY_MAP[nType].color : "#888";

  return (
    <Card sx={{
      mb: 2, position: "relative", overflow: "visible",
      animation: "fadeIn 0.4s ease " + ((index || 0) * 0.06) + "s both",
      "@keyframes fadeIn": {
        from: { opacity: 0, transform: "translateY(12px)" },
        to: { opacity: 1, transform: "translateY(0)" },
      },
      ...(isNew && {
        borderColor: "primary.main",
        boxShadow: "0 0 16px rgba(124, 77, 255, 0.2)",
      }),
    }}>
      <Box sx={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
        borderRadius: "14px 0 0 14px", backgroundColor: color,
      }} />
      <CardContent sx={{ pl: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip label={nType} size="small" sx={{ backgroundColor: color, color: "#fff", fontWeight: 600 }} />
            {showPriority && pLevel && <PriorityBadge level={pLevel} />}
            {isNew && (
              <FiberNewIcon sx={{
                color: "secondary.main", fontSize: 20,
                animation: "pulse 2s infinite",
                "@keyframes pulse": { "0%, 100%": { opacity: 1 }, "50%": { opacity: 0.4 } },
              }} />
            )}
          </Box>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>{formatTime(nTime)}</Typography>
        </Box>
        <Typography variant="body1" sx={{ color: "text.primary", lineHeight: 1.6, fontSize: "0.95rem" }}>
          {nMsg}
        </Typography>
        {showPriority && notification._priorityWeight && (
          <Typography variant="caption" sx={{ color: "text.secondary", mt: 1, display: "block", fontSize: "0.72rem" }}>
            Priority Score: {notification._priorityWeight}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default NotificationCard;
