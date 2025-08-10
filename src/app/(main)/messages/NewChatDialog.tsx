import LoadingButton from "@/components/LoadingButton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserAvatar from "@/components/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import useDebounce from "@/hooks/useDebounce";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckIcon, Loader2, SearchIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type UserResponse } from "stream-chat";
import { useChatContext } from "stream-chat-react";

interface NewChatDialogProps {
  onOpenChange: (open: boolean) => void;
  onChatCreated: () => void;
}

export default function NewChatDialog({
  onOpenChange,
  onChatCreated,
}: NewChatDialogProps) {
  const { client, setActiveChannel } = useChatContext();
  const { userDetails } = useAuth();

  const [searchInput, setSearchInput] = useState("");
  const searchInputDebounced = useDebounce(searchInput);
  const [selectedUsers, setSelectedUsers] = useState<UserResponse[]>([]);

  const { data, isError, isFetching, isSuccess } = useQuery({
    queryKey: ["stream-users", searchInputDebounced],
    queryFn: async () => {
      if (!searchInputDebounced) return [];
      const response = await client.queryUsers(
        {
          $or: [
            { name: { $autocomplete: searchInputDebounced } },
            { username: { $autocomplete: searchInputDebounced } },
            { id: { $autocomplete: searchInputDebounced } },
          ],
        },
        { name: 1, username: 1, id: 1 },
        { limit: 15 }
      );
      // Filter out current user from results
      return response.users.filter((user) => user.id !== userDetails?.clerkId);
    },
    enabled: !!searchInputDebounced,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!userDetails) return;

      const channel = client.channel("messaging", crypto.randomUUID(), {
        members: [userDetails.clerkId, ...selectedUsers.map((user) => user.id)],
      });

      await channel.create();
      return channel;
    },
    onSuccess: (channel) => {
      setActiveChannel(channel);
      onChatCreated();
    },
    onError: (error) => {
      console.error("Error creating chat channel:", error);
      toast.error("Failed to create chat channel. Please try again.");
    },
  });

  if (!userDetails) {
    return null;
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="bg-card p-0">
        <DialogHeader className="px-6 pt-6 ">
          <DialogTitle>New Chat</DialogTitle>
        </DialogHeader>
        <div>
          <div className="group relative">
            <SearchIcon className="absolute left-5 top-1/2 size-5 -translate-y-1/2 transform text-muted-foreground group-focus-within:text-primary" />
            <input
              placeholder="Search users..."
              className="h-12 w-full pe-4 ps-14 focus:outline-none bg-accent"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2">
              {selectedUsers.map((user) => (
                <SelectedUsersTag
                  key={user.id}
                  user={user}
                  onRemove={() => {
                    setSelectedUsers((prev) =>
                      prev.filter((u) => u.id !== user.id)
                    );
                  }}
                />
              ))}
            </div>
          )}
          <hr />
          <div className="h-96 overflow-y-auto">
            {isSuccess &&
              data.map((user) => (
                <UserResult
                  key={user.id}
                  user={user}
                  isSelected={selectedUsers.some((u) => u.id === user.id)}
                  onSelect={() => {
                    setSelectedUsers((prev) => {
                      return prev.some((u) => u.id === user.id)
                        ? prev.filter((u) => u.id !== user.id)
                        : [...prev, user];
                    });
                  }}
                />
              ))}
            {isSuccess && data.length === 0 && (
              <p className="my-3 text-center text-muted-foreground">
                No users found matching &quot;{searchInputDebounced}&quot;
              </p>
            )}
            {isFetching && <Loader2 className="mx-auto my-3 animate-spin" />}
            {isError && (
              <p className="my-3 text-center text-destructive">
                An error occurred while loading users.
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="px-6 pb-6">
          <LoadingButton
            disabled={!selectedUsers.length}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Create Chat
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface UserResultProps {
  user: UserResponse;
  isSelected: boolean;
  onSelect: () => void;
}

function UserResult({ user, isSelected, onSelect }: UserResultProps) {
  return (
    <button
      className="flex w-full items-center justify-between px-4 py-2.5 transition-colors hover:bg-muted/50"
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 ">
        <UserAvatar avatarUrl={user.image} />
        <div className="flex flex-col text-start ">
          <p className="font-bold">{user.name}</p>
          <p className="text-muted-foreground">@{user.username}</p>
        </div>
      </div>
      {isSelected && <CheckIcon className="size-5 text-green-500" />}
    </button>
  );
}

interface SelectedUsersTagProps {
  user: UserResponse;
  onRemove: () => void;
}

function SelectedUsersTag({ user, onRemove }: SelectedUsersTagProps) {
  return (
    <button
      className="flex items-center gap-2 rounded-full border p-1 hover:bg-muted/50"
      onClick={onRemove}
    >
      <UserAvatar avatarUrl={user.image} size={24} />
      <p className="font-bold">{user.name || user.username}</p>
      <XIcon className="mx-2 size-5 text-muted-foreground" />
    </button>
  );
}
