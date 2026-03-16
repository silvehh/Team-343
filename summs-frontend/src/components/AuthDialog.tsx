import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Link from "@mui/material/Link";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { type AuthMode, submitAuth } from "../api/auth";

type AuthDialogProps = {
  open: boolean;
  initialMode: AuthMode;
  onClose: () => void;
  onAuthSuccess: (email: string) => void;
};

export default function AuthDialog({ open, initialMode, onClose, onAuthSuccess }: AuthDialogProps) {
  const [authMode, setAuthMode] = React.useState<AuthMode>(initialMode);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState("");
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [confirmPasswordError, setConfirmPasswordError] = React.useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setAuthMode(initialMode);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFormError("");
    setEmailError(false);
    setEmailErrorMessage("");
    setPasswordError(false);
    setPasswordErrorMessage("");
    setConfirmPasswordError(false);
    setConfirmPasswordErrorMessage("");
    setIsSubmitting(false);
  }, [open, initialMode]);

  const validateInputs = () => {
    let isValid = true;

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password || password.length < 8) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 8 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    if (authMode === "signup") {
      if (!confirmPassword || confirmPassword.length < 8) {
        setConfirmPasswordError(true);
        setConfirmPasswordErrorMessage("Please confirm your password.");
        isValid = false;
      } else if (password !== confirmPassword) {
        setConfirmPasswordError(true);
        setConfirmPasswordErrorMessage("Passwords do not match.");
        isValid = false;
      } else {
        setConfirmPasswordError(false);
        setConfirmPasswordErrorMessage("");
      }
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrorMessage("");
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!validateInputs()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await submitAuth(authMode, email, password);
      onAuthSuccess(data.email);
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Could not reach the server. Make sure the backend is running.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography component="h1" variant="h4" sx={{ fontSize: "clamp(1.8rem, 7vw, 2.15rem)" }}>
            {authMode === "signin" ? "Sign in" : "Sign up"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl>
              <FormLabel htmlFor="auth-email">Email</FormLabel>
              <TextField
                id="auth-email"
                name="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                error={emailError}
                helperText={emailErrorMessage}
                color={emailError ? "error" : "primary"}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="auth-password">Password</FormLabel>
              <TextField
                id="auth-password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete={authMode === "signin" ? "current-password" : "new-password"}
                required
                fullWidth
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                error={passwordError}
                helperText={passwordErrorMessage}
                color={passwordError ? "error" : "primary"}
              />
            </FormControl>

            {authMode === "signup" && (
              <FormControl>
                <FormLabel htmlFor="auth-confirm-password">Confirm password</FormLabel>
                <TextField
                  id="auth-confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  fullWidth
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  error={confirmPasswordError}
                  helperText={confirmPasswordErrorMessage}
                  color={confirmPasswordError ? "error" : "primary"}
                />
              </FormControl>
            )}
          </Box>
          {formError && <Alert severity="error">{formError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 3 }}>
          <Typography sx={{ color: "text.secondary" }}>
            {authMode === "signin" ? "Don't have an account?" : "Already have an account?"} {" "}
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
              disabled={isSubmitting}
              sx={{ alignSelf: "center" }}
            >
              {authMode === "signin" ? "Sign up" : "Sign in"}
            </Link>
          </Typography>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : authMode === "signin" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
