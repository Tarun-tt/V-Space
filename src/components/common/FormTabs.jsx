import { useEffect, useRef, useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { boiSuccessGreen, boiBlue, boiMutedText } from "../../theme/theme";

/* ---------------- TAB CONTENT ---------------- */
const TabContent = styled(Box)(({ isActive, isCompleted }) => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",

  "& .prefix": {
    fontWeight: 700,
    fontSize: "0.9rem",
    color: isActive ? boiBlue : isCompleted ? boiSuccessGreen : boiMutedText,
    minWidth: "22px",
    textAlign: "center",
  },

  "& .label-text": {
    color: boiMutedText,
    fontWeight: 500,
    transition: "color 0.2s ease",
  },
}));

/* ---------------- TABS STYLE ---------------- */
const StyledTabs = styled(Tabs)({
  "& .MuiTabs-indicator": {
    backgroundColor: boiBlue,
    height: 3,
    borderRadius: "3px 3px 0 0",
  },

  "& .MuiTab-root": {
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.875rem",
    padding: "8px 16px 12px 16px",
    minHeight: "auto",
    borderRadius: "8px 8px 0 0",
    transition: "all 0.3s ease",

    "&:hover": {
      backgroundColor: "rgba(0, 93, 170, 0.04)",
    },
  },
});

/* ---------------- FORM TABS ---------------- */
export function FormTabs({
  value,
  onChange,
  tabs,
  variant = "standard",
  scrollButtons = "auto",
  center = false,
}) {
  const tabsRef = useRef(null);
  const [trianglePos, setTrianglePos] = useState(0);

  const handleChange = (_, newValue) => {
    onChange?.(newValue);
  };

  useEffect(() => {
    const updateTriangle = () => {
      if (!tabsRef.current) return;

      const activeTab = tabsRef.current.querySelector(".Mui-selected");

      if (activeTab) {
        const { offsetLeft, offsetWidth } = activeTab;
        setTrianglePos(offsetLeft + offsetWidth / 2);
      }
    };

    updateTriangle();
    window.addEventListener("resize", updateTriangle);

    return () => window.removeEventListener("resize", updateTriangle);
  }, [value, tabs]);

  const currentIndex = tabs.findIndex((t) => t.value === value);

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        mb: 2,
        position: "relative",
      }}
    >
      <StyledTabs
        ref={tabsRef}
        value={value}
        onChange={handleChange}
        variant={variant}
        scrollButtons={scrollButtons}
        centered={center}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.value === value;
          const isCompleted = index < currentIndex;

          let tabBgColor = "transparent";
          if (isActive) {
            tabBgColor = "rgba(0, 93, 170, 0.08)";
          } else if (isCompleted) {
            tabBgColor = "rgba(40, 167, 69, 0.08)";
          }

          return (
            <Tab
              key={tab.value}
              value={tab.value}
              disabled={tab.disabled || false}
              label={
                <TabContent isActive={isActive} isCompleted={isCompleted}>
                  <Box component="span" className="prefix">
                    {(index + 1).toString().padStart(2, "0")}
                  </Box>
                  <Box component="span" className="label-text">{tab.label}</Box>
                  {tab.badge && <Box component="span">{tab.badge}</Box>}
                </TabContent>
              }
              sx={{
                backgroundColor: tabBgColor,
                "&.Mui-selected": {
                  backgroundColor: "rgba(0, 93, 170, 0.08)",
                },
              }}
            />
          );
        })}
      </StyledTabs>

      <Box
        sx={{
          position: "absolute",
          top: "100%",
          left: trianglePos,
          transform: "translateX(-50%)",
          width: "36px",
          height: "21px",
          background:
            "linear-gradient(90deg, #F57C20 0%, #F57C20 26.44%, #446C97 58.65%, #007DC5 100%)",
          clipPath: "polygon(50% 100%, 0 0, 100% 0)",
          zIndex: 1,
          transition: "left 0.3s ease",
        }}
      />
    </Box>
  );
}

/* ---------------- STAGE TABS ---------------- */
export function StageTabs({
  stages,
  activeStage,
  onStageChange,
  activeTab,
  onTabChange,
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {stages.map((stage, stageIndex) => {
        const isStageActive = stage.value === activeStage;
        const isStageCompleted = stage.completed || false;

        return (
          <Box key={stage.value}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1,
                cursor: "pointer",
                p: 1,
                borderRadius: 1,
                backgroundColor: isStageActive
                  ? "rgba(0, 93, 170, 0.08)"
                  : isStageCompleted
                    ? "rgba(40, 167, 69, 0.08)"
                    : "transparent",
                "&:hover": {
                  backgroundColor: isStageActive
                    ? "rgba(0, 93, 170, 0.12)"
                    : isStageCompleted
                      ? "rgba(40, 167, 69, 0.12)"
                      : "rgba(0, 0, 0, 0.04)",
                },
              }}
              onClick={() => onStageChange?.(stage.value)}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isStageActive
                    ? boiBlue
                    : isStageCompleted
                      ? boiSuccessGreen
                      : "#e0e0e0",
                  color: "#fff",
                  fontWeight: "bold",
                  transition: "all 0.2s ease",
                }}
              >
                {stageIndex + 1}
              </Box>

              <Typography
                fontWeight={600}
                sx={{
                  color: boiMutedText,
                }}
              >
                {stage.label}
              </Typography>
            </Box>

            {isStageActive && (
              <Box sx={{ pl: 4 }}>
                <FormTabs
                  value={activeTab}
                  onChange={onTabChange}
                  tabs={stage.tabs}
                  variant="scrollable"
                />
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
