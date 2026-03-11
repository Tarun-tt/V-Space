import React from "react";

const CustomTable = ({
  columns = [],
  data = [],
  totalCount = 0,
  page = 1,
  pageSize = 20,
  lastPage = 1,
  onPageChange = () => {},
  onPageSizeChange = () => {},
}) => {
  const totalPages = lastPage;

  const handleRowsPerPageChange = (e) => {
    const newSize = Number(e.target.value);
    onPageSizeChange(newSize);
  };

  const goToPage = (targetPage) => {
    if (targetPage < 1) targetPage = 1;
    else if (targetPage > totalPages) targetPage = totalPages;
    onPageChange(targetPage);
  };

  const getPaginationNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      let left = page - 1;
      let right = page + 1;

      if (page <= 3) {
        left = 2;
        right = 4;
      } else if (page >= totalPages - 2) {
        left = totalPages - 3;
        right = totalPages - 1;
      }

      if (left > 2) {
        pages.push("...");
      }

      for (let i = left; i <= right; i++) {
        if (i > 1 && i < totalPages) pages.push(i);
      }

      if (right < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const paginationNumbers = getPaginationNumbers();
  const firstItem = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalCount);

  return (
    <div className="shadowBox">
      <div className="table-responsive">
        {/* Table */}
        <table className="table table-hover">
          {/* <thead className="table-primary">
           */}
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className=" text-white text-center"
                  style={{
                    backgroundColor: "#0066B3",
                    // borderTopLeftRadius: "10px",
                    // borderTopRightRadius: "10px",
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="text-center">
                      {typeof col.render === "function"
                        ? // ? col.render(row)
                          col.render(row, rowIndex)
                        : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center flex-wrap mt-3">
          <div className="mb-2 d-flex align-items-center">
            <span className="me-2">Show</span>
            <select
              className="form-select form-select-sm w-auto"
              value={pageSize}
              onChange={handleRowsPerPageChange}
            >
              {[20, 40, 60].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
            <span className="ms-2">entries</span>
            <span className="ms-3">
              Showing {firstItem} to {lastItem} of {totalCount} entries
            </span>
          </div>

          <div className="mb-2">
            <nav aria-label="Page navigation">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => goToPage(1)}
                    disabled={page === 1}
                  >
                    &laquo;
                  </button>
                </li>
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 1}
                  >
                    &lsaquo;
                  </button>
                </li>

                {paginationNumbers.map((item, idx) => (
                  <li
                    key={idx}
                    className={`page-item ${item === "..." ? "disabled" : ""} ${
                      item === page ? "active" : ""
                    }`}
                  >
                    {item === "..." ? (
                      <span className="page-link">...</span>
                    ) : (
                      <button
                        className="page-link"
                        onClick={() => goToPage(item)}
                      >
                        {item}
                      </button>
                    )}
                  </li>
                ))}

                <li
                  className={`page-item ${
                    page === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => goToPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    &rsaquo;
                  </button>
                </li>
                <li
                  className={`page-item ${
                    page === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => goToPage(totalPages)}
                    disabled={page === totalPages}
                  >
                    &raquo;
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomTable;
