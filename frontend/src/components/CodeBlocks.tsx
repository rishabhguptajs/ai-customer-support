import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <SyntaxHighlighter language={language} style={tomorrow}>
        {code}
      </SyntaxHighlighter>
      <button
        onClick={copyToClipboard}
        className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-sm"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
};

export default CodeBlock;