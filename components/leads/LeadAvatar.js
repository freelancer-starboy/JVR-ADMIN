import React from "react";
import { Avatar } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { initials } from "@/utils/format";

const PALETTE = ["#4F46E5", "#0F766E", "#B45309", "#BE185D", "#7C3AED", "#0369A1", "#15803D"];

function colorFor(key = "") {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export default function LeadAvatar({ lead, size = 38 }) {
  if (lead?.isGuest || !lead?.name) {
    return (
      <Avatar sx={{ width: size, height: size, bgcolor: "#EEF0F6", color: "text.secondary" }}>
        <PersonOutlineIcon fontSize="small" />
      </Avatar>
    );
  }
  return (
    <Avatar sx={{ width: size, height: size, bgcolor: colorFor(lead.userKey || lead.name), fontSize: size * 0.38, fontWeight: 600 }}>
      {initials(lead.name)}
    </Avatar>
  );
}
