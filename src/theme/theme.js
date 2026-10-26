import { createTheme } from "@mui/material/styles";

export const boiBlue = "#007DC5";
export const boiBlueDark = "#004a8c";
export const boiOrange = "#F37021";
export const boiPageBg = "#F5F7FA";
export const boiFilterBg = "#EBF3FB";
export const boiTableHeaderBg = "#E3EEF8";
export const boiInputSoftBg = "#EEF7FF";
export const boiSuccessGreen = "#28a745";
export const boiMutedText = "#5c6c7c";
export const boiBorder = "#d8e2ec";
export const boiErrorRed = "#d32f2f";

export const theme = createTheme({
  palette: {
    primary: { main: boiBlue, contrastText: "#fff", dark: boiBlueDark },
    secondary: { main: boiOrange, contrastText: "#fff" },
    error: { main: boiErrorRed },
    background: { default: boiPageBg, paper: "#fff" },
    text: { primary: "#1a2b3c", secondary: boiMutedText },
  },
  typography: {
    fontFamily:
      '"Source Sans 3", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
        containedPrimary: {
          boxShadow: "none",
          "&:hover": { boxShadow: "0 2px 8px rgba(0,93,170,0.35)" },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: boiBorder },
        },
      },
    },
  },
});
