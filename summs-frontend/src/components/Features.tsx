import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import MuiChip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import PedalBikeIcon from "@mui/icons-material/PedalBike";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NatureIcon from "@mui/icons-material/Nature";

const items = [
  {
    icon: <CompareArrowsIcon />,
    title: "Smart Trip Comparison",
    description:
      "Compare public transit, bike shares, and vehicle rentals side-by-side. Get instant cost, time, and environmental impact estimates for your journey.",
    imageLight: `url("${import.meta.env.TEMPLATE_IMAGE_URL || "https://mui.com"}/static/images/templates/templates-images/dash-light.png")`,
    imageDark: `url("${import.meta.env.TEMPLATE_IMAGE_URL || "https://mui.com"}/static/images/templates/templates-images/dash-dark.png")`,
  },
  {
    icon: <DirectionsCarIcon />,
    title: "Vehicle Rental Management",
    description:
      "Browse, reserve, and manage vehicle rentals from multiple providers. Track your reservations, extend rentals, and handle returns all in one place.",
    imageLight: `url("${import.meta.env.TEMPLATE_IMAGE_URL || "https://mui.com"}/static/images/templates/templates-images/mobile-light.png")`,
    imageDark: `url("${import.meta.env.TEMPLATE_IMAGE_URL || "https://mui.com"}/static/images/templates/templates-images/mobile-dark.png")`,
  },
  {
    icon: <DirectionsBusIcon />,
    title: "Public Transit Integration",
    description:
      "Access real-time transit schedules, routes, and delays from all major transit providers in your city. Plan multi-modal trips with ease.",
    imageLight: `url("${import.meta.env.TEMPLATE_IMAGE_URL || "https://mui.com"}/static/images/templates/templates-images/devices-light.png")`,
    imageDark: `url("${import.meta.env.TEMPLATE_IMAGE_URL || "https://mui.com"}/static/images/templates/templates-images/devices-dark.png")`,
  },
  {
    icon: <PedalBikeIcon />,
    title: "Bike Share Network",
    description:
      "Find and unlock bikes from all major bike-sharing services. Check availability, compare prices, and get directions to the nearest station.",
    imageLight: `url("${import.meta.env.TEMPLATE_IMAGE_URL || "https://mui.com"}/static/images/templates/templates-images/dash-light.png")`,
    imageDark: `url("${import.meta.env.TEMPLATE_IMAGE_URL || "https://mui.com"}/static/images/templates/templates-images/dash-dark.png")`,
  },
  {
    icon: <AccessTimeIcon />,
    title: "Real-time Updates",
    description:
      "Stay informed with live traffic updates, service delays, and dynamic route adjustments. Never miss your connection or waste time waiting.",
    imageLight: `url("${import.meta.env.TEMPLATE_IMAGE_URL || "https://mui.com"}/static/images/templates/templates-images/mobile-light.png")`,
    imageDark: `url("${import.meta.env.TEMPLATE_IMAGE_URL || "https://mui.com"}/static/images/templates/templates-images/mobile-dark.png")`,
  },
  {
    icon: <NatureIcon />,
    title: "Eco-Friendly Choices",
    description:
      "See the environmental impact of each travel option. Make sustainable choices with carbon footprint tracking and green transportation rewards.",
    imageLight: `url("${import.meta.env.TEMPLATE_IMAGE_URL || "https://mui.com"}/static/images/templates/templates-images/devices-light.png")`,
    imageDark: `url("${import.meta.env.TEMPLATE_IMAGE_URL || "https://mui.com"}/static/images/templates/templates-images/devices-dark.png")`,
  },
];

interface ChipProps {
  selected?: boolean;
}

const Chip = styled(MuiChip)<ChipProps>(({ theme }) => ({
  variants: [
    {
      props: ({ selected }) => !!selected,
      style: {
        background:
          "linear-gradient(to bottom right, hsl(210, 98%, 48%), hsl(210, 98%, 35%))",
        color: "hsl(0, 0%, 100%)",
        borderColor: (theme.vars || theme).palette.primary.light,
        "& .MuiChip-label": {
          color: "hsl(0, 0%, 100%)",
        },
        ...theme.applyStyles("dark", {
          borderColor: (theme.vars || theme).palette.primary.dark,
        }),
      },
    },
  ],
}));

interface MobileLayoutProps {
  selectedItemIndex: number;
  handleItemClick: (index: number) => void;
  selectedFeature: (typeof items)[0];
}

export function MobileLayout({
  selectedItemIndex,
  handleItemClick,
  selectedFeature,
}: MobileLayoutProps) {
  if (!items[selectedItemIndex]) {
    return null;
  }

  return (
    <Box
      sx={{
        display: { xs: "flex", sm: "none" },
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", gap: 2, overflow: "auto" }}>
        {items.map(({ title }, index) => (
          <Chip
            size="medium"
            key={index}
            label={title}
            onClick={() => handleItemClick(index)}
            selected={selectedItemIndex === index}
          />
        ))}
      </Box>
      <Card variant="outlined">
        <Box
          sx={(theme) => ({
            mb: 2,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: 280,
            backgroundImage: "var(--items-imageLight)",
            ...theme.applyStyles("dark", {
              backgroundImage: "var(--items-imageDark)",
            }),
          })}
          style={
            items[selectedItemIndex]
              ? ({
                  "--items-imageLight": items[selectedItemIndex].imageLight,
                  "--items-imageDark": items[selectedItemIndex].imageDark,
                } as any)
              : {}
          }
        />
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography
            gutterBottom
            sx={{ color: "text.primary", fontWeight: "medium" }}
          >
            {selectedFeature.title}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
            {selectedFeature.description}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}

export default function Features() {
  const [selectedItemIndex, setSelectedItemIndex] = React.useState(0);

  const handleItemClick = (index: number) => {
    setSelectedItemIndex(index);
  };

  const selectedFeature = items[selectedItemIndex];

  return (
    <Container id="features" sx={{ py: { xs: 8, sm: 16 } }}>
      <Box sx={{ width: { sm: "100%", md: "60%" } }}>
        <Typography
          component="h2"
          variant="h4"
          gutterBottom
          sx={{ color: "text.primary" }}
        >
          Everything You Need to Move Smarter
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", mb: { xs: 2, sm: 4 } }}
        >
          SUMMS brings together all your transportation options in one powerful
          platform. Compare, book, and manage your entire journey with features
          designed for modern urban mobility.
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row-reverse" },
          gap: 2,
        }}
      >
        <div>
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              flexDirection: "column",
              gap: 2,
              height: "100%",
            }}
          >
            {items.map(({ icon, title, description }, index) => (
              <Box
                key={index}
                component={Button}
                onClick={() => handleItemClick(index)}
                sx={[
                  (theme) => ({
                    p: 2,
                    height: "100%",
                    width: "100%",
                    "&:hover": {
                      backgroundColor: (theme.vars || theme).palette.action
                        .hover,
                    },
                  }),
                  selectedItemIndex === index && {
                    backgroundColor: "action.selected",
                  },
                ]}
              >
                <Box
                  sx={[
                    {
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "left",
                      gap: 1,
                      textAlign: "left",
                      textTransform: "none",
                      color: "text.secondary",
                    },
                    selectedItemIndex === index && {
                      color: "text.primary",
                    },
                  ]}
                >
                  {icon}

                  <Typography variant="h6">{title}</Typography>
                  <Typography variant="body2">{description}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <MobileLayout
            selectedItemIndex={selectedItemIndex}
            handleItemClick={handleItemClick}
            selectedFeature={selectedFeature}
          />
        </div>
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            width: { xs: "100%", md: "70%" },
            height: "var(--items-image-height)",
          }}
        >
          <Card
            variant="outlined"
            sx={{
              height: "100%",
              width: "100%",
              display: { xs: "none", sm: "flex" },
              pointerEvents: "none",
            }}
          >
            <Box
              sx={(theme) => ({
                m: "auto",
                width: 420,
                height: 500,
                backgroundSize: "contain",
                backgroundImage: "var(--items-imageLight)",
                ...theme.applyStyles("dark", {
                  backgroundImage: "var(--items-imageDark)",
                }),
              })}
              style={
                items[selectedItemIndex]
                  ? ({
                      "--items-imageLight": items[selectedItemIndex].imageLight,
                      "--items-imageDark": items[selectedItemIndex].imageDark,
                    } as any)
                  : {}
              }
            />
          </Card>
        </Box>
      </Box>
    </Container>
  );
}
