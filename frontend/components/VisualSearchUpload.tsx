"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

type VisualSearchResult = {
  productId: number;
  name: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  similarity: number;
};

export default function VisualSearchUpload() {
  const router = useRouter();

  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const apiBaseUrl = (
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5191/api"
      ).replace(/\/$/, "");

      const visualSearchUrl = `${apiBaseUrl}/products/visual-search`;

      console.log("Uploading image to:", visualSearchUrl);

      const response = await fetch(visualSearchUrl, {
        method: "POST",
        body: formData,
      });

      const responseText = await response.text();

      console.log("Visual search status:", response.status);
      console.log("Visual search response:", responseText);

      if (!response.ok) {
        throw new Error(responseText || "Visual search failed.");
      }

      const data = JSON.parse(responseText);

      const results: VisualSearchResult[] = data.results || [];

      console.log("Visual search results:", results);

      localStorage.setItem("visualSearchResults", JSON.stringify(results));

      event.target.value = "";

      router.push("/visual-search-results");
    } catch (error) {
      console.error("Visual search error:", error);

      const message =
        error instanceof Error ? error.message : "Unknown visual search error.";

      alert(`Visual search failed:\n${message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Upload image from device */}
      <button
        type="button"
        onClick={() => uploadInputRef.current?.click()}
        disabled={loading}
        title="Upload image"
        style={{
          border: "none",
          background: "transparent",
          cursor: loading ? "not-allowed" : "pointer",
          padding: "6px",
          color: "white",
          display: "flex",
          alignItems: "center",
        }}
      >
        {loading ? "..." : <FileUploadIcon fontSize="small" />}
      </button>

      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
      />

      {/* Take photo using camera, mainly works on mobile */}
      <button
        type="button"
        onClick={() => cameraInputRef.current?.click()}
        disabled={loading}
        title="Take photo"
        style={{
          border: "none",
          background: "transparent",
          cursor: loading ? "not-allowed" : "pointer",
          padding: "6px",
          color: "white",
          display: "flex",
          alignItems: "center",
        }}
      >
        <CameraAltIcon fontSize="small" />
      </button>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleFileChange}
      />
    </>
  );
}
