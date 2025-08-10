"use client";

import { useAuth } from "@/hooks/useAuth";
import kyInstance from "@/lib/ky";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";

export default function useInitializeChatClient() {
  const { userDetails } = useAuth();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);

  useEffect(() => {
    if (!userDetails) {
      return;
    }
    const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY!);

    client
      .connectUser(
        {
          id: userDetails?.clerkId,
          username: userDetails?.username,
          name: userDetails?.username,
          image: userDetails?.avatarUrl || undefined,
        },
        async () =>
          kyInstance
            .get("api/get-token")
            .json<{ token: string }>()
            .then((data) => data.token)
      )
      .catch((error) => {
        console.error("Error connecting to Stream Chat:", error);
      })
      .then(() => {
        setChatClient(client);
      });

    return () => {
      setChatClient(null);
      client
        .disconnectUser()
        .catch((error) => {
          console.error("Error disconnecting from Stream Chat:", error);
        })
        .then(() => {
          console.log("Disconnected from Stream Chat");
        });
    };
  }, [userDetails]);

  return chatClient;
}
