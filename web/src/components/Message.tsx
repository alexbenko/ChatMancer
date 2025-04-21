import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Typography, IconButton, Tooltip, Box } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import useNotification from '../hooks/useNotification';

interface MessageProps {
  content: string;
}

const Message: React.FC<MessageProps> = ({ content }) => {
  const sendNotification = useNotification();

  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <Typography variant="body1" gutterBottom>
            {children}
          </Typography>
        ),
        ol: ({ children }) => (
          <Box component="ol" sx={{ pl: 3, }}>
            {children}
          </Box>
        ),
        ul: ({ children }) => (
          <Box component="ul" sx={{ pl: 3, }}>
            {children}
          </Box>
        ),
        li: ({ children }) => (
          <li style={{ marginBottom: 4 }}>{children}</li>
        ),
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          const codeString = String(children).replace(/\n$/, '');

          const [copied, setCopied] = useState(false);

          const handleCopy = async () => {
            await navigator.clipboard.writeText(codeString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            sendNotification({ msg: 'Code copied to clipboard!', variant: 'info' });
          };

          if (!inline && match) {
            return (
              <Box sx={{ position: 'relative', mb: 2,                     maxWidth: '90%',
                overflowX: 'auto',
                boxSizing: 'border-box', }} >
                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                  <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
                    <IconButton size="small" onClick={handleCopy}>
                      {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                </Box>
                <SyntaxHighlighter
                  language={match[1]}
                  style={oneDark}
                  PreTag="div"
                  wrapLongLines
                  customStyle={{
                    borderRadius: '8px',
                    paddingTop: '2.5em',
                  }}
                  {...props}
                >
                  {codeString}
                </SyntaxHighlighter>
              </Box>
            );
          }

          return (
            <code
              style={{
                backgroundColor: 'rgba(27,31,35,.05)',
                padding: '0.2em 0.4em',
                borderRadius: 4,
                fontFamily: 'monospace',
              }}
              {...props}
            >
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default Message;
