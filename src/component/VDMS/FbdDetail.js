import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import SelectInput from "../CommonComponent/SelectInput";
import TextInput from "../CommonComponent/TextInput";
import {
  formatDateForInput,
  metaDataFields,
  decisionFields,
  docmetaDataFields,
  MtOptions,
  documentOptions,
  categoryOptions,
  classificationOptions,
  tagOptions,
} from "../headerData";
import { getRequestAccountDetails, requestAccountPre } from "../apiService";
import showToast from "../CommonComponent/ToastMessage";
import { useNavigate } from "react-router-dom";
import DocumentPreview from "../CommonComponent/DocumentPreview";

const FbdDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { state } = useLocation();
  useEffect(() => {
    const shouldReload =
      sessionStorage.getItem("shouldReloadFbdDetails") === "true";

    if (shouldReload) {
      sessionStorage.removeItem("shouldReloadFbdDetails");
      window.location.reload();
    }
  }, [id]);

  useEffect(() => {
    const reloadHandler = () => window.location.reload();
    window.addEventListener("reloadPage", reloadHandler);
    return () => window.removeEventListener("reloadPage", reloadHandler);
  }, []);

  const [actions, setActions] = useState([]);
  const [apiData, setApiData] = useState(null);
  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [currentAction, setCurrentAction] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(true);

  const [formData, setFormData] = useState({
    metaData: {},
    additionalDocuments: {},
    decision: {},
    documents: {
      documentFile: null,
    },
  });

  const optionsMap = {
    documentOptions: documentOptions,
    categoryOptions: categoryOptions,
    classificationOptions: classificationOptions,
    tagOptions: tagOptions,
  };

  const parseFileData = useCallback((fileString) => {
    if (!fileString) return null;
    try {
      return JSON.parse(fileString);
    } catch (e) {
      console.error("Error parsing file data:", e);
      return null;
    }
  }, []);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const handleChange = useCallback(
    (section, name, value) => {
      if (isReadOnly) return;
      if (!isFormDirty) {
        setIsFormDirty(true);
      }
      setFormData((prev) => {
        const updatedData = { ...prev };
        if (section === "metaData") {
          updatedData.metaData = { ...updatedData.metaData, [name]: value };
        } else if (section === "additionalDocuments") {
          updatedData.additionalDocuments = {
            ...updatedData.additionalDocuments,
            [name]: value,
          };
        } else if (section === "decision") {
          updatedData.decision = { ...updatedData.decision, [name]: value };
        }
        return updatedData;
      });
    },
    [isReadOnly, isFormDirty],
  );
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isFormDirty) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isFormDirty]);
  const handleOpenAction = useCallback((action) => {
    setCurrentAction({
      type: action.id, // transitionId
      taskId: action.taskId, // workflowTaskId
      name: action.name, // cleaned actionName
    });
  }, []);

  const ALLOWED_FILE_TYPES = [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "jpg",
    "jpeg",
    "png",
    "gif",
    "txt",
    "tif",
  ];

  const validateFile = (file) => {
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split(".").pop();
    const hasDoubleExtension = fileName.split(".").length > 2;

    if (!fileExtension || fileName.endsWith(".")) {
      return { isValid: false, message: "Files must have a valid extension" };
    }

    if (fileExtension === "php" || fileExtension === "exe") {
      return {
        isValid: false,
        message: `.${fileExtension} files are not allowed`,
      };
    }

    if (hasDoubleExtension) {
      const lastTwoExtensions = fileName.split(".").slice(-2).join(".");
      return {
        isValid: false,
        message: `Files with double extensions (like .${lastTwoExtensions}) are not allowed`,
      };
    }

    if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
      return {
        isValid: false,
        message: `.${fileExtension} files are not allowed. Only ${ALLOWED_FILE_TYPES.join(
          ", ",
        )} are accepted`,
      };
    }

    return { isValid: true };
  };

  const handleFileChange = useCallback((e) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    let hasInvalidFiles = false;

    const validFiles = files.filter((file) => {
      const validation = validateFile(file);
      if (!validation.isValid) {
        showToast({
          message: `Rejected ${file.name}: ${validation.message}`,
          type: "danger",
          title: "Invalid File",
          autoClose: 6000,
        });
        hasInvalidFiles = true;
        return false;
      }
      return true;
    });

    if (hasInvalidFiles) {
      e.target.value = "";
    }

    if (validFiles.length > 0) {
      setAttachedFiles((prev) => [...prev, ...validFiles]);
    }
  }, []);

  const handleRemoveFile = useCallback((index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const getHeaders = useCallback(() => {
    const csrfToken = window?.Liferay?.authToken || "";
    return {
      "x-csrf-token": csrfToken,
    };
  }, []);

  const [processingAction, setProcessingAction] = useState(null);
  const handleSubmitAction = useCallback(async () => {
    try {
      if (!currentAction) {
        showToast({
          message: "No action selected",
          type: "danger",
          title: "Validation Error",
          autoClose: 6000,
        });
        return;
      }

      if (!approvalRemarks.trim()) {
        showToast({
          message: "Remarks are required",
          type: "danger",
          title: "Validation Error",
          autoClose: 6000,
        });
        return;
      }

      setProcessingAction(currentAction.type);
      const formDataToSend = new FormData();
      // Append all metadata fields
      Object.entries(formData.metaData).forEach(([key, value]) => {
        formDataToSend.append(key, value || "");
      });

      // Append additional documents fields
      Object.entries(formData.additionalDocuments).forEach(([key, value]) => {
        formDataToSend.append(key, value || "");
      });

      // Append decision fields
      Object.entries(formData.decision).forEach(([key, value]) => {
        formDataToSend.append(key, value || "");
      });
      // Append document details
      formDataToSend.append(
        "documentDetailedFrom",
        formData.metaData.documentDetailedFrom || "",
      );
      formDataToSend.append(
        "documentDetailedTo",
        formData.metaData.documentDetailedTo || "",
      ); // Append document files if they exist
      if (formData.documents?.documentDetailedFile?.file) {
        formDataToSend.append(
          "documentFile",
          formData.documents.documentDetailedFile.file,
          formData.documents.documentDetailedFile.fileName,
        );
      }
      formDataToSend.append("entryId", formData.metaData.entryId || "");
      formDataToSend.append("transitionId", currentAction.type);
      formDataToSend.append("workflowTaskId", currentAction.taskId);
      formDataToSend.append("remarks", approvalRemarks);

      attachedFiles.forEach((file) => {
        formDataToSend.append("attachments", file);
      });

      const headers = getHeaders();
      delete headers["Content-Type"];

      const response = await fetch(
        "/o/boi-headless-delivery-web/v1.0/add-fbd/saveAsExport",
        {
          method: "POST",
          headers: headers,
          body: formDataToSend,
        },
      );

      let result;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        result = await response.json();
      } else {
        result = await response.text();
      }

      if (!response.ok) {
        throw new Error(
          typeof result === "string" ? result : "Submission failed",
        );
      }

      showToast({
        message: "Action submitted successfully",
        type: "success",
        title: "Success",
        autoClose: 4000,
      });

      setApprovalRemarks("");
      setAttachedFiles([]);
      setCurrentAction(null);
      setProcessingAction(null);

      navigate("/fbd-table");
    } catch (error) {
      console.error("Error submitting action:", error);
      showToast({
        message: error.message || "Unexpected error occurred.",
        type: "danger",
        title: "Error",
        autoClose: 6000,
      });
      setProcessingAction(null);
    }
  }, [approvalRemarks, attachedFiles, currentAction, getHeaders, navigate]);

  useEffect(() => {
    if (currentAction) {
      handleSubmitAction();
    }
  }, [currentAction, handleSubmitAction]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // const preferencesResponse = await requestAccountPre();
        // const preferencesData = preferencesResponse.data;

        if (id) {
          const response = await getRequestAccountDetails(id);
          setApiData(response);
          if (typeof window.integrateFile === "function") {
            window.integrateFile(response);
          } else {
            console.warn("window.integrateFile is not defined");
          }

          if (response.data?.actions) {
            setActions(
              response.data.actions.map((action) => ({
                id: action.transitionId,
                taskId: action.workflowTaskId,
                name: action.actionName.trim(),
              })),
            );
            setIsReadOnly(false);
          }

          const item = response.data || {};

          const documents = {
            documentDetailedFile: {
              fileName:
                extractFileNameFromURL(item.documentDetailedURL) ||
                (item.documentFileEntryId
                  ? `Document_${item.documentFileEntryId}.tif`
                  : ""),
              fileExtension: "tif",
              URL: item.documentDetailedURL || "",
            },
          };

          setFormData({
            metaData: {
              date: item.date || "",
              entryId: item.entryId || "",
              branchCode: item.branchCode || "",
              zone: item.zone || "",
              nbgCode: item.nbgCode || "",
              documentFrom: item.documentFrom || "",
              documentTo: item.documentTo || "",
              documentDetailedFrom: item.documentDetailedFrom || "",
              documentDetailedTo: item.documentDetailedTo || "",
            },
            additionalDocuments: {
              finacleReferenceNo: item.finacleReferenceNo || "",
              mtType: item.mtType || "",
            },
            decision: {
              decision: item.decision || "",
            },
            documents: {
              documentDetailedFile: {
                fileName:
                  extractFileNameFromURL(item.documentDetailedURL) ||
                  "Document_0.tif",
                fileExtension: "tif",
                URL: item.documentDetailedURL || "",
              },
            },
          });
        }
      } catch (error) {
        console.error("Error fetching account details:", error);
        setError("Failed to load account details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // }, [id, state, parseFileData]);
  }, [id]);

  const handleDocumentChange = (fieldName, fileData) => {
    setFormData((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [fieldName]: {
          fileName: fileData.fileName,
          fileExtension: fileData.fileExtension,
          file: fileData.file,
          URL: prev.documents[fieldName]?.URL,
        },
      },
    }));
  };
  const extractFileNameFromURL = (url) => {
    if (!url) return null;

    const parts = url.split("/");
    const filenameWithParams = parts[parts.length - 2];

    const filename = filenameWithParams.split("?")[0];

    return filename || null;
  };
  const renderFileView = (file) => {
    if (!file) return null;

    return (
      <>
        <i className="fa fa-file-pdf-o"></i>
        <span className="fileSize">
          {file.fileName}
          <br />
          <small>{file.fileExtension}</small>
        </span>
        {file.URL && (
          <a
            href={file.URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-primary ml-2"
          >
            <i className="fa fa-download"></i>
          </a>
        )}
      </>
    );
  };

  const renderFormField = (field, section) => {
    const isSectionReadOnly =
      section === "metaData" ||
      section === "additionalDocuments" ||
      section === "decision";
    const commonProps = {
      key: field.name,
      label: field.label,
      name: field.name,
      value: formData[section][field.name] || "",
      onChange: (e) => handleChange(section, field.name, e.target.value),
      required: field.required,
      // disabled: isReadOnly,
      // readOnly: isReadOnly,
      disabled: isSectionReadOnly || isReadOnly || field.readOnly,
      readOnly: isSectionReadOnly || isReadOnly || field.readOnly,
      maxLength: field.maxLength,
    };

    switch (field.type) {
      case "select":
        return (
          <SelectInput
            {...commonProps}
            options={optionsMap[field.optionsKey] || []}
          />
        );
      case "date":
        return (
          <TextInput
            {...commonProps}
            type="date"
            value={formatDateForInput(formData[section][field.name])}
          />
        );
      default:
        return <TextInput {...commonProps} type={field.type} />;
    }
  };

  // const renderDocumentFields = () => {
  //   return (
  //     <div className="col-md-12 mt-4">
  //       <div className="bgLightBlue">
  //         <h2>Attached Documents</h2>
  //         <div className="bgWhite p-4">
  //           {docmetaDataFields.map((docField) => {
  //             const fromValue = formData.metaData[docField.fromField] || "";
  //             const toValue = formData.metaData[docField.toField] || "";
  //             const documentFile = formData.documents?.[docField.file] || null;

  //             return (
  //               <div className="row mb-3" key={docField.id}>
  //                 <div className="col-md-3">
  //                   <div className="form-group">
  //                     <label>Page From</label>
  //                     <input
  //                       type="text"
  //                       className="form-control"
  //                       value={formData.metaData.documentDetailedTo || ""}
  //                       onChange={(e) =>
  //                         handleChange(
  //                           "metaData",
  //                           "documentDetailedTo",
  //                           e.target.value
  //                         )
  //                       }
  //                       disabled={isReadOnly}
  //                     />
  //                   </div>
  //                 </div>
  //                 <div className="col-md-3">
  //                   <div className="form-group">
  //                     <label>Page To</label>
  //                     <input
  //                       type="text"
  //                       className="form-control"
  //                       value={formData.metaData.documentDetailedFrom || ""}
  //                       onChange={(e) =>
  //                         handleChange(
  //                           "metaData",
  //                           "documentDetailedFrom",
  //                           e.target.value
  //                         )
  //                       }
  //                       disabled={isReadOnly}
  //                     />
  //                   </div>
  //                 </div>

  //                 <div className="col-md-6">
  //                   <div className="form-group attachmentbox">
  //                     <label>{docField.name}</label>
  //                     <div className="attchbox" style={{ width: "100%" }}>
  //                       <div
  //                         className="d-flex align-items-center gap-2"
  //                         style={{ width: "100%" }}
  //                       >
  //                         {!isReadOnly ? (
  //                           <div
  //                             className="custom-file"
  //                             style={{ flex: "1", minWidth: "0" }}
  //                           >
  //                             <input
  //                               type="file"
  //                               className="custom-file-input"
  //                               id={`fileInput-${docField.file}`}
  //                               onChange={(e) => {
  //                                 const file = e.target.files[0];
  //                                 if (file) {
  //                                   handleDocumentChange(docField.file, {
  //                                     fileName: file.name,
  //                                     fileExtension: file.name.split(".").pop(),
  //                                     file: file,
  //                                   });
  //                                 }
  //                               }}
  //                               disabled={isReadOnly}
  //                               style={{ width: "100%" }}
  //                             />
  //                             <label
  //                               htmlFor={`fileInput-${docField.file}`}
  //                               style={{
  //                                 display: "block",
  //                                 width: "93%",
  //                                 overflow: "hidden",
  //                                 textOverflow: "ellipsis",
  //                                 whiteSpace: "nowrap",
  //                                 marginTop: "15px",
  //                               }}
  //                             >
  //                               {documentFile?.fileName || "Choose file"}
  //                             </label>
  //                           </div>
  //                         ) : (
  //                           <div
  //                             style={{
  //                               flex: "1",
  //                               minWidth: "0",
  //                               padding: "8px",
  //                               borderRadius: "4px",
  //                             }}
  //                           >
  //                             {documentFile?.fileName || "No file attached"}
  //                           </div>
  //                         )}
  //                         {documentFile?.URL && (
  //                           <a
  //                             href={documentFile.URL}
  //                             target="_blank"
  //                             rel="noopener noreferrer"
  //                             className="btn btn-sm p-2"
  //                             title="Download document"
  //                             style={{
  //                               color: "red",
  //                               border: "none",
  //                               background: "transparent",
  //                               flexShrink: "0",
  //                               padding: "0 0 0 8px",
  //                             }}
  //                           >
  //                             <i className="fa fa-download"></i>
  //                           </a>
  //                         )}
  //                       </div>
  //                     </div>
  //                   </div>
  //                 </div>
  //               </div>
  //             );
  //           })}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };
  const renderDocumentFields = () => {
    return (
      <div className="col-md-12 mt-4">
        <div className="bgLightBlue">
          <h2>Attached Documents</h2>
          <div className="bgWhite p-4">
            {docmetaDataFields.map((docField) => {
              const fromValue = formData.metaData[docField.fromField] || "";
              const toValue = formData.metaData[docField.toField] || "";
              const documentFile = formData.documents?.[docField.file] || null;

              return (
                <div className="row mb-3" key={docField.id}>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Page From</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.metaData.documentDetailedTo || ""}
                        onChange={(e) =>
                          handleChange(
                            "metaData",
                            "documentDetailedTo",
                            e.target.value,
                          )
                        }
                        readOnly={true}
                        disabled={true}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Page To</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.metaData.documentDetailedFrom || ""}
                        onChange={(e) =>
                          handleChange(
                            "metaData",
                            "documentDetailedFrom",
                            e.target.value,
                          )
                        }
                        readOnly={true}
                        disabled={true}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group attachmentbox">
                      <label>{docField.name}</label>
                      <div className="attchbox" style={{ width: "100%" }}>
                        <div
                          className="d-flex align-items-center gap-2"
                          style={{ width: "100%" }}
                        >
                          {!isReadOnly ? (
                            <div
                              className="custom-file"
                              style={{ flex: "1", minWidth: "0" }}
                            >
                              <input
                                type="file"
                                className="custom-file-input"
                                id={`fileInput-${docField.file}`}
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    handleDocumentChange(docField.file, {
                                      fileName: file.name,
                                      fileExtension: file.name.split(".").pop(),
                                      file: file,
                                    });
                                  }
                                }}
                                disabled={true}
                                style={{ width: "100%" }}
                              />
                              <label
                                htmlFor={`fileInput-${docField.file}`}
                                style={{
                                  display: "block",
                                  width: "93%",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  marginTop: "15px",
                                }}
                              >
                                {documentFile?.fileName || "Choose file"}
                              </label>
                            </div>
                          ) : (
                            // This is the removed div - now only showing the file input label in read-only mode
                            <div
                              className="custom-file"
                              style={{ flex: "1", minWidth: "0" }}
                            >
                              <input
                                type="file"
                                className="custom-file-input"
                                id={`fileInput-${docField.file}`}
                                disabled={true}
                                style={{ width: "100%" }}
                              />
                              <label
                                htmlFor={`fileInput-${docField.file}`}
                                style={{
                                  display: "block",
                                  width: "93%",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  marginTop: "15px",
                                }}
                              >
                                {documentFile?.fileName || "No file attached"}
                              </label>
                            </div>
                          )}
                          {documentFile?.URL && (
                            <a
                              href={documentFile.URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm p-2"
                              title="Download document"
                              style={{
                                color: "red",
                                border: "none",
                                background: "transparent",
                                flexShrink: "0",
                                padding: "0 0 0 8px",
                              }}
                            >
                              <i className="fa fa-download"></i>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-danger">{error}</div>;
  if (!formData.metaData.date && !id)
    return <div className="p-4">No data available</div>;

  return (
    <div>
      <section className="main-section p-4">
        <div className="d-flex justify-content-between mb-2">
          <h1>FBD Detail</h1>
          <button
            className="btn btn-outline"
            style={{
              backgroundColor: "#0066B3",
              color: "white",
              borderColor: "#0066B3",
            }}
            onClick={() => navigate("/fbd-table")}
          >
            BACK
          </button>
        </div>
        <div className="shadowBox">
          <div className="row">
            <div className="col-md-7">
              <div
                className="shadowBox scrollHeight"
                style={{ overflowY: "auto" }}
              >
                <div className="row">
                  <div className="col-md-12">
                    {/* Meta Data Section */}
                    <div className="metaData">
                      <h2>Meta Data</h2>
                      <div className="formData">
                        <div className="row">
                          {metaDataFields.map((field, index) => (
                            <div
                              className="col-md-4"
                              key={field.name}
                              style={{
                                marginBottom: index % 3 === 2 ? "10px" : "0",
                                marginTop: index >= 3 ? "10px" : "0",
                              }}
                            >
                              {renderFormField(field, "metaData")}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {renderDocumentFields()}

                  {/* Logs Table */}
                  {apiData?.data?.logs?.length > 0 && (
                    <div className="mt-5">
                      <h3>Activity Logs</h3>
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="thead-dark">
                            <tr>
                              <th>Sr. No</th>
                              <th>Action</th>
                              <th>Remarks</th>
                              <th>Attachment</th>
                              <th>Created Date</th>
                              <th>ActionBy</th>
                            </tr>
                          </thead>
                          <tbody>
                            {apiData.data.logs.map((log, index) => {
                              const attachment = log.attachment
                                ? JSON.parse(log.attachment)
                                : null;
                              return (
                                <tr key={index}>
                                  <td>{index + 1}</td>
                                  <td>{log.customAction || "N/A"}</td>
                                  <td>{log.remarks || "N/A"}</td>
                                  <td>
                                    {attachment ? (
                                      <div className="form-group attachmentbox">
                                        <div
                                          className="attchbox"
                                          style={{ width: "100%" }}
                                        >
                                          <div
                                            className="d-flex align-items-center gap-2"
                                            style={{ width: "100%" }}
                                          >
                                            <div
                                              className="custom-file"
                                              style={{
                                                flex: "1",
                                                minWidth: "0",
                                              }}
                                            >
                                              <input
                                                type="file"
                                                className="custom-file-input"
                                                disabled={true}
                                                style={{ width: "100%" }}
                                              />
                                              <label
                                                style={{
                                                  display: "block",
                                                  width: "93%",
                                                  overflow: "hidden",
                                                  textOverflow: "ellipsis",
                                                  whiteSpace: "nowrap",
                                                  marginTop: "15px",
                                                }}
                                              >
                                                {attachment.fileName ||
                                                  "No file attached"}
                                              </label>
                                            </div>
                                            {attachment.URL && (
                                              <a
                                                href={attachment.URL}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-sm p-2"
                                                title="Download document"
                                                style={{
                                                  color: "red",
                                                  border: "none",
                                                  background: "transparent",
                                                  flexShrink: "0",
                                                  padding: "0 0 0 8px",
                                                }}
                                              >
                                                <i className="fa fa-download"></i>
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      "None"
                                    )}
                                  </td>
                                  <td>
                                    <input
                                      type="date"
                                      className="form-control"
                                      value={formatDateForInput(
                                        log.dateCreated,
                                      )}
                                      disabled
                                    />
                                  </td>
                                  <td>{log.createdBy || "N/A"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Approval Details Section */}
                  {actions.length > 0 && (
                    <div className="col-md-12 mt-4">
                      <div className="bgLightBlue">
                        <h2>Approval Details</h2>
                        <div className="bgWhite p-4">
                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label>Remarks *</label>
                                <textarea
                                  className="form-control"
                                  placeholder="Enter approval remarks"
                                  value={approvalRemarks}
                                  onChange={(e) => {
                                    const isValid =
                                      /^[a-zA-Z0-9\s.,!?()-]*$/.test(
                                        e.target.value,
                                      );
                                    if (isValid || e.target.value === "") {
                                      setApprovalRemarks(e.target.value);
                                    }
                                  }}
                                  onBlur={(e) => {
                                    if (
                                      !/^[a-zA-Z0-9\s.,!?()-]*$/.test(
                                        e.target.value,
                                      )
                                    ) {
                                      showToast({
                                        message:
                                          "Special characters are not allowed except .,!?()-",
                                        type: "danger",
                                        title: "Validation Error",
                                        autoClose: 6000,
                                      });
                                    }
                                  }}
                                  rows="4"
                                  maxLength={250}
                                  pattern="^[a-zA-Z0-9\s.,!?()-]*$"
                                  required
                                />
                                <small className="text-muted">
                                  {approvalRemarks.length}/250 characters
                                </small>
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="form-group">
                                <label>Attachments</label>
                                <div className="custom-file">
                                  <input
                                    type="file"
                                    className="custom-file-input"
                                    id="approvalAttachments"
                                    multiple
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.tif"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      const files = Array.from(
                                        e.dataTransfer.files,
                                      );
                                      const validFiles = files.filter(
                                        (file) => validateFile(file).isValid,
                                      );
                                      if (validFiles.length > 0) {
                                        setAttachedFiles((prev) => [
                                          ...prev,
                                          ...validFiles,
                                        ]);
                                      } else {
                                        showToast({
                                          message:
                                            "No valid files were dropped",
                                          type: "danger",
                                          title: "Invalid Files",
                                          autoClose: 6000,
                                        });
                                      }
                                    }}
                                  />
                                  <label
                                    className="custom-file-label"
                                    htmlFor="approvalAttachments"
                                  >
                                    {attachedFiles.length > 0
                                      ? `${attachedFiles.length} file(s) selected`
                                      : "Choose files"}
                                  </label>
                                </div>

                                {attachedFiles.length > 0 && (
                                  <div className="mt-2">
                                    <h6>Selected Files:</h6>
                                    <ul className="list-group">
                                      {attachedFiles.map((file, index) => (
                                        <li
                                          key={index}
                                          className="list-group-item d-flex justify-content-between align-items-center"
                                        >
                                          <span>
                                            <i className="fa fa-file mr-2"></i>
                                            {file.name} (
                                            {Math.round(file.size / 1024)} KB)
                                          </span>
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-danger"
                                            onClick={() =>
                                              handleRemoveFile(index)
                                            }
                                          >
                                            <i className="fa fa-trash"></i>
                                          </button>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {actions.length > 0 && (
                    <div className="text-center mt-4">
                      <ul className="pl-0 ml-0 d-flex align-items-center justify-content-center gap-2">
                        {actions.map((action) => {
                          const actionName = action.name;
                          const isProcessing = processingAction === action.id;

                          return (
                            <li key={action.id}>
                              <button
                                type="button"
                                className={`btn btn-${
                                  actionName.toLowerCase() === "reject"
                                    ? "danger"
                                    : "success"
                                }`}
                                onClick={() => {
                                  if (!approvalRemarks.trim()) {
                                    showToast({
                                      message: "Remarks are required",
                                      type: "danger",
                                      title: "Validation Error",
                                      autoClose: 6000,
                                    });
                                    return;
                                  }
                                  handleOpenAction(action);
                                }}
                                disabled={isProcessing}
                              >
                                {isProcessing ? (
                                  <>
                                    <span
                                      className="spinner-border spinner-border-sm me-2"
                                      role="status"
                                      aria-hidden="true"
                                    ></span>
                                    {`${actionName}...`}
                                  </>
                                ) : (
                                  actionName
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DocumentPreview />
          </div>
        </div>
      </section>
    </div>
  );
};

export default FbdDetail;
