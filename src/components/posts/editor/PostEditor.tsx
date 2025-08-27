"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useAuth } from "@/hooks/useAuth";
import UserAvatar from "@/components/UserAvatar";
import "./styles.css";
import { type ClipboardEvent, useRef, useState } from "react";
import { useSubmitPostMutation } from "./mutations";
import LoadingButton from "@/components/LoadingButton";
import useMediaUpload, { type Attachment } from "@/hooks/useMediaUpload";
import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2Icon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function PostEditor() {
  const { userDetails } = useAuth();
  const [content, setContent] = useState("");
  const {
    attachments,
    isUploading,
    startUpload,
    removeAttachment,
    reset: resetMediaUpload,
  } = useMediaUpload();

  const mutation = useSubmitPostMutation();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "Write your post here...",
      }),
    ],
    onUpdate: ({ editor }) => {
      const text = editor.getText({ blockSeparator: "\n" });
      setContent(text);
    },
    immediatelyRender: false,
  });

  async function onSubmit() {
    mutation.mutate(
      {
        content,
        mediaIds: attachments
          .map((attachment) => attachment.mediaId)
          .filter(Boolean) as string[],
      },
      {
        onSuccess() {
          editor?.commands.clearContent();
          setContent("");
          resetMediaUpload();
        },
      }
    );
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const files = Array.from(e.clipboardData.items)
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile()) as File[];

    if (files.length) startUpload(files);
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex gap-5">
        <UserAvatar
          avatarUrl={userDetails?.avatarUrl}
          className="hidden sm:inline"
        />
        <div className="w-full">
          <EditorContent
            editor={editor}
            className="w-full max-h-[20rem] overflow-y-auto bg-background rounded-2xl px-5 py-3"
            onPaste={onPaste}
          />
        </div>
      </div>
      {!!attachments.length && (
        <AttachmentPreviews
          attachments={attachments}
          removeAttachment={removeAttachment}
        />
      )}
      <div className="flex justify-end gap-3 items-center">
        {isUploading && (
          <Loader2Icon className="size-5 animate-spin text-primary" />
        )}
        <AddAttachmentsButton
          onFilesSelected={startUpload}
          disabled={isUploading || attachments.length >= 5}
        />
        <LoadingButton
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={!content.trim() || isUploading}
          className="min-w-20"
        >
          Post
        </LoadingButton>
      </div>
    </div>
  );
}

interface AddAttachmentsButtonProps {
  onFilesSelected: (files: File[]) => void;
  disabled: boolean;
}

function AddAttachmentsButton({
  onFilesSelected,
  disabled,
}: AddAttachmentsButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        variant={"ghost"}
        size="icon"
        disabled={disabled}
        className="text-primary hover:text-primary"
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon size={20} />
      </Button>
      <input
        type="file"
        accept="image/*, video/*"
        multiple
        ref={fileInputRef}
        className="hidden sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) {
            onFilesSelected(files);
            e.target.value = ""; // Reset input value
          }
        }}
      ></input>
    </>
  );
}

interface AttachmentPreviewsProps {
  attachments: Attachment[];
  removeAttachment: (fileName: string) => void;
}

function AttachmentPreviews({
  attachments,
  removeAttachment,
}: AttachmentPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2"
      )}
    >
      {attachments.map((attachment) => (
        <AttachmentPreview
          key={attachment.file.name}
          attachment={attachment}
          onRemoveClick={() => removeAttachment(attachment.file.name)}
        />
      ))}
    </div>
  );
}

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemoveClick: () => void;
}

function AttachmentPreview({
  attachment: { file, isUploading },
  onRemoveClick,
}: AttachmentPreviewProps) {
  const src = URL.createObjectURL(file);

  return (
    <div
      className={cn("relative mx-auto size-fit", isUploading && "opacity-50")}
    >
      {file.type.startsWith("image/") ? (
        <Image
          src={src}
          alt="Attachment preview"
          width={500}
          height={500}
          className="size-fit max-h-[30rem] rounded-2xl"
        />
      ) : (
        <video controls className="size-fit max-h-[30rem] rounded-2xl">
          <source src={src} type={file.type} />
        </video>
      )}

      {!isUploading && (
        <button
          onClick={onRemoveClick}
          className="absolute right-3 top-3 rounded-full bg-foreground p-1.5 text-background transition-colors hover:bg-foreground/60"
        >
          <XIcon size={20} />
        </button>
      )}
    </div>
  );
}
