'use client';

import { Color } from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import ResizableImageExtension from 'tiptap-extension-resize-image';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { EditorToolbar } from './EditorToolbar';
import './editor.css';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = 'Start writing...' }: RichTextEditorProps) {
    const [isCodeMode, setIsCodeMode] = useState(false);
    const [rawHtml, setRawHtml] = useState(content);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            Underline,
            TextStyle,
            Color,
            FontFamily,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-500 underline',
                },
            }),
            ResizableImageExtension.configure({
                inline: false,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'rounded-lg',
                },
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Placeholder.configure({
                placeholder,
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: 'prose prose-slate max-w-none dark:prose-invert focus:outline-none min-h-[400px] p-6 w-full',
                spellcheck: 'false',
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            console.log('Editor updated, HTML:', html);
            onChange(html);
        },
    });

    // Update editor content when prop changes
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
        setRawHtml(content);
    }, [content, editor]);

    // Toggle between visual and code mode
    const toggleCodeMode = () => {
        if (isCodeMode) {
            // Switching from code to visual
            if (editor) {
                editor.commands.setContent(rawHtml);
                onChange(rawHtml);
            }
        } else {
            // Switching from visual to code
            if (editor) {
                setRawHtml(editor.getHTML());
            }
        }
        setIsCodeMode(!isCodeMode);
    };

    // Handle raw HTML changes
    const handleRawHtmlChange = (value: string) => {
        setRawHtml(value);
        onChange(value);
    };

    if (!editor) {
        return <div className="border rounded-lg p-4 text-muted-foreground">Loading editor...</div>;
    }

    return (
        <div className="border rounded-lg overflow-hidden bg-background">
            <div className="flex items-center justify-between border-b bg-muted/50 px-4 py-2">
                <div className="text-sm font-medium">
                    {isCodeMode ? 'HTML Source' : 'Visual Editor'}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleCodeMode}
                >
                    {isCodeMode ? '👁 Visual' : '< > Code'}
                </Button>
            </div>

            {isCodeMode ? (
                <Textarea
                    value={rawHtml}
                    onChange={(e) => handleRawHtmlChange(e.target.value)}
                    className="min-h-[400px] font-mono text-sm border-0 rounded-none resize-none focus-visible:ring-0"
                    placeholder="Enter HTML code..."
                />
            ) : (
                <>
                    <EditorToolbar editor={editor} />
                    <div className="min-h-[400px]">
                        <EditorContent editor={editor} />
                    </div>
                </>
            )}
        </div>
    );
}
