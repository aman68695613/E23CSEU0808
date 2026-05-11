import Chip from "@mui/material/Chip";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import RemoveIcon from "@mui/icons-material/Remove";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const styles = {
  high: {
    bg: "rgba(229, 57, 53, 0.15)", border: "#e53935", text: "#ff6f60",
    icon: <ArrowUpwardIcon sx={{ fontSize: 14 }} />, label: "HIGH",
  },
  medium: {
    bg: "rgba(251, 140, 0, 0.15)", border: "#fb8c00", text: "#ffbd45",
    icon: <RemoveIcon sx={{ fontSize: 14 }} />, label: "MEDIUM",
  },
  low: {
    bg: "rgba(67, 160, 71, 0.15)", border: "#43a047", text: "#76d275",
    icon: <ArrowDownwardIcon sx={{ fontSize: 14 }} />, label: "LOW",
  },
};

function PriorityBadge({ level }) {
  const s = styles[level] || styles.low;
  return (
    <Chip icon={s.icon} label={s.label} size="small" sx={{
      backgroundColor: s.bg, color: s.text,
      border: "1px solid " + s.border,
      fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.08em", height: 24,
      "& .MuiChip-icon": { color: s.text },
    }} />
  );
}

export default PriorityBadge;
