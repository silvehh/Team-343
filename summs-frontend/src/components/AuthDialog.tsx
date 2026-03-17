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
  onAuthSuccess: (username: string) => void;
};

export default function AuthDialog({ open, initialMode, onClose, onAuthSuccess }: AuthDialogProps) {
  const [authMode, setAuthMode] = React.useState<AuthMode>(initialMode);
  const [username, setUsername] = React.useState("");
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
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFormError("");
    setIsSubmitting(false);
  }, [open, initialMode]);

  const usernamePattern = /^[A-Za-z0-9._-]{3,20}$/;

  const validateInputs = () => {
    if (authMode === "signup") {
      if (!username.trim()) {
        setFormError("Username is required.");
        return false;
      }

      if (!usernamePattern.test(username.trim())) {
        setFormError("Username must be 3 to 20 characters and use only letters, numbers, periods, underscores, or hyphens.");
        return false;
      }
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setFormError("Please enter a valid email address.");
      return false;
    }

    if (!password || password.length < 8) {
      setFormError("Password must be at least 8 characters long.");
      return false;
    }

    if (authMode === "signup") {
      if (!confirmPassword || confirmPassword.length < 8) {
        setFormError("Please confirm your password.");
        return false;
      }

      if (password !== confirmPassword) {
        setFormError("Passwords do not match.");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!validateInputs()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const data = authMode === "signup"
        ? await submitAuth("signup", { email, password, username: username.trim() })
        : await submitAuth("signin", { email, password });
      onAuthSuccess(data.username);
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
            {authMode === "signup" && (
              <FormControl>
                <FormLabel htmlFor="auth-username">Username</FormLabel>
                <TextField
                  id="auth-username"
                  name="username"
                  type="text"
                  placeholder="username"
                  autoComplete="username"
                  autoFocus
                  required
                  fullWidth
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </FormControl>
            )}

            <FormControl>
              <FormLabel htmlFor="auth-email">Email</FormLabel>
              <TextField
                id="auth-email"
                name="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus={authMode === "signin"}
                required
                fullWidth
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
                />
              </FormControl>
            )}
          </Box>
          {formError && <Alert severity="warning" sx={{ mt: 2 }}>{formError}</Alert>}
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
