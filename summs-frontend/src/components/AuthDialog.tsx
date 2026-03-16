import * as React from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
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

  React.useEffect(() => {
    if (!open) {
      return;
    }

    setAuthMode(initialMode);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFormError("");
    setIsSubmitting(false);
  }, [open, initialMode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (authMode === "signup" && password !== confirmPassword) {
      setFormError("Passwords do not match.");
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
        <DialogTitle>{authMode === "signin" ? "Sign in" : "Sign up"}</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 1 }}>
          <TextField
            autoFocus
            placeholder="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            fullWidth
          />
          <TextField
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            inputProps={{ minLength: 8 }}
            fullWidth
          />
          {authMode === "signup" && (
            <TextField
              placeholder="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              inputProps={{ minLength: 8 }}
              fullWidth
            />
          )}
          {formError && <Alert severity="error">{formError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 3 }}>
          <Button
            onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
            disabled={isSubmitting}
          >
            {authMode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </Button>
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
