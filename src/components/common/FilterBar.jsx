// FilterBar.js
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { useState } from "react";
import { CustomAutocomplete } from "./CustomAutocomplete";
import { CustomTextField } from "./CustomTextField";
import {
  boiBlue,
  boiFilterBg,
  boiBorder,
  boiInputSoftBg,
} from "../../theme/theme";

const labelProps = {
  shrink: true,
  sx: {
    color: boiBlue,
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    "&.MuiInputLabel-shrink": { transform: "translate(12px, -8px) scale(1)" },
  },
};

const fieldInputSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: boiInputSoftBg,
    borderRadius: "10px",
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: boiBlue },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderWidth: "1px" },
  },
};

export function FilterBar({
  statusOptions,
  typeOptions,
  sourceOptions,
  onSearch,
  onReset,
  showSourceFilter = true,
}) {
  const [status, setStatus] = useState(statusOptions?.[0] || "All Statuses");
  const [reference, setReference] = useState("");
  const [type, setType] = useState(typeOptions?.[0] || "All Types");
  const [source, setSource] = useState(sourceOptions?.[0] || "All Sources");

  const handleSearch = () => {
    onSearch({ status, reference, type, source });
  };

  const handleReset = () => {
    setStatus(statusOptions?.[0] || "All Statuses");
    setReference("");
    setType(typeOptions?.[0] || "All Types");
    setSource(sourceOptions?.[0] || "All Sources");
    if (onReset) {
      onReset();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        alignItems: "flex-end",
        bgcolor: boiFilterBg,
        p: 2.25,
        borderRadius: "12px",
        border: `1px solid ${boiBorder}`,
      }}
    >
      <Box sx={{ minWidth: 172, flex: "1 1 150px" }}>
        <CustomAutocomplete
          options={statusOptions || []}
          value={status}
          onChange={(_, v) =>
            setStatus(v ?? (statusOptions?.[0] || "All Statuses"))
          }
          label="STATUS"
          InputLabelProps={labelProps}
          textFieldSx={fieldInputSx}
        />
      </Box>
      <Box sx={{ minWidth: 208, flex: "1 1 190px" }}>
        <CustomTextField
          label="REFERENCE NUMBER"
          placeholder="Reference Number"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          InputLabelProps={labelProps}
          sx={fieldInputSx}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon
                  fontSize="small"
                  sx={{ color: boiBlue, opacity: 0.7 }}
                />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box sx={{ minWidth: 172, flex: "1 1 150px" }}>
        <CustomAutocomplete
          options={typeOptions || []}
          value={type}
          onChange={(_, v) => setType(v ?? (typeOptions?.[0] || "All Types"))}
          label="TYPE OF COMPLAINT"
          InputLabelProps={labelProps}
          textFieldSx={fieldInputSx}
        />
      </Box>
      {showSourceFilter && (
        <Box sx={{ minWidth: 172, flex: "1 1 150px" }}>
          <CustomAutocomplete
            options={sourceOptions || []}
            value={source}
            onChange={(_, v) =>
              setSource(v ?? (sourceOptions?.[0] || "All Sources"))
            }
            label="SOURCE OF COMPLAINT"
            InputLabelProps={labelProps}
            textFieldSx={fieldInputSx}
          />
        </Box>
      )}
      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={<SearchIcon />}
        onClick={handleSearch}
        sx={{ minHeight: 40, px: 2.5, borderRadius: "10px" }}
      >
        Search
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        size="large"
        startIcon={<RestartAltIcon />}
        onClick={handleReset}
        sx={{ minHeight: 40, px: 2.5, borderRadius: "10px" }}
      >
        Reset
      </Button>
    </Box>
  );
}
