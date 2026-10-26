import {
  useState,
  useCallback,
  forwardRef,
  useEffect,
  useImperativeHandle,
} from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  TextField as MuiTextField,
  IconButton,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Fab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  CustomAutocomplete,
  CustomTextField,
  useToast,
} from "../../components/common";
import {
  complaintDetailsFields,
  fraudDetailsFields,
  identifiedPersonFields,
  abbffFormOptionsMap,
  getABBFFFormTemplate,
} from "./MySpace";
import {
  boiBorder,
  boiBlue,
  boiOrange,
  boiMutedText,
  boiErrorRed,
  boiSuccessGreen,
} from "../../theme/theme";
import { ABBFFFormTab } from "./MySpaceForm";

// Theme colors
const themeColors = {
  success: boiSuccessGreen || "#28a745",
  error: boiErrorRed || "#d32f2f",
  orange: boiOrange || "#F37021",
  muted: boiMutedText || "#5c6c7c",
};

const APPROVE_OPTIONS = ["Approve", "Not Approved", "Revert"];
const APPROVE_REVERT_OPTIONS = ["Approve", "Revert"];

// ==================== FILE UPLOAD HELPERS ====================
const getDocumentFolderUrl = (folderId) =>
  `/o/headless-delivery/v1.0/document-folders/${folderId}/documents`;

const getFilenameFromPath = (path) => {
  if (!path || typeof path !== "string") return "";
  const pathname = path.split("?")[0];
  const segments = pathname.split("/").filter(Boolean);
  let rawName = "";
  if (segments.length >= 2) rawName = segments[segments.length - 2];
  else rawName = segments[segments.length - 1] || "";
  try {
    return decodeURIComponent(rawName);
  } catch {
    return rawName;
  }
};

const uploadFile = async (file, folderId, complaintNumber) => {
  const apiUrl = getDocumentFolderUrl(folderId);
  const timestamp = Date.now();
  const lastDot = file.name.lastIndexOf(".");
  const baseName = lastDot > 0 ? file.name.substring(0, lastDot) : file.name;
  const ext = lastDot > 0 ? file.name.substring(lastDot) : "";
  const newFileName = `${baseName}_${timestamp}${ext}`;

  const documentMeta = {
    fileName: newFileName,
    title: newFileName,
    customFields: [
      {
        attributeType: "STRING",
        name: "complaintNumber",
        customValue: { data: complaintNumber || "" },
      },
      {
        attributeType: "STRING",
        name: "tabName",
        customValue: { data: "ABBFF" },
      },
    ],
  };

  const formData = new FormData();
  formData.append("file", file);
  formData.append("document", JSON.stringify(documentMeta));

  const getHeaders = (isJson = true) => {
    const csrfToken = window?.Liferay?.authToken || "";
    return {
      "x-csrf-token": csrfToken,
      ...(isJson && { "Content-Type": "application/json" }),
    };
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: getHeaders(false),
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Upload failed: ${response.status}`);
  }
  return response.json();
};

// ==================== MAIN COMPONENT ====================
export const ABBFFDetailsMain = forwardRef(
  (
    {
      values,
      onChange,
      readOnly,
      addPerson,
      removePerson,
      updatePersonAtIndex,
      validationErrors = {},
      setValidationErrors,
      onActionPerformed,
      activePersonTab,
      setActivePersonTab,
      savingStates = {},
      submittingStates = {},
      parentFolderId,
    },
    ref,
  ) => {
    const { success, error: showError } = useToast();
    const [expandedABBFFIndex, setExpandedABBFFIndex] = useState(null);
    const [uploading, setUploading] = useState({});
    // ---------- Scroll position state (for FABs) ----------
    const [isAtTop, setIsAtTop] = useState(true);
    const [isAtBottom, setIsAtBottom] = useState(false);

    // ---------- Scroll listener for FAB visibility ----------
    useEffect(() => {
      const handleScroll = () => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const threshold = 50;
        const atTop = scrollY < threshold;
        const atBottom = scrollY + windowHeight >= docHeight - threshold;
        setIsAtTop(atTop);
        setIsAtBottom(atBottom);
      };

      window.addEventListener("scroll", handleScroll);
      handleScroll();

      return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    const persons = values.identifiedPersons || [];

    const getEmployeeDisplay = (person, idx) => {
      if (person?.empId && person?.employeeName) {
        return `${person.empId} - ${person.employeeName}`;
      }
      return person?.employeeName || person?.empId || `Person ${idx + 1}`;
    };

    // -------- resetABBFFForm (clears all form fields for given index) --------
    const resetABBFFForm = useCallback(
      (idx) => {
        const currentForms = values.abbffForms || [];
        const template = getABBFFFormTemplate();
        // Build a clean form with all non‑meta fields set to null
        const cleanForm = Object.keys(template).reduce((acc, key) => {
          if (
            ![
              "status",
              "documentsAttached",
              "abbffAttachment",
              "dateOfComplaint",
            ].includes(key)
          ) {
            acc[key] = null;
          } else {
            acc[key] = template[key]; // keep status, attachment etc as is
          }
          return acc;
        }, {});
        const updatedForms = [...currentForms];
        updatedForms[idx] = cleanForm;
        onChange({ abbffForms: updatedForms });

        // Clear validation errors for this form
        const newErrors = { ...validationErrors };
        Object.keys(newErrors).forEach((errKey) => {
          if (errKey.startsWith(`abbff_${idx}_`)) delete newErrors[errKey];
        });
        setValidationErrors(newErrors);
      },
      [values.abbffForms, onChange, validationErrors, setValidationErrors],
    );

    // Remark logic
    const getWfRemark = (idx) => persons[idx]?.wfRemark || "";
    const updateWfRemark = (idx, value) => {
      updatePersonAtIndex(idx, "wfRemark", value, "identifiedPersons");
      if (validationErrors[`remark_${idx}`]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[`remark_${idx}`];
          return newErrors;
        });
      }
    };

    // Field update functions
    const setField = useCallback(
      (field, value) => {
        onChange({ [field]: value });
        if (validationErrors[field]) {
          const newErrors = { ...validationErrors };
          delete newErrors[field];
          setValidationErrors(newErrors);
        }
      },
      [onChange, validationErrors, setValidationErrors],
    );

    const updatePerson = useCallback(
      (idx, field, value) => {
        updatePersonAtIndex(idx, field, value, "identifiedPersons");
      },
      [updatePersonAtIndex],
    );

    const updateABBFFForm = useCallback(
      (idx, field, value) => {
        const currentForms = values.abbffForms || [];
        const currentForm = currentForms[idx] || getABBFFFormTemplate();
        const updatedForms = [...currentForms];
        updatedForms[idx] = { ...currentForm, [field]: value };
        onChange({ abbffForms: updatedForms });

        if (validationErrors[`abbff_${idx}_${field}`]) {
          const newErrors = { ...validationErrors };
          delete newErrors[`abbff_${idx}_${field}`];
          setValidationErrors(newErrors);
        }
      },
      [values.abbffForms, onChange, validationErrors, setValidationErrors],
    );

    // ==================== ATTACHMENT HANDLERS (with mutual exclusivity) ====================
    const handleABBFFAttachmentUpload = useCallback(
      async (file, employeeIndex) => {
        if (!file) {
          updateABBFFForm(employeeIndex, "abbffAttachment", null);
          return;
        }
        if (!parentFolderId) {
          showError("Upload folder not available. Please refresh.");
          return;
        }
        const key = `abbff_${employeeIndex}`;
        setUploading((prev) => ({ ...prev, [key]: true }));
        try {
          const result = await uploadFile(
            file,
            parentFolderId,
            values.complaintNumber,
          );
          const attachmentObj = {
            fileName: result.fileName || file.name,
            contentUrl: result.contentUrl || result.contentURL || "",
          };
          // 1. Reset form data (mutual exclusivity)
          resetABBFFForm(employeeIndex);
          // 2. Set attachment
          updateABBFFForm(employeeIndex, "abbffAttachment", attachmentObj);
          success("ABBFF attachment uploaded successfully");
        } catch (err) {
          console.error("Upload failed:", err);
          showError(err.message || "Upload failed.");
        } finally {
          setUploading((prev) => ({ ...prev, [key]: false }));
        }
      },
      [
        parentFolderId,
        updateABBFFForm,
        resetABBFFForm,
        showError,
        success,
        values.complaintNumber,
      ],
    );

    const removeABBFFAttachment = useCallback(
      (employeeIndex) => {
        updateABBFFForm(employeeIndex, "abbffAttachment", null);
      },
      [updateABBFFForm],
    );

    // ==================== ACTION HANDLER ====================
    const handleAction = (idx, action) => {
      const remark = getWfRemark(idx);

      if (action === "REJECT") {
        if (!remark || remark.trim() === "") {
          setValidationErrors((prev) => ({
            ...prev,
            [`remark_${idx}`]: "Remark is required for Reject.",
          }));
          showError("Remark is required for Reject.");
          return;
        } else {
          setValidationErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[`remark_${idx}`];
            return newErrors;
          });
        }
      }

      if (action === "SUBMIT") {
        // Validate: either ABBFF form must have data OR attachment must be uploaded
        const safeForm = (values.abbffForms || [])[idx] || {};
        const excludeFields = [
          "status",
          "documentsAttached",
          "abbffAttachment",
          "dateOfComplaint",
        ];
        const hasFormData = Object.keys(safeForm).some((key) => {
          if (excludeFields.includes(key)) return false;
          const val = safeForm[key];
          if (val === null || val === undefined) return false;
          if (typeof val === "string") return val.trim() !== "";
          if (typeof val === "number") return val !== 0;
          if (Array.isArray(val)) return val.length > 0;
          if (typeof val === "object")
            return Object.values(val).some((v) => v != null && v !== "");
          return false;
        });
        const hasAttachment = !!safeForm?.abbffAttachment?.contentUrl;

        if (!hasFormData && !hasAttachment) {
          showError(
            "Please fill the ABBFF form or upload an attachment before submitting.",
          );
          return;
        }

        // If form is filled, validate mandatory fields
        if (hasFormData && !hasAttachment) {
          const mandatoryFields = [
            { key: "accountName", label: "Name of Account" },
            { key: "bankName", label: "Name of Bank / PSI / PFI" },
            { key: "branchOffice", label: "Branch Office / Circle / Region" },
          ];
          const missing = mandatoryFields.filter(
            (f) =>
              !safeForm[f.key] ||
              (typeof safeForm[f.key] === "string" && !safeForm[f.key].trim()),
          );
          if (missing.length > 0) {
            const newErrors = { ...validationErrors };
            missing.forEach((f) => {
              newErrors[`abbff_${idx}_${f.key}`] = `${f.label} is required`;
            });
            setValidationErrors(newErrors);
            setExpandedABBFFIndex(idx);
            showError(`Please fill: ${missing.map((f) => f.label).join(", ")}`);
            return;
          }
        }

        const isValid = validateTab();
        if (!isValid) return;
      }

      if (onActionPerformed) {
        onActionPerformed(idx, action, { wfRemark: remark });
      }
    };

    const isEmployeeReadOnly = (idx) => {
      const actions = (values.employeeActions || [])[idx] || [];
      if (actions.length === 0) return true;
      const hasSubmit = actions.includes("SUBMIT");
      return !hasSubmit;
    };

    const validateTab = useCallback(() => {
      return true;
    }, []);

    useImperativeHandle(ref, () => ({ validateTab }));

    // ==================== RENDER FUNCTIONS ====================

    const renderComplaintField = (field) => {
      if (field.condition && !field.condition(values)) return null;
      const value = values[field.name];
      const hasError = validationErrors[field.name];
      const isRequired = field.required;

      if (field.type === "select") {
        return (
          <CustomAutocomplete
            label={field.label}
            options={abbffFormOptionsMap[field.optionsKey] || []}
            value={value || null}
            disabled={true}
            readOnly={true}
            required={isRequired}
            error={!!hasError}
            helperText={hasError}
            fullWidth
          />
        );
      }
      if (field.type === "textarea") {
        return (
          <CustomTextField
            label={field.label}
            value={value || ""}
            disabled={true}
            readOnly={true}
            required={isRequired}
            error={!!hasError}
            helperText={hasError}
            multiline
            minRows={3}
            fullWidth
          />
        );
      }
      return (
        <CustomTextField
          label={field.label}
          value={value || ""}
          disabled={true}
          readOnly={true}
          required={isRequired}
          error={!!hasError}
          helperText={hasError}
          fullWidth
        />
      );
    };

    const renderFraudFieldItem = (field) => {
      const value = values[field.name];
      const hasError = validationErrors[field.name];
      const isRequired = field.required;

      if (field.type === "select") {
        return (
          <CustomAutocomplete
            label={field.label}
            options={abbffFormOptionsMap[field.optionsKey] || []}
            value={value || null}
            onChange={(e, v) => setField(field.name, v)}
            disabled={true}
            readOnly={true}
            required={isRequired}
            error={!!hasError}
            helperText={hasError}
            fullWidth
          />
        );
      }
      if (field.type === "date") {
        return (
          <CustomTextField
            type="date"
            label={field.label}
            value={value || ""}
            onChange={(date) => setField(field.name, date)}
            disabled={true}
            readOnly={true}
            required={isRequired}
            error={!!hasError}
            helperText={hasError}
            fullWidth
          />
        );
      }
      if (field.type === "file") {
        const attachments = Array.isArray(value) ? value : value ? [value] : [];
        if (attachments.length === 0) return null;
        return (
          <Box sx={{ gridColumn: "1 / -1" }}>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 500,
                color: "text.secondary",
                mb: 0.75,
              }}
            >
              {field.label}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {attachments.map((url, i) => {
                const fileName = getFilenameFromPath(url);
                return (
                  <Box
                    key={i}
                    sx={{
                      border: `1px solid ${boiBorder}`,
                      borderRadius: "8px",
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      bgcolor: "#f5f5f5",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.825rem",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fileName || `Attachment ${i + 1}`}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => window.open(url, "_blank")}
                      aria-label="download"
                    >
                      <DownloadIcon
                        sx={{ color: boiBlue, fontSize: "1.1rem" }}
                      />
                    </IconButton>
                  </Box>
                );
              })}
            </Box>
          </Box>
        );
      }
      return (
        <CustomTextField
          label={field.label}
          value={value || ""}
          onChange={(e) => setField(field.name, e.target.value)}
          disabled={true}
          readOnly={true}
          required={isRequired}
          error={!!hasError}
          helperText={hasError}
          fullWidth
        />
      );
    };

    const renderPersonField = (person, idx, field) => {
      const value = person[field.name];
      const hasError = validationErrors[`person_${idx}_${field.name}`];
      const isRequired = field.required;

      if (field.type === "select") {
        return (
          <CustomAutocomplete
            label={field.label}
            options={abbffFormOptionsMap[field.optionsKey] || []}
            value={value || null}
            disabled={true}
            readOnly={true}
            required={isRequired}
            error={!!hasError}
            helperText={hasError}
            fullWidth
          />
        );
      }
      if (field.type === "date") {
        return (
          <CustomTextField
            type="date"
            label={field.label}
            value={value}
            disabled={true}
            readOnly={true}
            required={isRequired}
            error={!!hasError}
            helperText={hasError}
            fullWidth
          />
        );
      }
      return (
        <CustomTextField
          label={field.label}
          value={value || ""}
          disabled={true}
          readOnly={true}
          required={isRequired}
          error={!!hasError}
          helperText={hasError}
          fullWidth
        />
      );
    };

    const renderPersonDetailsCard = (person, idx) => (
      <Card
        sx={{ mb: 3, borderRadius: "12px", border: `1px solid ${boiBorder}` }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                color: boiBlue,
                borderLeft: `3px solid ${boiBlue}`,
                pl: 1.5,
              }}
            >
              General Details of {getEmployeeDisplay(person, idx)}
            </Typography>
            {person.customStatus && (
              <Chip
                label={person.customStatus}
                size="small"
                sx={{
                  bgcolor: themeColors.orange,
                  color: "white",
                  fontWeight: 500,
                }}
              />
            )}
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            {identifiedPersonFields.map((field) => (
              <Box key={field.name}>
                {renderPersonField(person, idx, field)}
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );

    // ==================== ABBFF FORM TAB WITH ATTACHMENT (mutual exclusivity) ====================
    const renderABBFFFormTab = (form, idx) => {
      const isExpanded = expandedABBFFIndex === idx;
      const displayName = getEmployeeDisplay(persons[idx], idx);
      const isSaving = savingStates?.[idx] || false;
      const isSubmitting = submittingStates?.[idx] || false;
      const empReadOnly = isEmployeeReadOnly(idx);
      const actions = (values.employeeActions || [])[idx] || [];
      const activityLogs = (values.employeeLogs || [])[idx] || [];

      const safeForm = form || {};
      const template = getABBFFFormTemplate();
      const excludeFields = [
        "status",
        "documentsAttached",
        "abbffAttachment",
        "dateOfComplaint",
      ];

      const hasFormData = Object.keys(template).some((key) => {
        if (excludeFields.includes(key)) return false;
        const val = safeForm[key];
        if (val === null || val === undefined) return false;
        if (typeof val === "string") return val.trim() !== "";
        if (typeof val === "number") return val !== 0;
        if (val instanceof Date || (typeof val === "object" && val?.$d))
          return true;
        if (Array.isArray(val)) return val.length > 0;
        if (typeof val === "object") {
          return Object.values(val).some(
            (subVal) => subVal != null && subVal !== "",
          );
        }
        return false;
      });

      const hasAttachment = !!safeForm?.abbffAttachment?.contentUrl;

      // Mutual exclusivity: show only one
      const showForm = !hasAttachment; // hide form if attachment exists
      const showAttachment = !hasFormData; // hide attachment if form has data

      // Read-only states (used when the element is shown)
      const isFormReadOnly = readOnly || empReadOnly || hasAttachment; // if attachment exists, form is hidden anyway, but keep for safety
      const isAttachmentReadOnly =
        readOnly ||
        empReadOnly ||
        hasFormData ||
        actions.some((a) => a === "APPROVE" || a === "REJECT");

      const remark = getWfRemark(idx);
      const hasRemark = remark && remark.trim() !== "";
      const isApproveOrReject = actions.some(
        (a) => a === "APPROVE" || a === "REJECT",
      );
      const isSubmitOrDraft = actions.some(
        (a) => a === "SUBMIT" || a === "DRAFT",
      );
      const showRemark = isApproveOrReject || (isSubmitOrDraft && hasRemark);
      const isRemarkReadOnly = !isApproveOrReject;

      const isUploading = uploading[`abbff_${idx}`] || false;

      // onFormChange – clears attachment if present
      const handleFormChange = (updatedForm) => {
        const currentForms = [...(values.abbffForms || [])];
        // If there is an attachment, remove it
        if (updatedForm?.abbffAttachment?.contentUrl) {
          updatedForm = { ...updatedForm, abbffAttachment: null };
        }
        // Update form data
        currentForms[idx] = updatedForm;
        onChange({ abbffForms: currentForms });

        // Clear validation errors only if matching error was present
        if (validationErrors && Object.keys(validationErrors).length > 0) {
          let hasErrorChange = false;
          const newErrors = { ...validationErrors };
          Object.keys(updatedForm).forEach((key) => {
            const errKey = `abbff_${idx}_${key}`;
            if (newErrors[errKey]) {
              delete newErrors[errKey];
              hasErrorChange = true;
            }
          });
          if (hasErrorChange) {
            setValidationErrors(newErrors);
          }
        }
      };

      return (
        <Card
          sx={{ mb: 3, borderRadius: "12px", border: `1px solid ${boiBorder}` }}
        >
          <CardContent>
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  color: boiBlue,
                  borderLeft: `3px solid ${boiBlue}`,
                  pl: 1.5,
                }}
              >
                ABBFF Format Form - {displayName}
                {hasFormData && !hasAttachment && (
                  <Chip
                    label="Form filled"
                    size="small"
                    sx={{ ml: 2, bgcolor: themeColors.success, color: "white" }}
                  />
                )}
                {hasAttachment && !hasFormData && (
                  <Chip
                    label="Attachment uploaded"
                    size="small"
                    sx={{ ml: 2, bgcolor: boiBlue, color: "white" }}
                  />
                )}
              </Typography>
              {showForm && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={isExpanded ? <ExpandLessIcon /> : <EditIcon />}
                  onClick={() => handleToggleABBFFForm(idx)}
                  sx={{ bgcolor: boiBlue, textTransform: "none" }}
                >
                  {isExpanded
                    ? "Hide ABBFF Form"
                    : isFormReadOnly
                      ? "View ABBFF Form"
                      : "Fill ABBFF Form"}
                </Button>
              )}
            </Box>

            {/* ==================== ATTACHMENT – shown only if form not filled ==================== */}
            {showAttachment && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 500 }}>
                  ABBFF Attachment
                </Typography>
                <Box
                  sx={{
                    border: `1px dashed ${boiBorder}`,
                    borderRadius: "10px",
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: isAttachmentReadOnly ? "#f5f5f5" : "#fafcff",
                    cursor: isAttachmentReadOnly ? "default" : "pointer",
                    "&:hover": {
                      bgcolor: isAttachmentReadOnly ? "#f5f5f5" : "#f0f5fa",
                    },
                  }}
                  onClick={() => {
                    if (!isAttachmentReadOnly) {
                      document
                        .getElementById(`abbff-attachment-${idx}`)
                        ?.click();
                    }
                  }}
                >
                  <Typography
                    color={isAttachmentReadOnly ? "#999" : "text.secondary"}
                    sx={{
                      fontSize: "0.875rem",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {safeForm?.abbffAttachment?.fileName ||
                      "Upload ABBFF Attachment"}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {isUploading && (
                      <CircularProgress size={20} sx={{ color: boiBlue }} />
                    )}
                    {!isUploading && safeForm?.abbffAttachment?.contentUrl && (
                      <>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              safeForm.abbffAttachment.contentUrl,
                              "_blank",
                            );
                          }}
                          aria-label="download attachment"
                        >
                          <DownloadIcon sx={{ color: boiBlue }} />
                        </IconButton>
                        {!isAttachmentReadOnly && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeABBFFAttachment(idx);
                            }}
                            aria-label="delete attachment"
                          >
                            <DeleteIcon sx={{ color: boiErrorRed }} />
                          </IconButton>
                        )}
                      </>
                    )}
                    {!isUploading &&
                      !safeForm?.abbffAttachment?.contentUrl &&
                      !isAttachmentReadOnly && (
                        <CloudUploadIcon sx={{ color: boiBlue }} />
                      )}
                  </Box>
                  <input
                    id={`abbff-attachment-${idx}`}
                    type="file"
                    hidden
                    accept=".pdf,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.bmp,.webp"
                    disabled={isAttachmentReadOnly}
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleABBFFAttachmentUpload(e.target.files[0], idx);
                      }
                      e.target.value = "";
                    }}
                  />
                </Box>
              </Box>
            )}

            {/* ==================== COLLAPSIBLE FORM – shown only if no attachment ==================== */}
            {showForm && (
              <Collapse in={isExpanded}>
                <Box sx={{ mt: 2 }}>
                  <ABBFFFormTab
                    values={safeForm}
                    onChange={handleFormChange}
                    readOnly={isFormReadOnly}
                    validationErrors={validationErrors}
                    employeeIndex={idx}
                    activityLogs={activityLogs}
                  />
                </Box>

                {!isExpanded &&
                  safeForm?.status === "submitted" &&
                  actions.length === 0 && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 1.5,
                        bgcolor: "#e8f5e9",
                        borderRadius: "8px",
                        textAlign: "center",
                      }}
                    >
                      <Typography variant="caption" sx={{ color: "#2e7d32" }}>
                        ✓ ABBFF Form submitted for approval
                      </Typography>
                    </Box>
                  )}
              </Collapse>
            )}
            {/* ==================== REMARK – ALWAYS VISIBLE IF APPLICABLE ==================== */}
            {showRemark && (
              <MuiTextField
                label="Remark"
                multiline
                rows={3}
                fullWidth
                value={remark}
                onChange={(e) => updateWfRemark(idx, e.target.value)}
                disabled={isRemarkReadOnly}
                required={actions.includes("REJECT")}
                error={!!validationErrors[`remark_${idx}`]}
                helperText={
                  validationErrors[`remark_${idx}`] ||
                  (actions.includes("REJECT")
                    ? "Remark is required for Reject"
                    : "")
                }
                sx={{ mt: 2 }}
              />
            )}

            {/* ==================== ACTION BUTTONS – ALWAYS VISIBLE ==================== */}
            {actions.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  mt: 3,
                  flexWrap: "wrap",
                }}
              >
                {actions.map((action) => {
                  let variant = "contained";
                  let bgcolor = themeColors.orange;
                  let color = "white";
                  let isOutline = false;

                  switch (action) {
                    case "APPROVE":
                      bgcolor = themeColors.success;
                      break;
                    case "REJECT":
                      bgcolor = themeColors.error;
                      break;
                    case "SUBMIT":
                      bgcolor = themeColors.orange;
                      break;
                    case "DRAFT":
                      variant = "outlined";
                      bgcolor = "transparent";
                      color = themeColors.muted;
                      isOutline = true;
                      break;
                    default:
                      bgcolor = themeColors.orange;
                  }

                  const disabled =
                    isSaving ||
                    isSubmitting ||
                    (action === "REJECT" && !remark.trim());

                  return (
                    <Button
                      key={action}
                      variant={variant}
                      size="large"
                      onClick={() => handleAction(idx, action)}
                      disabled={disabled}
                      sx={{
                        bgcolor: isOutline ? "transparent" : bgcolor,
                        color: isOutline ? color : "white",
                        border: isOutline ? `1px solid ${color}` : "none",
                        "&:hover": {
                          bgcolor: isOutline
                            ? "rgba(92, 108, 124, 0.04)"
                            : bgcolor,
                        },
                      }}
                    >
                      {isSaving || isSubmitting ? "Processing..." : action}
                    </Button>
                  );
                })}
              </Box>
            )}

            {activityLogs.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography
                  sx={{ fontWeight: 700, fontSize: 14, mb: 1, color: boiBlue }}
                >
                  Activity Log
                </Typography>
                <Box sx={{ overflowX: "auto" }}>
                  <Table
                    size="small"
                    sx={{ border: `1px solid ${boiBorder}`, minWidth: 700 }}
                  >
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f3f6f9" }}>
                        {[
                          "Action",
                          "Performed By",
                          "Role",
                          "Date & Time",
                          "Remarks",
                        ].map((heading) => (
                          <TableCell
                            key={heading}
                            sx={{
                              fontWeight: 700,
                              fontSize: 12,
                              border: `1px solid ${boiBorder}`,
                            }}
                          >
                            {heading}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activityLogs.map((log, logIndex) => (
                        <TableRow key={logIndex}>
                          <TableCell
                            sx={{
                              fontSize: 12,
                              border: `1px solid ${boiBorder}`,
                            }}
                          >
                            {log.action || "-"}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: 12,
                              border: `1px solid ${boiBorder}`,
                            }}
                          >
                            {log.name || "-"}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: 12,
                              border: `1px solid ${boiBorder}`,
                            }}
                          >
                            {log.wfCurrentRoleAssign || "-"}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: 12,
                              border: `1px solid ${boiBorder}`,
                            }}
                          >
                            {log.approvalTime || "-"}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: 12,
                              border: `1px solid ${boiBorder}`,
                            }}
                          >
                            {log.remarks || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      );
    };

    // ==================== APPROVAL SECTIONS (unchanged) ====================
    const renderDOApprovalSection = (approval, idx) => {
      const showComments = approval?.isApprove === "Revert";
      const hasApproveError = validationErrors[`do_${idx}_isApprove`];
      const hasCommentError = validationErrors[`do_${idx}_comments`];
      const abbffForms = values.abbffForms || [];
      const hasForm = abbffForms[idx]?.status === "submitted";
      const displayName = getEmployeeDisplay(persons[idx], idx);

      return (
        <Card
          sx={{ mb: 3, borderRadius: "12px", border: `1px solid ${boiBorder}` }}
        >
          <CardContent>
            <Typography
              sx={{
                fontWeight: 700,
                color: boiBlue,
                mb: 2,
                borderLeft: `3px solid ${boiBlue}`,
                pl: 1.5,
              }}
            >
              DO Checker ABBFF Form
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, mb: 2, color: boiBlue }}
            >
              {displayName}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                disabled={!hasForm}
                onClick={() => handleToggleABBFFForm(idx)}
                sx={{ textTransform: "none" }}
              >
                View the filled form
              </Button>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "flex-start",
                gap: 2,
              }}
            >
              <Box sx={{ flex: "0 0 250px", minWidth: "200px" }}>
                <CustomAutocomplete
                  label="Is Approve"
                  options={APPROVE_REVERT_OPTIONS}
                  value={approval?.isApprove || null}
                  onChange={(e, v) => updateDOApproval(idx, "isApprove", v)}
                  disabled={readOnly}
                  required
                  error={!!hasApproveError}
                  helperText={hasApproveError}
                  fullWidth
                />
              </Box>
              {showComments && (
                <Box sx={{ flex: 1, minWidth: "250px" }}>
                  <CustomTextField
                    label="Comments"
                    value={approval?.comments || ""}
                    onChange={(e) =>
                      handleCommentChange(updateDOApproval, idx, e.target.value)
                    }
                    disabled={readOnly}
                    multiline
                    minRows={2}
                    maxRows={4}
                    maxLength={500}
                    required
                    error={!!hasCommentError}
                    helperText={
                      hasCommentError || "Please provide reason for revert"
                    }
                    fullWidth
                    placeholder="Enter reason for revert..."
                  />
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      );
    };

    const renderDGMApprovalSection = (approval, idx) => {
      const showComments = approval?.isApprove === "Revert";
      const hasApproveError = validationErrors[`dgm_${idx}_isApprove`];
      const hasCommentError = validationErrors[`dgm_${idx}_comments`];
      const abbffForms = values.abbffForms || [];
      const hasForm = abbffForms[idx]?.status === "submitted";
      const displayName = getEmployeeDisplay(persons[idx], idx);

      return (
        <Card
          sx={{ mb: 3, borderRadius: "12px", border: `1px solid ${boiBorder}` }}
        >
          <CardContent>
            <Typography
              sx={{
                fontWeight: 700,
                color: boiBlue,
                mb: 2,
                borderLeft: `3px solid ${boiBlue}`,
                pl: 1.5,
              }}
            >
              DGM ABBFF Form
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, mb: 2, color: boiBlue }}
            >
              {displayName}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                disabled={!hasForm}
                onClick={() => handleToggleABBFFForm(idx)}
                sx={{ textTransform: "none" }}
              >
                View the filled form
              </Button>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "flex-start",
                gap: 2,
              }}
            >
              <Box sx={{ flex: "0 0 250px", minWidth: "200px" }}>
                <CustomAutocomplete
                  label="Is Approve"
                  options={APPROVE_REVERT_OPTIONS}
                  value={approval?.isApprove || null}
                  onChange={(e, v) => updateDGMApproval(idx, "isApprove", v)}
                  disabled={readOnly}
                  required
                  error={!!hasApproveError}
                  helperText={hasApproveError}
                  fullWidth
                />
              </Box>
              {showComments && (
                <Box sx={{ flex: 1, minWidth: "250px" }}>
                  <CustomTextField
                    label="Comments"
                    value={approval?.comments || ""}
                    onChange={(e) =>
                      handleCommentChange(
                        updateDGMApproval,
                        idx,
                        e.target.value,
                      )
                    }
                    disabled={readOnly}
                    multiline
                    minRows={2}
                    maxRows={4}
                    maxLength={500}
                    required
                    error={!!hasCommentError}
                    helperText={
                      hasCommentError || "Please provide reason for revert"
                    }
                    fullWidth
                    placeholder="Enter reason for revert..."
                  />
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      );
    };

    const renderACVOApprovalSection = (approval, idx) => {
      const showComments = approval?.isApprove === "Revert";
      const hasApproveError = validationErrors[`acvo_${idx}_isApprove`];
      const hasCommentError = validationErrors[`acvo_${idx}_comments`];
      const abbffForms = values.abbffForms || [];
      const hasForm = abbffForms[idx]?.status === "submitted";
      const displayName = getEmployeeDisplay(persons[idx], idx);

      return (
        <Card
          sx={{ mb: 3, borderRadius: "12px", border: `1px solid ${boiBorder}` }}
        >
          <CardContent>
            <Typography
              sx={{
                fontWeight: 700,
                color: boiBlue,
                mb: 2,
                borderLeft: `3px solid ${boiBlue}`,
                pl: 1.5,
              }}
            >
              ACVO ABBFF Form
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, mb: 2, color: boiBlue }}
            >
              {displayName}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                disabled={!hasForm}
                onClick={() => handleToggleABBFFForm(idx)}
                sx={{ textTransform: "none" }}
              >
                View the filled form
              </Button>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "flex-start",
                gap: 2,
              }}
            >
              <Box sx={{ flex: "0 0 250px", minWidth: "200px" }}>
                <CustomAutocomplete
                  label="Is Approve"
                  options={APPROVE_REVERT_OPTIONS}
                  value={approval?.isApprove || null}
                  onChange={(e, v) => updateACVOApproval(idx, "isApprove", v)}
                  disabled={readOnly}
                  required
                  error={!!hasApproveError}
                  helperText={hasApproveError}
                  fullWidth
                />
              </Box>
              {showComments && (
                <Box sx={{ flex: 1, minWidth: "250px" }}>
                  <CustomTextField
                    label="Comments"
                    value={approval?.comments || ""}
                    onChange={(e) =>
                      handleCommentChange(
                        updateACVOApproval,
                        idx,
                        e.target.value,
                      )
                    }
                    disabled={readOnly}
                    multiline
                    minRows={2}
                    maxRows={4}
                    maxLength={500}
                    required
                    error={!!hasCommentError}
                    helperText={
                      hasCommentError || "Please provide reason for revert"
                    }
                    fullWidth
                    placeholder="Enter reason for revert..."
                  />
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      );
    };

    const renderCVOApprovalSection = (approval, idx) => {
      const showComments = approval?.isApprove === "Revert";
      const hasApproveError = validationErrors[`cvo_${idx}_isApprove`];
      const hasCommentError = validationErrors[`cvo_${idx}_comments`];
      const abbffForms = values.abbffForms || [];
      const hasForm = abbffForms[idx]?.status === "submitted";
      const displayName = getEmployeeDisplay(persons[idx], idx);

      return (
        <Card
          sx={{ mb: 3, borderRadius: "12px", border: `1px solid ${boiBorder}` }}
        >
          <CardContent>
            <Typography
              sx={{
                fontWeight: 700,
                color: boiBlue,
                mb: 2,
                borderLeft: `3px solid ${boiBlue}`,
                pl: 1.5,
              }}
            >
              CVO ABBFF Form
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, mb: 2, color: boiBlue }}
            >
              {displayName}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                disabled={!hasForm}
                onClick={() => handleToggleABBFFForm(idx)}
                sx={{ textTransform: "none" }}
              >
                View the filled form
              </Button>
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "flex-start",
                gap: 2,
              }}
            >
              <Box sx={{ flex: "0 0 250px", minWidth: "200px" }}>
                <CustomAutocomplete
                  label="Is Approve"
                  options={APPROVE_OPTIONS}
                  value={approval?.isApprove || null}
                  onChange={(e, v) => updateCVOApproval(idx, "isApprove", v)}
                  disabled={readOnly}
                  required
                  error={!!hasApproveError}
                  helperText={hasApproveError}
                  fullWidth
                />
              </Box>
              {showComments && (
                <Box sx={{ flex: 1, minWidth: "250px" }}>
                  <CustomTextField
                    label="Comments"
                    value={approval?.comments || ""}
                    onChange={(e) =>
                      handleCommentChange(
                        updateCVOApproval,
                        idx,
                        e.target.value,
                      )
                    }
                    disabled={readOnly}
                    multiline
                    minRows={2}
                    maxRows={4}
                    maxLength={500}
                    required
                    error={!!hasCommentError}
                    helperText={
                      hasCommentError || "Please provide reason for revert"
                    }
                    fullWidth
                    placeholder="Enter reason for revert..."
                  />
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      );
    };

    const renderApprovalDetailsSection = (detail, idx) => {
      const displayName = getEmployeeDisplay(persons[idx], idx);
      return (
        <Card
          sx={{ mb: 3, borderRadius: "12px", border: `1px solid ${boiBorder}` }}
        >
          <CardContent>
            <Typography
              sx={{
                fontWeight: 700,
                color: boiBlue,
                mb: 2,
                borderLeft: `3px solid ${boiBlue}`,
                pl: 1.5,
              }}
            >
              ABBFF Approved Details - {displayName}
            </Typography>
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <CustomTextField
                type="date"
                label="Date of Approval"
                value={detail?.dateOfApproval}
                onChange={(date) =>
                  updateApprovalDetails(idx, "dateOfApproval", date)
                }
                disabled={readOnly}
                fullWidth
              />
              <CustomTextField
                type="file"
                label="Attachment"
                name={`approval-attachment-${idx}`}
                value={detail?.attachment}
                onChange={(file) =>
                  updateApprovalDetails(idx, "attachment", file)
                }
                disabled={readOnly}
                fullWidth
              />
            </Box>
          </CardContent>
        </Card>
      );
    };

    // ==================== APPROVAL UPDATE FUNCTIONS ====================
    const updateDOApproval = useCallback(
      (idx, field, value) => {
        const updated = [...(values.doABBFFApprovals || [])];
        if (!updated[idx]) updated[idx] = {};
        updated[idx] = { ...updated[idx], [field]: value };
        onChange({ doABBFFApprovals: updated });
        if (validationErrors[`do_${idx}_${field}`]) {
          const newErrors = { ...validationErrors };
          delete newErrors[`do_${idx}_${field}`];
          setValidationErrors(newErrors);
        }
      },
      [
        values.doABBFFApprovals,
        onChange,
        validationErrors,
        setValidationErrors,
      ],
    );

    const updateDGMApproval = useCallback(
      (idx, field, value) => {
        const updated = [...(values.dgmABBFFApprovals || [])];
        if (!updated[idx]) updated[idx] = {};
        updated[idx] = { ...updated[idx], [field]: value };
        onChange({ dgmABBFFApprovals: updated });
      },
      [values.dgmABBFFApprovals, onChange],
    );

    const updateACVOApproval = useCallback(
      (idx, field, value) => {
        const updated = [...(values.acvoABBFFApprovals || [])];
        if (!updated[idx]) updated[idx] = {};
        updated[idx] = { ...updated[idx], [field]: value };
        onChange({ acvoABBFFApprovals: updated });
      },
      [values.acvoABBFFApprovals, onChange],
    );

    const updateCVOApproval = useCallback(
      (idx, field, value) => {
        const updated = [...(values.cvoABBFFApprovals || [])];
        if (!updated[idx]) updated[idx] = {};
        updated[idx] = { ...updated[idx], [field]: value };
        onChange({ cvoABBFFApprovals: updated });
      },
      [values.cvoABBFFApprovals, onChange],
    );

    const updateApprovalDetails = useCallback(
      (idx, field, value) => {
        const updated = [...(values.abbffApprovalDetails || [])];
        if (!updated[idx]) updated[idx] = {};
        updated[idx] = { ...updated[idx], [field]: value };
        onChange({ abbffApprovalDetails: updated });
      },
      [values.abbffApprovalDetails, onChange],
    );

    const handleCommentChange = (updateFn, idx, value) => {
      updateFn(idx, "comments", value);
    };

    const handleToggleABBFFForm = (idx) => {
      if (expandedABBFFIndex === idx) {
        setExpandedABBFFIndex(null);
      } else {
        setExpandedABBFFIndex(idx);
      }
    };

    // ==================== DATA FOR RENDERING ====================
    const doApprovals = values.doABBFFApprovals || [];
    const dgmApprovals = values.dgmABBFFApprovals || [];
    const acvoApprovals = values.acvoABBFFApprovals || [];
    const cvoApprovals = values.cvoABBFFApprovals || [];
    const approvalDetails = values.abbffApprovalDetails || [];
    const abbffForms = values.abbffForms || [];

    const visibleFraudFields = fraudDetailsFields.filter(
      (field) => !field.condition || field.condition(values),
    );

    const hasFraudData = visibleFraudFields.some((field) => {
      const val = values[field.name];
      if (val === null || val === undefined || val === "" || val === 0)
        return false;
      if (Array.isArray(val)) return val.length > 0;
      return true;
    });

    // ==================== MAIN RENDER ====================
    return (
      <Box>
        {/* Complaint Details Section */}
        <Card
          sx={{ mb: 3, borderRadius: "12px", border: `1px solid ${boiBorder}` }}
        >
          <CardContent>
            <Typography
              sx={{
                fontWeight: 700,
                color: boiBlue,
                mb: 2,
                borderLeft: `3px solid ${boiBlue}`,
                pl: 1.5,
              }}
            >
              Complaint Details
            </Typography>
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <CustomTextField
                label="Complaint Number"
                value={values.complaintNumber || ""}
                disabled
                fullWidth
              />
              <CustomAutocomplete
                label="Incident Occurred at"
                options={abbffFormOptionsMap.IncidentOptions || []}
                value={values.incidentOccurredAt || null}
                disabled={true}
                fullWidth
              />
              {values.incidentOccurredAt === "FGMO" && (
                <CustomTextField
                  label="FGMO Name"
                  value={values.fgmoName || ""}
                  disabled
                  fullWidth
                />
              )}
              {values.incidentOccurredAt === "ZONE" && (
                <CustomTextField
                  label="Zone Name"
                  value={values.zoneName || ""}
                  disabled
                  fullWidth
                />
              )}
              {values.incidentOccurredAt === "Branch" && (
                <CustomTextField
                  label="Branch Name"
                  value={values.branchName || ""}
                  disabled
                  fullWidth
                />
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Fraud Details Section */}
        {hasFraudData && (
          <Card
            sx={{
              mb: 3,
              borderRadius: "12px",
              border: `1px solid ${boiBorder}`,
            }}
          >
            <CardContent>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: boiBlue,
                  mb: 2,
                  borderLeft: `3px solid ${boiBlue}`,
                  pl: 1.5,
                }}
              >
                Fraud Details
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 2,
                }}
              >
                {visibleFraudFields.map((field) => (
                  <Box key={field.name}>{renderFraudFieldItem(field)}</Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Person Tabs */}
        <Card
          sx={{ mb: 3, borderRadius: "12px", border: `1px solid ${boiBorder}` }}
        >
          <CardContent>
            <Typography
              sx={{
                fontWeight: 700,
                color: boiBlue,
                mb: 2,
                borderLeft: `3px solid ${boiBlue}`,
                pl: 1.5,
              }}
            >
              Employee Details
            </Typography>

            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                mb: 2,
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              {persons.map((person, idx) => (
                <Button
                  key={idx}
                  onClick={() => setActivePersonTab(idx)}
                  sx={{
                    px: 3,
                    py: 1,
                    borderRadius: "8px 8px 0 0",
                    backgroundColor:
                      activePersonTab === idx ? boiBlue : "transparent",
                    color: activePersonTab === idx ? "white" : "#666",
                  }}
                >
                  {getEmployeeDisplay(person, idx)}
                </Button>
              ))}
            </Box>

            {/* Person-wise Content */}
            {persons.map((person, idx) => (
              <Box
                key={idx}
                sx={{ display: activePersonTab === idx ? "block" : "none" }}
              >
                {renderPersonDetailsCard(person, idx)}
                {renderABBFFFormTab(abbffForms[idx], idx)}
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* Floating scroll buttons */}
        <Box
          sx={{
            position: "fixed",
            bottom: 80,
            right: 20,
            display: "flex",
            flexDirection: "column",
            gap: 1,
            zIndex: 1000,
          }}
        >
          {!isAtTop && (
            <Fab
              size="small"
              color="primary"
              aria-label="scroll to top"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <KeyboardArrowUpIcon />
            </Fab>
          )}
          {!isAtBottom && (
            <Fab
              size="small"
              color="primary"
              aria-label="scroll to bottom"
              onClick={() =>
                window.scrollTo({
                  top: document.documentElement.scrollHeight,
                  behavior: "smooth",
                })
              }
            >
              <KeyboardArrowDownIcon />
            </Fab>
          )}
        </Box>
      </Box>
    );
  },
);
