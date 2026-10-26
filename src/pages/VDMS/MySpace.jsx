import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { fetchDocuments } from "./apiService";
import showToast from "../../components/common/ToastMessage";
import CustomTextField from "../../components/common/CustomTextField";
import { boiBlue, boiBorder, boiErrorRed } from "../../theme/theme";

const MySpace = () => {
  const navigate = useNavigate();
  const [mySpaceItems, setMySpaceItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderHistory, setFolderHistory] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData] = useState([]);
  const [loadingHistory] = useState(false);

  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderCreateError, setFolderCreateError] = useState(null);

  const [apiActions, setApiActions] = useState({
    uploadFile: true,
    createFolder: true,
  });

  const transformItemsForDisplay = (items) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item, index) => {
      let parsedDescription = null;
      if (item.description && typeof item.description === "string") {
        try {
          if (
            item.description.startsWith("[") ||
            item.description.startsWith("{")
          ) {
            const parsed = JSON.parse(item.description);
            parsedDescription = Array.isArray(parsed) ? parsed[0] : parsed;
          } else {
            parsedDescription = { description: item.description };
          }
        } catch (e) {
          console.log("Description parsing failed, using as text:", e);
          parsedDescription = { description: item.description };
        }
      }

      return {
        id:
          item.type === "folder"
            ? item.id
            : item.externalReferenceCode || `file-${index}`,
        name: item.name || item.fileName || "",
        type: item.type,
        modifiedDate: item.modifiedDate,
        fileName: item.fileName || "",
        fileExtension: item.fileExtension || "",
        description: item.description || "",
        title: item.title || "",
        friendlyUrlPath: item.friendlyUrlPath || "",
        externalReferenceCode: item.externalReferenceCode || "",
        parsedDescription: parsedDescription,
        keywords: item.keywords || [],
        creator: item.creator || { name: item.authorName || "Unknown" },
        documentType: item.documentType?.name || item.type || "Basic Document",
        sizeInBytes: item.sizeInBytes || item.size,
        encodingFormat: item.encodingFormat,
        status:
          parsedDescription?.status ||
          item.status ||
          (item.type === "folder" ? "Folder" : "Draft"),
        category:
          parsedDescription?.category ||
          parsedDescription?.docType ||
          item.category ||
          (item.type === "folder" ? "Folder" : "Uncategorized"),
        original: item,
      };
    });
  };

  const loadItems = useCallback(
    async (search = searchTerm, folderId = currentFolderId) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchDocuments({
          search,
          folderId,
        });

        console.log("API Response:", response);

        let items = [];
        if (response && response.items && Array.isArray(response.items)) {
          items = response.items;
        } else if (response && Array.isArray(response)) {
          items = response;
        } else if (response && response.data) {
          items = response.data;
        }

        if (response && response.actions) {
          setApiActions({
            uploadFile: response.actions.uploadFile || true,
            createFolder: response.actions.createFolder || true,
          });
        }

        if (items.length > 0) {
          const transformedItems = transformItemsForDisplay(items);
          setMySpaceItems(transformedItems);
        } else {
          setMySpaceItems([]);
        }
      } catch (err) {
        console.error("Error loading items:", err);
        setError("Failed to load items. Please try again later.");
        showToast({
          message: "Failed to load items. Please try again later.",
          type: "danger",
          title: "Error",
        });
      } finally {
        setLoading(false);
      }
    },
    [currentFolderId, searchTerm],
  );

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown")) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleViewHistory = (externalReferenceCode) => {
    setOpenDropdownId(null);
    navigate(`/myspace/history/${externalReferenceCode}`);
  };

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

  const handleDelete = async (externalReferenceCode, itemName) => {
    setOpenDropdownId(null);

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
    );

    if (!confirmDelete) return;

    try {
      const portalURL = getPortalURL();
      const response = await fetch(
        `${portalURL}/o/combined-docs/actions/remove/${externalReferenceCode}`,
        {
          method: "DELETE",
          headers: {
            accept: "application/json",
            ...getHeaders(),
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      showToast({
        message: `"${itemName}" deleted successfully`,
        type: "success",
        title: "Success",
      });

      await loadItems(searchTerm, currentFolderId);
    } catch (err) {
      console.error("Error deleting item:", err);
      showToast({
        message: `Failed to delete "${itemName}": ${err.message}`,
        type: "danger",
        title: "Error",
      });
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      setFolderCreateError("Folder name is required");
      showToast({
        message: "Folder name is required",
        type: "warning",
        title: "Validation Error",
      });
      return;
    }

    try {
      setCreatingFolder(true);
      setFolderCreateError(null);

      const folderData = {
        folderName: folderName.trim(),
        parentFolderId: currentFolderId || "",
        folderDescription: folderDescription.trim() || "",
      };

      console.log("Creating folder with data:", folderData);

      const portalURL = getPortalURL();
      const response = await fetch(
        `${portalURL}/o/combined-docs/submit/folder`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getHeaders(),
          },
          body: JSON.stringify(folderData),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      let successMessage = "Folder created successfully";

      try {
        const jsonResponse = JSON.parse(responseText);
        successMessage =
          jsonResponse.message ||
          jsonResponse.folderName ||
          "Folder created successfully";
      } catch {
        successMessage = responseText.replace(/^["']|["']$/g, "");
      }

      showToast({
        message: successMessage,
        type: "success",
        title: "Success",
        autoClose: 3000,
      });

      setShowCreateFolderModal(false);
      setFolderName("");
      setFolderDescription("");

      await loadItems(searchTerm, currentFolderId);
    } catch (err) {
      console.error("Error creating folder:", err);
      const errorMessage =
        err.message || "Failed to create folder. Please try again.";
      setFolderCreateError(errorMessage);
      showToast({
        message: errorMessage,
        type: "danger",
        title: "Error",
        autoClose: 5000,
      });
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateFolderModal(false);
    setFolderName("");
    setFolderDescription("");
    setFolderCreateError(null);
  };

  const getCurrentFolderName = () => {
    if (currentFolderId === null) return "Root";
    const currentFolder = mySpaceItems.find(
      (item) => item.id === currentFolderId && item.type === "folder",
    );
    return currentFolder ? currentFolder.name : "Current Folder";
  };

  const handleFolderClick = (folder) => {
    if (currentFolderId !== null) {
      const currentFolderName = getCurrentFolderName();
      setFolderHistory((prevHistory) => [
        ...prevHistory,
        { id: currentFolderId, name: currentFolderName },
      ]);
    }

    setCurrentFolderId(folder.id);
    setSearchTerm("");

    showToast({
      message: `Opened folder: ${folder.name}`,
      type: "info",
      title: "Navigation",
      autoClose: 2000,
    });
  };

  const handleGoBack = () => {
    if (folderHistory.length > 0) {
      const lastFolder = folderHistory[folderHistory.length - 1];
      const newHistory = folderHistory.slice(0, -1);
      setCurrentFolderId(lastFolder.id);
      setFolderHistory(newHistory);
      setSearchTerm("");

      showToast({
        message: `Navigated back to ${lastFolder.name}`,
        type: "info",
        title: "Navigation",
        autoClose: 2000,
      });
    } else {
      setCurrentFolderId(null);
      setSearchTerm("");

      showToast({
        message: "Navigated back to Root",
        type: "info",
        title: "Navigation",
        autoClose: 2000,
      });
    }
  };

  const handleAddNew = () => {
    if (currentFolderId) {
      sessionStorage.setItem("parentFolderId", currentFolderId);
      sessionStorage.setItem("folderId", currentFolderId);
    }
    navigate("/myspace/form");
  };

  const handleEdit = (item) => {
    setOpenDropdownId(null);
    if (item.type === "folder") {
      handleFolderClick(item);
    } else {
      const documentData = {
        id: item.id,
        name: item.name,
        fileName: item.fileName,
        title: item.title,
        description: item.description,
        externalReferenceCode: item.externalReferenceCode,
      };

      sessionStorage.setItem("editDocumentData", JSON.stringify(documentData));
      sessionStorage.setItem("isEditMode", "true");
      if (currentFolderId) {
        sessionStorage.setItem("parentFolderId", currentFolderId);
      }
      navigate(`/myspace/form/${item.id}`);
    }
  };

  const handleRefresh = () => {
    loadItems(searchTerm, currentFolderId);
    showToast({
      message: "Refreshing items...",
      type: "info",
      title: "Refresh",
      autoClose: 2000,
    });
  };

  const toggleDropdown = (itemId) => {
    setOpenDropdownId((prev) => (prev === itemId ? null : itemId));
  };

  const getStatusIcon = (type) => {
    if (type === "folder") return "📁";
    return "📄";
  };

  const getFileIcon = (fileExtension) => {
    const ext = fileExtension?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "xls":
      case "xlsx":
        return "📊";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "🖼️";
      case "js":
      case "jsx":
        return "💻";
      case "css":
        return "🎨";
      case "html":
      case "htm":
        return "🌐";
      case "json":
        return "🔧";
      case "txt":
        return "📃";
      default:
        return "📄";
    }
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

  return (
    <Box component="section" sx={{ p: 3, width: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: boiBlue }}>
            My Space
          </Typography>
          {currentFolderId && (
            <Box
              component="span"
              sx={{
                fontSize: 13,
                bgcolor: "#e9ecef",
                px: 1.5,
                py: 0.5,
                borderRadius: "16px",
                color: "text.secondary",
              }}
            >
              📁 {getCurrentFolderName()}
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Box sx={{ width: 220 }}>
            <CustomTextField
              size="small"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>

          {apiActions.createFolder && (
            <Button
              variant="contained"
              color="success"
              onClick={() => setShowCreateFolderModal(true)}
              sx={{ textTransform: "none", borderRadius: "8px" }}
            >
              📁 Create Folder
            </Button>
          )}

          {apiActions.uploadFile && (
            <Button
              variant="contained"
              onClick={handleAddNew}
              sx={{
                bgcolor: boiBlue,
                color: "#fff",
                textTransform: "none",
                borderRadius: "8px",
              }}
            >
              + Add New
            </Button>
          )}

          {(folderHistory.length > 0 || currentFolderId !== null) && (
            <Button
              variant="outlined"
              onClick={handleGoBack}
              sx={{
                textTransform: "none",
                borderRadius: "8px",
                borderColor: boiBorder,
                color: "text.primary",
              }}
            >
              ← Back
            </Button>
          )}
        </Box>
      </Box>

      {/* Main Content Card */}
      <Box
        sx={{
          p: 3,
          bgcolor: "#fff",
          borderRadius: "12px",
          border: `1px solid ${boiBorder}`,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        {loading && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <CircularProgress size={40} sx={{ color: boiBlue, mb: 2 }} />
            <Typography sx={{ color: "text.secondary" }}>Loading items...</Typography>
          </Box>
        )}

        {error && !loading && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Box sx={{ fontSize: 48, mb: 1 }}>⚠️</Box>
            <Typography variant="h6" sx={{ color: boiErrorRed, mb: 1 }}>
              Error Loading Items
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 2 }}>{error}</Typography>
            <Button variant="outlined" onClick={handleRefresh}>
              Try Again
            </Button>
          </Box>
        )}

        {!loading && !error && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 2.5,
            }}
          >
            {mySpaceItems.length > 0 ? (
              mySpaceItems.map((item) => (
                <Box
                  key={`${item.type}-${item.id}`}
                  sx={{
                    p: 2,
                    borderRadius: "10px",
                    border: `1px solid ${boiBorder}`,
                    bgcolor: item.type === "folder" ? "#fbfdff" : "#fff",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    position: "relative",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      borderColor: boiBlue,
                    },
                  }}
                  onClick={() => {
                    if (openDropdownId !== item.id) {
                      handleEdit(item);
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1.5,
                    }}
                  >
                    <Box sx={{ fontSize: 28 }}>
                      {item.type === "folder"
                        ? getStatusIcon(item.type)
                        : getFileIcon(item.fileExtension)}
                    </Box>
                    <Box sx={{ position: "relative" }}>
                      {item.type === "file" && (
                        <Box
                          className="dropdown"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleDropdown(item.id);
                            }}
                            sx={{
                              minWidth: 32,
                              p: 0.5,
                              color: "text.secondary",
                              fontSize: 18,
                            }}
                          >
                            ⋮
                          </Button>
                          {openDropdownId === item.id && (
                            <Box
                              sx={{
                                position: "absolute",
                                right: 0,
                                top: "100%",
                                bgcolor: "#fff",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                borderRadius: "8px",
                                p: 0.5,
                                zIndex: 20,
                                minWidth: 140,
                                border: `1px solid ${boiBorder}`,
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <Button
                                fullWidth
                                size="small"
                                sx={{
                                  justifyContent: "flex-start",
                                  textTransform: "none",
                                  color: "text.primary",
                                  px: 1.5,
                                  py: 0.75,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewHistory(item.externalReferenceCode);
                                }}
                              >
                                📜 View History
                              </Button>
                              <Button
                                fullWidth
                                size="small"
                                sx={{
                                  justifyContent: "flex-start",
                                  textTransform: "none",
                                  color: boiErrorRed,
                                  px: 1.5,
                                  py: 0.75,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(
                                    item.externalReferenceCode,
                                    item.name,
                                  );
                                }}
                              >
                                🗑️ Delete
                              </Button>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: 14,
                        mb: 0.5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        color: item.type === "folder" ? boiBlue : "text.primary",
                      }}
                      title={item.name}
                    >
                      {item.type === "folder"
                        ? item.name
                        : item.fileName || item.name || item.title}
                    </Typography>

                    {item.type === "folder" ? (
                      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                        {item.parsedDescription?.description ||
                          item.description ||
                          "Folder"}
                      </Typography>
                    ) : (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                          {item.fileExtension && (
                            <Box
                              component="span"
                              sx={{
                                fontSize: 10,
                                fontWeight: 700,
                                bgcolor: "#e9ecef",
                                px: 0.75,
                                py: 0.25,
                                borderRadius: "4px",
                                color: "#495057",
                              }}
                            >
                              {item.fileExtension.toUpperCase()}
                            </Box>
                          )}
                          {item.sizeInBytes && (
                            <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                              {formatFileSize(item.sizeInBytes)}
                            </Typography>
                          )}
                        </Box>

                        {item.parsedDescription?.docType && (
                          <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
                            Type: {item.parsedDescription.docType}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {item.modifiedDate && (
                      <Typography
                        sx={{
                          fontSize: 11,
                          color: "text.secondary",
                          mt: 1,
                          pt: 0.5,
                          borderTop: "1px dashed #eee",
                        }}
                      >
                        {formatDate(item.modifiedDate)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))
            ) : (
              <Box
                sx={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  py: 8,
                }}
              >
                <Box sx={{ fontSize: 48, mb: 1 }}>
                  {currentFolderId ? "📂" : "📄"}
                </Box>
                <Typography variant="h6" sx={{ color: "text.secondary", mb: 0.5 }}>
                  No Items Found
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                  {searchTerm
                    ? `No items match your search "${searchTerm}".`
                    : currentFolderId
                      ? 'This folder is empty. Click "Create Folder" or "Add New" to add items.'
                      : 'Click "Create Folder" or "Add New" to get started.'}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* History Modal */}
      {showHistoryModal && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
          }}
          onClick={() => setShowCreateFolderModal(false)}
        >
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: "12px",
              p: 3,
              maxWidth: 480,
              width: "90%",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Version History
              </Typography>
              <Button
                size="small"
                onClick={() => setShowCreateFolderModal(false)}
                sx={{ minWidth: 32, p: 0.5 }}
              >
                ×
              </Button>
            </Box>
            <Box>
              {loadingHistory ? (
                <CircularProgress size={24} />
              ) : historyData && historyData.length > 0 ? (
                historyData.map((version, index) => (
                  <Box key={index} sx={{ py: 1, borderBottom: "1px solid #eee" }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      Version {version.version || index + 1}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      {formatDate(version.modifiedDate || version.createdDate)}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography sx={{ color: "text.secondary" }}>
                  No version history available
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
          }}
          onClick={handleCloseModal}
        >
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: "12px",
              p: 3.5,
              maxWidth: 460,
              width: "90%",
              boxShadow: "0 8px 28px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2.5,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: boiBlue }}>
                Create New Folder
              </Typography>
              <Button
                size="small"
                onClick={handleCloseModal}
                sx={{ minWidth: 32, p: 0.5, fontSize: 20, color: "text.secondary" }}
              >
                ×
              </Button>
            </Box>

            {folderCreateError && (
              <Box
                sx={{
                  p: 1.5,
                  mb: 2,
                  bgcolor: "#ffebee",
                  borderRadius: "8px",
                  color: boiErrorRed,
                  fontSize: 13,
                }}
              >
                ⚠️ {folderCreateError}
              </Box>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <CustomTextField
                label="Folder Name"
                required
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
                disabled={creatingFolder}
              />

              <CustomTextField
                label="Folder Description"
                multiline
                minRows={3}
                value={folderDescription}
                onChange={(e) => setFolderDescription(e.target.value)}
                placeholder="Enter folder description (optional)"
                disabled={creatingFolder}
              />

              {currentFolderId && (
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "#f8f9fa",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                >
                  <Box component="span" sx={{ color: "text.secondary", mr: 1 }}>
                    Parent Folder:
                  </Box>
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {getCurrentFolderName()}
                  </Box>
                </Box>
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1.5,
                mt: 3,
                pt: 2,
                borderTop: `1px solid ${boiBorder}`,
              }}
            >
              <Button
                variant="outlined"
                onClick={handleCloseModal}
                disabled={creatingFolder}
                sx={{ borderRadius: "8px", textTransform: "none" }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleCreateFolder}
                disabled={creatingFolder || !folderName.trim()}
                sx={{
                  bgcolor: boiBlue,
                  borderRadius: "8px",
                  textTransform: "none",
                }}
              >
                {creatingFolder ? "Creating..." : "Create Folder"}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MySpace;
