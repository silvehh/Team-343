import * as React from "react";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
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
import { login, logout } from "../store/authSlice";
import type { RootState, AppDispatch } from "../store/store";

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

  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { username, isAuthenticated, accountType } = useSelector((state: RootState) => state.auth);

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
    dispatch(logout());
    navigate("/");
  };

  const handleAuthSuccess = (payload: { userId: number; username: string; email: string; accountType: string }) => {
    dispatch(login(payload));
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
            <Box sx={{ cursor: "pointer", display: "flex", alignItems: "center" }} onClick={() => navigate("/")}>
              <Sitemark />
            </Box>
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <Button variant="text" color="info" size="small" onClick={() => navigate("/vehicles")}>
                Browse Vehicles
              </Button>
              <Button variant="text" color="info" size="small" onClick={() => navigate("/parking")}>
                Parking
              </Button>
              <Button variant="text" color="info" size="small" onClick={() => navigate("/transit")}>
                Transit
              </Button>
              {isAuthenticated && accountType !== "ADMIN" && (
                <Button variant="text" color="info" size="small" onClick={() => navigate("/rentals")}>
                  My Rentals
                </Button>
              )}
              {isAuthenticated && accountType === "MOBILITY_PROVIDER" && (
                <Button variant="text" color="info" size="small" onClick={() => navigate("/provider/vehicles")}>
                  My Vehicles
                </Button>
              )}
              {isAuthenticated && accountType === "ADMIN" && (
                <Button variant="text" color="info" size="small" onClick={() => navigate("/admin/stations")}>
                  Manage Stations
                </Button>
              )}
            </Box>
          </Box>
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 1,
              alignItems: "center",
            }}
          >
            {isAuthenticated ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                  {username}
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

                <MenuItem onClick={() => { setOpen(false); navigate("/vehicles"); }}>
                  Browse Vehicles
                </MenuItem>
                <MenuItem onClick={() => { setOpen(false); navigate("/parking"); }}>
                  Parking
                </MenuItem>
                <MenuItem onClick={() => { setOpen(false); navigate("/transit"); }}>
                  Transit
                </MenuItem>
                {isAuthenticated && accountType !== "ADMIN" && (
                  <MenuItem onClick={() => { setOpen(false); navigate("/rentals"); }}>
                    My Rentals
                  </MenuItem>
                )}
                {isAuthenticated && accountType === "MOBILITY_PROVIDER" && (
                  <MenuItem onClick={() => { setOpen(false); navigate("/provider/vehicles"); }}>
                    My Vehicles
                  </MenuItem>
                )}
                {isAuthenticated && accountType === "ADMIN" && (
                  <MenuItem onClick={() => { setOpen(false); navigate("/admin/stations"); }}>
                    Manage Stations
                  </MenuItem>
                )}
                <Divider sx={{ my: 3 }} />
                <MenuItem>
                  {isAuthenticated ? (
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
                  {!isAuthenticated && (
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
