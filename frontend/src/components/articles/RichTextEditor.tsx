import { useCallback, useEffect, useRef } from 'react';

interface RichTextEditorProps {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

type BlockTag = 'p' | 'h2' | 'h3';

export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = 'Write article content…',
  minHeight = 280,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    const el = editorRef.current;
    if (!el || isInternalChange.current) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || '';
    }
  }, [value]);

  const emitChange = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    isInternalChange.current = true;
    onChange(el.innerHTML);
    requestAnimationFrame(() => {
      isInternalChange.current = false;
    });
  }, [onChange]);

  const exec = (command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    emitChange();
  };

  const setBlock = (tag: BlockTag) => {
    document.execCommand('formatBlock', false, tag);
    editorRef.current?.focus();
    emitChange();
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL');
    if (url) exec('createLink', url);
  };

  return (
    <div className="rich-text-editor">
      <div className="rich-text-editor__toolbar" role="toolbar" aria-label="Formatting">
        <button type="button" title="Heading 2" onClick={() => setBlock('h2')}>H2</button>
        <button type="button" title="Heading 3" onClick={() => setBlock('h3')}>H3</button>
        <button type="button" title="Paragraph" onClick={() => setBlock('p')}>P</button>
        <button type="button" title="Bold" onClick={() => exec('bold')}>
          <i className="fas fa-bold" aria-hidden="true" />
        </button>
        <button type="button" title="Italic" onClick={() => exec('italic')}>
          <i className="fas fa-italic" aria-hidden="true" />
        </button>
        <button type="button" title="Bullet list" onClick={() => exec('insertUnorderedList')}>
          <i className="fas fa-list-ul" aria-hidden="true" />
        </button>
        <button type="button" title="Numbered list" onClick={() => exec('insertOrderedList')}>
          <i className="fas fa-list-ol" aria-hidden="true" />
        </button>
        <button type="button" title="Link" onClick={insertLink}>
          <i className="fas fa-link" aria-hidden="true" />
        </button>
        <button type="button" title="Blockquote" onClick={() => exec('formatBlock', 'blockquote')}>
          <i className="fas fa-quote-right" aria-hidden="true" />
        </button>
      </div>
      <div
        id={id}
        ref={editorRef}
        className="rich-text-editor__body"
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        style={{ minHeight }}
        onInput={emitChange}
        onBlur={emitChange}
        suppressContentEditableWarning
      />
    </div>
  );
}
