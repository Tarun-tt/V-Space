import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { boiBlue } from "../../theme/theme";

function Layout({ children }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Container maxWidth="xxl" sx={{ mt: 3, mb: 3, flex: 1 }}>
        {children}
      </Container>
    </Box>
  );
}

export default Layout;
