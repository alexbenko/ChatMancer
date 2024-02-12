import { ChangeEvent, useEffect, useRef, useState } from "react";
import {
    Avatar,
    Box,
    Chip,
    Container,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CircularProgress from "@mui/material/CircularProgress";
import { LoadingButton } from "@mui/lab";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import useNotification from "../hooks/useNotification";

export interface ChatMessage {
    type: "human" | "ai";
    content: string;
}

export interface ChatMessageProps {
    message: ChatMessage;
}

const isProduction = import.meta.env.MODE === "production";
const apiRootPath = isProduction ? "" : "/api";

export function Chatbot() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [contextFile, setContextFile] = useState<string | null>(null);
    const sendNotification = useNotification();

    useEffect(() => {
        if (error) {
            sendNotification({ msg: error, variant: "error" });
        }
    }, [error, sendNotification]);

    useEffect(() => {
        if (info) {
            sendNotification({ msg: info, variant: "info" });
        }
    }, [info, sendNotification]);

    const clearContextFile = async () => {
        try {
            const response = await fetch(`${apiRootPath}/clear_context_file`, {
                method: "POST",
            });

            const data = await response.json();
            if (data?.response) {
                setInfo(data.response);
                setContextFile(null);
            } else {
                setError("Error Clearing Context File.");
            }
        } catch (error) {
            console.error("Error clearing context file:", error);
            setError("An error occurred while clearing context file.");
        }
    };

    const fetchContextFile = async () => {
        try {
            const response = await fetch(`${apiRootPath}/context_file`);
            const data = await response.json();
            console.log(data);
            if (data?.response) {
                setContextFile(data.response);
                if (file) setFile(null);
            }
        } catch (error) {
            console.error("Error fetching context file:", error);
            setError("An error occurred while fetching context file.");
        }
    };

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                const response = await fetch(`${apiRootPath}/chat`);
                const data = await response.json();
                console.log(data);
                setMessages(data.response.messages);
            } catch (error) {
                console.error("Error fetching chat history:", error);
                setError("An error occurred while fetching chat history.");
            }
        };

        fetchChatHistory();
        fetchContextFile();
    }, []);

    useEffect(() => {
        fetchContextFile();
    }, [messages]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setInputValue(value);
    };

    const handleSendMessage = async () => {
        const trimmedInput = inputValue.trim();
        if (trimmedInput) {
            try {
                setMessages([
                    ...messages,
                    {
                        type: "human",
                        content: trimmedInput,
                    },
                ]);
                setLoading(true);

                const formData = new FormData();
                formData.append("question", trimmedInput);
                if (file) {
                    formData.append("file", file);
                }
                const requestOptions = {
                    method: "POST",
                    body: formData, // FormData will set the Content-Type to 'multipart/form-data' automatically
                };

                const response = await fetch(`${apiRootPath}/chat`, requestOptions);
                const data = await response.json();

                if (data && data.response) {
                    console.log(data.response);

                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            type: "ai",
                            content: data.response,
                        },
                    ]);
                    if (file) setFile(null);
                }
            } catch (error) {
                console.error("Error sending message:", error);
                setError("An error occurred while sending the message.");
            } finally {
                setLoading(false);
                setInputValue(""); // Clear the input field after sending the message
            }
        }
    };

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView();
        }
    }, [messages]);

    // State for file input element
    const [fileInputKey, setFileInputKey] = useState(Date.now());

    const handleUploadClick = () => {
        // Trigger file input click
        document.getElementById("file-upload-input")?.click();
    };
    const [file, setFile] = useState<File | null>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        const MAX_FILE_SIZE = 250 * 1024 * 1024;
        if (file && file.size > MAX_FILE_SIZE) {
            setError("File size should be less than 250MB.");
        } else if (file) {
            console.log(file);
            setFile(file);
            setInfo("File added successfully.");
            // Reset the file input after selection
            setFileInputKey(Date.now());
        }
    };

    return (
        <Container
            maxWidth="xl"
            component="div"
            sx={{ minHeight: "100vh", pl: "0", pr: "0" }}
        >
            <Paper
                elevation={3}
                sx={{
                    padding: "20px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    minHeight: "85vh",
                }}
            >
                {messages.map((message, index) => (
                    <>
                        <ChatMessage key={index} message={message} />
                    </>
                ))}
                <div ref={messagesEndRef} />

                {loading && (
                    <Box sx={{ display: "flex" }}>
                        <CircularProgress />
                        <Typography variant="body1">
                            Loading ChatMancer Response...
                        </Typography>
                    </Box>
                )}
            </Paper>

            <Box sx={{ display: "flex", marginTop: "10px", gap: "10px" }}>
                {file && !contextFile && (
                    <Chip
                        color="success"
                        label={file.name}
                        onDelete={() => setFile(null)}
                    />
                )}

                <TextField
                    disabled={loading}
                    fullWidth
                    multiline
                    label="Type your message"
                    variant="outlined"
                    value={inputValue}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    onChange={handleInputChange}
                    InputProps={{
                        startAdornment: !contextFile && (
                            <InputAdornment position="start">
                                <IconButton onClick={handleUploadClick} edge="start">
                                    <AttachFileIcon />

                                    <input
                                        disabled={!!contextFile}
                                        type="file"
                                        id="file-upload-input"
                                        style={{ display: "none" }}
                                        onChange={handleFileChange}
                                        accept=".pdf"
                                        max={1}
                                        key={fileInputKey}
                                    />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <LoadingButton
                    loading={loading}
                    disabled={!inputValue || loading}
                    variant="contained"
                    color="primary"
                    onClick={handleSendMessage}
                >
                    <SendIcon />
                </LoadingButton>
            </Box>
            {contextFile && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        File loaded in context:
                    </Typography>
                    <Tooltip title="ChatMancer remembers the information from this file and can continue to answer questions on it. Use /pdf to continue asking questions.">
                        <Chip
                            onDelete={() => clearContextFile()}
                            color="primary"
                            label={contextFile}
                        />
                    </Tooltip>
                </Box>
            )}
        </Container>
    );
}

export default Chatbot;

const ChatMessage = ({ message }: ChatMessageProps) => {
    const isAIMessage = message.type === "ai";
    const senderName = isAIMessage ? "ChatMancer" : "You";
    const avatarSrc = isAIMessage ? `/chatmancer.webp` : `cat.webp`;

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: isAIMessage ? "flex-start" : "flex-end",
                maxWidth: "70%",
                margin: isAIMessage ? "10px auto 10px 10px" : "10px 10px 10px auto",
                backgroundColor: isAIMessage ? "#f5f5f5" : "blue",
                color: isAIMessage ? "black" : "white",
                borderRadius: isAIMessage ? "10px 10px 10px 0" : "10px 10px 0 10px",
                padding: "10px",
            }}
        >
            {message.content.startsWith("Here is the image you requested:") ?
                <>
                    <Typography variant="body1" gutterBottom>
                        Here is the image you requested:
                    </Typography>
                    <a
                        href={message.content.replace(
                            "Here is the image you requested: ",
                            "",
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Avatar
                            sx={{ width: 100, height: 100 }}
                            src={message.content.replace(
                                "Here is the image you requested: ",
                                "",
                            )}
                            alt="Generated"
                        />
                    </a>
                </>
            :   <Typography variant="body1" gutterBottom>
                    {message.content}
                </Typography>
            }
            <Avatar alt={senderName} src={avatarSrc} />
            <Typography
                variant="subtitle2"
                sx={{
                    alignSelf: isAIMessage ? "flex-start" : "flex-end",
                    marginTop: "10px",
                }}
            >
                {senderName}
            </Typography>
        </Box>
    );
};
