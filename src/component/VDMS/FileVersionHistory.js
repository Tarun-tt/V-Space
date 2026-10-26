// FileVersionHistory.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CustomTable from "../CommonComponent/CustomTable";
import showToast from "../CommonComponent/ToastMessage";

const FileVersionHistory = () => {
  const { externalReferenceCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [versionData, setVersionData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [lastPage, setLastPage] = useState(1);
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

  const fetchVersionHistory = async () => {
    try {
      setLoading(true);
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

      const data = await response.json();
      console.log("Version history data:", data);

      // Set total count and pagination info
      setTotalCount(data.total || 0);
      setLastPage(Math.ceil((data.total || 0) / pageSize));

      // Process the items
      if (data.items && Array.isArray(data.items)) {
        const processedItems = data.items.map((item) => {
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

        // Set file info from the first item
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
    } catch (error) {
      console.error("Error fetching version history:", error);
      showToast({
        message: "Failed to load version history. Please try again.",
        type: "danger",
        title: "Error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (externalReferenceCode) {
      fetchVersionHistory();
    }
  }, [externalReferenceCode, page, pageSize]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1);
  };

  const handleDownload = async (friendlyUrlPath, fileName, version) => {
    if (!friendlyUrlPath) {
      showToast({
        message: "Download URL not available",
        type: "warning",
        title: "Download Failed",
      });
      return;
    }

    try {
      setDownloading(true);
      const portalURL = getPortalURL();
      const downloadUrl = `${portalURL}${friendlyUrlPath}`;

      // Make the API call with headers
      const response = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          ...getHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Set the filename
      const extension = fileName.split(".").pop();
      const downloadFileName = version
        ? `${fileName.replace(`.${extension}`, "")}_v${version}.${extension}`
        : fileName;
      link.download = downloadFileName;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast({
        message: `Download started: ${downloadFileName}`,
        type: "success",
        title: "Download",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Download failed:", error);
      showToast({
        message: `Failed to download file: ${error.message}`,
        type: "danger",
        title: "Download Failed",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Define table columns
  const columns = [
    {
      header: "Version",
      accessor: "version",
      render: (row) => <span className="badge bg-primary">{row.version}</span>,
    },
    {
      header: "File Name",
      accessor: "fileName",
      render: (row) => (
        <div>
          <strong>{row.fileName}</strong>
          {row.title && row.title !== row.fileName && (
            <div>
              <small className="text-muted">Title: {row.title}</small>
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Type",
      accessor: "fileExtension",
      render: (row) => (
        <span className="file-extension-badge">
          {row.fileExtension?.toUpperCase() || "N/A"}
        </span>
      ),
    },
    {
      header: "Size",
      accessor: "formattedSize",
    },
    {
      header: "Modified Date",
      accessor: "formattedDate",
    },
    {
      header: "Modified By",
      accessor: "userName",
    },
    {
      header: "Document Type",
      accessor: "docType",
      render: (row) => row.docType || "-",
    },
    {
      header: "Category",
      accessor: "category",
      render: (row) => row.category || "-",
    },
    {
      header: "Tags",
      accessor: "tags",
      render: (row) =>
        row.tags ? <span className="badge bg-secondary">{row.tags}</span> : "-",
    },
    {
      header: "Classification",
      accessor: "classification",
      render: (row) => row.classification || "-",
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <button
          className="btn btn-sm btn-success"
          onClick={() =>
            handleDownload(row.friendlyUrlPath, row.fileName, row.version)
          }
          disabled={downloading}
          title={`Download version ${row.version}`}
        >
          {downloading ? "Downloading..." : "📥 Download"}
        </button>
      ),
    },
  ];

  return (
    <section className="main-section p-4 version-history-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Version History</h1>
        <button className="btn-back" onClick={handleGoBack}>
          ← Back
        </button>
      </div>

      {fileInfo && (
        <div className="shadowBox mb-4">
          <div className="p-3">
            <h5 className="mb-2">File Information</h5>
            <div className="row">
              <div className="col-md-4">
                <strong>File Name:</strong> {fileInfo.fileName}
              </div>
              <div className="col-md-4">
                <strong>Title:</strong> {fileInfo.title || "-"}
              </div>
              <div className="col-md-4">
                <strong>File Type:</strong>{" "}
                {fileInfo.fileExtension?.toUpperCase() || "N/A"}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading version history...</p>
        </div>
      ) : versionData.length > 0 ? (
        <CustomTable
          columns={columns}
          data={versionData}
          totalCount={totalCount}
          page={page}
          pageSize={pageSize}
          lastPage={lastPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      ) : (
        <div className="shadowBox">
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <h3>No Version History Found</h3>
            <p>No previous versions are available for this file.</p>
          </div>
        </div>
      )}

      <style>{`
        .version-history-container .btn-back {
          padding: 8px 16px;
          background-color: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
        }

        .version-history-container .btn-back:hover {
          background-color: #5a6268;
        }

        .version-history-container .badge {
          padding: 4px 8px;
          font-size: 11px;
          border-radius: 4px;
        }

        .version-history-container .badge.bg-primary {
          background-color: #0066B3 !important;
        }

        .version-history-container .badge.bg-secondary {
          background-color: #6c757d !important;
        }

        .version-history-container .file-extension-badge {
          background-color: #e9ecef;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          color: #495057;
        }

        .version-history-container .loading-state {
          text-align: center;
          padding: 60px 20px;
        }

        .version-history-container .spinner {
          width: 40px;
          height: 40px;
          margin: 0 auto 20px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #0066B3;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .version-history-container .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .version-history-container .empty-state-icon {
          font-size: 64px;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .version-history-container .empty-state h3 {
          margin-bottom: 10px;
          color: #666;
        }

        .version-history-container .empty-state p {
          color: #999;
        }

        /* Table styling overrides */
        .version-history-container .table {
          margin-bottom: 0;
        }

        .version-history-container .table thead th {
          background-color: #0066B3;
          color: white;
          border: none;
          padding: 12px;
        }

        .version-history-container .table tbody td {
          vertical-align: middle;
          padding: 12px;
        }

        .version-history-container .table tbody tr:hover {
          background-color: #f8f9fa;
        }

        .version-history-container .btn-sm {
          padding: 4px 12px;
          font-size: 12px;
        }

        .version-history-container .btn-success {
          background-color: #28a745;
          border-color: #28a745;
        }

        .version-history-container .btn-success:hover:not(:disabled) {
          background-color: #218838;
          border-color: #1e7e34;
        }

        .version-history-container .btn-success:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .version-history-container .table-responsive {
            overflow-x: auto;
          }
          
          .version-history-container .btn-back {
            margin-bottom: 10px;
          }
          
          .version-history-container .d-flex {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start !important;
          }
        }
      `}</style>
    </section>
  );
};

export default FileVersionHistory;
