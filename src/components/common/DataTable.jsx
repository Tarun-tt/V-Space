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
import { useState } from "react";
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
  columns,
  rows,
  getRowId,
  emptyMessage = "No records",
  page: controlledPage,
  rowsPerPage: controlledRowsPerPage,
  totalRows,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25],
  onRowClick,
}) {
  const [localPage, setLocalPage] = useState(0);
  const [localRpp, setLocalRpp] = useState(10);

  const page = controlledPage ?? localPage;
  const rowsPerPage = controlledRowsPerPage ?? localRpp;
  const count = totalRows ?? rows.length;

  const sliceStart = controlledPage === undefined ? page * rowsPerPage : 0;
  const sliceEnd =
    controlledPage === undefined ? sliceStart + rowsPerPage : rows.length;
  const visibleRows =
    controlledPage === undefined ? rows.slice(sliceStart, sliceEnd) : rows;

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${boiBorder}`,
        borderRadius: "12px",
        overflow: "hidden",
        bgcolor: "#fff",
      }}
    >
      <TableContainer>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <HeaderCell key={String(col.id)} align={col.align}>
                  {col.label}
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
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((row, rowIndex) => (
                <TableRow
                  hover
                  key={getRowId(row)}
                  onClick={() => onRowClick?.(row)}
                  sx={{
                    cursor: onRowClick ? "pointer" : "default",
                    bgcolor: "#fff",
                    "&:last-child td": { borderBottom: 0 },
                  }}
                >
                  {columns.map((col, ci) => (
                    <TableCell
                      key={`${String(col.id)}-${ci}`}
                      align={col.align}
                      sx={{
                        fontSize: 13,
                        borderBottom: `1px solid ${boiBorder}`,
                        py: 1.1,
                        color: "text.primary",
                      }}
                    >
                      {col.format
                        ? col.format(row, sliceStart + rowIndex + 1)
                        : String(row[col.id] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={count}
        page={page}
        onPageChange={(_, p) => {
          onPageChange?.(p);
          if (controlledPage === undefined) setLocalPage(p);
        }}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          const next = parseInt(e.target.value, 10);
          onRowsPerPageChange?.(next);
          if (controlledRowsPerPage === undefined) {
            setLocalRpp(next);
            setLocalPage(0);
          }
        }}
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
