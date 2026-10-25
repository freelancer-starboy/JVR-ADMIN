import React, { useState } from "react";
import { Box } from "@mui/material";
import CheckroomOutlinedIcon from "@mui/icons-material/CheckroomOutlined";

// Square product image with a graceful fallback when the image is missing or broken.
export default function ProductThumb({ src, alt = "", size = 44, radius = 8, sx }) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: `${radius}px`,
        overflow: "hidden",
        bgcolor: "#F1F2F8",
        border: "1px solid",
        borderColor: "divider",
        display: "grid",
        placeItems: "center",
        color: "text.disabled",
        ...sx,
      }}
    >
      {showImage ? (
        <Box
          component="img"
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <CheckroomOutlinedIcon sx={{ fontSize: size * 0.45 }} />
      )}
    </Box>
  );
}
