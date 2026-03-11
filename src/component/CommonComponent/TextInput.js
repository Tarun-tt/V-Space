import { useState, useEffect } from "react";

const TextInput = ({
  label,
  name,
  value,
  onChange,
  required = false,
  disabled = false,
  readOnly = false,
  type = "text",
  pattern,
  errorMessage = "Invalid input",
  placeholder,
  isDigit = false,
  className = "form-control",
  maxLength,
  error,
}) => {
  const [localError, setLocalError] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched && value) {
      validateInput(value);
    }
  }, [value, touched]);

  const validateInput = (inputValue) => {
    if (!pattern) return true;

    const regex = new RegExp(pattern);
    const isValid = regex.test(inputValue);

    if (!isValid) {
      setLocalError(errorMessage);
      return false;
    } else {
      setLocalError("");
      return true;
    }
  };

  const handleChange = (e) => {
    if (readOnly) return;

    let newValue = e.target.value;

    if (isDigit) {
      newValue = newValue.replace(/[^\d]/g, "");
    }

    if (pattern) {
      const regex = new RegExp(pattern);
      if (newValue && !regex.test(newValue)) {
        return;
      }
    }

    onChange({
      target: {
        name,
        value: newValue,
      },
    });
  };

  const handleBlur = () => {
    setTouched(true);
    if (value && pattern) {
      validateInput(value);
    }
  };

  return (
    <div className="form-group">
      <label>
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </label>
      <input
        type={type}
        className={`${className} ${error || localError ? "is-invalid" : ""}`}
        name={name}
        value={value || ""}
        onChange={handleChange}
        onBlur={handleBlur}
        readOnly={readOnly}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        pattern={pattern}
      />
      {(error || localError) && (
        <div className="invalid-feedback">{error || localError}</div>
      )}
    </div>
  );
};

export default TextInput;
