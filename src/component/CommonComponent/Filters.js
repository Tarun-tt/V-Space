import React, { useState } from "react";
import { formatDateForInput } from "../headerData";
import SelectInput from "./SelectInput";

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
        .replace(/[^a-zA-Z0-9@&%$#!:";'{}\[\]\(\);\-_\+=,\.?\/|\\`\s]/g, "");
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
      colSize: 3,
      pattern: `[a-zA-Z0-9@&%$#!:";'{}\\[\\]\\(\\);\\-_\+=,\\.\\?/|\\\\\`\\s]*`,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: statusOptions,
      colSize: 2,
    },
    {
      name: "fromDate",
      label: "From Date",
      type: "date",
      max: filters.toDate || formatDateForInput(new Date()),
      colSize: 2,
    },
    {
      name: "toDate",
      label: "To Date",
      type: "date",
      min: filters.fromDate,
      max: formatDateForInput(new Date()),
      colSize: 2,
    },
  ];

  const renderFilterField = (field) => {
    switch (field.type) {
      case "select":
        return (
          <SelectInput
            label={field.label}
            name={field.name}
            value={filters[field.name]}
            onChange={handleChange}
            options={field.options}
          />
        );
      case "date":
        return (
          <div className="form-group">
            <label htmlFor={`${field.name}Filter`}>{field.label}</label>
            <input
              type="date"
              className="form-control"
              id={`${field.name}Filter`}
              name={field.name}
              value={
                filters[field.name]
                  ? formatDateForInput(filters[field.name])
                  : ""
              }
              onChange={handleChange}
              max={field.max}
              min={field.min}
            />
          </div>
        );
      case "text":
        return (
          <div className="form-group">
            <label htmlFor={`${field.name}Filter`}>{field.label}</label>
            <input
              type="text"
              className="form-control"
              id={`${field.name}Filter`}
              name={field.name}
              value={filters[field.name] || ""}
              onChange={handleChange}
              placeholder="Enter search text"
              pattern={field.pattern || "[a-zA-Z0-9@/.\\s-]*"}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-body shadowBox">
        <div className="metaData">
          <div className="d-flex justify-content-between align-items-center">
            <h2>Filters</h2>
            <button
              className="btn  mb-2"
              style={{
                backgroundColor: "#0066B3",
                color: "white",
                borderColor: "#0066B3",
              }}
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? "+" : "-"}
            </button>
          </div>

          <div className={`collapse ${!isCollapsed ? "show" : ""}`}>
            <div className="formData">
              <div className="row">
                {filterFields.map((field) => (
                  <div
                    className={`col-md-${field.colSize} mt-2`}
                    key={field.name}
                  >
                    {renderFilterField(field)}
                  </div>
                ))}

                {/* Action buttons */}
                <div className="col-md-3 mt-2">
                  <div className="d-flex align-items-end h-100">
                    <div className="d-flex gap-2 w-100">
                      <button
                        type="button"
                        className="btn flex-grow-1"
                        onClick={onSearch}
                        style={{
                          backgroundColor: "#0066B3",
                          color: "white",
                          borderColor: "#0066B3",
                        }}
                      >
                        Search
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary flex-grow-1"
                        onClick={onReset}
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
