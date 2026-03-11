import React from "react";

const FieldRenderer = ({ field, value, onChange }) => {
  const { label, name, type, required, disabled, options } = field;

  const handleInputChange = (e) => {
    onChange(name, e.target.value);
  };

  return (
    <div className="form-group">
      <label>
        {label}
        {required && <span className="text-danger">*</span>}
      </label>

      {type === "select" ? (
        <select
          className="form-control"
          name={name}
          value={value || ""}
          onChange={handleInputChange}
          disabled={disabled}
        >
          {(options || []).map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type || "text"}
          className="form-control"
          name={name}
          value={value || ""}
          onChange={handleInputChange}
          disabled={disabled}
        />
      )}
    </div>
  );
};

export default FieldRenderer;
