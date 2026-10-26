import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { submitDocument } from "./apiService";
import CustomTextField from "../../components/common/CustomTextField";
import CustomAutocomplete from "../../components/common/CustomAutocomplete";
import ActionButton from "../../components/common/ActionButtons";
import {
  actions as defaultActions,
  actionsfile,
  decisionFields,
  documentOptions,
  getInitialFormState,
  metaDataFields,
  categoryOptions,
  classificationOptions,
  tagOptions,
} from "./headerData";
import DocumentPreview from "../../components/common/DocumentPreview";
import showToast from "../../components/common/ToastMessage";
import { boiBlue, boiBorder } from "../../theme/theme";

const MySpaceForm = () => {
  const navigate = useNavigate();
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const initialFormState = useRef(getInitialFormState());

  const [parentFolderId, setParentFolderId] = useState("");
  const [documentData, setDocumentData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [form, setForm] = useState({
    ...getInitialFormState(),
    date: new Date().toISOString().split("T")[0],
    uploadedFile: null,
    parentFolderId: "",
  });

  useEffect(() => {
    const storedParentFolderId = sessionStorage.getItem("parentFolderId");
    if (storedParentFolderId) {
      setParentFolderId(storedParentFolderId);
      setForm((prev) => ({
        ...prev,
        parentFolderId: storedParentFolderId,
      }));
    }

    const editMode = sessionStorage.getItem("isEditMode") === "true";
    setIsEditMode(editMode);

    if (editMode) {
      const storedDocumentData = sessionStorage.getItem("editDocumentData");
      if (storedDocumentData) {
        try {
          const parsedData = JSON.parse(storedDocumentData);
          setDocumentData(parsedData);
        } catch (error) {
          console.error("Error parsing document data:", error);
        }
      }
    }
  }, []);

  useEffect(() => {
    const formLoaded = sessionStorage.getItem("myspaceFormLoaded");
    if (!formLoaded) {
      sessionStorage.setItem("myspaceFormLoaded", "true");
    }

    return () => {
      setTimeout(() => {
        sessionStorage.removeItem("myspaceFormLoaded");
      }, 10);
    };
  }, []);

  const optionsMap = {
    documentOptions: documentOptions,
    categoryOptions: categoryOptions,
    classificationOptions: classificationOptions,
    tagOptions: tagOptions,
  };

  useEffect(() => {
    if (!isInitialized) {
      window.currentParentFolderId = parentFolderId;
      setIsInitialized(true);
    }
  }, [isInitialized, parentFolderId]);

  const [errors, setErrors] = useState({});
  const [isScanModalOpen, setScanModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const docMetaRefs = useRef({});
  const fileInputRef = useRef(null);

  const parseDescriptionMetadata = (description) => {
    if (!description) return null;
    try {
      let parsedData;
      if (typeof description === "string") {
        parsedData = JSON.parse(description);
      } else {
        parsedData = description;
      }

      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData[0];
      }
      return parsedData;
    } catch (error) {
      console.error("Error parsing description:", error);
      return null;
    }
  };

  useEffect(() => {
    if (isEditMode && documentData) {
      setIsLoading(true);
      try {
        const metadata = parseDescriptionMetadata(documentData.description);

        let formattedDate = "";
        if (metadata?.date) {
          formattedDate = metadata.date;
        } else if (documentData.modifiedDate) {
          const date = new Date(documentData.modifiedDate);
          if (!isNaN(date.getTime())) {
            formattedDate = date.toISOString().split("T")[0];
          }
        }

        const updatedForm = {
          fileName: documentData.fileName || documentData.name || "",
          fileTitle: documentData.title || metadata?.fileTitle || "",
          docType: metadata?.docType || "",
          cateType: metadata?.category || "",
          classType: metadata?.classification || "",
          tagsType: metadata?.tags || "",
          keyword: metadata?.keyword || "",
          decision: metadata?.decision || "",
          date: formattedDate || new Date().toISOString().split("T")[0],
          uploadedFile: null,
          parentFolderId: parentFolderId,
        };

        setForm(updatedForm);
        initialFormState.current = updatedForm;

        if (window.integrateFile && typeof window.integrateFile === "function") {
          window.integrateFile(documentData);
        }

        showToast({
          message: `Editing: ${documentData.fileName || documentData.name}`,
          type: "info",
          title: "Edit Mode",
          autoClose: 3000,
        });
      } catch (error) {
        console.error("Error populating form:", error);
        showToast({
          message: "Failed to load document data",
          type: "danger",
          title: "Error",
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [isEditMode, documentData, parentFolderId]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    const trimmedValue = typeof value === "string" ? value.trimStart() : value;

    if (name.includes(".")) {
      const [parent, field] = name.split(".");
      setForm((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [field]: trimmedValue },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: trimmedValue }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const handleManualUpdate = useCallback((name, value) => {
    if (name.includes(".")) {
      const [parent, field] = name.split(".");
      setForm((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [field]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  useEffect(() => {
    const hasChanges =
      JSON.stringify(form) !== JSON.stringify(initialFormState.current);
    setIsDirty(hasChanges);
  }, [form]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty && !isSubmitting) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty, isSubmitting]);

  useEffect(() => {
    window.updateDocMetaField = (name, value) => {
      if (name === "file") {
        if (value instanceof Blob || value instanceof File) {
          let fileName = value.name || "scanned_document";

          if (
            !fileName.toLowerCase().endsWith(".tif") &&
            !fileName.toLowerCase().endsWith(".tiff")
          ) {
            fileName = fileName.replace(/\.[^/.]+$/, "") + ".tif";
          }

          const file = new File([value], fileName, {
            type: value.type || "image/tiff",
            lastModified: Date.now(),
          });

          setForm((prev) => ({
            ...prev,
            uploadedFile: file,
            fileName: prev.fileName || fileName.replace(/\.[^/.]+$/, ""),
          }));

          setErrors((prev) => ({ ...prev, file: "" }));

          showToast({
            message: `File loaded: ${fileName}`,
            type: "success",
            title: "File Loaded",
            autoClose: 2000,
          });
        } else {
          handleManualUpdate(name, value);
        }
      } else {
        handleManualUpdate(name, value);
      }

      const element = docMetaRefs.current[name];
      if (element && element.type !== "file") {
        element.value = value || "";
      }
    };

    window.updateDocMetaFieldDelete = (name, value) => {
      if (name === "file") {
        setForm((prev) => ({
          ...prev,
          uploadedFile: null,
        }));

        showToast({
          message: "File removed",
          type: "info",
          title: "File Removed",
          autoClose: 1500,
        });
      } else {
        handleManualUpdate(name, value);
      }

      const element = docMetaRefs.current[name];
      if (element && element.type !== "file") {
        element.value = value || "";
      }
    };

    return () => {
      window.updateDocMetaField = undefined;
      window.updateDocMetaFieldDelete = undefined;
      window.importFromHDD = undefined;
    };
  }, [handleManualUpdate]);

  useEffect(() => {
    window.updateFormField = (name, value) => {
      const event = { target: { name, value } };
      handleChange(event);
    };
    window.setScanModalOpen = setScanModalOpen;

    return () => {
      delete window.updateFormField;
      delete window.setScanModalOpen;
    };
  }, [handleChange]);

  const validateForm = (showErrors = false) => {
    const missingFields = [];
    const newErrors = {};

    const allFields = [...metaDataFields, ...decisionFields];

    allFields.forEach((field) => {
      if (field.required) {
        const value = field.name.includes(".")
          ? form?.[field.name.split(".")[0]]?.[field.name.split(".")[1]]
          : form?.[field.name];

        if (!value || value.toString().trim() === "") {
          missingFields.push(field.label);
          if (showErrors) {
            newErrors[field.name] = `${field.label} is required`;
          }
        }
      }
    });

    if (showErrors) {
      setErrors(newErrors);
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
      errors: newErrors,
    };
  };

  const closeScanModal = () => {
    setScanModalOpen(false);
  };

  const prepareSubmitFormData = () => {
    const metadataArray = [
      {
        docType: form.docType || "",
        category: form.cateType || "",
        tags: form.tagsType || "",
        classification: form.classType || "",
        keyword: form.keyword || "",
        fileName: form.fileName || "",
        fileTitle: form.fileTitle || "",
        date: form.date || "",
        decision: form.decision || "",
      },
    ];

    let fileName = form.fileName || "";
    if (
      form.uploadedFile &&
      fileName &&
      !fileName.toLowerCase().endsWith(".tif")
    ) {
      fileName = fileName + ".tif";
    }

    const submitData = {
      title: form.fileTitle || form.fileName || "Untitled",
      description: JSON.stringify(metadataArray),
      fileName: fileName,
      datePublished: form.date
        ? new Date(form.date).toISOString()
        : new Date().toISOString(),

      ...(form.dateExpired && {
        dateExpired: new Date(form.dateExpired).toISOString(),
      }),

      file: form.uploadedFile || null,

      keywords: [],
    };

    if (form.keyword && form.keyword.trim()) {
      if (form.keyword.includes(",")) {
        submitData.keywords = form.keyword
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k);
      } else {
        submitData.keywords = [form.keyword.trim()];
      }
    }

    return submitData;
  };

  const handleSubmit = async () => {
    try {
      const validation = validateForm(true);
      if (!validation.isValid) {
        showToast({
          message: `Please fill the following required fields: ${validation.missingFields.join(", ")}`,
          type: "danger",
          title: "Validation Error",
          autoClose: 6000,
        });
        return;
      }

      setIsSubmitting(true);

      const submitData = prepareSubmitFormData();
      let folderIdToUse = parentFolderId || "";

      const externalReferenceCode = isEditMode
        ? documentData?.externalReferenceCode
        : null;

      await submitDocument(
        submitData,
        folderIdToUse,
        externalReferenceCode,
      );

      showToast({
        message: isEditMode
          ? "Document updated successfully!"
          : "Document submitted successfully!",
        type: "success",
        title: "Success",
      });

      sessionStorage.removeItem("parentFolderId");
      sessionStorage.removeItem("folderId");
      sessionStorage.removeItem("isEditMode");
      sessionStorage.removeItem("editDocumentData");

      setTimeout(() => {
        navigate("/myspace");
      }, 1000);
    } catch (error) {
      console.error("Submit error:", error);
      showToast({
        message:
          `${isEditMode ? "Update" : "Submission"} failed! ` +
          (error.message || ""),
        type: "danger",
        title: "Error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const modifiedActions = defaultActions
    .map((action) => {
      if (action.label === "Save") {
        return null;
      }
      if (action.label === "Scan") {
        return {
          ...action,
          onClick: () => {
            if (typeof window.setScanModalOpen === "function") {
              window.setScanModalOpen(true);
            }
          },
        };
      }
      if (action.label === "Import Files") {
        return {
          ...action,
          onClick: () => {
            window.importFromHDD?.();
          },
        };
      }
      if (action.label === "Submit") {
        return {
          ...action,
          label: isSubmitting
            ? isEditMode
              ? "Updating..."
              : "Submitting..."
            : isEditMode
              ? "Update"
              : "Submit",
          disabled: isSubmitting,
          onClick: handleSubmit,
        };
      }
      return action;
    })
    .filter(Boolean);

  return (
    <Box component="section" sx={{ p: 3, width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: boiBlue }}>
          {isEditMode ? "Edit Document" : "Create New Document"}
        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: boiBlue,
            color: "white",
            borderRadius: "8px",
            textTransform: "none",
          }}
          onClick={() => navigate("/myspace")}
        >
          BACK
        </Button>
      </Box>

      <Box
        sx={{
          p: 3,
          bgcolor: "#fff",
          borderRadius: "12px",
          border: `1px solid ${boiBorder}`,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {/* Left Panel */}
          <Box sx={{ flex: { xs: "1 1 100%", md: "0 0 38%" } }}>
            <Box sx={{ position: "relative" }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: boiBlue }}>
                Meta Data
              </Typography>

              {isLoading && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bgcolor: "rgba(255,255,255,0.85)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                    borderRadius: "8px",
                  }}
                >
                  <CircularProgress size={36} sx={{ color: boiBlue, mb: 1 }} />
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    Loading document data...
                  </Typography>
                </Box>
              )}

              {isSubmitting && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bgcolor: "rgba(255,255,255,0.85)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                    borderRadius: "8px",
                  }}
                >
                  <CircularProgress size={36} sx={{ color: boiBlue, mb: 1 }} />
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    {isEditMode
                      ? "Updating, please wait..."
                      : "Submitting, please wait..."}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {metaDataFields.map((field) => (
                  <Box key={field.name}>
                    {field.type === "select" ? (
                      <CustomAutocomplete
                        label={field.label}
                        name={field.name}
                        value={
                          field.name.includes(".")
                            ? form?.[field.name.split(".")[0]]?.[
                                field.name.split(".")[1]
                              ] || ""
                            : form?.[field.name] || ""
                        }
                        options={optionsMap[field.optionsKey] || []}
                        onChange={handleChange}
                        required={field.required}
                        error={!!errors[field.name]}
                        helperText={errors[field.name]}
                        disabled={isLoading}
                      />
                    ) : (
                      <CustomTextField
                        label={field.label}
                        name={field.name}
                        value={form[field.name] || ""}
                        onChange={handleChange}
                        required={field.required}
                        type={field.type}
                        maxLength={field.maxLength}
                        error={errors[field.name]}
                        pattern={field.pattern}
                        helperText={errors[field.name]}
                        readOnly={field.readOnly}
                        disabled={isLoading}
                      />
                    )}
                  </Box>
                ))}

                <Box sx={{ display: "none" }}>
                  <input
                    ref={fileInputRef}
                    id="file"
                    name="file"
                    type="file"
                    onChange={handleChange}
                    disabled={isLoading || isSubmitting}
                  />
                </Box>
              </Box>
            </Box>

            <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${boiBorder}` }}>
              <Box
                component="ul"
                sx={{
                  p: 0,
                  m: 0,
                  listStyle: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                {modifiedActions.map((action, index) => (
                  <Box component="li" key={index}>
                    <ActionButton {...action} />
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Right Panel: DocumentPreview */}
          <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 58%" } }}>
            <DocumentPreview
              isScanModalOpen={isScanModalOpen}
              closeScanModal={closeScanModal}
              actionsfile={actionsfile}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MySpaceForm;
