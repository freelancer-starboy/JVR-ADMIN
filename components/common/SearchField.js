import React, { useEffect, useRef, useState } from "react";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

// Search box that reports its value after the user stops typing.
export default function SearchField({ value = "", onChange, placeholder = "Search…", delay = 350, sx }) {
  const [text, setText] = useState(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const lastSent = useRef(value);

  // Keep in sync when the parent resets the value (e.g. from the URL)
  useEffect(() => {
    if (value !== lastSent.current) {
      lastSent.current = value;
      setText(value);
    }
  }, [value]);

  useEffect(() => {
    if (text === lastSent.current) return undefined;
    const timer = setTimeout(() => {
      lastSent.current = text;
      onChangeRef.current?.(text);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, delay]);

  const clear = () => {
    setText("");
    lastSent.current = "";
    onChangeRef.current?.("");
  };

  return (
    <TextField
      size="small"
      value={text}
      onChange={(event) => setText(event.target.value)}
      placeholder={placeholder}
      sx={{ minWidth: { xs: "100%", sm: 280 }, ...sx }}
      inputProps={{ "aria-label": placeholder }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
          </InputAdornment>
        ),
        endAdornment: text ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={clear} aria-label="Clear search">
              <CloseIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
    />
  );
}
