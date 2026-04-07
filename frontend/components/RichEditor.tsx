"use client";

import { useRef, useCallback } from 'react';

interface RichEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const TOOLS = [
  { cmd: 'bold',          label: 'B',   title: 'Bold',          style: 'font-bold' },
  { cmd: 'italic',        label: 'I',   title: 'Italic',        style: 'italic' },
  { cmd: 'underline',     label: 'U',   title: 'Underline',     style: 'underline' },
  { cmd: 'insertUnorderedList', label: '• सूची', title: 'Bullet List', style: '' },
  { cmd: 'insertOrderedList',   label: '१. सूची', title: 'Numbered List', style: '' },
  { cmd: 'formatBlock',   label: 'H2',  title: 'Heading',       arg: 'h2', style: 'font-bold' },
  { cmd: 'formatBlock',   label: '¶',   title: 'Paragraph',     arg: 'p',  style: '' },
];

export default function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = useCallback((cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
    editorRef.current?.focus();
    // Sync content after command
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Insert YouTube embed
  const insertYouTube = useCallback(() => {
    const url = prompt('YouTube URL दर्ज करें:');
    if (!url) return;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    if (!match) { alert('Invalid YouTube URL'); return; }
    const id = match[1];
    const html = `<div class="yt-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:16px 0"><iframe src="https://www.youtube.com/embed/${id}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" allowfullscreen></iframe></div>`;
    document.execCommand('insertHTML', false, html);
    handleInput();
  }, [handleInput]);

  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden bg-gray-800">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-700 bg-gray-850">
        {TOOLS.map((tool, i) => (
          <button
            key={i}
            type="button"
            title={tool.title}
            onMouseDown={e => { e.preventDefault(); exec(tool.cmd, tool.arg); }}
            className={`px-2.5 py-1.5 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${tool.style}`}
          >
            {tool.label}
          </button>
        ))}

        {/* Separator */}
        <div className="w-px h-6 bg-gray-600 mx-1" />

        {/* YouTube button */}
        <button
          type="button"
          title="YouTube वीडियो जोड़ें"
          onMouseDown={e => { e.preventDefault(); insertYouTube(); }}
          className="px-2.5 py-1.5 rounded-lg text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors flex items-center gap-1"
        >
          ▶ YouTube
        </button>

        {/* Clear */}
        <button
          type="button"
          title="सब साफ करें"
          onMouseDown={e => { e.preventDefault(); if (editorRef.current) { editorRef.current.innerHTML = ''; onChange(''); } }}
          className="ml-auto px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-700 hover:text-gray-300 transition-colors"
        >
          साफ करें ✕
        </button>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder || 'लेख की सामग्री यहाँ लिखें...'}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-[200px] p-4 text-white text-sm leading-relaxed focus:outline-none
          [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-4
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2
          [&_b]:font-bold [&_strong]:font-bold
          [&_i]:italic [&_em]:italic
          [&_u]:underline
          [&_p]:mb-2
          empty:before:content-[attr(data-placeholder)] empty:before:text-gray-500"
      />
    </div>
  );
}