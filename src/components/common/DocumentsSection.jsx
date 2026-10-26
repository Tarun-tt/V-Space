import React, { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import CustomTextField from "./CustomTextField";
import { docmetaDataFields } from "../../pages/VDMS/headerData";

const DocumentsSection = ({ form, handleChange }) => {
  const docMetaRefs = useRef({});

  const handleManualUpdate = (name, value) => {
    const event = {
      target: { name, value },
    };
    handleChange(event);
  };

  useEffect(() => {
    window.updateDocMetaField = (name, value) => {
      handleManualUpdate(name, value);
      const element = docMetaRefs.current[name];
      if (element && element.type !== "file") {
        element.value = value || "";
      }
    };
    window.updateDocMetaFieldDelete = (name, value) => {
      handleManualUpdate(name, value);
      const element = docMetaRefs.current[name];
      if (element && element.type !== "file") {
        element.value = value || "";
      }
    };
    return () => {
      window.updateDocMetaField = undefined;
      window.updateDocMetaFieldDelete = undefined;
    };
  }, [handleChange]);

  useEffect(() => {
    docmetaDataFields.forEach((field) => {
      const fromRef = docMetaRefs.current[field.fromField];
      const toRef = docMetaRefs.current[field.toField];
      if (fromRef) fromRef.value = form[field.fromField] || "";
      if (toRef) toRef.value = form[field.toField] || "";
    });
  }, [form]);

  return (
    <Box className="col-md-6 pl-0">
      <Box className="docSec">
        <Typography component="h2" variant="h6">
          Documents Type
        </Typography>
        <Box className="docScroll scroll-on-hover">
          <Box className="formData">
            {docmetaDataFields.map((field, index) => (
              <Box
                className={`formBox ${index === 0 ? "active" : ""}`}
                key={field.id}
              >
                <Box className="form-check mb-3">
                  <FormControlLabel
                    control={
                      <Radio
                        name="optradio"
                        defaultChecked={index === 0}
                        id={`${field.id}-${index}`}
                        size="small"
                        className="form-check-input"
                        sx={{ "&.Mui-checked": { color: "#f54220" } }}
                      />
                    }
                    label={
                      <Typography component="span" sx={{ fontSize: 14 }}>
                        {field.name}
                      </Typography>
                    }
                    className="form-check-label"
                  />
                </Box>
                <Box className="form-group">
                  <Box className="d-flex align-items-center inlineInput">
                    <Box className="label mr-2" sx={{ minWidth: "60px" }}>
                      Pages:
                    </Box>
                    <Box className="d-flex flex-grow-1 gap-2">
                      <CustomTextField
                        id={field.toField}
                        name={field.toField}
                        value={form[field.toField] || ""}
                        onChange={handleChange}
                        readOnly
                        size="small"
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          "& .MuiOutlinedInput-root": { height: 30 },
                        }}
                        inputRef={(el) => {
                          docMetaRefs.current[field.toField] = el;
                        }}
                      />
                      <CustomTextField
                        id={field.fromField}
                        name={field.fromField}
                        value={form[field.fromField] || ""}
                        onChange={handleChange}
                        readOnly
                        size="small"
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          "& .MuiOutlinedInput-root": { height: 30 },
                        }}
                        inputRef={(el) => {
                          docMetaRefs.current[field.fromField] = el;
                        }}
                      />
                      <Box
                        component="input"
                        type="file"
                        id={field.id}
                        name={field.file}
                        sx={{ display: "none" }}
                        onChange={handleChange}
                        ref={(el) => {
                          docMetaRefs.current[field.file] = el;
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentsSection;
