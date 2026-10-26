import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDocuments } from "../apiService";
import showToast from "../CommonComponent/ToastMessage";

const MySpace = () => {
  const navigate = useNavigate();
  const [mySpaceItems, setMySpaceItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folderHistory, setFolderHistory] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderCreateError, setFolderCreateError] = useState(null);

  const [apiActions, setApiActions] = useState({
    uploadFile: null,
    createFolder: null,
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
            uploadFile: response.actions.uploadFile || null,
            createFolder: response.actions.createFolder || null,
          });
        } else {
          setApiActions({
            uploadFile: null,
            createFolder: null,
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
    } catch (error) {
      console.error("Error deleting item:", error);
      showToast({
        message: `Failed to delete "${itemName}": ${error.message}`,
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
      } catch (parseError) {
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
    } catch (error) {
      console.error("Error creating folder:", error);
      const errorMessage =
        error.message || "Failed to create folder. Please try again.";
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
    setSearchInput("");

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
      setSearchInput("");

      showToast({
        message: `Navigated back to ${lastFolder.name}`,
        type: "info",
        title: "Navigation",
        autoClose: 2000,
      });
    } else {
      setCurrentFolderId(null);
      setSearchTerm("");
      setSearchInput("");

      showToast({
        message: "Navigated back to Root",
        type: "info",
        title: "Navigation",
        autoClose: 2000,
      });
    }
  };

  const getCurrentFolderName = () => {
    if (currentFolderId === null) return "Root";
    const currentFolder = mySpaceItems.find(
      (item) => item.id === currentFolderId && item.type === "folder",
    );
    return currentFolder ? currentFolder.name : "Current Folder";
  };

  // const handleAddNew = () => {
  //   navigate("/myspace/form", {

  //     state: {
  //       folderId: currentFolderId,
  //       refresh: true,
  //       parentFolderId: currentFolderId,
  //     },
  //   });
  // };

  // const handleEdit = (item) => {
  //   setOpenDropdownId(null);
  //   if (item.type === "folder") {
  //     handleFolderClick(item);
  //   } else {
  //     navigate(`/myspace/form/${item.id}`, {
  //       state: {
  //         documentData: item,
  //         isEditMode: true,
  //         refresh: true,
  //         parentFolderId: currentFolderId,
  //       },
  //     });
  //   }
  // };
  const handleAddNew = () => {
    // Store the folderId and parentFolderId in sessionStorage
    if (currentFolderId) {
      sessionStorage.setItem("parentFolderId", currentFolderId);
      sessionStorage.setItem("folderId", currentFolderId);
    }

    // Navigate using window.location.href
    window.location.href = `/add-form#/myspace/form`;
  };

  const handleEdit = (item) => {
    setOpenDropdownId(null);
    if (item.type === "folder") {
      handleFolderClick(item);
    } else {
      // Store document data in sessionStorage before navigation
      const documentData = {
        id: item.id,
        name: item.name,
        fileName: item.fileName,
        title: item.title,
        description: item.description,
        externalReferenceCode: item.externalReferenceCode,
        // Add any other necessary fields
      };

      sessionStorage.setItem("editDocumentData", JSON.stringify(documentData));
      sessionStorage.setItem("isEditMode", "true");
      if (currentFolderId) {
        sessionStorage.setItem("parentFolderId", currentFolderId);
      }

      // Navigate using window.location.href
      window.location.href = `/add-form#/myspace/form/${item.id}`;
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

  const getStatusIcon = (type, status) => {
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
    <section className="main-section p-4 myspace-container">
      <div className="my-space-header">
        <h1>My Space</h1>
        <div className="header-actions">
          {apiActions.createFolder && (
            <button
              className="btn btn-outline"
              style={{
                backgroundColor: "#28a745",
                color: "white",
                borderColor: "#28a745",
              }}
              onClick={() => setShowCreateFolderModal(true)}
            >
              📁 Create Folder
            </button>
          )}

          {apiActions.uploadFile && (
            <button
              className="btn btn-outline"
              style={{
                backgroundColor: "#0066B3",
                color: "white",
                borderColor: "#0066B3",
              }}
              onClick={handleAddNew}
            >
              + Add New
            </button>
          )}

          {(folderHistory.length > 0 || currentFolderId !== null) && (
            <button className="btn-back" onClick={handleGoBack}>
              ← Back
            </button>
          )}
        </div>
      </div>

      <div className="shadowBox">
        <div className="my-space-content">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading items...</p>
            </div>
          )}

          {error && !loading && (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Error Loading Items</h3>
              <p>{error}</p>
              <button className="btn-retry" onClick={handleRefresh}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="cards-grid">
              {mySpaceItems.length > 0 ? (
                mySpaceItems.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className={`card-item ${item.type === "folder" ? "folder-item" : "file-item"}`}
                    onClick={() => {
                      if (openDropdownId !== item.id) {
                        handleEdit(item);
                      }
                    }}
                  >
                    <div className="card-header">
                      <div className="card-icon">
                        {item.type === "folder"
                          ? getStatusIcon(item.type, item.status)
                          : getFileIcon(item.fileExtension)}
                      </div>
                      <div className="card-actions">
                        {item.type === "file" && (
                          <div
                            className="dropdown"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <button
                              className="dropdown-toggle-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleDropdown(item.id);
                              }}
                              title="More options"
                            >
                              ⋮
                            </button>
                            {openDropdownId === item.id && (
                              <div
                                className="dropdown-menu"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <button
                                  className="dropdown-item"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewHistory(
                                      item.externalReferenceCode,
                                    );
                                  }}
                                >
                                  📜 View History
                                </button>
                                <button
                                  className="dropdown-item delete"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(
                                      item.externalReferenceCode,
                                      item.name,
                                    );
                                  }}
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="card-body">
                      <h3 className="card-title">
                        {item.type === "folder"
                          ? item.name
                          : item.fileName || item.name || item.title}
                      </h3>

                      {item.type === "folder" ? (
                        <div className="folder-info">
                          <p className="card-description">
                            {item.parsedDescription?.description ||
                              item.description ||
                              "Click to open folder"}
                          </p>
                        </div>
                      ) : (
                        <>
                          {item.title && item.title !== item.fileName && (
                            <div className="file-title">
                              <span className="meta-label">Title:</span>
                              <span className="meta-value">{item.title}</span>
                            </div>
                          )}

                          <div className="file-meta">
                            {item.fileExtension && (
                              <span className="file-extension-badge">
                                {item.fileExtension.toUpperCase()}
                              </span>
                            )}
                            {item.sizeInBytes && (
                              <span className="file-size">
                                {formatFileSize(item.sizeInBytes)}
                              </span>
                            )}
                          </div>

                          {item.parsedDescription &&
                            typeof item.parsedDescription === "object" && (
                              <div className="card-meta">
                                {item.parsedDescription.docType && (
                                  <span className="meta-item">
                                    <span className="meta-label">Type:</span>
                                    <span className="meta-value">
                                      {item.parsedDescription.docType}
                                    </span>
                                  </span>
                                )}
                                {item.parsedDescription.category && (
                                  <span className="meta-item">
                                    <span className="meta-label">
                                      Category:
                                    </span>
                                    <span className="meta-value">
                                      {item.parsedDescription.category}
                                    </span>
                                  </span>
                                )}
                                {item.keywords && item.keywords.length > 0 && (
                                  <div className="keywords-container">
                                    {item.keywords.map((keyword, idx) => (
                                      <span key={idx} className="keyword-tag">
                                        #{keyword}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                        </>
                      )}

                      {item.modifiedDate && (
                        <div className="last-modified">
                          Modified: {formatDate(item.modifiedDate)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    {currentFolderId ? "📂" : "📄"}
                  </div>
                  <h3>No Items Found</h3>
                  <p>
                    {searchTerm
                      ? `No items match your search "${searchTerm}". Try different keywords.`
                      : currentFolderId
                        ? 'This folder is empty. Click "Create Folder" or "Add New" to add items.'
                        : 'Click "Create Folder" or "Add New" to get started.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowHistoryModal(false)}
        >
          <div
            className="modal-content history-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Version History</h2>
              <button
                className="modal-close"
                onClick={() => setShowHistoryModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {loadingHistory ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading history...</p>
                </div>
              ) : historyData && historyData.length > 0 ? (
                <div className="history-list">
                  {historyData.map((version, index) => (
                    <div key={index} className="history-item">
                      <div className="history-version">
                        Version {version.version || index + 1}
                      </div>
                      <div className="history-date">
                        {formatDate(
                          version.modifiedDate || version.createdDate,
                        )}
                      </div>
                      {version.size && (
                        <div className="history-size">
                          {formatFileSize(version.size)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No version history available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCreateFolderModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Folder</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {folderCreateError && (
                <div className="error-message">⚠️ {folderCreateError}</div>
              )}

              <div className="form-group">
                <label htmlFor="folderName">
                  Folder Name <span className="required">*</span>
                </label>
                <input
                  id="folderName"
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  autoFocus
                  disabled={creatingFolder}
                />
              </div>

              <div className="form-group">
                <label htmlFor="folderDescription">Folder Description</label>
                <textarea
                  id="folderDescription"
                  value={folderDescription}
                  onChange={(e) => setFolderDescription(e.target.value)}
                  placeholder="Enter folder description (optional)"
                  rows="4"
                  disabled={creatingFolder}
                />
              </div>

              {currentFolderId && (
                <div className="parent-folder-info">
                  <span className="info-label">Parent Folder:</span>
                  <span className="info-value">{getCurrentFolderName()}</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={handleCloseModal}
                disabled={creatingFolder}
              >
                Cancel
              </button>
              <button
                className="btn-create"
                onClick={handleCreateFolder}
                disabled={creatingFolder || !folderName.trim()}
              >
                {creatingFolder ? "Creating..." : "Create Folder"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
  /* Scope all styles under myspace-container */
  .myspace-container .card-actions {
    position: relative;
    z-index: 100;
  }

  .myspace-container .dropdown {
    position: relative;
    display: inline-block;
  }

  .myspace-container .dropdown-toggle-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
    color: #666;
    font-weight: bold;
    position: relative;
    z-index: 10;
  }

  .myspace-container .dropdown-toggle-btn:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }

  .myspace-container .dropdown-menu {
    position: absolute;
    right: 0;
    top: 100%;
    margin-top: 5px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    min-width: 160px;
    z-index: 1000;
    overflow: visible;
    border: 1px solid #e0e0e0;
    display: block;
  }

  .myspace-container .dropdown-item {
    display: block;
    width: 100%;
    padding: 10px 16px;
    text-align: left;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
    color: #333;
    white-space: nowrap;
  }

  .myspace-container .dropdown-item:hover {
    background-color: #f5f5f5;
  }

  .myspace-container .dropdown-item.delete {
    color: #dc3545;
    border-top: 1px solid #e0e0e0;
  }

  .myspace-container .dropdown-item.delete:hover {
    background-color: #ffe6e6;
  }

  .myspace-container .card-item {
    position: relative;
    z-index: 1;
    overflow: visible !important;
  }

  .myspace-container .card-item:hover {
    z-index: 2;
  }
  
  .myspace-container .card-header {
    overflow: visible !important;
  }

  /* All other styles also need to be scoped */
  .myspace-container .history-modal {
    max-width: 600px;
  }

  .myspace-container .history-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .myspace-container .history-item {
    padding: 12px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .myspace-container .history-item:last-child {
    border-bottom: none;
  }

  .myspace-container .history-version {
    font-weight: 600;
    color: #0066B3;
  }

  .myspace-container .history-date {
    font-size: 12px;
    color: #666;
  }

  .myspace-container .history-size {
    font-size: 12px;
    color: #999;
  }

  .myspace-container .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    animation: fadeIn 0.2s ease;
  }

  .myspace-container .modal-content {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    animation: slideUp 0.3s ease;
  }

  .myspace-container .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e0e0e0;
  }

  .myspace-container .modal-header h2 {
    margin: 0;
    font-size: 20px;
    color: #333;
  }

  .myspace-container .modal-close {
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: #999;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .myspace-container .modal-close:hover {
    background-color: #f0f0f0;
    color: #333;
  }

  .myspace-container .modal-body {
    padding: 24px;
  }

  .myspace-container .form-group {
    margin-bottom: 20px;
  }

  .myspace-container .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
    font-size: 14px;
  }

  .myspace-container .required {
    color: #dc3545;
  }

  .myspace-container .form-group input,
  .myspace-container .form-group textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s;
    font-family: inherit;
  }

  .myspace-container .form-group input:focus,
  .myspace-container .form-group textarea:focus {
    outline: none;
    border-color: #0066B3;
    box-shadow: 0 0 0 3px rgba(0, 102, 179, 0.1);
  }

  .myspace-container .form-group input:disabled,
  .myspace-container .form-group textarea:disabled {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }

  .myspace-container .parent-folder-info {
    margin-top: 16px;
    padding: 12px;
    background-color: #f8f9fa;
    border-radius: 6px;
    font-size: 13px;
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .myspace-container .info-label {
    font-weight: 600;
    color: #666;
  }

  .myspace-container .info-value {
    color: #0066B3;
  }

  .myspace-container .error-message {
    background-color: #f8d7da;
    color: #721c24;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 20px;
    font-size: 14px;
    border: 1px solid #f5c6cb;
  }

  .myspace-container .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid #e0e0e0;
  }

  .myspace-container .btn-cancel,
  .myspace-container .btn-create {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .myspace-container .btn-cancel {
    background-color: #f8f9fa;
    color: #6c757d;
    border: 1px solid #dee2e6;
  }

  .myspace-container .btn-cancel:hover:not(:disabled) {
    background-color: #e2e6ea;
  }

  .myspace-container .btn-create {
    background-color: #28a745;
    color: white;
  }

  .myspace-container .btn-create:hover:not(:disabled) {
    background-color: #218838;
    transform: translateY(-1px);
  }

  .myspace-container .btn-create:disabled,
  .myspace-container .btn-cancel:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* My Space Styles */
  .myspace-container .my-space-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 15px;
  }

  .myspace-container .my-space-header h1 {
    margin: 0;
    font-size: 24px;
    color: #333;
  }

  .myspace-container .header-actions {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }

  .myspace-container .btn-back {
    padding: 6px 12px;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;
  }

  .myspace-container .btn-back:hover {
    background-color: #5a6268;
  }

  .myspace-container .my-space-content {
    padding: 20px;
  }

  /* Loading State */
  .myspace-container .loading-state {
    text-align: center;
    padding: 60px 20px;
  }

  .myspace-container .spinner {
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

  /* Error State */
  .myspace-container .error-state {
    text-align: center;
    padding: 60px 20px;
  }

  .myspace-container .error-icon {
    font-size: 48px;
    margin-bottom: 20px;
  }

  .myspace-container .btn-retry {
    padding: 10px 20px;
    background-color: #0066B3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 20px;
  }

  .myspace-container .btn-retry:hover {
    background-color: #0052a3;
  }

  /* Cards Grid */
  .myspace-container .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .myspace-container .card-item {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px solid #e0e0e0;
  }

  .myspace-container .card-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border-color: #0066B3;
  }

  .myspace-container .card-header {
    padding: 15px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #dee2e6;
  }

  .myspace-container .card-icon {
    font-size: 28px;
  }

  .myspace-container .card-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .myspace-container .btn-icon {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .myspace-container .btn-icon:hover {
    transform: scale(1.1);
  }

  .myspace-container .btn-download {
    background-color: #28a745;
    color: white;
  }

  .myspace-container .btn-download:hover {
    background-color: #218838;
  }

  .myspace-container .card-body {
    padding: 20px;
    flex: 1;
  }

  .myspace-container .card-title {
    margin: 0 0 10px 0;
    font-size: 16px;
    font-weight: 600;
    color: #333;
    word-break: break-word;
  }

  .myspace-container .card-description {
    margin: 0 0 10px 0;
    font-size: 13px;
    color: #666;
    line-height: 1.5;
    word-break: break-word;
  }

  .myspace-container .file-title {
    margin-bottom: 8px;
    font-size: 13px;
    color: #666;
  }

  .myspace-container .file-meta {
    display: flex;
    gap: 10px;
    margin: 10px 0;
    flex-wrap: wrap;
  }

  .myspace-container .file-extension-badge {
    background-color: #e9ecef;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    color: #495057;
  }

  .myspace-container .file-size {
    font-size: 11px;
    color: #6c757d;
    background-color: #f8f9fa;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .myspace-container .keywords-container {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 8px;
  }

  .myspace-container .keyword-tag {
    background-color: #e9ecef;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    color: #495057;
  }

  .myspace-container .card-meta {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 10px;
  }

  .myspace-container .meta-item {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
  }

  .myspace-container .meta-label {
    color: #999;
  }

  .myspace-container .meta-value {
    color: #333;
    font-weight: 500;
    text-align: right;
    word-break: break-word;
    max-width: 60%;
  }

  .myspace-container .last-modified {
    margin-top: 10px;
    font-size: 11px;
    color: #999;
    padding-top: 10px;
    border-top: 1px solid #e0e0e0;
  }

  .myspace-container .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 20px;
  }

  .myspace-container .empty-state-icon {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.5;
  }

  .myspace-container .empty-state h3 {
    margin-bottom: 10px;
    color: #666;
  }

  .myspace-container .empty-state p {
    color: #999;
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .myspace-container .cards-grid {
      grid-template-columns: 1fr;
    }

    .myspace-container .my-space-header {
      flex-direction: column;
      align-items: stretch;
    }

    .myspace-container .header-actions {
      flex-direction: column;
    }

    .myspace-container .modal-content {
      width: 95%;
      margin: 20px;
    }
  }
`}</style>
    </section>
  );
};

export default MySpace;
