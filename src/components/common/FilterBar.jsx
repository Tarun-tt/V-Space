import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { formatDateForInput } from "../../pages/VDMS/headerData";
import CustomAutocomplete from "./CustomAutocomplete";
import CustomTextField from "./CustomTextField";
import { boiBlue, boiBorder } from "../../theme/theme";

const Filters = ({
  filters,
  setFilters,
  onSearch,
  onReset,
  statusOptions = [],
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "search") {
      const sanitizedValue = value
        .trimStart()
        .replace(/[^a-zA-Z0-9@&%$#!:";'{}[\]();\-_+=,.?/|\\`\s]/g, "");
      setFilters((prev) => ({ ...prev, [name]: sanitizedValue }));
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  const filterFields = [
    {
      name: "search",
      label: "Search By Text",
      type: "text",
      pattern: "[a-zA-Z0-9@&%$#!:\";'{}\\[\\]();\\-_+=,.?/|\\\\`\\s]*",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: statusOptions,
    },
    {
      name: "fromDate",
      label: "From Date",
      type: "date",
    },
    {
      name: "toDate",
      label: "To Date",
      type: "date",
    },
  ];

  const renderFilterField = (field) => {
    switch (field.type) {
      case "select":
        return (
          <CustomAutocomplete
            label={field.label}
            name={field.name}
            value={filters[field.name] || ""}
            onChange={handleChange}
            options={field.options}
          />
        );
      case "date":
        return (
          <CustomTextField
            type="date"
            label={field.label}
            name={field.name}
            value={
              filters[field.name]
                ? formatDateForInput(filters[field.name])
                : ""
            }
            onChange={handleChange}
          />
        );
      case "text":
        return (
          <CustomTextField
            label={field.label}
            name={field.name}
            value={filters[field.name] || ""}
            onChange={handleChange}
            placeholder="Enter search text"
            pattern={field.pattern}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        mb: 3,
        p: 2.5,
        bgcolor: "#fff",
        borderRadius: "12px",
        border: `1px solid ${boiBorder}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: isCollapsed ? 0 : 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: boiBlue }}>
          Filters
        </Typography>
        <Button
          size="small"
          variant="outlined"
          sx={{
            minWidth: 32,
            px: 1,
            borderRadius: "6px",
            borderColor: boiBorder,
          }}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? "+" : "-"}
        </Button>
      </Box>

      {!isCollapsed && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-end" }}>
          {filterFields.map((field) => (
            <Box
              key={field.name}
              sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 16px)", md: "1 1 200px" } }}
            >
              {renderFilterField(field)}
            </Box>
          ))}

          <Box sx={{ display: "flex", gap: 1, flex: "0 0 auto", mt: { xs: 1, sm: 0 } }}>
            <Button
              variant="contained"
              onClick={onSearch}
              sx={{
                bgcolor: boiBlue,
                color: "#fff",
                textTransform: "none",
                borderRadius: "8px",
                px: 2.5,
              }}
            >
              Search
            </Button>
            <Button
              variant="outlined"
              onClick={onReset}
              sx={{
                borderColor: boiBorder,
                color: "text.secondary",
                textTransform: "none",
                borderRadius: "8px",
                px: 2,
              }}
            >
              Reset
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export { Filters as FilterBar };
export default Filters;
