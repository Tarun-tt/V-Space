import React from "react";
import Box from "@mui/material/Box";

const ActionButton = ({
  type = "button",
  label,
  title,
  icon,
  onClick,
  menu = [],
  disabled = false,
  className = "",
  style = {},
}) => {
  const handleClick = (e) => {
    e.preventDefault();
    if (!disabled && typeof onClick === "function") {
      onClick();
    }
  };

  if (type === "link") {
    return (
      <button
        type="button"
        title={title || label}
        role="button"
        onClick={handleClick}
        className={className}
        style={{
          cursor: "pointer",
          opacity: disabled ? 0.5 : 1,
          ...style,
        }}
        aria-disabled={disabled}
      >
        {label}
      </button>
    );
  }

  if (type === "dropdown") {
    return (
      <Box className={`dropdown dropBTN ${className}`}>
        <Box
          className="dropdown-toggle"
          type="button"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          onClick={handleClick}
          style={{ cursor: "pointer", ...style }}
        >
          {icon && <img src={icon} alt="menu" />}
        </Box>
        <Box className="dropdown-menu">
          {menu.map((item, idx) => (
            <button
              type="button"
              className="dropdown-item"
              key={idx}
              onClick={handleClick}
            >
              {item}
            </button>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <button
      type={type}
      className={className}
      title={title || label}
      onClick={handleClick}
      disabled={disabled}
      style={style}
    >
      {label}
      {icon && <img src={icon} alt="icon" />}
    </button>
  );
};

export default ActionButton;
