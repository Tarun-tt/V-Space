import React, { useEffect, useRef, useState } from "react";
import {
  exportAccountOpeningForm,
  getRequestAccountDetails,
  requestAccountPre,
  submitAccountOpeningForm,
} from "../apiService";
import TextInput from "../CommonComponent/TextInput";
import SelectInput from "../CommonComponent/SelectInput";
import ActionButton from "../CommonComponent/ActionButtons";
import {
  actions as defaultActions,
  actionsfile,
  additionalDocumentFields,
  decisionFields,
  documentOptions,
  getInitialFormState,
  metaDataFields,
  MtOptions,
} from "../headerData";
import DocumentPreview from "../CommonComponent/DocumentPreview";
import DocumentsSection from "../CommonComponent/DocumentsSection";
import showToast from "../CommonComponent/ToastMessage";
import { useParams } from "react-router-dom";

/* global importFromHDD */
/* global uploadFileToDMS */
const FBDOpenning = () => {
  const { id } = useParams();
  const [isDirty, setIsDirty] = useState(false);
  const initialFormState = useRef(getInitialFormState());
  const [form, setForm] = useState({
    ...getInitialFormState(),
    date: new Date().toISOString().split("T")[0],
  });
  const optionsMap = {
    MtOptions: MtOptions,
  };
  useEffect(() => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split("T")[0];

    dateInputs.forEach((input) => {
      input.max = today;
    });
  }, []);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const initializeForm = async () => {
      if (id) {
        try {
          const response = await getRequestAccountDetails(id);
          if (response.data) {
            populateFormFromResponse(response);
            if (typeof window.integrateFile === "function") {
              window.integrateFile(response);
            } else {
              console.warn("window.integrateFile is not defined");
            }
          }
        } catch (error) {
          console.error("Error fetching on page load:", error);
        }
      } else {
        try {
          const response = await requestAccountPre();
          setForm((prev) => ({
            ...getInitialFormState(),
            date: new Date().toISOString().split("T")[0],
            nbgCode: response.nbgCode || "",
            zone: response.zoneName || "",
            branchCode: response.branch || "",
          }));
        } catch (error) {
          console.error("Error in requestAccountPre:", error);
        }
      }
    };

    initializeForm();
  }, [id]);
  useEffect(() => {
    const hasChanges =
      JSON.stringify(form) !== JSON.stringify(initialFormState.current);
    setIsDirty(hasChanges);
  }, [form]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const handleChange = (e) => {
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
  };
  useEffect(() => {
    window.updateFormField = (name, value) => {
      const event = { target: { name, value } };
      handleChange(event);
    };
    return () => {
      delete window.updateFormField;
    };
  }, [handleChange]);

  const validateForm = (showErrors = false) => {
    const missingFields = [];
    const newErrors = {};

    const allFields = [
      ...metaDataFields,
      ...additionalDocumentFields,
      ...decisionFields,
    ];

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
  const styles = `
  .is-invalid {
    border-color: #dc3545 !important;
    background-color: #fff5f5 !important;
  }
  
  .invalid-feedback {
    color: #dc3545;
    font-size: 0.875em;
    margin-top: 0.25rem;
  }
  
  .btn-save-draft {
    background-color: #6c757d;
    border-color: #6c757d;
    color: white;
  }
  
  .btn-save-draft:hover {
    background-color: #5a6268;
    border-color: #545b62;
    color: white;
  }
  
  .saving-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .saving-overlay p {
    font-size: 1.2rem;
    font-weight: 500;
  }
`;

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  const [isScanModalOpen, setScanModalOpen] = useState(false);

  const closeScanModal = () => {
    setScanModalOpen(false);
  };

  const acquireImage = () => {
    setScanModalOpen(true);
  };

  const [isSaving, setIsSaving] = useState(false);
  // const modifiedActions = defaultActions
  //   .map((action) => {
  //     if (action.label === "Save" && form.actions?.length > 0) {
  //       return null;
  //     }

  //     if (action.label === "Save") {
  //       return {
  //         ...action,
  //         label: isSaving ? "Saving As Draft..." : "Save As Draft",
  //         icon: isSaving ? null : action.icon,
  //         disabled: isSaving,
  //         onClick: () => {
  //           const validation = validateForm(true);
  //           if (!validation.isValid) {
  //             showToast({
  //               message:
  //                 "Form saved as draft, but some required fields are missing",
  //               type: "warning",
  //               title: "Validation Warning",
  //               autoClose: 6000,
  //             });
  //           }
  //           submitFormData(true);
  //         },
  //       };
  //     }
  //     if (action.label === "Scan") {
  //       return {
  //         ...action,
  //         onClick: acquireImage,
  //       };
  //     }
  //     return action;
  //   })
  //   .filter(Boolean);
  const modifiedActions = defaultActions
    .map((action) => {
      // Show Save button only when:
      // 1. There's NO ID (new form) AND no API actions, OR
      // 2. When ID exists AND status is "draft"
      if (action.label === "Save") {
        const shouldShowSave =
          (!id && !form.actions?.length) || // New form without API actions
          (id && form.status?.toLowerCase() === "draft"); // Existing form with draft status

        if (!shouldShowSave) {
          return null; // Hide Save when conditions not met
        }
        return {
          ...action,
          label: isSaving ? "Saving As Draft..." : "Save As Draft",
          icon: isSaving ? null : action.icon,
          disabled: isSaving,
          onClick: () => {
            const validation = validateForm(true);
            if (!validation.isValid) {
              showToast({
                message:
                  "Form saved as draft, but some required fields are missing",
                type: "warning",
                title: "Validation Warning",
                autoClose: 6000,
              });
            }
            submitFormData(true);
          },
        };
      }
      if (action.label === "Scan") {
        return {
          ...action,
          onClick: acquireImage,
        };
      }
      return action;
    })
    .filter(Boolean);

  const mapFormToRequestBody = () => {
    return {
      ...form,
      documentDetailedFile: form.documentDetailedFile,
    };
  };
  const formatDateFromTimestamp = (timestamp) => {
    if (!timestamp) return "";

    if (typeof timestamp === "string" && timestamp.includes("T")) {
      return timestamp.split("T")[0];
    }

    const date = new Date(Number(timestamp));
    return date.toISOString().split("T")[0];
  };

  const populateFormFromResponse = (responseData) => {
    const data = responseData.data || responseData;

    let documentFileData = {};
    try {
      documentFileData = data.documentFile ? JSON.parse(data.documentFile) : {};
    } catch (e) {
      console.error("Error parsing documentFile:", e);
    }

    const updatedForm = {
      ...getInitialFormState(),

      date: data.date ? formatDateFromTimestamp(data.date) : "",
      branchCode: data.branchCode || "",
      zone: data.zone || "",
      nbgCode: data.nbgCode || "",
      finacleReferenceNo: data.finacleReferenceNo || "",
      mtType: data.mtType || "",
      documentDetailedTo: data.documentDetailedTo || "",
      documentDetailedFrom: data.documentDetailedFrom || "",
      documentDetailedFile: data.documentDetailedFile || "",
      entryId: data.entryId || data.c_fbddmsId || "",
      status: data.status || "",

      decision: data.decision || "",
    };

    if (data.actions && data.actions.length > 0) {
      updatedForm.actions = data.actions.map((action) => ({
        transitionId: action.transitionId,
        workflowTaskId: action.workflowTaskId,
        actionName: action.actionName.trim(),
      }));
    } else {
      updatedForm.actions = [];
    }

    setForm(updatedForm);
  };

  // const submitFormData = async (isDraft = false) => {
  //   try {
  //     setIsSaving(true);

  //     if (!isDraft) {
  //       const validation = validateForm(true);
  //       if (!validation.isValid) {
  //         showToast({
  //           message: `Please fill the following required fields: ${validation.missingFields.join(
  //             ", "
  //           )}`,
  //           type: "danger",
  //           title: "Validation Error",
  //           autoClose: 6000,
  //         });
  //         setIsSaving(false);
  //         return;
  //       }
  //     }

  //     const requestBody = mapFormToRequestBody();
  //     if (form.entryId || id) {
  //       requestBody.entryId = form.entryId || id;
  //     }

  //     const response = await submitAccountOpeningForm(requestBody);
  //     if (response.data?.entryId && !form.entryId) {
  //       setForm((prev) => ({
  //         ...prev,
  //         entryId: response.data.entryId,
  //       }));
  //     }

  //     if (isDraft) {
  //       showToast({
  //         message: "Form saved as draft successfully!",
  //         type: "success",
  //         title: "Draft Saved",
  //         autoClose: 3000,
  //       });
  //     } else if (response.success) {
  //       showToast({
  //         message: response?.customMessage || "Form submitted successfully!",
  //         type: "success",
  //         title: "Success",
  //       });
  //     }

  //     setForm((prev) => ({
  //       ...prev,
  //     }));
  //   } catch (error) {
  //     console.error("Submission error:", error);
  //     showToast({
  //       message: isDraft ? "Draft save failed!" : "Submission failed!",
  //       type: "danger",
  //       title: "Error",
  //     });
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  const submitFormData = async (isDraft = false) => {
    try {
      setIsSaving(true);

      if (!isDraft) {
        const validation = validateForm(true);
        if (!validation.isValid) {
          showToast({
            message: `Please fill the following required fields: ${validation.missingFields.join(
              ", "
            )}`,
            type: "danger",
            title: "Validation Error",
            autoClose: 6000,
          });
          setIsSaving(false);
          return;
        }
      }

      const requestBody = mapFormToRequestBody();
      if (form.entryId || id) {
        requestBody.entryId = form.entryId || id;
      }

      const response = await submitAccountOpeningForm(requestBody);

      // Check for file size limit error
      if (
        response &&
        response.responseId === 406 &&
        response.data &&
        response.data.Error
      ) {
        const errorMessage = response.data.Error;
        showToast({
          message: errorMessage,
          type: "danger",
          title: "File Size Limit Exceeded",
          autoClose: 6000,
        });
        setIsSaving(false);
        return;
      }

      if (response.data?.entryId && !form.entryId) {
        setForm((prev) => ({
          ...prev,
          entryId: response.data.entryId,
        }));
      }

      if (isDraft) {
        showToast({
          message: "Form saved as draft successfully!",
          type: "success",
          title: "Draft Saved",
          autoClose: 3000,
        });
      } else if (response.success) {
        showToast({
          message: response?.customMessage || "Form submitted successfully!",
          type: "success",
          title: "Success",
        });
      }

      setForm((prev) => ({
        ...prev,
      }));
    } catch (error) {
      console.error("Submission error:", error);

      // Check if error has file size limit response
      if (error.response && error.response.data && error.response.data.Error) {
        showToast({
          message: error.response.data.Error,
          type: "danger",
          title: "Submission Error",
          autoClose: 6000,
        });
      } else {
        showToast({
          message: isDraft ? "Draft save failed!" : "Submission failed!",
          type: "danger",
          title: "Error",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };
  const [isExporting, setIsExporting] = useState(false);
  // const modifiedFileActions = actionsfile.map((action) => {
  //   if (action.label === "Export" && form.actions?.length > 0) {
  //     const apiAction = form.actions[0];
  //     return {
  //       ...action,
  //       label: apiAction.actionName,
  //       className: "btn btn-save mt-2",
  //       disabled: !form.entryId && !id,
  //       onClick: () => {
  //         if (!validateForm()) return;
  //         exportFormData(apiAction.transitionId, apiAction.workflowTaskId);
  //       },
  //     };
  //   }

  //   if (action.label === "Export") {
  //     return {
  //       ...action,
  //       label: isExporting ? "Submitting..." : "Submit",
  //       icon: isExporting ? null : action.icon,
  //       disabled: isExporting || (!form.entryId && !id),
  //       onClick: () => {
  //         if (!validateForm()) return;
  //         exportFormData();
  //       },
  //     };
  //   }
  //   return action;
  // });
  const modifiedFileActions = actionsfile
    .map((action) => {
      if (action.label === "Export") {
        // Show API action button when actions exist from API and actionName is present
        if (form.actions?.length > 0 && form.actions[0]?.actionName) {
          const apiAction = form.actions[0];
          return {
            ...action,
            label: apiAction.actionName,
            className: "btn btn-save mt-2",
            disabled: !form.entryId && !id,
            onClick: () => {
              if (!validateForm()) return;
              exportFormData(apiAction.transitionId, apiAction.workflowTaskId);
            },
          };
        }
        // Show regular Export/Submit button when:
        // 1. No ID (new form) OR
        // 2. When API actions exist but no actionName OR
        // 3. When ID exists AND status is "draft"
        else if (
          !id ||
          (form.actions?.length > 0 && !form.actions[0]?.actionName) ||
          (id && form.status?.toLowerCase() === "draft")
        ) {
          return {
            ...action,
            label: isExporting ? "Submitting..." : "Submit",
            icon: isExporting ? null : action.icon,
            disabled: isExporting || (!form.entryId && !id),
            onClick: () => {
              if (!validateForm()) return;
              exportFormData();
            },
          };
        }
        // Hide Export button when ID exists but no valid API actions and status is not draft
        else {
          return null;
        }
      }
      return action;
    })
    .filter(Boolean);
  // const filteredActions =
  //   form.actions?.length > 0
  //     ? modifiedActions.filter((action) => action.label !== "Save")
  //     : modifiedActions;
  const filteredActions = modifiedActions.filter((action) => action !== null);
  // const exportFormData = async (transitionId, workflowTaskId) => {
  //   try {
  //     const validation = validateForm(true);

  //     if (!validation.isValid) {
  //       showToast({
  //         message: `Please fill the following required fields: ${validation.missingFields.join(
  //           ", "
  //         )}`,
  //         type: "danger",
  //         title: "Validation Error",
  //         autoClose: 6000,
  //       });
  //       setIsExporting(false);
  //       return;
  //     }

  //     setIsExporting(true);
  //     const entryIdToUse = form.entryId || id;

  //     const requestBody = mapFormToRequestBody();
  //     requestBody.entryId = entryIdToUse;

  //     if (transitionId && workflowTaskId) {
  //       requestBody.transitionId = transitionId;
  //       requestBody.workflowTaskId = workflowTaskId;
  //     }

  //     if (form.urn) {
  //       requestBody.urn = form.urn;
  //     }

  //     const response = await exportAccountOpeningForm(requestBody);

  //     if (response) {
  //       showToast({
  //         message: "Document exported successfully!",
  //         type: "success",
  //         title: "Success",
  //       });

  //       if (response instanceof Blob) {
  //         const url = window.URL.createObjectURL(response);
  //         const a = document.createElement("a");
  //         a.href = url;
  //         a.download = "exported-document.pdf";
  //         document.body.appendChild(a);
  //         a.click();
  //         window.URL.revokeObjectURL(url);
  //         document.body.removeChild(a);
  //       }
  //       window.location.href = `/web/boi-dms/fbd-table`;
  //     }
  //   } catch (error) {
  //     showToast({
  //       message: "Export failed! " + (error.message || ""),
  //       type: "danger",
  //       title: "Error",
  //     });
  //   } finally {
  //     setIsExporting(false);
  //   }
  // };
  const exportFormData = async (transitionId, workflowTaskId) => {
    try {
      const validation = validateForm(true);

      if (!validation.isValid) {
        showToast({
          message: `Please fill the following required fields: ${validation.missingFields.join(
            ", "
          )}`,
          type: "danger",
          title: "Validation Error",
          autoClose: 6000,
        });
        setIsExporting(false);
        return;
      }

      setIsExporting(true);
      const entryIdToUse = form.entryId || id;

      const requestBody = mapFormToRequestBody();
      requestBody.entryId = entryIdToUse;

      if (transitionId && workflowTaskId) {
        requestBody.transitionId = transitionId;
        requestBody.workflowTaskId = workflowTaskId;
      }

      if (form.urn) {
        requestBody.urn = form.urn;
      }

      const response = await exportAccountOpeningForm(requestBody);

      // Check for file size limit error
      if (
        response &&
        response.responseId === 406 &&
        response.data &&
        response.data.Error
      ) {
        const errorMessage = response.data.Error;
        showToast({
          message: errorMessage,
          type: "danger",
          title: "File Size Limit Exceeded",
          autoClose: 6000,
        });
        setIsExporting(false);
        return;
      }

      if (response) {
        showToast({
          message: "Document exported successfully!",
          type: "success",
          title: "Success",
        });

        if (response instanceof Blob) {
          const url = window.URL.createObjectURL(response);
          const a = document.createElement("a");
          a.href = url;
          a.download = "exported-document.pdf";
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
        window.location.href = `/web/boi-dms/fbd-table`;
      }
    } catch (error) {
      console.error("Export error:", error);

      // Check if error has file size limit response
      if (error.response && error.response.data && error.response.data.Error) {
        showToast({
          message: error.response.data.Error,
          type: "danger",
          title: "Export Error",
          autoClose: 6000,
        });
      } else {
        showToast({
          message: "Export failed! " + (error.message || ""),
          type: "danger",
          title: "Error",
        });
      }
    } finally {
      setIsExporting(false);
    }
  };
  return (
    <section className="main-section p-4">
      <h1>FBD Opening</h1>
      <div className="shadowBox scrollHeight">
        <div className="row">
          {/* Left Panel */}
          <div className="col-md-7">
            <div className="row">
              {/* Meta Data */}
              <div className="col-md-6">
                <div className="metaData">
                  <h2>Meta Data</h2>
                  {(isSaving || isExporting) && (
                    <div className="saving-overlay">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="sr-only">Saving...</span>
                      </div>
                      <p className="mt-2">
                        {isSaving && "Saving As Draft, please wait..."}
                        {isExporting && "Submitting, please wait..."}
                      </p>

                      <style>
                        {`
        .saving-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(255, 255, 255, 0.8);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .spinner-border {
          width: 3rem;
          height: 3rem;
        }

        .saving-overlay p {
          font-size: 1.2rem;
          font-weight: 500;
        }
      `}
                      </style>
                    </div>
                  )}

                  <div className="formScroll scroll-on-hover">
                    <div className="formData ">
                      {metaDataFields.map((field) => (
                        <div className="form-group mt-3" key={field.name}>
                          <TextInput
                            label={field.label}
                            name={field.name}
                            value={form[field.name] || ""}
                            onChange={handleChange}
                            required={field.required}
                            type={field.type}
                            maxLength={field.maxLength}
                            error={errors[field.name]}
                            readOnly={field.readOnly}
                            pattern={field.pattern}
                            errorMessage={field.errorMessage}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Additional Documents */}
                    <div className="mt-4">
                      {/* <h2>Additional Documents</h2> */}
                      <div className="formData ">
                        {additionalDocumentFields.map((field) => (
                          <div className="form-group mt-3" key={field.name}>
                            {field.type === "select" ? (
                              <SelectInput
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
                              />
                            ) : (
                              <TextInput
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
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Decision */}
                    {/* <div className="mt-4">
                      <h2>Decision</h2>
                      <div className="formData ">
                        {decisionFields.map((field) => (
                          <div className="form-group mt-3" key={field.name}>
                            <TextInput
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
                            />
                          </div>
                        ))}
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>

              <DocumentsSection form={form} handleChange={handleChange} />
            </div>
            <div className="btnWrapper">
              <ul className="pl-0 ml-0 d-flex align-items-center justify-content-between">
                {filteredActions.map((action, index) => (
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
            actionsfile={modifiedFileActions}
          />
        </div>
      </div>
    </section>
  );
};

export default FBDOpenning;
