import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { MailPlusIcon, XIcon } from "lucide-react";
import { useCallback, useState } from "react";
import {
  ChannelList,
  ChannelPreviewMessenger,
  type ChannelPreviewUIComponentProps,
} from "stream-chat-react";
import NewChatDialog from "./NewChatDialog";

interface ChatSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function ChatSidebar({ open, onClose }: ChatSidebarProps) {
  const { userDetails } = useAuth();

  const ChannelPreviewCustom = useCallback(
    (props: ChannelPreviewUIComponentProps) => {
      return (
        <ChannelPreviewMessenger
          {...props}
          onSelect={() => {
            props.setActiveChannel?.(props.channel, props.watchers);
            onClose(); // Close the sidebar when a channel is selected
          }}
        />
      );
    },
    [onClose]
  );

  if (!userDetails) {
    return null; // or a loading state
  }

  return (
    <div
      className={cn(
        "size-full md:flex flex-col border-e md:w-72",
        open ? "flex" : "hidden"
      )}
    >
      <MenuHeader onClose={onClose} />
      <ChannelList
        filters={{
          type: "messaging",
          members: { $in: [userDetails?.clerkId] },
        }}
        showChannelSearch
        options={{ state: true, presence: true, limit: 8 }}
        sort={{ last_message_at: -1 }}
        additionalChannelSearchProps={{
          searchForChannels: true,
          searchForUsers: true,
          searchQueryParams: {
            channelFilters: {
              filters: {
                members: { $in: [userDetails?.clerkId] },
              },
            },
            userFilters: {
              filters: {},
            },
          },
        }}
        Preview={ChannelPreviewCustom}
      />
    </div>
  );
}

interface MenuHeaderProps {
  onClose: () => void;
}

export function MenuHeader({ onClose }: MenuHeaderProps) {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  return (
    <>
      <div className="flex items-center gap-3 p-2">
        <div className="h-full md:hidden">
          <Button size="icon" variant="ghost" onClick={onClose}>
            <XIcon className="size-5" />
          </Button>
        </div>
        <h1 className="me-auto text-xl font-bold md:ms-2">Messages</h1>
        <Button
          size="icon"
          variant="ghost"
          title="Start new chat"
          onClick={() => setShowNewChatDialog(true)}
        >
          <MailPlusIcon className="size-5" />
        </Button>
      </div>
      {showNewChatDialog && (
        <NewChatDialog
          onOpenChange={setShowNewChatDialog}
          onChatCreated={() => {
            setShowNewChatDialog(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
