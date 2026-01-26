import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, List, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start typing...',
  className,
  minHeight = '200px',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnorderedList = () => execCommand('insertUnorderedList');
  const handleUndo = () => execCommand('undo');
  const handleRedo = () => execCommand('redo');

  const isCommandActive = (command: string): boolean => {
    return document.queryCommandState(command);
  };

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden bg-background', className)}>
      {/* Toolbar */}
      <div className="flex items-center space-x-1 p-2 border-b border-border bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleBold}
          className={cn(
            'h-8 w-8 bg-transparent hover:bg-muted',
            isCommandActive('bold') && 'bg-primary/10 text-primary'
          )}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" strokeWidth={2} />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleItalic}
          className={cn(
            'h-8 w-8 bg-transparent hover:bg-muted',
            isCommandActive('italic') && 'bg-primary/10 text-primary'
          )}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" strokeWidth={2} />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleUnorderedList}
          className={cn(
            'h-8 w-8 bg-transparent hover:bg-muted',
            isCommandActive('insertUnorderedList') && 'bg-primary/10 text-primary'
          )}
          title="Bullet List"
        >
          <List className="w-4 h-4" strokeWidth={2} />
        </Button>

        <div className="w-px h-6 bg-border mx-1"></div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleUndo}
          className="h-8 w-8 bg-transparent hover:bg-muted"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" strokeWidth={2} />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleRedo}
          className="h-8 w-8 bg-transparent hover:bg-muted"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" strokeWidth={2} />
        </Button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'px-4 py-3 text-body text-foreground outline-none overflow-y-auto',
          'prose prose-sm max-w-none',
          '[&>ul]:list-disc [&>ul]:ml-6 [&>ul]:my-2',
          '[&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:my-2',
          '[&>p]:my-2',
          '[&>strong]:font-semibold',
          '[&>em]:italic',
          !value && !isFocused && 'before:content-[attr(data-placeholder)] before:text-muted-foreground before:pointer-events-none'
        )}
        style={{ minHeight }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
};

export default RichTextEditor;
