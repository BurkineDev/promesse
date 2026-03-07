"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, ImageIcon } from "lucide-react";
import Image from "next/image";

interface PhotoUploadProps {
  packageId: string;
  currentPhotoUrl: string | null;
  onUpload: (url: string | null) => void;
}

export function PhotoUpload({
  packageId,
  currentPhotoUrl,
  onUpload,
}: PhotoUploadProps) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    setError(null);
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `packages/${packageId}/photo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("package-photos")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError("Erreur lors de l'upload : " + uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("package-photos").getPublicUrl(path);

    // Update package record
    await supabase
      .from("packages")
      .update({ photo_url: publicUrl })
      .eq("id", packageId);

    setPreview(publicUrl);
    onUpload(publicUrl);
    setUploading(false);
  }

  async function handleRemove() {
    const path = `packages/${packageId}/photo`;
    await supabase.storage.from("package-photos").remove([path]);
    await supabase
      .from("packages")
      .update({ photo_url: null })
      .eq("id", packageId);
    setPreview(null);
    onUpload(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <p className="label mb-2">Photo du colis</p>

      {preview ? (
        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 group">
          <Image
            src={preview}
            alt="Photo du colis"
            fill
            className="object-cover"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Supprimer la photo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="w-full h-36 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          {uploading ? (
            <p className="text-sm text-gray-500">Envoi en cours...</p>
          ) : (
            <>
              <div className="flex items-center gap-2 text-gray-400">
                <ImageIcon className="w-6 h-6" />
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-sm text-gray-500">
                Glisser-déposer ou cliquer
              </p>
              <p className="text-xs text-gray-400">PNG, JPG, WEBP — 5 Mo max</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
