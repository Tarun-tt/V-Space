import Chip from "@mui/material/Chip";
import { boiBlue, boiOrange, boiSuccessGreen } from "../../theme/theme";

export function StatusBadge({ status }) {
  const getColor = () => {
    switch (status?.toLowerCase()) {
      case "approved":
        return boiSuccessGreen;
      case "pending":
        return boiOrange;
      case "draft":
        return "#6c757d";
      default:
        return boiBlue;
    }
  };

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        bgcolor: getColor(),
        color: "white",
        fontWeight: 600,
        fontSize: "11px",
        height: "24px",
      }}
    />
  );
}
