import React from "react";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ColorSwatch from "@/components/common/ColorSwatch";
import ImageDropzone from "./ImageDropzone";
import { QUICK_COLORS, sizeOptions } from "./constants";

const HEX = /^#[0-9A-F]{6}$/i;

// One colour of a product: colour value, sizes with stock, and photos.
export default function VariantEditor({
  variant,
  index,
  category,
  errors = {},
  canRemove,
  onChange,
  onRemove,
  onAddSize,
  onSizeChange,
  onRemoveSize,
  onAddImages,
  onRemoveExisting,
  onRemoveNew,
}) {
  const sizes = sizeOptions(category);
  const used = new Set(variant.sizes.map((size) => size.size.trim().toLowerCase()).filter(Boolean));
  const remaining = sizes.filter((size) => !used.has(size.toLowerCase()));
  const totalStock = variant.sizes.reduce((sum, size) => sum + (Number(size.stock) || 0), 0);
  const pickerValue = HEX.test(variant.color) ? variant.color : "#000000";

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: errors.any ? "error.light" : "divider",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{ px: 2, py: 1.25, bgcolor: "#FAFAFD", borderBottom: "1px solid", borderColor: "divider" }}
      >
        <ColorSwatch color={variant.color || "#ffffff"} size={20} />
        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
          Colour {index + 1}
          {variant.color && (
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              {variant.color.toUpperCase()}
            </Typography>
          )}
        </Typography>
        <Chip size="small" label={`${totalStock} in stock`} variant="outlined" />
        {canRemove && (
          <Tooltip title="Remove this colour">
            <IconButton size="small" onClick={onRemove} aria-label={`Remove colour ${index + 1}`}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <Stack spacing={3} sx={{ p: 2 }}>
        {/* Colour */}
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            Colour
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "flex-start" }}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                component="label"
                sx={{
                  position: "relative",
                  width: 44,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                  cursor: "pointer",
                  bgcolor: variant.color || "#fff",
                }}
                title="Pick a colour"
              >
                <input
                  type="color"
                  value={pickerValue}
                  onChange={(event) => onChange({ color: event.target.value.toUpperCase() })}
                  style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer" }}
                  aria-label={`Colour picker for colour ${index + 1}`}
                />
              </Box>
              <TextField
                size="small"
                value={variant.color}
                onChange={(event) => {
                  let value = event.target.value.toUpperCase().replace(/[^#0-9A-F]/g, "");
                  if (value && !value.startsWith("#")) value = `#${value}`;
                  if (value.length <= 7) onChange({ color: value });
                }}
                placeholder="#000000"
                error={Boolean(errors.color)}
                helperText={errors.color || "Hex code"}
                sx={{ width: 140 }}
                inputProps={{ "aria-label": "Colour hex code", maxLength: 7 }}
              />
            </Stack>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, pt: { sm: 1 } }}>
              {QUICK_COLORS.map((quick) => (
                <Tooltip key={quick.hex} title={quick.name}>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => onChange({ color: quick.hex })}
                    aria-label={quick.name}
                    sx={{ p: 0, border: 0, bgcolor: "transparent", cursor: "pointer", lineHeight: 0 }}
                  >
                    <ColorSwatch color={quick.hex} size={22} selected={variant.color?.toUpperCase() === quick.hex} />
                  </Box>
                </Tooltip>
              ))}
            </Box>
          </Stack>
        </Box>

        {/* Sizes */}
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            Sizes & stock
          </Typography>
          <Stack spacing={1.25}>
            {variant.sizes.map((size) => {
              const sizeErrors = errors.sizes?.[size.key] || {};
              return (
                <Stack key={size.key} direction="row" spacing={1.25} alignItems="flex-start">
                  <Autocomplete
                    freeSolo
                    size="small"
                    options={remaining}
                    value={size.size}
                    inputValue={size.size}
                    onInputChange={(event, value) => onSizeChange(size.key, { size: value })}
                    onChange={(event, value) => onSizeChange(size.key, { size: value || "" })}
                    sx={{ flex: 1, maxWidth: 260 }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Size"
                        error={Boolean(sizeErrors.size)}
                        helperText={sizeErrors.size}
                        inputProps={{ ...params.inputProps, "aria-label": "Size" }}
                      />
                    )}
                  />
                  <TextField
                    size="small"
                    type="number"
                    value={size.stock}
                    onChange={(event) => onSizeChange(size.key, { stock: event.target.value })}
                    onWheel={(event) => event.target.blur()}
                    placeholder="0"
                    error={Boolean(sizeErrors.stock)}
                    helperText={sizeErrors.stock}
                    sx={{ width: 130 }}
                    inputProps={{ min: 0, step: 1, "aria-label": "Stock" }}
                    InputProps={{ endAdornment: <InputAdornment position="end">pcs</InputAdornment> }}
                  />
                  <Tooltip title="Remove size">
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => onRemoveSize(size.key)}
                        disabled={variant.sizes.length === 1}
                        aria-label="Remove size"
                        sx={{ mt: 0.5 }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              );
            })}
          </Stack>

          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
            <Button size="small" startIcon={<AddIcon />} onClick={() => onAddSize("")}>
              Add size
            </Button>
            {remaining.slice(0, 8).map((size) => (
              <Chip
                key={size}
                label={`+ ${size}`}
                size="small"
                variant="outlined"
                onClick={() => onAddSize(size)}
                sx={{ fontWeight: 500 }}
              />
            ))}
          </Stack>
          {errors.sizesMessage && (
            <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
              {errors.sizesMessage}
            </Typography>
          )}
        </Box>

        {/* Photos */}
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            Photos
          </Typography>
          <ImageDropzone
            existing={variant.existingImages}
            added={variant.newImages}
            onAdd={onAddImages}
            onRemoveExisting={onRemoveExisting}
            onRemoveNew={onRemoveNew}
            error={errors.images}
          />
        </Box>
      </Stack>
    </Box>
  );
}
