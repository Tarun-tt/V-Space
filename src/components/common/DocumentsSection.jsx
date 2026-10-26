import React, { useEffect, useRef } from "react";
import { docmetaDataFields } from "../headerData";

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
    <div className="col-md-6 pl-0">
      <div className="docSec">
        <h2>Documents Type</h2>
        <div className="docScroll scroll-on-hover">
          <div className="formData">
            {docmetaDataFields.map((field, index) => (
              <div
                className={`formBox ${index === 0 ? "active" : ""}`}
                key={field.id}
              >
                <div className="form-check mb-3">
                  <label className="form-check-label">
                    <input
                      type="radio"
                      className="form-check-input"
                      name="optradio"
                      defaultChecked={index === 0}
                      id={`${field.id}-${index}`}
                    />
                    {field.name}
                  </label>
                </div>
                <div className="form-group">
                  <div className="d-flex align-items-center inlineInput">
                    <div className="label mr-2" style={{ minWidth: "60px" }}>
                      Pages:
                    </div>
                    <div className="d-flex flex-grow-1 gap-2">
                      <input
                        type="text"
                        className="form-control"
                        id={field.toField}
                        name={field.toField}
                        value={form[field.toField] || ""}
                        onChange={handleChange}
                        readOnly
                        ref={(el) => {
                          docMetaRefs.current[field.toField] = el;
                          if (el) el.value = form[field.toField] || "";
                        }}
                      />
                      <input
                        type="text"
                        className="form-control mr-2"
                        id={field.fromField}
                        name={field.fromField}
                        value={form[field.fromField] || ""}
                        onChange={handleChange}
                        readOnly
                        ref={(el) => {
                          docMetaRefs.current[field.fromField] = el;
                          if (el) el.value = form[field.fromField] || "";
                        }}
                      />

                      <input
                        type="file"
                        id={field.id}
                        name={field.file}
                        style={{ display: "none" }}
                        onChange={handleChange}
                        ref={(el) => {
                          docMetaRefs.current[field.file] = el;
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsSection;
