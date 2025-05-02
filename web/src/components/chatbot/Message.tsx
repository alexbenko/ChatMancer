import { FC, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Typography, IconButton, Tooltip, Box, Container, Avatar } from "@mui/material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import useNotification from "../../hooks/useNotification";
interface MessageProps {
    content: string;
    streaming?: boolean;
}

const Message: FC<MessageProps> = ({ content, streaming = false }) => {
    const sendNotification = useNotification();
    if (streaming) {
        return (
            <Typography variant="body1" gutterBottom>
                {content}
            </Typography>
        );
    }
    const dalleImageUrl = useMemo(() => {
        const urlRegex = /(https?:\/\/[^\s]+)/g; // Regex to match URLs
        const matches = content.match(urlRegex);
        return matches?.find((url) => url.includes("dalle")) || null;
    }, [content]);
    console.log(content);
    console.log("Dalle Image URL", dalleImageUrl);
    if (dalleImageUrl) {
        return (
            <Container maxWidth="md">
                <Avatar
                    alt="DALL-E Generated Image"
                    src={dalleImageUrl}
                    sx={{ width: 128, height: 128 }}
                />
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <ReactMarkdown
                components={{
                    p: ({ children }) => (
                        <Typography variant="body1" gutterBottom>
                            {children}
                        </Typography>
                    ),
                    ol: ({ children }) => (
                        <Box component="ol" sx={{ pl: 2 }}>
                            {children}
                        </Box>
                    ),
                    ul: ({ children }) => (
                        <Box component="ul" sx={{ pl: 2 }}>
                            {children}
                        </Box>
                    ),
                    li: ({ children }) => (
                        <li style={{ marginBottom: 4 }}>{children}</li>
                    ),
                    code({ node, inline, className, children, ...props }: any) {
                        console.log("CODE BLOCK");
                        const match = /language-(\w+)/.exec(className || "");
                        const codeString = String(children).replace(/\n$/, "");

                        const [copied, setCopied] = useState(false);
                        useEffect(() => {
                            if (copied) {
                                const h = setTimeout(() => setCopied(false), 2000);
                                return () => clearTimeout(h);
                            }
                        }, [copied]);

                        const handleCopy = async () => {
                            await navigator.clipboard.writeText(codeString);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                            sendNotification({
                                msg: "Code copied to clipboard!",
                                variant: "info",
                            });
                        };

                        if (!inline && match) {
                            return (
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            background: "#eee",
                                            px: 1,
                                            backgroundColor: "#6d6d6d",
                                            borderRadius: "4px 4px 0 0",
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontSize: "0.75rem",
                                                color: "white",
                                            }}
                                        >
                                            {match[1]}
                                        </Typography>
                                        <Tooltip
                                            title={copied ? "Copied!" : "Copy code"}
                                        >
                                            <IconButton
                                                size="small"
                                                onClick={handleCopy}
                                            >
                                                {copied ?
                                                    <CheckIcon fontSize="small" />
                                                :   <ContentCopyIcon fontSize="small" />
                                                }
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                    <SyntaxHighlighter
                                        wrapLines
                                        wrapLongLines
                                        language={match[1]}
                                        style={oneDark}
                                        PreTag="div"
                                        showLineNumbers
                                        customStyle={{
                                            borderRadius: "0 0 8px 8px",
                                            padding: "1em",
                                            margin: 0,
                                        }}
                                        {...props}
                                    >
                                        {codeString}
                                    </SyntaxHighlighter>
                                </Box>
                            );
                        }

                        return <code {...props}>{children}</code>;
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </Container>
    );
};

export default Message;
