import React, { useState, useRef, useEffect } from 'react';

const RichTextEditor = ({ value, onChange, placeholder = "Start typing..." }) => {
    const editorRef = useRef(null);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');

    // Initialize content only once
    useEffect(() => {
        if (editorRef.current && value && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const handleBold = () => {
        editorRef.current.focus();
        document.execCommand('bold', false, null);
        updateContent();
    };

    const handleItalic = () => {
        editorRef.current.focus();
        document.execCommand('italic', false, null);
        updateContent();
    };

    const handleUnderline = () => {
        editorRef.current.focus();
        document.execCommand('underline', false, null);
        updateContent();
    };

    const handleOrderedList = () => {
        editorRef.current.focus();
        document.execCommand('insertOrderedList', false, null);
        updateContent();
    };

    const handleUnorderedList = () => {
        editorRef.current.focus();
        document.execCommand('insertUnorderedList', false, null);
        updateContent();
    };

    const handleAddLink = () => {
        if (!linkUrl.trim()) {
            alert('Please enter a URL');
            return;
        }

        // Validate URL
        try {
            new URL(linkUrl);
        } catch {
            alert('Please enter a valid URL (e.g., https://example.com)');
            return;
        }

        editorRef.current.focus();
        
        const selection = window.getSelection();
        const selectedText = selection.toString();
        
        // Use selected text or custom link text or URL as display text
        const displayText = selectedText || linkText || linkUrl;
        
        // Create link element
        const link = document.createElement('a');
        link.href = linkUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = displayText;
        link.style.cssText = 'color: #3b82f6; text-decoration: underline; cursor: pointer;';
        
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(link);
            
            // Move cursor after link
            range.setStartAfter(link);
            range.setEndAfter(link);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Add space after link
            const space = document.createTextNode(' ');
            range.insertNode(space);
        } else {
            editorRef.current.appendChild(link);
            editorRef.current.appendChild(document.createTextNode(' '));
        }
        
        updateContent();
        setShowLinkInput(false);
        setLinkUrl('');
        setLinkText('');
    };

    const updateContent = () => {
        if (editorRef.current) {
            const content = editorRef.current.innerHTML;
            onChange(content);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        
        // Get plain text from clipboard
        const text = e.clipboardData.getData('text/plain');
        
        // Insert plain text at cursor position
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);
            
            // Move cursor to end of inserted text
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        
        updateContent();
    };

    const handleClearFormatting = () => {
        editorRef.current.focus();
        document.execCommand('removeFormat', false, null);
        document.execCommand('unlink', false, null);
        updateContent();
    };

    const handleKeyDown = (e) => {
        // Handle Enter key in lists properly
        if (e.key === 'Enter') {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const listItem = range.startContainer.parentElement?.closest('li');
                
                if (listItem && listItem.textContent.trim() === '') {
                    // Exit list if empty list item
                    e.preventDefault();
                    document.execCommand('insertParagraph', false, null);
                }
            }
        }
    };

    return (
        <div className="rich-text-editor w-full">
            {/* Toolbar */}
            <div className="toolbar flex flex-wrap gap-1 sm:gap-2 p-2 sm:p-3 bg-gray-100 border border-gray-300 rounded-t-lg">
                {/* Text Formatting */}
                <button
                    type="button"
                    onClick={handleBold}
                    className="px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors font-semibold text-sm sm:text-base"
                    title="Bold"
                >
                    <strong>B</strong>
                </button>
                
                <button
                    type="button"
                    onClick={handleItalic}
                    className="px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm sm:text-base"
                    title="Italic"
                >
                    <em>I</em>
                </button>
                
                <button
                    type="button"
                    onClick={handleUnderline}
                    className="px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm sm:text-base"
                    title="Underline"
                >
                    <u>U</u>
                </button>

                {/* Divider */}
                <div className="w-px h-6 sm:h-8 bg-gray-300"></div>

                {/* Lists */}
                <button
                    type="button"
                    onClick={handleUnorderedList}
                    className="px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                    title="Bullet List"
                >
                    <span className="flex items-center gap-1">
                        <span>•</span>
                        <span className="hidden sm:inline">List</span>
                    </span>
                </button>
                
                <button
                    type="button"
                    onClick={handleOrderedList}
                    className="px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                    title="Numbered List"
                >
                    <span className="flex items-center gap-1">
                        <span>1.</span>
                        <span className="hidden sm:inline">List</span>
                    </span>
                </button>

                {/* Divider */}
                <div className="w-px h-6 sm:h-8 bg-gray-300"></div>

                {/* Link */}
                <button
                    type="button"
                    onClick={() => setShowLinkInput(!showLinkInput)}
                    className="px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                    title="Add Link"
                >
                    <span className="flex items-center gap-1">
                        <span>🔗</span>
                        <span className="hidden sm:inline">Link</span>
                    </span>
                </button>

                {/* Divider */}
                <div className="w-px h-6 sm:h-8 bg-gray-300"></div>

                {/* Clear Formatting */}
                <button
                    type="button"
                    onClick={handleClearFormatting}
                    className="px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                    title="Clear Formatting"
                >
                    <span className="flex items-center gap-1">
                        <span>🧹</span>
                        <span className="hidden sm:inline">Clear</span>
                    </span>
                </button>
            </div>

            {/* Link Input Modal */}
            {showLinkInput && (
                <div className="link-input p-3 sm:p-4 bg-blue-50 border border-gray-300 border-t-0">
                    <div className="grid grid-cols-1 gap-2 sm:gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                URL *
                            </label>
                            <input
                                type="url"
                                placeholder="https://example.com"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Display Text (Optional)
                            </label>
                            <input
                                type="text"
                                placeholder="Click here"
                                value={linkText}
                                onChange={(e) => setLinkText(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Leave empty to use selected text or URL
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleAddLink}
                                className="flex-1 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium text-sm"
                            >
                                Insert Link
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowLinkInput(false);
                                    setLinkUrl('');
                                    setLinkText('');
                                }}
                                className="flex-1 px-3 sm:px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Editor Area */}
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={updateContent}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                className="editor p-3 sm:p-4 border border-gray-300 border-t-0 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto bg-white"
                style={{ 
                    minHeight: '200px',
                    maxHeight: '400px',
                    direction: 'ltr',
                    textAlign: 'left'
                }}
                dir="ltr"
                data-placeholder={placeholder}
            />
            
            {/* Inline Styles */}
            <style>{`
                .rich-text-editor {
                    width: 100%;
                }
                
                .editor:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    pointer-events: none;
                    font-style: italic;
                }
                
                .editor {
                    direction: ltr !important;
                    text-align: left !important;
                    line-height: 1.6;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                .editor * {
                    direction: ltr !important;
                }
                
                .editor p {
                    margin: 0 0 8px 0;
                }
                
                .editor ul,
                .editor ol {
                    margin: 8px 0;
                    padding-left: 24px;
                }
                
                .editor li {
                    margin: 4px 0;
                    padding-left: 4px;
                }
                
                .editor ul {
                    list-style-type: disc;
                }
                
                .editor ol {
                    list-style-type: decimal;
                }
                
                .editor a {
                    color: #3b82f6;
                    text-decoration: underline;
                    cursor: pointer;
                }
                
                .editor a:hover {
                    color: #2563eb;
                }
                
                .editor strong {
                    font-weight: 700;
                }
                
                .editor em {
                    font-style: italic;
                }
                
                .editor u {
                    text-decoration: underline;
                }
                
                /* Responsive design */
                @media (max-width: 640px) {
                    .toolbar {
                        gap: 0.25rem;
                    }
                    
                    .toolbar button {
                        padding: 0.5rem 0.75rem;
                    }
                    
                    .editor {
                        padding: 1rem;
                        min-height: 150px;
                    }
                }
                
                @media (max-width: 480px) {
                    .toolbar {
                        flex-wrap: wrap;
                    }
                    
                    .toolbar button {
                        flex: 1 0 calc(33.333% - 0.5rem);
                        min-width: 60px;
                    }
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;