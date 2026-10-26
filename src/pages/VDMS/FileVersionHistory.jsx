// FileVersionHistory.jsx
import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import DataTable from "../../components/common/DataTable";
import { ToastContext } from "../../components/common/ToastContext";
import { LoadingContext } from "../../components/common/LoadingContext";
import { boiBlue, boiBorder } from "../../theme/theme";

const FileVersionHistory = () => {
  const { externalReferenceCode } = useParams();
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [versionData, setVersionData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [fileInfo, setFileInfo] = useState(null);

  const getPortalURL = () => {
    if (window?.Liferay?.ThemeDisplay?.getPortalURL) {
      return window.Liferay.ThemeDisplay.getPortalURL();
    }
    return `${window.location.protocol}//${window.location.host}`;
  };

  const getHeaders = () => {
    const csrfToken = window?.Liferay?.authToken || "";
    return {
      "x-csrf-token": csrfToken,
      "Content-Type": "application/json",
    };
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      return new Date(timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0 || !bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const parseDescription = (description) => {
    if (!description) return null;
    try {
      if (description.startsWith("[") || description.startsWith("{")) {
        const parsed = JSON.parse(description);
        return Array.isArray(parsed) ? parsed[0] : parsed;
      }
    } catch (e) {
      console.log("Description parsing failed:", e);
    }
    return null;
  };

  const fetchVersionHistory = useCallback(async () => {
    try {
      setLoading(true);
      showLoading("Loading version history...", "Fetching versions from server");
      const portalURL = getPortalURL();
      const response = await fetch(
        `${portalURL}/o/combined-docs/items/file-versions/${externalReferenceCode}?page=${page}&pageSize=${pageSize}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            ...getHeaders(),
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const resData = await response.json();
      console.log("Version history data:", resData);

      setTotalCount(resData.total || 0);

      if (resData.items && Array.isArray(resData.items)) {
        const processedItems = resData.items.map((item) => {
          const parsedDesc = parseDescription(item.description);

          return {
            ...item,
            version: item.version || "1.0",
            userName: item.userName || "Unknown",
            formattedDate: formatDate(item.modifiedDate || item.createDate),
            formattedSize: formatFileSize(item.size),
            description: parsedDesc?.description || "",
            docType: parsedDesc?.docType || "",
            category: parsedDesc?.category || "",
            tags: parsedDesc?.tags || parsedDesc?.keyword || "",
            classification: parsedDesc?.classification || "",
          };
        });
        setVersionData(processedItems);

        if (processedItems.length > 0 && !fileInfo) {
          setFileInfo({
            fileName: processedItems[0].fileName,
            title: processedItems[0].title,
            fileExtension: processedItems[0].fileExtension,
          });
        }
      } else {
        setVersionData([]);
      }
    } catch (err) {
      console.error("Error fetching version history:", err);
      showToast({
        message: `Failed to load version history: ${err.message}`,
        type: "danger",
        title: "Error",
      });
      setVersionData([]);
    } finally {
      setLoading(false);
      hideLoading();
    }
  }, [externalReferenceCode, page, pageSize, fileInfo, showLoading, hideLoading, showToast]);

  useEffect(() => {
    if (externalReferenceCode) {
      fetchVersionHistory();
    }
  }, [fetchVersionHistory, externalReferenceCode]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleDownload = async (friendlyUrlPath, fileName, version) => {
    try {
      setDownloading(true);
      showLoading(
        `Downloading version ${version}...`,
        `Preparing ${fileName}`
      );
      const portalURL = getPortalURL();
      const downloadUrl = `${portalURL}${friendlyUrlPath}`;

      showToast({
        message: `Starting download for version ${version}...`,
        type: "info",
        title: "Downloading",
        autoClose: 2000,
      });

      const response = await fetch(downloadUrl, {
        method: "GET",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const extension = fileName.split(".").pop();
      const downloadFileName = version
        ? `${fileName.replace(`.${extension}`, "")}_v${version}.${extension}`
        : fileName;
      link.download = downloadFileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast({
        message: `Download started: ${downloadFileName}`,
        type: "success",
        title: "Download",
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Download failed:", err);
      showToast({
        message: `Failed to download file: ${err.message}`,
        type: "danger",
        title: "Download Failed",
      });
    } finally {
      setDownloading(false);
      hideLoading();
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const columns = [
    {
      label: "Version",
      id: "version",
      render: (row) => (
        <Box
          component="span"
          sx={{
            px: 1,
            py: 0.5,
            bgcolor: boiBlue,
            color: "#fff",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {row.version}
        </Box>
      ),
    },
    {
      label: "File Name",
      id: "fileName",
      render: (row) => (
        <Box>
          <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
            {row.fileName}
          </Typography>
          {row.title && row.title !== row.fileName && (
            <Typography sx={{ color: "text.secondary", fontSize: 11 }}>
              Title: {row.title}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      label: "Type",
      id: "fileExtension",
      render: (row) => (
        <Box
          component="span"
          sx={{
            bgcolor: "#e9ecef",
            px: 1,
            py: 0.5,
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: 600,
            color: "#495057",
          }}
        >
          {row.fileExtension?.toUpperCase() || "N/A"}
        </Box>
      ),
    },
    {
      label: "Size",
      id: "formattedSize",
    },
    {
      label: "Modified Date",
      id: "formattedDate",
    },
    {
      label: "Modified By",
      id: "userName",
    },
    {
      label: "Document Type",
      id: "docType",
      render: (row) => row.docType || "-",
    },
    {
      label: "Category",
      id: "category",
      render: (row) => row.category || "-",
    },
    {
      label: "Tags",
      id: "tags",
      render: (row) =>
        row.tags ? (
          <Box
            component="span"
            sx={{
              bgcolor: "#6c757d",
              color: "#fff",
              px: 1,
              py: 0.5,
              borderRadius: "4px",
              fontSize: "11px",
            }}
          >
            {row.tags}
          </Box>
        ) : (
          "-"
        ),
    },
    {
      label: "Classification",
      id: "classification",
      render: (row) => row.classification || "-",
    },
    {
      label: "Actions",
      id: "actions",
      render: (row) => (
        <Button
          size="small"
          variant="contained"
          color="success"
          onClick={() =>
            handleDownload(row.friendlyUrlPath, row.fileName, row.version)
          }
          disabled={downloading}
          sx={{
            textTransform: "none",
            fontSize: 12,
            py: 0.5,
            px: 1.5,
            borderRadius: "6px",
          }}
        >
          {downloading ? "Downloading..." : "📥 Download"}
        </Button>
      ),
    },
  ];

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
          Version History
        </Typography>
        <Button
          variant="outlined"
          onClick={handleGoBack}
          sx={{
            borderRadius: "8px",
            borderColor: boiBorder,
            color: "text.primary",
            textTransform: "none",
          }}
        >
          ← Back
        </Button>
      </Box>

      {fileInfo && (
        <Box
          sx={{
            p: 2.5,
            mb: 3,
            bgcolor: "#fff",
            borderRadius: "12px",
            border: `1px solid ${boiBorder}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
            File Information
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            <Box>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                File Name:
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>{fileInfo.fileName}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                Title:
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>{fileInfo.title || "-"}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                File Type:
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {fileInfo.fileExtension?.toUpperCase() || "N/A"}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <CircularProgress size={40} sx={{ color: boiBlue, mb: 2 }} />
          <Typography sx={{ color: "text.secondary" }}>
            Loading version history...
          </Typography>
        </Box>
      ) : versionData.length > 0 ? (
        <DataTable
          columns={columns}
          rows={versionData}
          totalRows={totalCount}
          page={page}
          rowsPerPage={pageSize}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handlePageSizeChange}
          getRowId={(row) => row.version || row.id || Math.random()}
        />
      ) : (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            bgcolor: "#fff",
            borderRadius: "12px",
            border: `1px solid ${boiBorder}`,
          }}
        >
          <Box sx={{ fontSize: 48, mb: 1 }}>📄</Box>
          <Typography variant="h6" sx={{ color: "text.secondary", mb: 0.5 }}>
            No Version History Found
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
            No previous versions are available for this file.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FileVersionHistory;
