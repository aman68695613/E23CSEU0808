import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import NotificationCard from "./NotificationCard";

function NotificationList({ notifications, isLoading, viewedIds, showPriority }) {
  if (isLoading) {
    return (
      <Box>
        {[1, 2, 3, 4].map(function (i) {
          return (
            <Box key={i} sx={{ mb: 2 }}>
              <Skeleton variant="rounded" height={90}
                sx={{ backgroundColor: "rgba(124, 77, 255, 0.06)", borderRadius: 3 }} />
            </Box>
          );
        })}
      </Box>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
        <Typography variant="h6" color="text.secondary">No notifications to show</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Try changing the filter or check back later
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {notifications.map(function (notif, idx) {
        var nid = notif.id || notif.ID;
        var isNew = viewedIds ? !viewedIds.has(nid) : false;

        return (
          <NotificationCard
            key={nid || idx}
            notification={notif}
            isNew={isNew}
            showPriority={showPriority || false}
            index={idx}
          />
        );
      })}
    </Box>
  );
}

export default NotificationList;
