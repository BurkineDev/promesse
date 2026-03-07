"use client";

import { useState } from "react";
import { PhotoUpload } from "./PhotoUpload";

interface PhotoUploadSectionProps {
  packageId: string;
  currentPhotoUrl: string | null;
}

export function PhotoUploadSection({
  packageId,
  currentPhotoUrl,
}: PhotoUploadSectionProps) {
  const [photoUrl, setPhotoUrl] = useState(currentPhotoUrl);

  return (
    <div className="card p-6">
      <PhotoUpload
        packageId={packageId}
        currentPhotoUrl={photoUrl}
        onUpload={setPhotoUrl}
      />
    </div>
  );
}
