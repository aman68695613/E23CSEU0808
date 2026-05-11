import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import RefreshIcon from "@mui/icons-material/Refresh";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { NOTIF_TYPES, PRIORITY_MAP } from "../config/constants";

function FilterBar({ activeFilter, onFilterChange, totalCount, onRefresh }) {
  return (
    <Box sx={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexWrap: "wrap", gap: 2, mb: 3, p: 2, borderRadius: 2,
      backgroundColor: "rgba(26, 26, 46, 0.6)",
      border: "1px solid rgba(124, 77, 255, 0.1)",
    }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Notification Type</InputLabel>
          <Select value={activeFilter} label="Notification Type"
            onChange={function (e) { onFilterChange(e.target.value); }}
            sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(124, 77, 255, 0.3)" } }}>
            <MenuItem value=""><em>All Types</em></MenuItem>
            {NOTIF_TYPES.map(function (t) {
              return (
                <MenuItem key={t} value={t}>
                  <Chip label={t} size="small"
                    sx={{ backgroundColor: PRIORITY_MAP[t].color, color: "#fff", mr: 1, height: 20, fontSize: "0.7rem" }} />
                  {t}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        {activeFilter && (
          <Chip label={"Showing: " + activeFilter} onDelete={function () { onFilterChange(""); }}
            color="primary" variant="outlined" size="small" />
        )}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {totalCount > 0 ? totalCount + " notifications" : ""}
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={onRefresh} size="small" color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default FilterBar;
