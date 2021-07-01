import React, { useEffect, useRef } from "react";
import { useMemo, useState } from "react";
import { BaseEditor, createEditor, Descendant } from "slate";
import { Editable, Slate, withReact, ReactEditor } from "slate-react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

type CustomText = { text: string; bold: boolean; italic: boolean };

type CustomEditor = BaseEditor & ReactEditor;

type ParagraphElement = {
  type: "paragraph";
  children: CustomText[];
};

type HeadingElement = {
  type: "heading";
  level: number;
  children: CustomText[];
};

type CustomElement = ParagraphElement | HeadingElement;

declare module "slate" {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

interface SyncingEditorProps {}

export const SyncingEditor: React.FC<SyncingEditorProps> = ({}) => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const id = useRef(`${Date.now()}`);
  // const editor = useRef(null)
  const remote = useRef(false);
  // Add the initial value when setting up our state.
  const [value, setValue] = useState([
    {
      type: "paragraph",
      children: [{ text: "A line of text in a paragraph." }],
    },
  ]) as any;

  useEffect(() => {
    socket.on(
      "new-remote-opperations",
      ({ editorId, newValue }: { editorId: string; newValue: string }) => {
        if (id.current !== editorId) {
          console.log("chnage happened in other editor");
          remote.current = true;
          setValue(JSON.parse(newValue));
          remote.current = false;
          console.log(newValue);
        }
      }
    );
  });

  return (
    <div
      style={{
        border: "2px solid black",
        margin: "10px",
        backgroundColor: "#fafafa",
      }}
    >
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => {
          if (newValue !== value && !remote.current) {
            // console.log(newValue);
            socket.emit("new-operations", {
              editorId: id.current,
              newValue: JSON.stringify(newValue),
            });
          }
          setValue(newValue);
        }}
      >
        <Editable />
      </Slate>
    </div>
  );
};
