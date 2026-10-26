import React from "react";
import Box from "@mui/material/Box";
import CustomTextField from "./CustomTextField";
import CustomAutocomplete from "./CustomAutocomplete";

const FieldRenderer = ({ field, value, onChange }) => {
  const { label, name, type, required, disabled, options, placeholder } = field;

  if (type === "select") {
    return (
      <Box sx={{ mb: 2 }}>
        <CustomAutocomplete
          label={label}
          name={name}
          value={value || ""}
          onChange={(_fieldObj, val) => onChange(name, val)}
          options={options || []}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <CustomTextField
        label={label}
        name={name}
        type={type || "text"}
        value={value || ""}
        onChange={(e) => onChange(name, e.target.value)}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
      />
    </Box>
  );
};

export default FieldRenderer;
