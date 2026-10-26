import React, { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { boiBlue, boiTableHeaderBg, boiBorder } from "../../theme/theme";

function HeaderCell({ children, sortable, align }) {
  return (
    <TableCell
      align={align}
      sx={{
        minWidth: 0,
        fontWeight: 700,
        color: boiBlue,
        fontSize: 13,
        borderBottom: `1px solid ${boiBorder}`,
        bgcolor: boiTableHeaderBg,
        py: 1.25,
      }}
    >
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.35 }}>
        {children}
        {sortable && (
          <UnfoldMoreIcon
            sx={{ fontSize: 18, color: boiBlue, opacity: 0.55 }}
          />
        )}
      </Box>
    </TableCell>
  );
}

export function DataTable({
  columns = [],
  rows,
  data,
  getRowId = (row, i) => row?.id || row?.externalReferenceCode || `row-${i}`,
  emptyMessage = "No records found",
  page: controlledPage,
  rowsPerPage: controlledRowsPerPage,
  pageSize,
  totalRows,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onPageSizeChange,
  rowsPerPageOptions = [10, 20, 50],
  onRowClick,
}) {
  const tableData = rows || data || [];
  const [localPage, setLocalPage] = useState(0);
  const [localRpp, setLocalRpp] = useState(20);

  // Support 1-based page from parent or 0-based
  const isOneBased = typeof controlledPage === "number" && controlledPage >= 1;
  const page =
    controlledPage !== undefined
      ? isOneBased
        ? controlledPage - 1
        : controlledPage
      : localPage;
  const rowsPerPage = controlledRowsPerPage ?? pageSize ?? localRpp;
  const count = totalRows ?? totalCount ?? tableData.length;

  const sliceStart = controlledPage === undefined ? page * rowsPerPage : 0;
  const sliceEnd =
    controlledPage === undefined ? sliceStart + rowsPerPage : tableData.length;
  const visibleRows =
    controlledPage === undefined
      ? tableData.slice(sliceStart, sliceEnd)
      : tableData;

  const handleMuiPageChange = (_, newPage) => {
    if (onPageChange) {
      onPageChange(isOneBased ? newPage + 1 : newPage);
    }
    if (controlledPage === undefined) setLocalPage(newPage);
  };

  const handleMuiRowsPerPageChange = (e) => {
    const next = parseInt(e.target.value, 10);
    if (onRowsPerPageChange) onRowsPerPageChange(next);
    if (onPageSizeChange) onPageSizeChange(next);
    if (controlledRowsPerPage === undefined && pageSize === undefined) {
      setLocalRpp(next);
      setLocalPage(0);
    }
  };

  return (
    <Paper
      elevation={0}
      component={Box}
      sx={{
        border: `1px solid ${boiBorder}`,
        borderRadius: "12px",
        overflow: "hidden",
        bgcolor: "#fff",
      }}
    >
      <TableContainer component={Box}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col, idx) => (
                <HeaderCell
                  key={String(col.id || col.accessor || idx)}
                  align={col.align || "left"}
                >
                  {col.label || col.header}
                </HeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Box sx={{ color: "text.secondary" }}>{emptyMessage}</Box>
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row, rowIndex) => (
                <TableRow
                  hover
                  key={getRowId(row, rowIndex)}
                  onClick={() => onRowClick?.(row)}
                  sx={{
                    cursor: onRowClick ? "pointer" : "default",
                    bgcolor: "#fff",
                    "&:last-child td": { borderBottom: 0 },
                  }}
                >
                  {columns.map((col, ci) => {
                    const colKey = col.id || col.accessor || `col-${ci}`;
                    let cellContent;
                    if (typeof col.render === "function") {
                      cellContent = col.render(row, rowIndex);
                    } else if (typeof col.format === "function") {
                      cellContent = col.format(row, sliceStart + rowIndex + 1);
                    } else {
                      cellContent = row[colKey] ?? "";
                    }

                    return (
                      <TableCell
                        key={`${String(colKey)}-${ci}`}
                        align={col.align || "left"}
                        sx={{
                          fontSize: 13,
                          borderBottom: `1px solid ${boiBorder}`,
                          py: 1.1,
                          color: "text.primary",
                        }}
                      >
                        {cellContent}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component={Box}
        count={count}
        page={Math.max(0, page)}
        onPageChange={handleMuiPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleMuiRowsPerPageChange}
        rowsPerPageOptions={rowsPerPageOptions}
        labelRowsPerPage="Show"
        showFirstButton
        showLastButton
        sx={{
          borderTop: `1px solid ${boiBorder}`,
          bgcolor: "#fafbfc",
          "& .MuiTablePagination-toolbar": { minHeight: 52, px: 2 },
          "& .MuiTablePagination-select": { borderRadius: "8px" },
          "& .MuiIconButton-root": { color: boiBlue },
          "& .MuiTablePagination-actions .MuiIconButton-root": {
            border: `1px solid ${boiBorder}`,
            borderRadius: "8px",
            mx: 0.25,
            bgcolor: "#fff",
          },
        }}
      />
    </Paper>
  );
}

export default DataTable;
