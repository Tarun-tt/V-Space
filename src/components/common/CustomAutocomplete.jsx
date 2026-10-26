import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CustomTextField } from "./CustomTextField";

const RequiredAsterisk = () => (
  <Typography
    component={Box}
    sx={{ color: "error.main", fontSize: "1.2rem", lineHeight: 1, ml: 0.5, display: "inline" }}
  >
    *
  </Typography>
);

export function CustomAutocomplete({
  label,
  name,
  value,
  options = [],
  onChange,
  error,
  helperText,
  readOnly,
  disabled,
  InputLabelProps,
  textFieldSx,
  sx,
  placeholder,
  required = false,
  ...rest
}) {
  const normalizedOptions = options.map((opt) =>
    typeof opt === "object" && opt !== null ? opt : { label: String(opt), value: opt }
  );

  const selectedOption =
    normalizedOptions.find((opt) => opt.value === value || opt.label === value) || null;

  const handleChange = (event, newValue) => {
    const finalValue = newValue ? (typeof newValue === "object" ? newValue.value : newValue) : "";
    if (onChange) {
      onChange({ target: { name, value: finalValue } }, newValue);
    }
  };

  return (
    <Autocomplete
      disabled={disabled || readOnly}
      readOnly={readOnly}
      options={normalizedOptions}
      getOptionLabel={(opt) => (typeof opt === "object" ? opt.label || "" : String(opt))}
      isOptionEqualToValue={(option, val) =>
        typeof val === "object" ? option.value === val.value : option.value === val
      }
      value={selectedOption}
      onChange={handleChange}
      sx={sx}
      {...rest}
      renderInput={(params) => (
        <CustomTextField
          {...params}
          label={
            <Box component="span">
              {label}
              {required && <RequiredAsterisk />}
            </Box>
          }
          error={error}
          placeholder={placeholder}
          helperText={helperText}
          size="small"
          sx={{
            ...textFieldSx,
            "& .MuiOutlinedInput-root": { borderRadius: "10px" },
          }}
          required={false}
          InputLabelProps={{ ...params.InputLabelProps, ...InputLabelProps }}
        />
      )}
    />
  );
}

export default CustomAutocomplete;
