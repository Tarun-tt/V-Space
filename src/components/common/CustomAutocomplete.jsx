import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CustomTextField } from "./CustomTextField";

const RequiredAsterisk = () => (
  <Typography
    component="span"
    sx={{ color: "error.main", fontSize: "1.2rem", lineHeight: 1, ml: 0.5 }}
  >
    *
  </Typography>
);

export function CustomAutocomplete({
  label,
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
  return (
    <Autocomplete
      disabled={disabled || readOnly}
      readOnly={readOnly}
      sx={sx}
      {...rest}
      renderInput={(params) => (
        <CustomTextField
          {...params}
          label={
            <span>
              {label}
              {required && <RequiredAsterisk />}
            </span>
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
