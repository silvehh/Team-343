import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ColorModeIconDropdown from "../shared-theme/ColorModeIconDropdown";
import Sitemark from "./SitemarkIcon";
import AuthDialog from "./AuthDialog";
import { type AuthMode } from "../api/auth";

const AUTH_EMAIL_KEY = "summs.auth.email";

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: "blur(24px)",
  border: "1px solid",
  borderColor: (theme.vars || theme).palette.divider,
  backgroundColor: theme.vars
    ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.4)`
    : alpha(theme.palette.background.default, 0.4),
  boxShadow: (theme.vars || theme).shadows[1],
  padding: "8px 12px",
}));

export default function AppAppBar() {
  const [open, setOpen] = React.useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<AuthMode>("signin");
  const [currentUserEmail, setCurrentUserEmail] = React.useState(
    () => localStorage.getItem(AUTH_EMAIL_KEY) ?? "",
  );

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const openAuthDialog = (mode: AuthMode) => {
    setAuthMode(mode);
    setIsAuthDialogOpen(true);
  };

  const closeAuthDialog = () => {
    setIsAuthDialogOpen(false);
  };

  const handleLogout = () => {
    setCurrentUserEmail("");
    localStorage.removeItem(AUTH_EMAIL_KEY);
  };

  const handleAuthSuccess = (email: string) => {
    setCurrentUserEmail(email);
    localStorage.setItem(AUTH_EMAIL_KEY, email);
  };

  return (
    <AppBar
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: "transparent",
        backgroundImage: "none",
        mt: "calc(var(--template-frame-height, 0px) + 28px)",
      }}
    >
      <Container maxWidth="lg">
        <StyledToolbar variant="dense" disableGutters>
          <Box
            sx={{ flexGrow: 1, display: "flex", alignItems: "center", px: 0 }}
          >
            <Sitemark />
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <Button variant="text" color="info" size="small">
                Features
              </Button>
              <Button variant="text" color="info" size="small">
                Testimonials
              </Button>
              <Button variant="text" color="info" size="small">
                Highlights
              </Button>
              <Button variant="text" color="info" size="small">
                Pricing
              </Button>
              <Button
                variant="text"
                color="info"
                size="small"
                sx={{ minWidth: 0 }}
              >
                FAQ
              </Button>
              <Button
                variant="text"
                color="info"
                size="small"
                sx={{ minWidth: 0 }}
              >
                Blog
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 1,
              alignItems: "center",
            }}
          >
            {currentUserEmail ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                  {currentUserEmail}
                </Typography>
                <Button color="primary" variant="outlined" size="small" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button color="primary" variant="text" size="small" onClick={() => openAuthDialog("signin")}>
                  Sign in
                </Button>
                <Button color="primary" variant="contained" size="small" onClick={() => openAuthDialog("signup")}>
                  Sign up
                </Button>
              </>
            )}
            <ColorModeIconDropdown />
          </Box>
          <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1 }}>
            <ColorModeIconDropdown size="medium" />
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="top"
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: {
                  top: "var(--template-frame-height, 0px)",
                },
              }}
            >
              <Box sx={{ p: 2, backgroundColor: "background.default" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>

                <MenuItem>Features</MenuItem>
                <MenuItem>Testimonials</MenuItem>
                <MenuItem>Highlights</MenuItem>
                <MenuItem>Pricing</MenuItem>
                <MenuItem>FAQ</MenuItem>
                <MenuItem>Blog</MenuItem>
                <Divider sx={{ my: 3 }} />
                <MenuItem>
                  {currentUserEmail ? (
                    <Button color="primary" variant="outlined" fullWidth onClick={handleLogout}>
                      Log out
                    </Button>
                  ) : (
                    <Button
                      color="primary"
                      variant="contained"
                      fullWidth
                      onClick={() => {
                        setOpen(false);
                        openAuthDialog("signup");
                      }}
                    >
                      Sign up
                    </Button>
                  )}
                </MenuItem>
                <MenuItem>
                  {!currentUserEmail && (
                    <Button
                      color="primary"
                      variant="outlined"
                      fullWidth
                      onClick={() => {
                        setOpen(false);
                        openAuthDialog("signin");
                      }}
                    >
                      Sign in
                    </Button>
                  )}
                </MenuItem>
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>

      <AuthDialog
        open={isAuthDialogOpen}
        initialMode={authMode}
        onClose={closeAuthDialog}
        onAuthSuccess={handleAuthSuccess}
      />
    </AppBar>
  );
}
