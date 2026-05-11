import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import Alert from "@mui/material/Alert";
import useNotifications from "../hook/useNotifications";
import NotificationList from "../component/NotificationList";
import FilterBar from "../component/FilterBar";

function AllNotificationsPage() {
  var {
    notifications, totalCount, currentPage, isLoading,
    error, activeFilter, viewedIds, changePage, changeFilter, refresh,
  } = useNotifications();

  var pages = Math.max(1, Math.ceil(totalCount / 10));

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{
          mb: 0.5,
          background: "linear-gradient(135deg, #e8e8f0, #7c4dff)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          All Notifications
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Browse and filter notifications across all types
        </Typography>
      </Box>

      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={changeFilter}
        totalCount={totalCount}
        onRefresh={refresh}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3, backgroundColor: "rgba(229, 57, 53, 0.1)", borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <NotificationList
        notifications={notifications}
        isLoading={isLoading}
        viewedIds={viewedIds}
        showPriority={false}
      />

      {!isLoading && notifications.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={pages} page={currentPage}
            onChange={function (e, pg) { changePage(pg); }}
            color="primary" size="large"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "text.secondary",
                "&.Mui-selected": {
                  background: "linear-gradient(135deg, #7c4dff, #651fff)",
                  color: "#fff",
                },
              },
            }}
          />
        </Box>
      )}
    </Container>
  );
}

export default AllNotificationsPage;
