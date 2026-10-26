// // In CustomTextField.jsx - Update the date picker section
// import TextField from "@mui/material/TextField";
// import Box from "@mui/material/Box";
// import Typography from "@mui/material/Typography";
// import Radio from "@mui/material/Radio";
// import RadioGroup from "@mui/material/RadioGroup";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import FormLabel from "@mui/material/FormLabel";
// import IconButton from "@mui/material/IconButton";
// import FormControl from "@mui/material/FormControl";
// import CloudUploadIcon from "@mui/icons-material/CloudUpload";
// import CircularProgress from "@mui/material/CircularProgress";
// import DownloadIcon from "@mui/icons-material/Download";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import {
//   boiBlue,
//   boiBorder,
//   boiInputSoftBg,
//   boiErrorRed,
// } from "../../theme/theme";
// import dayjs from "dayjs";

// const soft = {
//   "& .MuiOutlinedInput-root": { bgcolor: boiInputSoftBg, borderRadius: "10px" },
// };

// const toDayjs = (value) => {
//   if (!value) return null;
//   if (dayjs.isDayjs(value)) return value;
//   return dayjs(value);
// };

// // Helper function to prevent leading spaces
// const preventLeadingSpace = (value) => {
//   if (typeof value !== "string") return value;
//   return value.replace(/^\s+/, "");
// };

// export function CustomTextField({
//   cellVariant,
//   size = "small",
//   fullWidth = true,
//   sx,
//   InputLabelProps,
//   multiline,
//   minRows,
//   maxRows,
//   type = "text",
//   value,
//   onChange,
//   error,
//   helperText,
//   required,
//   label,
//   placeholder,
//   options,
//   optionsKey,
//   optionsMap,
//   name,
//   trimStart = true,
//   pattern,
//   maxLength,
//   inputProps: externalInputProps,
//   disabled = false,
//   uploading = false,
//   ...rest
// }) {
//   const cellSx = cellVariant
//     ? {
//         "& .MuiOutlinedInput-root": {
//           borderRadius: 0,
//           bgcolor: "background.paper",
//           "& fieldset": { border: "none" },
//         },
//       }
//     : {};

//   // const multilineProps = multiline
//   //   ? {
//   //       multiline: true,
//   //       minRows: minRows || 2,
//   //       maxRows: maxRows || 4,
//   //     }
//   //   : {};
//   const getMultilineProps = () => {
//     if (!multiline) return {};
//     // If rows is explicitly provided and not zero, use fixed rows
//     if (rest.rows) {
//       return { multiline: true, rows: rest.rows };
//     }
//     // Otherwise use dynamic rows with min/max
//     return {
//       multiline: true,
//       minRows: minRows || 2,
//       maxRows: maxRows || 4,
//     };
//   };
//   const multilineProps = getMultilineProps();

//   // Build inputProps with pattern and maxLength
//   const inputProps = {
//     ...externalInputProps,
//     readOnly: disabled, // Add readOnly for text fields when disabled
//   };

//   if (maxLength) {
//     inputProps.maxLength = maxLength;
//   }

//   if (pattern) {
//     inputProps.pattern = pattern;
//   }

//   // Handle text input change with trim start, pattern, and maxLength
//   const handleTextChange = (e) => {
//     if (disabled || !onChange) return; // Prevent changes when disabled

//     let newValue = e.target.value;

//     // Apply maxLength
//     if (maxLength && newValue.length > maxLength) {
//       newValue = newValue.slice(0, maxLength);
//     }

//     // Apply pattern validation - allow empty values, validate only if value exists
//     if (pattern && newValue) {
//       const regex = new RegExp(pattern);
//       if (!regex.test(newValue)) {
//         // Don't prevent typing, just don't update if pattern doesn't match
//         return;
//       }
//     }

//     if (trimStart && typeof newValue === "string") {
//       newValue = preventLeadingSpace(newValue);
//     }

//     // Create a synthetic event-like object
//     onChange({
//       target: {
//         name: e.target.name,
//         value: newValue,
//       },
//     });
//   };

//   // Handle paste event
//   const handlePaste = (e) => {
//     if (disabled || !onChange) return; // Prevent changes when disabled

//     e.preventDefault();
//     const pastedText = e.clipboardData.getData("text");
//     let cleanedText = pastedText;

//     // Remove leading spaces if trimStart is enabled
//     if (trimStart && typeof cleanedText === "string") {
//       cleanedText = preventLeadingSpace(cleanedText);
//     }

//     // Apply maxLength
//     if (maxLength && cleanedText.length > maxLength) {
//       cleanedText = cleanedText.slice(0, maxLength);
//     }

//     // Apply pattern validation
//     if (pattern && cleanedText) {
//       const regex = new RegExp(pattern);
//       if (!regex.test(cleanedText)) {
//         cleanedText = cleanedText
//           .split("")
//           .filter((char) => regex.test(char))
//           .join("");
//         if (!cleanedText) return;
//       }
//     }

//     onChange({
//       target: {
//         name: e.target.name,
//         value: cleanedText,
//       },
//     });
//   };

//   if (type === "radio") {
//     const radioOptions =
//       options ||
//       (optionsMap && optionsKey ? optionsMap[optionsKey] : ["Yes", "No"]);
//     // allowed props for FormControl
//     const { label, required, error, disabled, ...restRadio } = rest;
//     // ensure no invalid props like InputLabelProps, inputProps are passed
//     return (
//       <FormControl
//         component="fieldset"
//         error={!!error}
//         fullWidth
//         disabled={disabled}
//         {...restRadio} // only safe props (e.g., sx, className)
//       >
//         <FormLabel component="legend" sx={{ fontSize: 13, mb: 1 }}>
//           {label}
//           {required && " *"}
//         </FormLabel>
//         <RadioGroup
//           row
//           value={value || ""}
//           onChange={(e) => !disabled && onChange && onChange(e)}
//         >
//           {radioOptions.map((opt) => (
//             <FormControlLabel
//               key={opt}
//               value={opt}
//               control={<Radio size="small" />}
//               label={opt}
//               disabled={disabled}
//             />
//           ))}
//         </RadioGroup>
//         {error && (
//           <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
//             {error}
//           </Typography>
//         )}
//       </FormControl>
//     );
//   }

//   if (type === "date") {
//     return (
//       <DatePicker
//         label={label}
//         value={toDayjs(value)}
//         onChange={(date) => {
//           if (!disabled && onChange) {
//             // Convert Dayjs to ISO string (YYYY-MM-DD)
//             const isoString = date ? date.format("YYYY-MM-DD") : "";
//             onChange(isoString);
//           }
//         }}
//         disabled={disabled}
//         slotProps={{
//           textField: {
//             fullWidth: true,
//             size: size,
//             sx: soft,
//             placeholder: placeholder,
//             error: !!error,
//             disabled: disabled,
//             required: required,
//           },
//         }}
//       />
//     );
//   }

//   if (type === "file") {
//     const isDisabled = disabled;
//     const fileLoading = uploading;
//     const RequiredAsterisk = () => (
//       <span style={{ color: boiErrorRed, marginLeft: 2 }}>*</span>
//     );
//     const hasError = !!error;
//     const ALLOWED_EXTENSIONS = [
//       "pdf",
//       "xls",
//       "xlsx",
//       "csv",
//       "png",
//       "jpg",
//       "jpeg",
//       "gif",
//       "bmp",
//       "webp",
//     ];
//     const ACCEPT_STRING =
//       ".pdf,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.bmp,.webp";

//     const isValidFile = (file) => {
//       const name = file.name || "";
//       const parts = name.split(".");
//       // Must have at least name + extension
//       if (parts.length < 2) return false;
//       // Check double extension (more than 2 parts means multiple dots)
//       // Only the last part should be a valid extension, and second-to-last should NOT be a known dangerous extension
//       const dangerousExts = [
//         "exe",
//         "bat",
//         "cmd",
//         "msi",
//         "js",
//         "vbs",
//         "ps1",
//         "sh",
//         "dll",
//         "com",
//         "scr",
//       ];
//       if (parts.length > 2) {
//         // Check if any middle part is a dangerous extension
//         for (let i = 1; i < parts.length - 1; i++) {
//           if (dangerousExts.includes(parts[i].toLowerCase())) return false;
//         }
//       }
//       const ext = parts[parts.length - 1].toLowerCase();
//       return ALLOWED_EXTENSIONS.includes(ext);
//     };

//     const getFilenameFromPath = (path) => {
//       if (!path || typeof path !== "string") return "";
//       const pathname = path.split("?")[0];
//       const segments = pathname.split("/").filter(Boolean);
//       if (segments.length === 0) return "";
//       const lastSegment = segments[segments.length - 1];
//       if (lastSegment.includes(".")) return decodeURIComponent(lastSegment);
//       if (segments.length >= 2)
//         return decodeURIComponent(segments[segments.length - 2]);
//       return decodeURIComponent(lastSegment) || "";
//     };

//     const normalizeDownloadUrl = (url) => {
//       if (!url) return null;
//       return url.startsWith("http") ? url : `${window.location.origin}${url}`;
//     };

//     const getFileDownloadUrl = (val) => {
//       if (!val) return null;
//       if (typeof val === "string") return normalizeDownloadUrl(val);
//       if (typeof val === "object" && !(val instanceof File)) {
//         return normalizeDownloadUrl(val.contentUrl || val.url || "");
//       }
//       return null;
//     };

//     const hasFile =
//       value instanceof File ||
//       (value &&
//         typeof value === "object" &&
//         (value.contentUrl || value.fileName)) ||
//       (typeof value === "string" && value.length > 0);

//     const displayValue =
//       value instanceof File
//         ? value.name
//         : value && typeof value === "object" && !(value instanceof File)
//           ? value.fileName ||
//             value.name ||
//             getFilenameFromPath(value.contentUrl)
//           : typeof value === "string"
//             ? getFilenameFromPath(value) || value
//             : "";

//     const downloadUrl = getFileDownloadUrl(value);

//     return (
//       <Box sx={{ width: "100%" }}>
//         <Typography
//           sx={{
//             mb: 0.75,
//             fontSize: 13,
//             fontWeight: 500,
//             color: "text.secondary",
//           }}
//         >
//           {label}
//           {required && !isDisabled && <RequiredAsterisk />}
//         </Typography>
//         <Box
//           sx={{
//             border: `1px dashed ${hasError ? boiErrorRed : boiBorder}`,
//             borderRadius: "10px",
//             p: 2,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             bgcolor: isDisabled ? "#f5f5f5" : "#fafcff",
//             cursor: isDisabled || hasFile ? "default" : "pointer",
//             width: "100%",
//             "&:hover": {
//               bgcolor: isDisabled ? "#f5f5f5" : hasFile ? "#fafcff" : "#f0f5fa",
//             },
//           }}
//           onClick={() => {
//             if (!isDisabled && !hasFile) {
//               document.getElementById(`${name}-input`)?.click();
//             }
//           }}
//         >
//           <Typography
//             color={isDisabled ? "#999" : "text.secondary"}
//             sx={{
//               fontSize: "0.875rem",
//               flex: 1,
//               overflow: "hidden",
//               textOverflow: "ellipsis",
//               whiteSpace: "nowrap",
//             }}
//           >
//             {displayValue || "Upload Document"}
//           </Typography>
//           <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
//             {fileLoading && (
//               <CircularProgress size={20} sx={{ color: boiBlue }} />
//             )}
//             {!fileLoading && hasFile && downloadUrl && (
//               <IconButton
//                 size="small"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   window.open(downloadUrl, "_blank");
//                 }}
//                 aria-label="download attachment"
//               >
//                 <DownloadIcon sx={{ color: boiBlue }} />
//               </IconButton>
//             )}
//             {!fileLoading && hasFile && !isDisabled && (
//               <IconButton
//                 size="small"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   if (onChange) onChange(null);
//                 }}
//                 aria-label="delete attachment"
//               >
//                 <DeleteIcon sx={{ color: boiErrorRed }} />
//               </IconButton>
//             )}
//             {!fileLoading && !hasFile && !isDisabled && (
//               <CloudUploadIcon sx={{ color: boiBlue }} />
//             )}
//           </Box>
//           <input
//             id={`${name}-input`}
//             type="file"
//             hidden
//             accept={ACCEPT_STRING}
//             disabled={isDisabled}
//             onChange={(e) => {
//               if (onChange && e.target.files[0] && !isDisabled) {
//                 const file = e.target.files[0];
//                 if (!isValidFile(file)) {
//                   alert(
//                     "Invalid file. Only PDF, Excel, CSV and image files are allowed.",
//                   );
//                   e.target.value = "";
//                   return;
//                 }
//                 onChange(file);
//               }
//               e.target.value = "";
//             }}
//           />
//         </Box>
//         {error && (
//           <Typography
//             color="error"
//             variant="caption"
//             sx={{ mt: 0.5, display: "block" }}
//           >
//             {error}
//           </Typography>
//         )}
//       </Box>
//     );
//   }

//   return (
//     <TextField
//       size={size}
//       fullWidth={fullWidth}
//       variant="outlined"
//       sx={{ ...cellSx, ...sx }}
//       InputLabelProps={InputLabelProps}
//       type={type}
//       label={label}
//       value={value || ""}
//       onChange={handleTextChange}
//       onPaste={handlePaste}
//       error={!!error}
//       disabled={disabled} // Add disabled prop to TextField
//       required={required}
//       placeholder={placeholder}
//       name={name}
//       inputProps={inputProps}
//       {...multilineProps}
//       {...rest}
//     />
//   );
// }

import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  boiBlue,
  boiBorder,
  boiInputSoftBg,
  boiErrorRed,
} from "../../theme/theme";
import dayjs from "dayjs";
import React, { useState, useRef } from "react";

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

const formatDate = (value) => {
  if (!value) return null;
  if (dayjs.isDayjs(value)) return value.format("YYYY-MM-DD");
  if (typeof value === "string") return value;
  return null;
};

const RequiredAsterisk = () => (
  <Typography
    component="span"
    sx={{ color: boiErrorRed, fontSize: "1.2rem", lineHeight: 1, ml: 0.5 }}
  >
    *
  </Typography>
);

// Helper function to prevent leading spaces
const preventLeadingSpace = (value) => {
  if (typeof value !== "string") return value;
  return value.replace(/^\s+/, "");
};

// Helper function to filter input by pattern
const filterInputByPattern = (value, pattern) => {
  if (!pattern || !value) return value;
  const regex = new RegExp(pattern);
  const filtered = value
    .split("")
    .filter((char) => regex.test(char))
    .join("");
  return filtered;
};

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
  required = false,
  label,
  placeholder,
  options,
  optionsKey,
  optionsMap,
  name,
  readOnly = false,
  disabled = false,
  trimStart = true,
  pattern,
  maxLength,
  disableFuture = true, // default true, can be overridden
  ...rest
}) {
  const cellSx = cellVariant
    ? {
        "& .MuiOutlinedInput-root": {
          borderRadius: 0,
          bgcolor: "background.paper",
          "& fieldset": { border: "none" },
        },
      }
    : {};

  const multilineProps = multiline
    ? {
        multiline: true,
        minRows: minRows || 2,
        maxRows: maxRows || 4,
      }
    : {};

  const isDisabled = disabled || readOnly;

  // Handle text change with trimming and pattern filtering
  const handleTextChange = (e) => {
    if (!onChange) return;

    let newValue = e.target.value;

    // Apply pattern filtering if specified
    if (pattern && newValue) {
      newValue = filterInputByPattern(newValue, pattern);
    }

    // Apply maxLength restriction
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength);
    }

    // Trim leading spaces if enabled
    if (trimStart && typeof newValue === "string") {
      newValue = preventLeadingSpace(newValue);
    }

    onChange({
      target: {
        name: e.target.name,
        value: newValue,
      },
    });
  };

  const handlePaste = (e) => {
    if (disabled || readOnly || !onChange) return;
    e.preventDefault();

    let pastedText = e.clipboardData.getData("text");
    if (trimStart && typeof pastedText === "string") {
      pastedText = preventLeadingSpace(pastedText);
    }
    if (pattern && pastedText) {
      pastedText = filterInputByPattern(pastedText, pattern);
    }
    if (maxLength && pastedText.length > maxLength) {
      pastedText = pastedText.slice(0, maxLength);
    }
    if (!pastedText) return;

    const input = e.target;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || start;
    const currentValue = input.value || "";

    const newValue =
      currentValue.substring(0, start) +
      pastedText +
      currentValue.substring(end);

    const finalValue = maxLength ? newValue.slice(0, maxLength) : newValue;

    onChange({
      target: {
        name: e.target.name,
        value: finalValue,
      },
    });

    setTimeout(() => {
      const newCursorPos = Math.min(
        start + pastedText.length,
        finalValue.length,
      );
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  if (type === "radio") {
    const radioOptions =
      options ||
      (optionsMap && optionsKey ? optionsMap[optionsKey] : ["Yes", "No"]);
    const hasError = !!error;

    const handleRadioChange = (event) => {
      if (onChange && !isDisabled) {
        onChange(event);
      }
    };

    const selectedValue = value || "";

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

  // ----- FIXED DATE TYPE -----
  if (type === "date") {
    const [open, setOpen] = useState(false);
    const [internalError, setInternalError] = useState(false);
    const [internalHelper, setInternalHelper] = useState("");
    const lastValidRef = useRef(value);

    const handleDateChange = (date) => {
      // ✅ Only block future dates if disableFuture is true
      if (
        disableFuture &&
        date &&
        date.isValid() &&
        date.isAfter(dayjs(), "day")
      ) {
        setInternalError(true);
        setInternalHelper("Future date not allowed");
        // Revert to last valid date (string)
        onChange && onChange(lastValidRef.current);
        return;
      }
      setInternalError(false);
      setInternalHelper("");
      const newValue = date ? date.format("YYYY-MM-DD") : "";
      lastValidRef.current = newValue;
      onChange && onChange(newValue);
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
        disableFuture={disableFuture} // <-- passed to MUI picker
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

  if (type === "file") {
    const hasError = !!error;
    const getFilenameFromPath = (path) => {
      if (!path || typeof path !== "string") return "";
      const pathname = path.split("?")[0];
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
          <input
            id={`${name}-input`}
            type="file"
            hidden
            accept=".pdf,.xls,.xlsx,.csv,.doc,.docx,.png,.jpg,.jpeg,.gif,.bmp,.webp"
            disabled={isDisabled}
            onChange={(e) => {
              if (onChange && e.target.files[0] && !isDisabled) {
                onChange(e.target.files[0]);
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

  // For text/number/email/etc. fields
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
        <span>
          {label}
          {required && !isDisabled && <RequiredAsterisk />}
        </span>
      }
      value={value || ""}
      onChange={handleTextChange}
      onPaste={handlePaste}
      error={!!error}
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
