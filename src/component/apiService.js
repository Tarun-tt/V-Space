// const BASE_URL = "http://192.168.100.58:8080";
const BASE_URL = "";

const getHeaders = () => {
  const csrfToken = window?.Liferay?.authToken || "";
  return {
    "x-csrf-token": csrfToken,
  };
};

export const requestAccountPre = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/o/customer-account-headless-delivery/v1.0/request-meta-data`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const responseData = await response.json();
    return responseData.data;
  } catch (error) {
    throw error;
  }
};

export const getRequestAccounts = async ({
  page = 1,
  pageSize = 20,
  search = "",
  status = "",
  fromDate = "",
  toDate = "",
  exportData = false,
}) => {
  try {
    let url = `${BASE_URL}/o/boi-headless-delivery-web/v1.0/request-fbds?page=${page}&pageSize=${pageSize}`;

    if (exportData) {
      url += `&export=true`;
    }

    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${status.toLowerCase()}`;
    if (fromDate) url += `&fromDate=${formatAPIDate(fromDate)}`;
    if (toDate) url += `&toDate=${formatAPIDate(toDate)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Failed to fetch request accounts:", error);
    throw error;
  }
};

export const exportRequestAccounts = async ({
  search = "",
  status = "",
  fromDate = "",
  toDate = "",
}) => {
  try {
    let url = `${BASE_URL}/o/boi-headless-delivery-web/v1.0/request-fbds?export=true`;

    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status) url += `&status=${status.toLowerCase()}`;
    if (fromDate) url += `&fromDate=${formatAPIDate(fromDate)}`;
    if (toDate) url += `&toDate=${formatAPIDate(toDate)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Failed to export request accounts:", error);
    throw error;
  }
};
const formatAPIDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};
export const getRequestAccountDetails = async (accountId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/o/boi-headless-delivery-web/v1.0/request-fbds/${accountId}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error("❌ Failed to fetch request account details:", error);
    throw error;
  }
};

export const submitAccountOpeningForm = async (requestBody) => {
  try {
    const formData = new FormData();

    Object.entries(requestBody).forEach(([key, value]) => {
      if (
        key === "documentDetailedFile" &&
        (value instanceof Blob || value instanceof File)
      ) {
        formData.append(key, value, value.name);
      } else if (value instanceof Blob || value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === "object" && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value !== undefined ? value : "");
      }
    });

    for (let [key, val] of formData.entries()) {
      // console.log(`FormData key: ${key}, value:`, val);
    }
    const response = await fetch(
      `${BASE_URL}/o/boi-headless-delivery-web/v1.0/add-fbd/saveAsDraft`,
      {
        method: "POST",
        headers: getHeaders(),
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
export const exportAccountOpeningForm = async (requestBody) => {
  try {
    const formData = new FormData();

    Object.entries(requestBody).forEach(([key, value]) => {
      if (
        key === "documentDetailedFile" &&
        (value instanceof Blob || value instanceof File)
      ) {
        formData.append(key, value, value.name);
      } else if (value instanceof Blob || value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === "object" && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value !== undefined ? value : "");
      }
    });

    for (let [key, val] of formData.entries()) {
      // console.log(`FormData key: ${key}, value:`, val);
    }
    const response = await fetch(
      `${BASE_URL}/o/boi-headless-delivery-web/v1.0/add-fbd/saveAsExport`,
      {
        method: "POST",
        headers: getHeaders(),
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
