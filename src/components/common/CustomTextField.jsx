import React, { useState, useRef, useContext } from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import IconButton from "@mui/material/IconButton";
import FormControl from "@mui/material/FormControl";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LoadingContext } from "./LoadingContext";
import { ToastContext } from "./ToastContext";
import {
  boiBlue,
  boiBorder,
  boiInputSoftBg,
  boiErrorRed,
} from "../../theme/theme";
import dayjs from "dayjs";

const soft = {
  "& .MuiOutlinedInput-root": {
    bgcolor: boiInputSoftBg,
    borderRadius: "10px",
    "& fieldset": { borderColor: boiBorder },
  },
};

const toDayjs = (value) => {
  if (!value) return null;
  if (dayjs.isDayjs(value)) return value;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

const RequiredAsterisk = () => (
  <Typography
    component={Box}
    sx={{
      color: boiErrorRed,
      fontSize: "1.2rem",
      lineHeight: 1,
      ml: 0.5,
      display: "inline",
    }}
  >
    *
  </Typography>
);

const preventLeadingSpace = (value) => {
  if (typeof value !== "string") return value;
  return value.replace(/^\s+/, "");
};

const filterInputByPattern = (value, pattern) => {
  if (!pattern || !value) return value;
  const regex = new RegExp(pattern);
  return value
    .split("")
    .filter((char) => regex.test(char))
    .join("");
};

function CustomDateField({
  label,
  value,
  onChange,
  disableFuture,
  isDisabled,
  size,
  placeholder,
  error,
  helperText,
  required,
}) {
  const [open, setOpen] = useState(false);
  const [internalError, setInternalError] = useState(false);
  const [internalHelper, setInternalHelper] = useState("");
  const lastValidRef = useRef(value);

  const handleDateChange = (date) => {
    if (
      disableFuture &&
      date &&
      date.isValid() &&
      date.isAfter(dayjs(), "day")
    ) {
      setInternalError(true);
      setInternalHelper("Future date not allowed");
      if (onChange) onChange(lastValidRef.current);
      return;
    }
    setInternalError(false);
    setInternalHelper("");
    const newValue = date ? date.format("YYYY-MM-DD") : "";
    lastValidRef.current = newValue;
    if (onChange) onChange(newValue);
  };

  const combinedError = internalError || !!error;
  const combinedHelper = internalError ? internalHelper : helperText || "";

  return (
    <DatePicker
      label={label}
      value={toDayjs(value)}
      onChange={handleDateChange}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      disableFuture={disableFuture}
      disabled={isDisabled}
      readOnly={isDisabled}
      slotProps={{
        textField: {
          fullWidth: true,
          size: size,
          sx: soft,
          placeholder: placeholder,
          error: combinedError,
          helperText: combinedHelper,
          required: required,
          onClick: () => {
            if (!isDisabled) setOpen(true);
          },
          disabled: isDisabled,
          InputProps: {
            readOnly: true,
          },
        },
      }}
    />
  );
}

export function CustomTextField({
  cellVariant,
  size = "small",
  fullWidth = true,
  sx,
  InputLabelProps,
  multiline,
  minRows,
  maxRows,
  type = "text",
  value,
  onChange,
  error,
  helperText,
  required,
  label,
  placeholder,
  options,
  optionsKey,
  optionsMap,
  name,
  disabled,
  readOnly,
  disableFuture,
  maxLength,
  pattern,
  onPaste,
  ...rest
}) {
  const isDisabled = disabled || readOnly;
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const { showToast } = useContext(ToastContext);

  const cellSx = cellVariant
    ? {
        "& .MuiOutlinedInput-root": {
          bgcolor: boiInputSoftBg,
          borderRadius: "8px",
          fontSize: 13,
          "& fieldset": { borderColor: boiBorder },
        },
      }
    : soft;

  const multilineProps = multiline
    ? {
        multiline: true,
        minRows: minRows || 3,
        maxRows: maxRows || 6,
      }
    : {};

  const handleTextChange = (e) => {
    let raw = e.target.value;
    let clean = preventLeadingSpace(raw);
    if (pattern) {
      clean = filterInputByPattern(clean, pattern);
    }
    if (maxLength && clean.length > maxLength) {
      clean = clean.slice(0, maxLength);
    }
    if (onChange) {
      onChange({ target: { name, value: clean } });
    }
  };

  const handlePaste = (e) => {
    if (onPaste) onPaste(e);
  };

  if (type === "radio") {
    let radioOptions = [];
    if (Array.isArray(options)) radioOptions = options;
    else if (optionsKey && optionsMap && optionsMap[optionsKey]) {
      radioOptions = optionsMap[optionsKey];
    }
    const hasError = !!error;
    const selectedValue = value ?? "";

    const handleRadioChange = (e) => {
      if (isDisabled) return;
      if (onChange) {
        onChange({ target: { name, value: e.target.value } });
      }
    };

    return (
      <FormControl
        component="fieldset"
        error={hasError}
        fullWidth
        disabled={isDisabled}
        sx={{ width: "100%" }}
      >
        <FormLabel
          component="legend"
          sx={{
            fontSize: 13,
            mb: 1,
            fontWeight: 500,
            color: hasError ? boiErrorRed : "text.secondary",
          }}
        >
          {label}
          {required && <RequiredAsterisk />}
        </FormLabel>
        <RadioGroup row value={selectedValue} onChange={handleRadioChange}>
          {radioOptions.map((opt) => (
            <FormControlLabel
              key={opt}
              value={opt}
              control={<Radio size="small" />}
              label={opt}
              disabled={isDisabled}
            />
          ))}
        </RadioGroup>
        {error && (
          <Typography
            color="error"
            variant="caption"
            sx={{ mt: 0.5, display: "block" }}
          >
            {error}
          </Typography>
        )}
      </FormControl>
    );
  }

  if (type === "date") {
    return (
      <CustomDateField
        label={label}
        value={value}
        onChange={onChange}
        disableFuture={disableFuture}
        isDisabled={isDisabled}
        size={size}
        placeholder={placeholder}
        error={error}
        helperText={helperText}
        required={required}
      />
    );
  }

  if (type === "file") {
    const hasError = !!error;
    const getFilenameFromPath = (filePath) => {
      if (!filePath || typeof filePath !== "string") return "";
      const pathname = filePath.split("?")[0];
      const segments = pathname.split("/").filter(Boolean);
      if (segments.length === 0) return "";
      const lastSegment = segments[segments.length - 1];
      if (lastSegment.includes(".")) return lastSegment;
      if (segments.length >= 2) return segments[segments.length - 2];
      return lastSegment || "";
    };

    const normalizeDownloadUrl = (url) => {
      if (!url) return null;
      return url.startsWith("http") ? url : `${window.location.origin}${url}`;
    };

    const getFileDownloadUrl = (val) => {
      if (!val) return null;
      if (typeof val === "string") return normalizeDownloadUrl(val);
      if (typeof val === "object" && !(val instanceof File)) {
        return normalizeDownloadUrl(val.contentUrl || val.url || "");
      }
      return null;
    };

    const displayValue =
      value instanceof File
        ? value.name
        : value && typeof value === "object"
          ? value.fileName ||
            value.name ||
            getFilenameFromPath(value.contentUrl)
          : typeof value === "string"
            ? getFilenameFromPath(value) || value
            : "";

    const hasFile = !!displayValue;
    const downloadUrl = getFileDownloadUrl(value);

    return (
      <Box sx={{ width: "100%" }}>
        <Typography
          sx={{
            mb: 0.75,
            fontSize: 13,
            fontWeight: 500,
            color: "text.secondary",
          }}
        >
          {label}
          {required && !isDisabled && <RequiredAsterisk />}
        </Typography>
        <Box
          sx={{
            border: `1px dashed ${hasError ? boiErrorRed : boiBorder}`,
            borderRadius: "10px",
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: isDisabled ? "#f5f5f5" : "#fafcff",
            cursor: isDisabled || hasFile ? "default" : "pointer",
            width: "100%",
            "&:hover": {
              bgcolor: isDisabled || hasFile ? undefined : "#f0f5fa",
            },
          }}
          onClick={() => {
            if (!isDisabled && !hasFile) {
              document.getElementById(`${name}-input`)?.click();
            }
          }}
        >
          <Typography
            color={isDisabled ? "#999" : "text.secondary"}
            sx={{ fontSize: "0.875rem", flex: 1 }}
          >
            {displayValue || placeholder || "Upload Document"}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {hasFile && downloadUrl && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(downloadUrl, "_blank");
                }}
                aria-label="download attachment"
              >
                <DownloadIcon sx={{ color: boiBlue }} />
              </IconButton>
            )}
            {hasFile && !isDisabled && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onChange) onChange(null);
                }}
                aria-label="delete attachment"
              >
                <DeleteIcon sx={{ color: boiErrorRed }} />
              </IconButton>
            )}
            {!hasFile && !isDisabled && (
              <CloudUploadIcon sx={{ color: boiBlue }} />
            )}
          </Box>
          <Box
            component="input"
            id={`${name}-input`}
            type="file"
            sx={{ display: "none" }}
            accept=".pdf,.xls,.xlsx,.csv,.doc,.docx,.png,.jpg,.jpeg,.gif,.bmp,.webp,.tif,.tiff"
            disabled={isDisabled}
            onChange={async (e) => {
              const file = e.target.files && e.target.files[0];
              if (file && !isDisabled) {
                if (showLoading) {
                  showLoading(
                    `Uploading attachment "${file.name}"...`,
                    "Processing and attaching document",
                  );
                }
                try {
                  if (onChange) {
                    await onChange(file);
                  }
                  if (showToast) {
                    showToast({
                      message: `Attachment "${file.name}" attached successfully!`,
                      type: "success",
                      title: "Attachment Uploaded",
                    });
                  }
                } catch (uploadErr) {
                  if (showToast) {
                    showToast({
                      message: `Failed to attach "${file.name}": ${uploadErr.message || uploadErr}`,
                      type: "danger",
                      title: "Attachment Error",
                    });
                  }
                } finally {
                  if (hideLoading) hideLoading();
                }
              }
              e.target.value = "";
            }}
          />
        </Box>
        {error && (
          <Typography
            color="error"
            variant="caption"
            sx={{ mt: 0.5, display: "block" }}
          >
            {error}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <TextField
      size={size}
      fullWidth={fullWidth}
      variant="outlined"
      sx={{ ...cellSx, ...sx }}
      InputLabelProps={{
        ...InputLabelProps,
        shrink: true,
      }}
      type={type}
      label={
        <Box component="span">
          {label}
          {required && !isDisabled && <RequiredAsterisk />}
        </Box>
      }
      value={value || ""}
      onChange={handleTextChange}
      onPaste={handlePaste}
      error={!!error}
      helperText={error || helperText}
      required={false}
      placeholder={placeholder}
      name={name}
      disabled={isDisabled}
      inputProps={{
        maxLength: maxLength,
        pattern: pattern,
      }}
      {...multilineProps}
      {...rest}
    />
  );
}

export default CustomTextField;
