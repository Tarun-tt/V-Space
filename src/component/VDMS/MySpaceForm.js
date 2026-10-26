import React, { useEffect, useRef, useState, useCallback } from "react";
import { submitDocument } from "../apiService";
import TextInput from "../CommonComponent/TextInput";
import SelectInput from "../CommonComponent/SelectInput";
import ActionButton from "../CommonComponent/ActionButtons";
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
} from "../headerData";
import DocumentPreview from "../CommonComponent/DocumentPreview";
import showToast from "../CommonComponent/ToastMessage";
import { useParams, useLocation } from "react-router-dom";

const MySpaceForm = () => {
  const { id } = useParams();
  const location = useLocation();
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const initialFormState = useRef(getInitialFormState());

  // Get data from sessionStorage instead of location.state
  const [parentFolderId, setParentFolderId] = useState("");
  const [documentData, setDocumentData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [form, setForm] = useState({
    ...getInitialFormState(),
    date: new Date().toISOString().split("T")[0],
    uploadedFile: null,
    parentFolderId: "",
  });

  // Retrieve data from sessionStorage on component mount
  useEffect(() => {
    // Get parent folder ID
    const storedParentFolderId = sessionStorage.getItem("parentFolderId");
    if (storedParentFolderId) {
      setParentFolderId(storedParentFolderId);
      setForm((prev) => ({
        ...prev,
        parentFolderId: storedParentFolderId,
      }));
    }

    // Check if in edit mode
    const editMode = sessionStorage.getItem("isEditMode") === "true";
    setIsEditMode(editMode);

    // Get document data if in edit mode
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

    // Clean up sessionStorage after retrieving (optional - keep if needed for page refresh)
    // If you want to clear after navigation, uncomment the following lines
    // return () => {
    //   sessionStorage.removeItem("parentFolderId");
    //   sessionStorage.removeItem("folderId");
    //   sessionStorage.removeItem("isEditMode");
    //   sessionStorage.removeItem("editDocumentData");
    // };
  }, []);

  // Handle page reload prevention (remove the reload logic if not needed)
  useEffect(() => {
    // Remove the automatic reload logic that was causing issues
    // This was previously forcing a page reload on every load
    const formLoaded = sessionStorage.getItem("myspaceFormLoaded");
    if (!formLoaded) {
      sessionStorage.setItem("myspaceFormLoaded", "true");
      // Optionally, you can keep this or remove it
      // window.location.reload();
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
      console.log("Initializing window functions...");
      console.log("Parent Folder ID from sessionStorage:", parentFolderId);

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
        console.log(
          "Document data received from sessionStorage:",
          documentData,
        );

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

        console.log("Populated form:", updatedForm);
        setForm(updatedForm);
        initialFormState.current = updatedForm;

        if (
          window.integrateFile &&
          typeof window.integrateFile === "function"
        ) {
          window.integrateFile(documentData);
          console.log(
            "Called window.integrateFile with document data",
            documentData,
          );
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
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split("T")[0];
    dateInputs.forEach((input) => {
      input.max = today;
    });
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
      console.log("updateDocMetaField called:", {
        name,
        value,
        type: typeof value,
      });

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
      console.log("updateDocMetaFieldDelete called:", { name, value });

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
      console.log("submitData", submitData);

      let folderIdToUse = parentFolderId || "";

      const externalReferenceCode = isEditMode
        ? documentData?.externalReferenceCode
        : null;

      const response = await submitDocument(
        submitData,
        folderIdToUse,
        externalReferenceCode,
      );

      console.log("Submission successful:", response);

      showToast({
        message: isEditMode
          ? "Document updated successfully!"
          : "Document submitted successfully!",
        type: "success",
        title: "Success",
      });

      // Clear sessionStorage after successful submission
      sessionStorage.removeItem("parentFolderId");
      sessionStorage.removeItem("folderId");
      sessionStorage.removeItem("isEditMode");
      sessionStorage.removeItem("editDocumentData");

      setTimeout(() => {
        window.location.href = "/web/vdms//my-space";
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
    <section className="main-section p-4">
      <div className="d-flex justify-content-between mb-2">
        <h1>{isEditMode ? "Edit Document" : "Create New Document"}</h1>
        <button
          className="btn btn-outline"
          style={{
            backgroundColor: "#0066B3",
            color: "white",
            borderColor: "#0066B3",
          }}
          onClick={() => (window.location.href = "/web/vdms/my-space")}
        >
          BACK
        </button>
      </div>

      <div className="shadowBox scrollHeight">
        <div className="row">
          {/* Left Panel */}
          <div className="col-md-4">
            <div className="row">
              {/* Meta Data */}
              <div className="col-md-12">
                <div className="metaData">
                  <h2>Meta Data</h2>

                  {isLoading && (
                    <div className="saving-overlay">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="sr-only">Loading...</span>
                      </div>
                      <p className="mt-2">Loading document data...</p>
                    </div>
                  )}

                  {isSubmitting && (
                    <div className="saving-overlay">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="sr-only">Loading...</span>
                      </div>
                      <p className="mt-2">
                        {isEditMode
                          ? "Updating, please wait..."
                          : "Submitting, please wait..."}
                      </p>
                    </div>
                  )}

                  <div className="formScroll scroll-on-hover">
                    <div className="formData">
                      {metaDataFields.map((field) => (
                        <div className="form-group mt-3" key={field.name}>
                          {field.type === "select" ? (
                            <SelectInput
                              ref={(el) => {
                                if (el) {
                                  docMetaRefs.current[field.name] = el;
                                }
                              }}
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
                              error={errors[field.name]}
                              disabled={isLoading}
                            />
                          ) : (
                            <TextInput
                              ref={(el) => {
                                if (el) {
                                  docMetaRefs.current[field.name] = el;
                                }
                              }}
                              label={field.label}
                              name={field.name}
                              value={form[field.name] || ""}
                              onChange={handleChange}
                              required={field.required}
                              type={field.type}
                              maxLength={field.maxLength}
                              error={errors[field.name]}
                              pattern={field.pattern}
                              errorMessage={field.errorMessage}
                              readOnly={field.readOnly}
                              disabled={isLoading}
                            />
                          )}
                        </div>
                      ))}

                      <div style={{ display: "none" }}>
                        <input
                          ref={fileInputRef}
                          id="file"
                          name="file"
                          type="file"
                          onChange={handleChange}
                          disabled={isLoading || isSubmitting}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="btnWrapper">
              <ul className="pl-0 ml-0 d-flex align-items-center justify-content-between">
                {modifiedActions.map((action, index) => (
                  <li key={index}>
                    <ActionButton {...action} />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <DocumentPreview
            isScanModalOpen={isScanModalOpen}
            closeScanModal={closeScanModal}
            actionsfile={actionsfile}
          />
        </div>
      </div>

      <style jsx>{`
        .alert-sm {
          padding: 8px 12px;
          font-size: 12px;
        }
        .alert-info {
          background-color: #e8f4fd;
          border-color: #b8e1f5;
          color: #0066b3;
          border-radius: 4px;
          margin-bottom: 12px;
          padding: 8px 12px;
          font-size: 13px;
        }
        .form-control[type="file"] {
          padding: 0.375rem 0.75rem;
        }
        .saving-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.9);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 10;
          border-radius: 8px;
        }
        .metaData {
          position: relative;
        }
      `}</style>
    </section>
  );
};

export default MySpaceForm;
