"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useAuth } from "@/hooks/useAuth";
import UserAvatar from "@/components/UserAvatar";
import "./styles.css";
import { useState } from "react";
import { useSubmitPostMutation } from "./mutations";
import LoadingButton from "@/components/LoadingButton";

export default function PostEditor() {
  const { userDetails } = useAuth();
  const [content, setContent] = useState("");

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
    mutation.mutate(content, {
      onSuccess() {
        editor?.commands.clearContent();
        setContent("");
      },
    });
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex gap-5">
        <UserAvatar
          avatarUrl={userDetails?.avatarUrl}
          className="hidden sm:inline"
        />
        <EditorContent
          editor={editor}
          className="w-full max-h-[20rem] overflow-y-auto bg-background rounded-2xl px-5 py-3"
        />
      </div>
      <div className="flex justify-end">
        <LoadingButton
          onClick={onSubmit}
          loading={mutation.isPending}
          disabled={!content.trim()}
          className="min-w-20"
        >
          Post
        </LoadingButton>
      </div>
    </div>
  );
}
