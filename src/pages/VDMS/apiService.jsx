const BASE_URL = "";

const getHeaders = () => {
  const csrfToken = window?.Liferay?.authToken || "";
  return {
    "x-csrf-token": csrfToken,
    "Content-Type": "application/json",
  };
};

const getPortalURL = () => {
  if (window?.Liferay?.ThemeDisplay?.getPortalURL) {
    return window.Liferay.ThemeDisplay.getPortalURL();
  }
  return `${window.location.protocol}//${window.location.host}`;
};

const getScopeGroupId = () => {
  if (window?.Liferay?.ThemeDisplay?.getScopeGroupId) {
    return window.Liferay.ThemeDisplay.getScopeGroupId();
  }
  return "";
};

export const createFolder = async (folderData) => {
  try {
    const portalURL = getPortalURL();
    const response = await fetch(`${portalURL}/o/combined-docs/submit/folder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
      body: JSON.stringify(folderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    let data;
    const responseText = await response.text();

    try {
      data = JSON.parse(responseText);
      return {
        success: true,
        data: data,
        message: data.message || "Folder created successfully",
      };
    } catch {
      console.log(
        "Response is not JSON, treating as plain text:",
        responseText,
      );
      return {
        success: true,
        data: { message: responseText },
        message: responseText || "Folder created successfully",
      };
    }
  } catch (error) {
    console.error("Failed to create folder:", error);
    return {
      success: false,
      error: error.message,
      message: error.message || "Failed to create folder",
    };
  }
};

export const fetchDocuments = async ({
  search = "",
  folderId = null,
  groupId = null,
} = {}) => {
  try {
    const portalURL = getPortalURL();
    const scopeGroupId = groupId || getScopeGroupId();

    let url = `${portalURL}/o/combined-docs/items?groupId=${scopeGroupId}`;

    if (folderId) {
      url += `&parentFolderId=${folderId}`;
    }

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        ...getHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    throw error;
  }
};

export const formatAPIDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

export const submitDocument = async (
  formData,
  folderId = "",
  externalReferenceCode = null,
) => {
  try {
    const portalURL = getPortalURL();

    const formDataToSend = new FormData();
    console.log("formDataToSend", formDataToSend);

    formDataToSend.append("documentFolderId", folderId);

    if (externalReferenceCode) {
      formDataToSend.append("externalReferenceCode", externalReferenceCode);
      console.log("Updating document with ERC:", externalReferenceCode);
    }

    if (formData.title) {
      formDataToSend.append("title", formData.title);
    }

    if (formData.description) {
      formDataToSend.append("description", formData.description);
    }

    if (formData.fileName) {
      formDataToSend.append("fileName", formData.fileName);
    }

    if (formData.datePublished) {
      formDataToSend.append("datePublished", formData.datePublished);
    }

    if (formData.dateExpired) {
      formDataToSend.append("dateExpired", formData.dateExpired);
    }

    if (formData.keywords && Array.isArray(formData.keywords)) {
      formData.keywords.forEach((keyword) => {
        if (keyword && keyword.trim()) {
          formDataToSend.append("keywords", keyword.trim());
        }
      });
    }

    if (
      formData.file &&
      (formData.file instanceof File || formData.file instanceof Blob)
    ) {
      const fileToSend = formData.file;
      const fileName =
        fileToSend.name || formData.fileName || `document_${Date.now()}.tiff`;

      if (fileToSend instanceof Blob && !(fileToSend instanceof File)) {
        const file = new File([fileToSend], fileName, {
          type: fileToSend.type || "application/octet-stream",
        });
        formDataToSend.append("file", file);
      } else {
        formDataToSend.append("file", fileToSend);
      }
    }

    const headers = getHeaders();
    delete headers["Content-Type"];

    const response = await fetch(`${portalURL}/o/combined-docs/submit/file`, {
      method: "POST",
      headers: headers,
      body: formDataToSend,
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    console.log("Response text:", responseText);

    try {
      const jsonResponse = JSON.parse(responseText);
      return jsonResponse;
    } catch {
      return {
        success: true,
        message: responseText,
        data: responseText,
      };
    }
  } catch (error) {
    console.error("Failed to submit document:", error);
    throw error;
  }
};
