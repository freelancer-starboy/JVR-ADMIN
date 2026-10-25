import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";

const TOOLBAR = [
  [{ header: [2, 3, false] }],
  ["bold", "italic", "underline"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link"],
  ["clean"],
];

function editorHtml(quill) {
  if (quill.getLength() <= 1) return "";
  // getSemanticHTML() outputs real <ul>/<ol> lists (Quill 2 stores both as <ol> internally)
  const html = typeof quill.getSemanticHTML === "function" ? quill.getSemanticHTML() : quill.root.innerHTML;
  return html.replace(/&nbsp;/g, " ");
}

// Minimal Quill 2 wrapper. `value`/`onChange` work with HTML strings.
export default function RichTextEditor({ value = "", onChange, placeholder = "Write something…", minHeight = 180 }) {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const lastHtml = useRef(value);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  valueRef.current = value;
  onChangeRef.current = onChange;

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;

    import("quill").then(({ default: Quill }) => {
      if (cancelled || !container) return;
      const editorElement = document.createElement("div");
      container.appendChild(editorElement);

      const quill = new Quill(editorElement, {
        theme: "snow",
        placeholder,
        modules: { toolbar: TOOLBAR },
      });

      const initial = valueRef.current || "";
      if (initial) quill.clipboard.dangerouslyPasteHTML(initial, "silent");
      lastHtml.current = initial;

      quill.on("text-change", (delta, oldDelta, source) => {
        if (source === "silent") return;
        const html = editorHtml(quill);
        lastHtml.current = html;
        onChangeRef.current?.(html);
      });

      quillRef.current = quill;
    });

    return () => {
      cancelled = true;
      quillRef.current = null;
      if (container) container.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply value changes that come from outside (loading a product, resetting the form)
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill || value === lastHtml.current) return;
    lastHtml.current = value || "";
    if (value) {
      quill.clipboard.dangerouslyPasteHTML(value, "silent");
    } else {
      quill.setText("", "silent");
    }
  }, [value]);

  return <Box ref={containerRef} className="rich-editor" sx={{ "--editor-min-height": `${minHeight}px` }} />;
}
