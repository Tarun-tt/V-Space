export const documentOptions = [
  { label: "Select", value: "" },
  { label: "Aadhar Card", value: "Aadhar Card" },
  { label: "Pan Card", value: "Pan Card" },
  { label: "Voter Card", value: "Voter Card" },
];

export const genderOptions = [
  { label: "Select Gender", value: "" },
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
];

export const MtOptions = [
  { label: "Select", value: "" },
  { label: "MT103", value: "MT103" },
  { label: "MT202", value: "MT202" },
];

export const actions = [
  {
    type: "link",
    label: "Scan",
    onClick: () => {
      if (typeof window.setScanModalOpen === "function") {
        window.setScanModalOpen(true);
      }
    },
    className: "btn btn-primary mt-2",
  },
  {
    type: "link",
    label: "Import Files",
    onClick: () => {
      window.importFromHDD?.();
    },
    className: "btn btn-primary mt-2",
  },

  {
    type: "button",
    label: "Save",
    disabled: false,
    className: "btn btn-save mt-2",
  },
];

export const actionsfile = [
  {
    type: "button",
    label: "Insert After",
    className: "btn btn-primary mt-2",
    onClick: () => {
      window.insertAfter?.();
    },
  },
  {
    type: "button",
    label: "Insert Before",
    className: "btn btn-primary mt-2",
    onClick: () => {
      window.insertBefore?.();
    },
  },
  {
    type: "button",
    label: "Delete Page",
    className: "btn btn-primary mt-2",
    onClick: () => {
      window.deleteCurrent?.();
    },
  },
  {
    type: "button",
    label: "Export",
    className: "btn btn-save mt-2",
    disabled: false,
  },
];
export const formatDateForInput = (isoDateString) => {
  if (!isoDateString) return "";

  try {
    const date = new Date(isoDateString);

    if (isNaN(date.getTime())) {
      console.warn("Invalid date string:", isoDateString);
      return "";
    }

    const isoDatePattern = /^(\d{4,})-(\d{2})-(\d{2})/;
    const match = isoDateString.match(isoDatePattern);

    if (match) {
      const year = match[1];
      const month = match[2];
      const day = match[3];

      if (
        parseInt(month) >= 1 &&
        parseInt(month) <= 12 &&
        parseInt(day) >= 1 &&
        parseInt(day) <= 31
      ) {
        return `${year}-${month}-${day}`;
      }
    }

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date:", error, isoDateString);
    return "";
  }
};

////////////////////////////////////////////////////////////////////////////FBD start
export const metaDataFields = [
  {
    label: "Date",
    name: "date",
    type: "date",
    required: true,
    maxLength: 30,
    readOnly: true,
    value: new Date().toISOString().split("T")[0],
  },
  {
    label: "NBG Name",
    name: "nbgCode",
    type: "text",
    required: true,
    maxLength: 50,
    readOnly: true,
  },
  {
    label: "Zone",
    name: "zone",
    type: "text",
    required: true,
    maxLength: 50,
    readOnly: true,
  },
  {
    label: "Branch",
    name: "branchCode",
    type: "text",
    required: true,
    maxLength: 50,
    readOnly: true,
  },
];

export const additionalDocumentFields = [
  {
    label: "Finacle Reference No",
    name: "finacleReferenceNo",
    type: "text",
    required: true,
    maxLength: 50,
    pattern: "^[a-zA-Z0-9 ]*$",
    errorMessage: "Special characters are not allowed",
  },
  {
    label: "MT Type",
    name: "mtType",
    type: "select",
    required: true,
    optionsKey: "MtOptions",
  },
];

export const decisionFields = [
  {
    label: "Decision",
    name: "decision",
    type: "text",
    required: false,
    maxLength: 50,
    pattern: "^[a-zA-Z0-9 ]*$",
    errorMessage: "Special characters are not allowed",
  },
];

export const allFields = [
  ...metaDataFields,
  ...additionalDocumentFields,
  ...decisionFields,
];

export const getInitialFormState = () => {
  const formState = {};

  allFields.forEach((field) => {
    if (field.name.includes(".")) {
      const [parent, child] = field.name.split(".");
      if (!formState[parent]) {
        formState[parent] = {};
      }
      formState[parent][child] = "";
    } else {
      formState[field.name] = "";
    }
  });

  return formState;
};

export const docmetaDataFields = [
  {
    id: "documentDetailedFile",
    name: "Document",
    fromField: "documentDetailedFrom",
    toField: "documentDetailedTo",
    file: "documentDetailedFile",
  },
];
