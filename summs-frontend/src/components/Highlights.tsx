import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SavingsIcon from "@mui/icons-material/Savings";
import SpeedIcon from "@mui/icons-material/Speed";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import SecurityIcon from "@mui/icons-material/Security";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const items = [
  {
    icon: <SavingsIcon />,
    title: "Save Money",
    description:
      "Compare prices across all providers instantly. Find the most affordable option for every trip and save up to 30% on transportation costs.",
  },
  {
    icon: <SpeedIcon />,
    title: "Save Time",
    description:
      "No more juggling multiple apps. Plan, book, and manage all your transportation needs in one place with just a few taps.",
  },
  {
    icon: <PhoneAndroidIcon />,
    title: "One App, All Options",
    description:
      "Access public transit, bike shares, and vehicle rentals through a single, intuitive interface. Simplicity meets comprehensive coverage.",
  },
  {
    icon: <SecurityIcon />,
    title: "Secure & Reliable",
    description:
      "Your payment information is protected with bank-level encryption. Enjoy peace of mind with every transaction and booking.",
  },
  {
    icon: <NotificationsActiveIcon />,
    title: "Smart Notifications",
    description:
      "Get real-time alerts about delays, price changes, and better route options. Stay informed and adjust your plans on the fly.",
  },
  {
    icon: <AccountCircleIcon />,
    title: "Flexible Subscriptions",
    description:
      "Choose the plan that fits your lifestyle. Upgrade, downgrade, or cancel anytime. Manage your profile and preferences with complete control.",
  },
];

export default function Highlights() {
  return (
    <Box
      id="highlights"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: "white",
        bgcolor: "grey.900",
      }}
    >
      <Container
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: "100%", md: "60%" },
            textAlign: { sm: "left", md: "center" },
          }}
        >
          <Typography component="h2" variant="h4" gutterBottom>
            Why Choose SUMMS?
          </Typography>
          <Typography variant="body1" sx={{ color: "grey.400" }}>
            Experience the future of urban mobility. SUMMS combines convenience,
            savings, and sustainability to transform how you navigate your city.
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {items.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Stack
                direction="column"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  color: "inherit",
                  p: 3,
                  height: "100%",
                  borderColor: "hsla(220, 25%, 25%, 0.3)",
                  backgroundColor: "grey.800",
                }}
              >
                <Box sx={{ opacity: "50%" }}>{item.icon}</Box>
                <div>
                  <Typography gutterBottom sx={{ fontWeight: "medium" }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "grey.400" }}>
                    {item.description}
                  </Typography>
                </div>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
