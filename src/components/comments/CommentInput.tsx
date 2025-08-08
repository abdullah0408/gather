import type { PostData } from "@/lib/types";
import { useState } from "react";
import { useSubmitCommentMutation } from "./mutations";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, SendHorizonalIcon } from "lucide-react";

interface CommentsInputProps {
  post: PostData;
}

export default function CommentInput({ post }: CommentsInputProps) {
  const [input, setInput] = useState("");

  const mutation = useSubmitCommentMutation(post.id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!input.trim()) return;

    mutation.mutate(
      {
        post,
        content: input.trim(),
      },
      {
        onSuccess: () => setInput(""),
      }
    );
  }

  return (
    <form className="flex w-full items-center gap-2" onSubmit={handleSubmit}>
      <Input
        placeholder="write a comment..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoFocus
      />

      <Button
        type="submit"
        variant="ghost"
        size="icon"
        disabled={!input.trim() || mutation.isPending}
      >
        {!mutation.isPending ? (
          <SendHorizonalIcon />
        ) : (
          <Loader2 className="animate-spin" />
        )}
      </Button>
    </form>
  );
}
