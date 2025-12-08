'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import type { Editor } from '@tiptap/react';
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Image as ImageIcon,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Quote,
    Redo,
    Strikethrough,
    Table,
    Underline as UnderlineIcon,
    Undo,
} from 'lucide-react';
import { useCallback, useState } from 'react';

interface EditorToolbarProps {
    editor: Editor;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [showImageInput, setShowImageInput] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('Image too large. Maximum size is 10MB');
            return;
        }

        try {
            setUploadingImage(true);
            console.log('Starting image upload...', file.name);
            const formData = new FormData();
            formData.append('file', file);

            console.log('Sending request to /api/docs/upload/image');
            const response = await fetch('/api/docs/upload/image', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            console.log('Response status:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Upload failed:', errorText);
                throw new Error(`Failed to upload image: ${response.status}`);
            }

            const data = await response.json();
            console.log('Upload successful, URL:', data.url);
            editor.chain().focus().setImage({ src: data.url }).run();
            console.log('Image inserted into editor');
            setShowImageInput(false);
        } catch (error) {
            console.error('Image upload error:', error);
            alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setUploadingImage(false);
            console.log('Upload process complete');
        }
    }, [editor]);

    const addLink = useCallback(() => {
        if (linkUrl) {
            editor.chain().focus().setLink({ href: linkUrl }).run();
            setLinkUrl('');
            setShowLinkInput(false);
        }
    }, [editor, linkUrl]);

    const addImage = useCallback(() => {
        if (imageUrl) {
            console.log('Adding image:', imageUrl);
            const result = editor.chain().focus().setImage({ src: imageUrl }).run();
            console.log('Image added:', result);
            setImageUrl('');
            setShowImageInput(false);
        }
    }, [editor, imageUrl]);

    const setColor = useCallback((color: string) => {
        editor.chain().focus().setColor(color).run();
    }, [editor]);

    const setFontFamily = useCallback((font: string) => {
        editor.chain().focus().setFontFamily(font).run();
    }, [editor]);

    return (
        <div className="border-b bg-muted/50 p-2 space-y-2">
            {/* Row 1: Text Formatting */}
            <div className="flex flex-wrap items-center gap-1">
                <Toggle
                    size="sm"
                    pressed={editor.isActive('bold')}
                    onPressedChange={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('italic')}
                    onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('underline')}
                    onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                >
                    <UnderlineIcon className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('strike')}
                    onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                >
                    <Strikethrough className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('code')}
                    onPressedChange={() => editor.chain().focus().toggleCode().run()}
                >
                    <Code className="h-4 w-4" />
                </Toggle>

                <Separator orientation="vertical" className="h-6" />

                {/* Headings */}
                <Toggle
                    size="sm"
                    pressed={editor.isActive('heading', { level: 1 })}
                    onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                >
                    <Heading1 className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('heading', { level: 2 })}
                    onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                    <Heading2 className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('heading', { level: 3 })}
                    onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                    <Heading3 className="h-4 w-4" />
                </Toggle>

                <Separator orientation="vertical" className="h-6" />

                {/* Text Color */}
                <div className="flex items-center gap-1">
                    <label className="text-xs text-muted-foreground">Color:</label>
                    <input
                        type="color"
                        onChange={(e) => setColor(e.target.value)}
                        className="h-6 w-8 rounded border cursor-pointer"
                        title="Text color"
                    />
                </div>

                <Separator orientation="vertical" className="h-6" />

                {/* Font Family */}
                <Select onValueChange={setFontFamily}>
                    <SelectTrigger className="h-8 w-32">
                        <SelectValue placeholder="Font" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Inter">Inter (Default)</SelectItem>
                        <SelectItem value="Arial">Arial</SelectItem>
                        <SelectItem value="Georgia">Georgia</SelectItem>
                        <SelectItem value="'Courier New'">Courier New</SelectItem>
                        <SelectItem value="'Times New Roman'">Times New Roman</SelectItem>
                        <SelectItem value="monospace">Monospace</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Row 2: Alignment, Lists, and Blocks */}
            <div className="flex flex-wrap items-center gap-1">
                <Toggle
                    size="sm"
                    pressed={editor.isActive({ textAlign: 'left' })}
                    onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
                >
                    <AlignLeft className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive({ textAlign: 'center' })}
                    onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
                >
                    <AlignCenter className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive({ textAlign: 'right' })}
                    onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
                >
                    <AlignRight className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive({ textAlign: 'justify' })}
                    onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()}
                >
                    <AlignJustify className="h-4 w-4" />
                </Toggle>

                <Separator orientation="vertical" className="h-6" />

                <Toggle
                    size="sm"
                    pressed={editor.isActive('bulletList')}
                    onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('orderedList')}
                    onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive('blockquote')}
                    onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                >
                    <Quote className="h-4 w-4" />
                </Toggle>

                <Separator orientation="vertical" className="h-6" />

                {/* Link */}
                {!showLinkInput ? (
                    <Button
                        type="button"
                        size="sm"
                        variant={editor.isActive('link') ? 'default' : 'ghost'}
                        onClick={() => setShowLinkInput(true)}
                    >
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                ) : (
                    <div className="flex items-center gap-1">
                        <Input
                            type="url"
                            placeholder="https://example.com"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            className="h-8 w-48"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addLink();
                                }
                                if (e.key === 'Escape') setShowLinkInput(false);
                            }}
                        />
                        <Button type="button" size="sm" onClick={addLink}>Add</Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => setShowLinkInput(false)}>Cancel</Button>
                    </div>
                )}

                {/* Image */}
                {!showImageInput ? (
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowImageInput(true)}
                        disabled={uploadingImage}
                    >
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                ) : (
                    <div className="flex items-center gap-1">
                        <label className="cursor-pointer">
                            <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                                disabled={uploadingImage}
                            />
                            <Button type="button" size="sm" variant="outline" disabled={uploadingImage} asChild>
                                <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                            </Button>
                        </label>
                        <span className="text-xs text-muted-foreground">or</span>
                        <Input
                            type="url"
                            placeholder="Image URL"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="h-8 w-40"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addImage();
                                }
                                if (e.key === 'Escape') setShowImageInput(false);
                            }}
                            disabled={uploadingImage}
                        />
                        <Button type="button" size="sm" onClick={addImage} disabled={uploadingImage}>Add URL</Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => setShowImageInput(false)} disabled={uploadingImage}>Cancel</Button>
                    </div>
                )}

                {/* Table */}
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                >
                    <Table className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6" />

                {/* Undo/Redo */}
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                >
                    <Redo className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
