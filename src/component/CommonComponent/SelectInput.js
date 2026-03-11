const SelectInput = ({
  label,
  name,
  value,
  options,
  onChange,
  required = false,
  disabled = false,
  readonly = false,
  error,
}) => {
  const formattedOptions =
    options && options.length > 0
      ? options.map((opt) =>
          typeof opt === "object" ? opt : { label: opt, value: opt }
        )
      : [];

  return (
    <div className="form-group">
      <label>
        {label}
        {required && <span className="text-danger">*</span>}
      </label>
      <select
        className={`form-control ${error ? "is-invalid" : ""}`}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled || readonly}
        required={required}
      >
        {formattedOptions.map((opt, i) => (
          <option key={i} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default SelectInput;
