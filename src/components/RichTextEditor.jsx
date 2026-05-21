import React, { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Type your text here...",
  rtl,
}) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    // Initialize Quill editor only once
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        // modules: {
        //     toolbar: [
        //         ['bold', 'italic', 'underline', 'strike'],
        //         [{ list: 'ordered' }, { list: 'bullet' }],
        //         ['link'],
        //         ['clean'],
        //     ],
        //     link: {
        //         // Disable default link behavior
        //         openOnClick: false,
        //     },
        // },
        placeholder,
        formats: ["bold", "italic", "underline", "strike", "list", "link"],
      });

      // Set initial content if provided
      if (value) {
        quillRef.current.root.innerHTML = value;
      } else {
        quillRef.current.root.innerHTML = ""; // ensure clean empty
      }

      // Handle content changes
      const handleChange = () => {
        if (quillRef.current && !isUpdatingRef.current) {
          const content = quillRef.current.root.innerHTML;
          // Normalize: empty editor → empty string, not <p><br></p>
          const normalized = content === "<p><br></p>" ? "" : content;
          if (onChange) {
            onChange(normalized);
          }
        }
      };

      quillRef.current.on("text-change", handleChange);

      // Custom link handler - make link automatically
      const toolbar = quillRef.current.getModule("toolbar");

      toolbar.addHandler("link", () => {
        const range = quillRef.current.getSelection();
        if (range && range.length > 0) {
          // Get the selected text
          const selectedText = quillRef.current.getText(
            range.index,
            range.length,
          );

          // Make the selected text a link with the text itself as URL
          // If it looks like a URL, use it as is, otherwise prepend https://
          let url = selectedText.trim();
          if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
          }

          // Make the selected text a link
          quillRef.current.formatText(range.index, range.length, "link", url);
        }
      });

      // Add click event listener to handle link clicks
      const handleLinkClick = (event) => {
        if (event.target.tagName === "A") {
          event.preventDefault();
          const url = event.target.href;
          if (url) {
            window.open(url, "_blank", "noopener,noreferrer");
          }
        }
      };

      // Add click event listener to the editor container
      const editorContainer = quillRef.current.root;
      editorContainer.addEventListener("click", handleLinkClick);

      // Cleanup function
      return () => {
        if (quillRef.current) {
          quillRef.current.off("text-change");
          editorContainer.removeEventListener("click", handleLinkClick);
          quillRef.current = null;
        }
      };
    }
  }, []); // Remove value from dependencies to prevent re-initialization

  // Update editor content when value prop changes (but not during user typing)
  useEffect(() => {
    if (quillRef.current && value !== undefined) {
      const currentContent = quillRef.current.root.innerHTML;
      if (value !== currentContent) {
        isUpdatingRef.current = true;
        quillRef.current.root.innerHTML = value || "";
        isUpdatingRef.current = false;
      }
    }
  }, [value]);

  return (
    <div dir={rtl ? "rtl" : "ltr"} className="w-full mx-auto relative">
      <div
        ref={editorRef}
        className="border border-gray-300 min-h-[150px] bg-white"
      />
    </div>
  );
};

export default RichTextEditor;
