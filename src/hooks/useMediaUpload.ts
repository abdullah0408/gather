import { useUploadThing } from "@/lib/uploadthing";
import { useState } from "react";
import { toast } from "sonner";

export interface Attachment {
  file: File;
  mediaId?: string;
  isUploading: boolean;
}

export default function useMediaUpload() {
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [uploadProgress, setUploadProgress] = useState<number>();

  const { startUpload, isUploading } = useUploadThing("attachment", {
    onBeforeUploadBegin(files) {
      const renamedFiles = files.map((file) => {
        const extension = file.name.split(".").pop();

        return new File(
          [file],
          `attachment_${crypto.randomUUID()}.${extension}`,
          { type: file.type }
        );
      });
      setAttachments((prev) => [
        ...prev,
        ...renamedFiles.map((file) => ({
          file,
          isUploading: true,
        })),
      ]);

      return renamedFiles;
    },
    onUploadProgress: setUploadProgress,
    onClientUploadComplete(res) {
      setAttachments((prev) =>
        prev.map((attachment) => {
          const uploadResult = res.find(
            (result) => result.name === attachment.file.name
          );
          if (!uploadResult) return attachment;

          return {
            ...attachment,
            mediaId: uploadResult.serverData.mediaId,
            isUploading: false,
          };
        })
      );
    },
    onUploadError(error) {
      setAttachments((prev) =>
        prev.filter((attachment) => !attachment.isUploading)
      );

      toast.error(error.message || "Failed to upload media");
    },
  });

  function handleStartUpload(files: File[]) {
    if (isUploading) {
      toast.error("Please wait for the current upload to finish.");
      return;
    }

    if (attachments.length + files.length > 5) {
      toast.error("You can only upload 5 attachments per post.");
      return;
    }

    startUpload(files);
  }

  function removeAttachment(fileName: string) {
    setAttachments((prev) =>
      prev.filter((attachment) => attachment.file.name !== fileName)
    );
  }

  function reset() {
    setAttachments([]);
    setUploadProgress(undefined);
  }

  return {
    attachments,
    uploadProgress,
    isUploading,
    startUpload: handleStartUpload,
    removeAttachment,
    reset,
  };
}
