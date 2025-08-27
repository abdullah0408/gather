import { useState } from "react";
import { toast } from "sonner";

export interface Attachment {
  file: File;
  mediaId?: string;
  isUploading: boolean;
}

export default function useMediaUpload() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  async function handleStartUpload(files: File[]) {
    if (isUploading) {
      toast.error("Please wait for the current upload to finish.");
      return;
    }

    if (attachments.length + files.length > 5) {
      toast.error("You can only upload 5 attachments per post.");
      return;
    }

    setIsUploading(true);

    const newAttachments = files.map((file) => ({
      file,
      isUploading: true,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);

    try {
      for (const attachment of newAttachments) {
        const formData = new FormData();
        formData.append("file", attachment.file);

        const response = await fetch("/api/imagekit", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload file");
        }

        const result = await response.json();

        setAttachments((prev) =>
          prev.map((a) =>
            a.file.name === attachment.file.name
              ? {
                  ...a,
                  mediaId: result.id,
                  isUploading: false,
                }
              : a
          )
        );
      }
    } catch (error) {
      console.error("Failed to upload media:", error);
      toast.error("Failed to upload media.");
      setAttachments((prev) =>
        prev.filter(
          (a) => !newAttachments.some((na) => na.file.name === a.file.name)
        )
      );
    } finally {
      setIsUploading(false);
    }
  }

  function removeAttachment(fileName: string) {
    setAttachments((prev) =>
      prev.filter((attachment) => attachment.file.name !== fileName)
    );
  }

  function reset() {
    setAttachments([]);
  }

  return {
    attachments,
    isUploading,
    startUpload: handleStartUpload,
    removeAttachment,
    reset,
  };
}
