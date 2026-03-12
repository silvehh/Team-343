import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";

const partners = ["STM", "exo", "BIXI", "Communauto", "RTL", "ARTM"];

export default function LogoCollection() {
  return (
    <Box id="logoCollection" sx={{ py: 4 }}>
      <Typography
        component="p"
        variant="subtitle2"
        align="center"
        sx={{ color: "text.secondary", mb: 2 }}
      >
        Partnered with Montreal's leading transportation providers
      </Typography>
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        sx={{ justifyContent: "center", flexWrap: "wrap" }}
      >
        {partners.map((partner, index) => (
          <Chip
            key={index}
            label={partner}
            variant="outlined"
            sx={{ fontSize: "1rem", px: 1 }}
          />
        ))}
      </Stack>
    </Box>
  );
}
