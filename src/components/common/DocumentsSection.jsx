import React, { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import CustomTextField from "./CustomTextField";
import { docmetaDataFields } from "../../pages/VDMS/headerData";
import { boiBorder } from "../../theme/theme";

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
    <Box sx={{ width: "100%", maxWidth: { md: "50%" }, pl: 0 }}>
      <Box sx={{ p: 2, border: `1px solid ${boiBorder}`, borderRadius: "10px", bgcolor: "#fff" }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Documents Type
        </Typography>
        <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {docmetaDataFields.map((field, index) => (
              <Box
                key={field.id}
                sx={{
                  p: 2,
                  border: `1px solid ${index === 0 ? "primary.main" : boiBorder}`,
                  borderRadius: "8px",
                  bgcolor: index === 0 ? "rgba(0, 114, 206, 0.04)" : "background.paper",
                }}
              >
                <Box sx={{ mb: 1 }}>
                  <FormControlLabel
                    control={
                      <Radio
                        name="optradio"
                        defaultChecked={index === 0}
                        id={`${field.id}-${index}`}
                        size="small"
                      />
                    }
                    label={<Typography sx={{ fontSize: 14, fontWeight: 500 }}>{field.name}</Typography>}
                  />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography sx={{ minWidth: "60px", fontSize: 13, color: "text.secondary" }}>
                    Pages:
                  </Typography>
                  <Box sx={{ display: "flex", flexGrow: 1, gap: 1 }}>
                    <CustomTextField
                      id={field.toField}
                      name={field.toField}
                      value={form[field.toField] || ""}
                      onChange={handleChange}
                      disabled
                      size="small"
                    />
                    <CustomTextField
                      id={field.fromField}
                      name={field.fromField}
                      value={form[field.fromField] || ""}
                      onChange={handleChange}
                      disabled
                      size="small"
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
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentsSection;

