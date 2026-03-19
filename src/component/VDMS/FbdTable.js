import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomTable from "../CommonComponent/CustomTable";
import {
  exportRequestAccounts,
  getRequestAccountDetails,
  getRequestAccounts,
} from "../apiService";
import { formatDateForInput } from "../headerData";
import Filters from "../CommonComponent/Filters";
import showToast from "../CommonComponent/ToastMessage";

const FbdTable = () => {
  const navigate = useNavigate();
  const initialLoadRef = useRef(true);
  useEffect(() => {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split("T")[0];

    dateInputs.forEach((input) => {
      input.max = today;

      input.addEventListener("keydown", (e) => e.preventDefault());
    });

    return () => {
      dateInputs.forEach((input) => {
        input.removeEventListener("keydown", (e) => e.preventDefault());
      });
    };
  }, []);

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    lastPage: 1,
  });
  const [formFilters, setFormFilters] = useState(() => {
    const savedFilters = sessionStorage.getItem("fbdTableFilters");
    return savedFilters
      ? JSON.parse(savedFilters)
      : {
          search: "",
          status: "",
          fromDate: "",
          toDate: "",
        };
  });
  const [appliedFilters, setAppliedFilters] = useState(() => {
    const savedAppliedFilters = sessionStorage.getItem("fbdAppliedFilters");
    return savedAppliedFilters ? JSON.parse(savedAppliedFilters) : formFilters;
  });
  const [statusOptions, setStatusOptions] = useState([]);
  const [exportRequested, setExportRequested] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  useEffect(() => {
    sessionStorage.setItem("fbdTableFilters", JSON.stringify(formFilters));
  }, [formFilters]);

  useEffect(() => {
    if (Object.keys(appliedFilters).length > 0) {
      sessionStorage.setItem(
        "fbdAppliedFilters",
        JSON.stringify(appliedFilters)
      );
    }
  }, [appliedFilters]);
  const [exportStatus, setExportStatus] = useState(null);
  const handleExport = async () => {
    try {
      if (!exportRequested && exportStatus !== "in-progress") {
        await exportRequestAccounts(appliedFilters);
        setExportRequested(true);
        setExportStatus("in-progress");

        showToast({
          message: "Export request has been initiated",
          type: "success",
          title: "Export Started",
          autoClose: 6000,
        });
      } else if (exportStatus === "in-progress") {
        showToast({
          message: "Export is already in progress",
          type: "info",
          title: "Export Status",
          autoClose: 6000,
        });
      }
    } catch (error) {
      console.error("Error initiating export:", error);
      showToast({
        message: "Failed to initiate export",
        type: "danger",
        title: "Export Error",
        autoClose: 6000,
      });
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "fbd.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast({
        message: "File download has started",
        type: "success",
        title: "Download Started",
        autoClose: 6000,
      });

      setExportRequested(false);
      setDownloadUrl(null);
    }
  };

  useEffect(() => {
    const fetchAccountData = async () => {
      if (initialLoadRef.current) {
        initialLoadRef.current = false;
        return;
      }
      setLoading(true);
      try {
        const response = await getRequestAccounts({
          page: pagination.page,
          pageSize: pagination.pageSize,
          ...appliedFilters,
          exportStatus: exportRequested ? "check" : undefined,
        });

        if (response.downloadUrl) {
          if (response.downloadUrl === "in-progress") {
            setExportStatus("in-progress");
          } else {
            setDownloadUrl(response.downloadUrl);
            setExportStatus("ready");
          }
        }

        if (response.statusList) {
          const options = response.statusList.map((status) => ({
            value: status.toLowerCase(),
            label:
              status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
          }));
          setStatusOptions([{ value: "", label: "All" }, ...options]);
        }

        const items = response.items || [];

        setPagination((prev) => ({
          ...prev,
          page: response.page || 1,
          pageSize: response.pageSize || prev.pageSize,
          totalCount: response.totalCount || 0,
          lastPage: response.lastPage || 1,
        }));

        const formattedData = items.map((item) => {
          return {
            id: item.id,
            nBGCode: item.nbgCode || "N/A",
            branchCode: item.branchCode || "N/A",
            zone: item.zone || "N/A",
            dateCreated: item.date || "N/A",
            status: item.status
              ? item.status.charAt(0).toUpperCase() +
                item.status.slice(1).toLowerCase()
              : "N/A",
            finacleReferenceNo: item.finacleReferenceNo || "",
            redirectTo: item.redirectTo,
            fullRowData: item,
          };
        });

        setTableData(formattedData);
      } catch (error) {
        console.error("Error fetching request accounts:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      if (Object.keys(appliedFilters).length > 0) {
        fetchAccountData();
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [pagination.page, pagination.pageSize, appliedFilters, exportRequested]);
  useEffect(() => {
    if (Object.keys(appliedFilters).length > 0 && initialLoadRef.current) {
      initialLoadRef.current = false;
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [appliedFilters]);
  const handleSearch = () => {
    const newFilters = {
      search: formFilters.search,
      status: formFilters.status,
      fromDate: formFilters.fromDate,
      toDate: formFilters.toDate,
    };
    setAppliedFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));

    sessionStorage.setItem("fbdAppliedFilters", JSON.stringify(newFilters));
  };
  const handleReset = () => {
    const resetFilters = {
      search: "",
      status: "",
      fromDate: "",
      toDate: "",
    };
    setFormFilters(resetFilters);
    setAppliedFilters(resetFilters);
    sessionStorage.removeItem("fbdTableFilters");
    sessionStorage.removeItem("fbdAppliedFilters");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleViewDetails = async (row) => {
    try {
      const response = await getRequestAccountDetails(row.id);

      if (row.redirectTo === "scanner") {
        window.location.href = `/web/boi-dms/fbd#/fbd/${row.id}`;
      } else {
        sessionStorage.setItem("shouldReloadFbdDetails", "true");

        navigate(`/fbd-details/${row.id}`, {
          state: {
            apiData: response.data,
          },
          replace: true,
        });
      }
    } catch (error) {
      console.error("Error fetching account details:", error);
    }
  };

  const columns = [
    {
      header: "Sr. No",
      render: (row, index) => {
        const serialNumber =
          (pagination.page - 1) * pagination.pageSize + index + 1;
        return serialNumber;
      },
    },
    { header: "Finacle Reference No", accessor: "finacleReferenceNo" },
    { header: "NBG", accessor: "nBGCode" },
    { header: "Branch Code", accessor: "branchCode" },
    { header: "Zone", accessor: "zone" },
    {
      header: "Date Created",
      accessor: "dateCreated",
      render: (row) => {
        if (!row.dateCreated) return "N/A";

        const date = new Date(row.dateCreated);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
      },
    },
    { header: "Status", accessor: "status" },
    {
      header: "Actions",
      render: (row) => (
        <i
          className="fa fa-eye"
          style={{ cursor: "pointer", fontSize: "20px", color: "#007bff" }}
          onClick={() => handleViewDetails(row)}
          title="View Details"
        />
      ),
    },
  ];

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between mb-3">
        <h1>FBD Table</h1>
        <div className="d-flex align-items-center gap-2">
          {tableData.length > 0 && downloadUrl !== "not-available" && (
            <button
              className="btn btn-outline-success gap-2"
              onClick={handleExport}
              disabled={exportStatus === "in-progress"}
            >
              {exportStatus === "in-progress"
                ? "Excel in progress..."
                : "Export to Excel"}
            </button>
          )}
          {downloadUrl &&
            downloadUrl !== "not-available" &&
            downloadUrl !== "in-progress" && (
              <button
                className="btn btn-success"
                onClick={handleDownload}
                style={{ backgroundColor: "#0066B3" }}
              >
                <i
                  className="fa fa-download"
                  style={{ backgroundColor: "#0066B3" }}
                ></i>
              </button>
            )}
        </div>
      </div>

      <Filters
        filters={formFilters}
        setFilters={setFormFilters}
        onSearch={handleSearch}
        onReset={handleReset}
        statusOptions={statusOptions}
      />

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <CustomTable
          columns={columns}
          data={tableData}
          totalCount={pagination.totalCount}
          page={pagination.page}
          pageSize={pagination.pageSize}
          lastPage={pagination.lastPage}
          onPageChange={(newPage) =>
            setPagination((prev) => ({ ...prev, page: newPage }))
          }
          onPageSizeChange={(newSize) => {
            setPagination((prev) => ({
              ...prev,
              pageSize: newSize,
              page: 1,
            }));
          }}
        />
      )}
    </div>
  );
};

export default FbdTable;
