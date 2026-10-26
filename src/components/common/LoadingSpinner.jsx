import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import { boiBlue } from "../../theme/theme";

export const LoadingSpinner = ({
  open = true,
  message = "Loading, please wait...",
  subMessage = "Please wait while we process your request",
  inline = false,
  size = 48,
}) => {
  if (inline) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          gap: 1.5,
          width: "100%",
        }}
      >
        <CircularProgress size={size} sx={{ color: boiBlue }} thickness={4} />
        {message && (
          <Typography
            sx={{
              color: boiBlue,
              fontWeight: 600,
              fontSize: 14,
              textAlign: "center",
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 3000,
        backgroundColor: "rgba(10, 24, 40, 0.6)",
        backdropFilter: "blur(4px)",
      }}
    >
      <Box
        sx={{
          bgcolor: "#ffffff",
          p: 4,
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          boxShadow: "0 12px 48px rgba(0, 0, 0, 0.2)",
          border: "1px solid rgba(0, 114, 206, 0.15)",
          maxWidth: 380,
          width: "90%",
          textAlign: "center",
          animation: "fadeIn 0.2s ease-in-out",
        }}
      >
        <Box sx={{ position: "relative", display: "inline-flex" }}>
          <CircularProgress
            variant="determinate"
            value={100}
            size={size}
            thickness={4}
            sx={{ color: "rgba(0, 114, 206, 0.12)" }}
          />
          <CircularProgress
            variant="indeterminate"
            disableShrink
            size={size}
            thickness={4}
            sx={{
              color: boiBlue,
              animationDuration: "1s",
              position: "absolute",
              left: 0,
            }}
          />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography
            variant="h6"
            sx={{
              color: boiBlue,
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: 0.2,
            }}
          >
            {message}
          </Typography>
          {subMessage && (
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
              {subMessage}
            </Typography>
          )}
        </Box>
      </Box>
    </Backdrop>
  );
};

export default LoadingSpinner;
