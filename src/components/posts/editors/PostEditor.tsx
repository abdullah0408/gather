"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import PlaceHolder, { Placeholder } from "@tiptap/extension-placeholder"
import { submitPost } from "./actions"
import UserAvatar from "@/components/UserAvatar"
import { useState } from "react"
import { useTheme } from "next-themes"
import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import { fetchUserDetails } from "@/lib/fetchUserDetails"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import "./styles.css"


const PostEditor = () => {

    const [user, setUser] = useState<any>(null);
    const {theme, setTheme} = useTheme()
  
    useEffect(() => {
      const getUserDetails = async () => {
        const userDetails = await fetchUserDetails();
        setUser(userDetails);
      };
  
      getUserDetails();
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bold: false,
                italic: false
            }),
            Placeholder.configure({
                placeholder: "What's crack-a-lackin?"
            })
        ]
    })

    const input = editor?.getText({
        blockSeparator: "\n",
    }) || ""

    async function onSubmit() {
        editor?.commands.clearContent()
        await submitPost(input)
    }
  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
        <div className="flex gap-5">
        <UserAvatar className="hidden sm:inline" avatarUrl={(!user) ? avatarPlaceholder : user?.avatarUrl} size={40} />
        
         {/* <UserAvatar avatarUrl={user.avatarUrl} /> */}
        <EditorContent
        editor={editor}
        className="w-full max-h-[20rem] overflow-y-auto bg-background rounded-2xl px-5 py-3"
        />
        </div>
        <div className="flex justify-end">
            <Button onClick={onSubmit}
            disabled={!input.trim()}
            className="min-w-20"
            >
                Post
            </Button>
        </div>
    </div>
  )
}

export default PostEditor




// "use client";

// import { EditorContent, useEditor } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Placeholder from "@tiptap/extension-placeholder";
// import { submitPost } from "./actions";
// import UserAvatar from "@/components/UserAvatar";
// import { useState, useEffect, useCallback } from "react";
// import { useTheme } from "next-themes";
// import avatarPlaceholder from "@/assets/avatar-placeholder.png";
// import { fetchUserDetails } from "@/lib/fetchUserDetails";
// import { Button } from "@/components/ui/button";
// import "./styles.css";

// const PostEditor = () => {
//   const [user, setUser] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [input, setInput] = useState(""); // Store the input text
  
//     useEffect(() => {
//       const getUserDetails = async () => {
//         const userDetails = await fetchUserDetails();
//         setUser(userDetails);
//       };
  
//       getUserDetails();
//     }, []);

//     const editor = useEditor({
//         extensions: [
//           StarterKit.configure({
//             bold: false,
//             italic: false,
//           }),
//           Placeholder.configure({
//             placeholder: "What's crack-a-lackin?",
//           }),
//         ],
//         onUpdate: ({ editor }) => {
//           setInput(editor.getText({ blockSeparator: "\n" }));
//         },
//       });
    
//       const handleSubmit = useCallback(async () => {
//         if (!editor) return; // Guard clause if editor is not initialized
//         if (input.trim() === "") return;
    
//         setIsSubmitting(true);
    
//         try {
//           await submitPost(input);
//           editor.commands.clearContent();
//           setInput(""); // Clear the input state
//         } catch (error) {
//           console.error("Error submitting post:", error);
//           // Consider showing a user-friendly error message
//         } finally {
//           setIsSubmitting(false);
//         }
//       }, [editor, input]);
    
//       if (!editor) {
//         return <div>Loading editor...</div>; // Or a more appropriate loading indicator
//       }
    
//       return (
//         <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
//           <div className="flex gap-5">
//             <UserAvatar
//               className="hidden sm:inline"
//               avatarUrl={!user ? avatarPlaceholder : user?.avatarUrl}
//               size={40}
//             />
//             <EditorContent
//               editor={editor}
//               className="w-full max-h-[20rem] overflow-y-auto bg-background rounded-2xl px-5 py-3"
//             />
//           </div>
//           <div className="flex justify-end">
//             <Button
//               onClick={handleSubmit}
//               disabled={isSubmitting || input.trim() === ""}
//               className="min-w-20"
//             >
//               {isSubmitting ? "Submitting..." : "Post"}
//             </Button>
//           </div>
//         </div>
//       );
//     };
    
//     export default PostEditor;