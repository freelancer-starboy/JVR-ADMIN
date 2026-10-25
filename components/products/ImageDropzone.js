import React, { useRef, useState } from "react";
import { Box, Chip, IconButton, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import CloseIcon from "@mui/icons-material/Close";

const tileSx = {
  position: "relative",
  aspectRatio: "3 / 4",
  borderRadius: 2,
  overflow: "hidden",
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "#F1F2F8",
};

function Thumb({ src, label, isNew, isCover, onRemove }) {
  return (
    <Box sx={{ ...tileSx, "&:hover .remove-btn": { opacity: 1 } }}>
      <Box component="img" src={src} alt={label} sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      <Box sx={{ position: "absolute", left: 6, bottom: 6, display: "flex", gap: 0.5 }}>
        {isCover && <Chip label="Cover" size="small" sx={{ bgcolor: "rgba(17,24,39,0.75)", color: "#fff", height: 20, fontSize: 11 }} />}
        {isNew && <Chip label="New" size="small" color="primary" sx={{ height: 20, fontSize: 11 }} />}
      </Box>
      <Tooltip title="Remove photo">
        <IconButton
          className="remove-btn"
          size="small"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            bgcolor: "rgba(255,255,255,0.92)",
            boxShadow: 1,
            opacity: { xs: 1, md: 0 },
            transition: "opacity 150ms ease",
            "&:hover": { bgcolor: "#fff", color: "error.main" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

// Photo grid with a click / drag-and-drop tile for adding more images.
export default function ImageDropzone({ existing = [], added = [], onAdd, onRemoveExisting, onRemoveNew, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const total = existing.length + added.length;

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length) onAdd(files);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(3, 1fr)", sm: "repeat(4, 1fr)", md: "repeat(5, 1fr)" },
          gap: 1.25,
        }}
      >
        {existing.map((url, index) => (
          <Thumb
            key={url}
            src={url}
            label={`photo ${index + 1}`}
            isCover={index === 0}
            onRemove={() => onRemoveExisting(url)}
          />
        ))}
        {added.map((image, index) => (
          <Thumb
            key={image.id}
            src={image.preview}
            label={image.file.name}
            isNew
            isCover={existing.length === 0 && index === 0}
            onRemove={() => onRemoveNew(image.id)}
          />
        ))}

        <Box
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            handleFiles(event.dataTransfer.files);
          }}
          sx={(theme) => ({
            ...tileSx,
            gridColumn: total === 0 ? "1 / -1" : "auto",
            aspectRatio: total === 0 ? "auto" : "3 / 4",
            minHeight: total === 0 ? 150 : 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 0.75,
            p: 1.5,
            cursor: "pointer",
            borderStyle: "dashed",
            borderWidth: 2,
            borderColor: error ? "error.main" : dragging ? "primary.main" : "#CDD1E0",
            bgcolor: dragging ? alpha(theme.palette.primary.main, 0.06) : "#FAFAFD",
            color: dragging ? "primary.main" : "text.secondary",
            transition: "all 150ms ease",
            "&:hover, &:focus-visible": {
              borderColor: "primary.main",
              color: "primary.main",
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              outline: "none",
            },
          })}
        >
          <AddPhotoAlternateOutlinedIcon />
          <Typography variant="body2" fontWeight={600} color="inherit">
            {total === 0 ? "Click or drop photos here" : "Add photos"}
          </Typography>
          {total === 0 && (
            <Typography variant="caption" color="text.secondary">
              JPG, PNG or WebP · up to 10 MB each · the first photo is the cover
            </Typography>
          )}
        </Box>
      </Box>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {error && (
        <Typography variant="caption" color="error" sx={{ display: "block", mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
