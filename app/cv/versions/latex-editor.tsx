"use client";

import CodeMirror from "@uiw/react-codemirror";
import { StreamLanguage } from "@codemirror/language";
import { stex } from "@codemirror/legacy-modes/mode/stex";

const latexLanguage = StreamLanguage.define(stex);

export default function LatexEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      height="24rem"
      extensions={[latexLanguage]}
      basicSetup={{ lineNumbers: true, foldGutter: true }}
      className="overflow-hidden rounded-md border border-black/[.08] text-sm dark:border-white/[.145]"
    />
  );
}
