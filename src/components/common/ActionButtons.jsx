import React, { useState, useContext } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { LoadingContext } from "./LoadingContext";
import { boiBlue } from "../../theme/theme";

const ActionButton = ({
  type = "button",
  label,
  title,
  icon,
  onClick,
  menu = [],
  disabled = false,
  loading = false,
  loadingText,
  className = "",
  style = {},
  variant = "contained",
  color = "primary",
  size = "small",
  ...rest
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const open = Boolean(anchorEl);

  const isBusy = disabled || loading || isLocalLoading;

  const handleClick = async (e) => {
    if (isBusy) return;
    if (type === "dropdown") {
      setAnchorEl(e.currentTarget);
      return;
    }
    if (typeof onClick === "function") {
      try {
        const result = onClick(e);
        if (result && typeof result.then === "function") {
          setIsLocalLoading(true);
          showLoading(
            loadingText || `Processing ${label || "request"}...`,
            "Please wait while we complete this action"
          );
          await result;
        }
      } catch (err) {
        console.error("ActionButton onClick error:", err);
      } finally {
        setIsLocalLoading(false);
        hideLoading();
      }
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = async (item, idx) => {
    handleClose();
    const handler = typeof item?.onClick === "function" ? item.onClick : onClick;
    if (typeof handler === "function") {
      try {
        const itemLabel = typeof item === "object" ? item.label : item;
        const result = handler(item, idx);
        if (result && typeof result.then === "function") {
          setIsLocalLoading(true);
          showLoading(
            `Processing ${itemLabel || label || "request"}...`,
            "Please wait while we complete this action"
          );
          await result;
        }
      } catch (err) {
        console.error("MenuItem click error:", err);
      } finally {
        setIsLocalLoading(false);
        hideLoading();
      }
    }
  };

  const startIcon = isBusy ? (
    <CircularProgress size={16} color="inherit" />
  ) : icon && typeof icon === "string" ? (
    <Box component="img" src={icon} alt="" sx={{ width: 16, height: 16 }} />
  ) : (
    icon
  );

  if (type === "link") {
    return (
      <Button
        variant="text"
        title={title || label}
        onClick={handleClick}
        disabled={isBusy}
        className={className}
        size={size}
        sx={{
          textTransform: "none",
          fontWeight: 600,
          color: boiBlue,
          ...style,
        }}
        startIcon={startIcon}
        {...rest}
      >
        {label}
      </Button>
    );
  }

  if (type === "dropdown") {
    return (
      <Box sx={{ display: "inline-block" }}>
        <Button
          variant={variant}
          color={color}
          title={title || label}
          onClick={handleClick}
          disabled={isBusy}
          className={className}
          size={size}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            bgcolor: color === "primary" ? boiBlue : undefined,
            ...style,
          }}
          startIcon={startIcon}
          {...rest}
        >
          {label}
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          slotProps={{
            paper: {
              sx: {
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              },
            },
          }}
        >
          {menu.map((item, idx) => (
            <MenuItem key={idx} onClick={() => handleMenuItemClick(item, idx)}>
              {typeof item === "object" && item.label ? item.label : item}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    );
  }

  return (
    <Button
      variant={variant}
      color={color}
      title={title || label}
      onClick={handleClick}
      disabled={isBusy}
      className={className}
      size={size}
      sx={{
        textTransform: "none",
        borderRadius: "8px",
        bgcolor: color === "primary" ? boiBlue : undefined,
        ...style,
      }}
      startIcon={startIcon}
      {...rest}
    >
      {label}
    </Button>
  );
};

export default ActionButton;
