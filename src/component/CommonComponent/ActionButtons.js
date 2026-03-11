import React from "react";

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
        href="#"
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
      <div className={`dropdown dropBTN ${className}`}>
        {" "}
        <div
          className="dropdown-toggle"
          type="button"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          onClick={handleClick}
          style={{ cursor: "pointer", ...style }}
        >
          {icon && <img src={icon} alt="menu" />}
        </div>
        <div className="dropdown-menu">
          {menu.map((item, idx) => (
            <button
              className="dropdown-item"
              href="#"
              key={idx}
              onClick={handleClick}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <button
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
