export const documentOptions = [
  { label: "Select", value: "" },
  { label: "Technical Document", value: "Technical Document" },
  { label: "Information Management", value: "Information Management" },
  { label: "Consumer", value: "Consumer" },
];

export const categoryOptions = [
  { label: "Select Gender", value: "" },
  { label: "CAT 1", value: "CAT 1" },
  { label: "CAT 2", value: "CAT 2" },
  { label: "CAT 3", value: "CAT 3" },
];

export const classificationOptions = [
  { label: "Select", value: "" },
  { label: "Private", value: "Private" },
  { label: "Public", value: "Public" },
];
export const tagOptions = [
  { label: "Select", value: "" },
  { label: "TAG 1", value: "TAG 1" },
  { label: "TAG 2", value: "TAG 2" },
  { label: "TAG 3", value: "TAG 3" },
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

export const metaDataFields = [
  {
    label: "File Name",
    name: "fileName",
    type: "text",
    required: true,
    maxLength: 50,
    readOnly: true,
  },
  {
    label: "File Title",
    name: "fileTitle",
    type: "text",
    required: true,
    maxLength: 50,
    readOnly: true,
  },
  {
    label: "Document Type",
    name: "docType",
    type: "select",
    required: true,
    optionsKey: "documentOptions",
  },
  {
    label: "Category",
    name: "cateType",
    type: "select",
    required: true,
    optionsKey: "categoryOptions",
  },
  {
    label: "Classification",
    name: "classType",
    type: "select",
    required: true,
    optionsKey: "classificationOptions",
  },
  {
    label: "Tags",
    name: "tagsType",
    type: "select",
    required: true,
    optionsKey: "tagOptions",
  },
  {
    label: "Keyword",
    name: "keyword",
    type: "text",
    required: true,
    maxLength: 50,
    readOnly: true,
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

export const allFields = [...metaDataFields, ...decisionFields];

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
