import { ChangeEvent, memo, useEffect, useRef, useState } from "react";
import {
    Avatar,
    Box,
    Chip,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Tooltip,
    Typography,
    SelectChangeEvent,
    FormHelperText,
} from "@mui/material";

import { useLocalStorage } from "../../hooks/useLocalStorage";
import apiPath from "../../lib/apiPath";
import Message from "./Message";
import ChatInput from "./ChatInput";
import useNotification from "../../hooks/useNotification";
import StreamMessage from "./StreamMessage";

export interface ChatMessage {
    type: "human" | "ai";
    content: string;
    content_type: "text" | "image" | "file";
    model?: string;
}

export interface ChatMessageProps {
    message: ChatMessage;
    streaming?: boolean;
}

const { isProduction, apiRootPath } = apiPath();

export function Chatbot() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [streamQuestion, setStreamQuestion] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [contextFile, setContextFile] = useState<string | null>(null);
    const [csrfToken] = useLocalStorage<string | null>("csrfToken", null);

    const sendNotification = useNotification();
    const defaultModel = isProduction ? "gpt-4" : "gpt-3.5-turbo";
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
                credentials: "include",
                headers: {
                    "x-csrf-token": csrfToken!,
                },
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

    const fetchModels = async () => {
        try {
            const response = await fetch(`${apiRootPath}/models`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "x-csrf-token": csrfToken!,
                },
            });
            const data = await response.json();

            if (data?.response) {
                return data.response;
            }
        } catch (error) {
            console.error("Error fetching models:", error);
            setError("An error occurred while fetching models.");
        }
    };

    const fetchContextFile = async () => {
        try {
            const response = await fetch(`${apiRootPath}/context_file`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "x-csrf-token": csrfToken!,
                },
            });
            const data = await response.json();

            if (data?.response) {
                setContextFile(data.response);
                if (file) setFile(null);
            }
        } catch (error) {
            console.error("Error fetching context file:", error);
            setError("An error occurred while fetching context file.");
        }
    };

    const handleModelChange = (event: SelectChangeEvent<string>) => {
        setSelectedModel(event.target.value);
    };

    const [selectedModel, setSelectedModel] = useLocalStorage<string | undefined>(
        "selectedModel",
        undefined,
    );
    const [models, setModels] = useLocalStorage("models", []);

    useEffect(() => {
        fetchChatHistory();
        fetchContextFile();
    }, []);
    const fetchChatHistory = async () => {
        try {
            const response = await fetch(`${apiRootPath}/chat`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "x-csrf-token": csrfToken!,
                },
            });
            const data = await response.json();

            setMessages(data.response.messages);
            console.log("Chat history:", data.response.messages);
            if (!models.length) {
                const models = await fetchModels();
                if (models) {
                    setModels(models);
                }
            }
        } catch (error) {
            console.error("Error fetching chat history:", error);
            setError("An error occurred while fetching chat history.");
        }
    };

    const handleSendMessage = async (msg: string) => {
        setLoading(true);
        setMessages((prevMessages) => [
            ...prevMessages,
            {
                type: "human",
                content: msg,
                content_type: "text",
            },
        ]);
        setStreamQuestion(msg); //so the stream isnt rendered until the user sends the message

        return;
        /**
        const trimmedInput = inputValue.trim();
        if (trimmedInput) {
            try {
                setLoading(true);

                const formData = new FormData();
                formData.append("question", trimmedInput);

                if (selectedModel) {
                    formData.append("selected_model", selectedModel);
                }

                if (file) {
                    formData.append("file", file);
                }
                const requestOptions = {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                    headers: {
                        "x-csrf-token": csrfToken!,
                    },
                };

                const response = await fetch(`${apiRootPath}/chat`, {
                    ...requestOptions,
                    credentials: "include" as RequestCredentials,
                });
                const data = await response.json();

                if (data && data?.messages) {
                    setMessages(() => [...data.messages]);
                    if (file) {
                        setFile(null);
                        await fetchContextFile();
                    }
                } else {
                    setError("Error sending message.");
                    console.error("Error:", data);
                }
            } catch (error) {
                console.error("Error sending message:", error);
                setError("An error occurred while sending the message.");
            } finally {
                setLoading(false);
                setInputValue("");
            }
        }
            */
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

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        const MAX_FILE_SIZE = 250 * 1024 * 1024;
        if (file && file.size > MAX_FILE_SIZE) {
            setError("File size should be less than 250MB.");
        } else if (file) {
            console.log(file);
            setFile(file);
            setInfo("File added successfully.");
            const formData = new FormData();
            formData.append("file", file);
            try {
                const response = await fetch(`${apiRootPath}/upload_file`, {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                    headers: {
                        "x-csrf-token": csrfToken!,
                    },
                });

                const data = await response.json();
                if (data?.response) {
                    setInfo(data.response);
                    setContextFile(file.name); // Update context file state
                } else {
                    setError("Error uploading file.");
                }
            } catch (error) {
                console.error("Error uploading file:", error);
                setError("An error occurred while uploading the file.");
            } finally {
                // Reset the file input after selection
                setFileInputKey(Date.now());
            }
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
                {!messages.length && (
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <Typography variant="h5">
                            Start a conversation with ChatMancer!
                        </Typography>
                    </Box>
                )}

                {messages.map((message, index) => (
                    <ChatMessage key={index} message={message} />
                ))}

                {streamQuestion && (
                    <StreamMessage
                        question={streamQuestion}
                        model={selectedModel ?? defaultModel}
                        onComplete={() => {
                            fetchChatHistory();
                            setLoading(false);
                            setStreamQuestion(null);
                        }}
                    />
                )}

                <div ref={messagesEndRef} />
            </Paper>

            <Box sx={{ display: "flex", marginTop: "10px", gap: "10px" }}>
                {file && !contextFile && (
                    <Chip
                        color="success"
                        label={file.name}
                        onDelete={() => setFile(null)}
                    />
                )}

                <ChatInput
                    handleSendMessage={handleSendMessage}
                    loading={loading}
                    fileInputKey={fileInputKey}
                    handleUploadClick={handleUploadClick}
                    handleFileChange={handleFileChange}
                    contextFile={contextFile}
                />
            </Box>

            {contextFile && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        File loaded in context:
                    </Typography>
                    <Tooltip title="ChatMancer remembers the information from this file and can continue to answer questions on it. Remove the file if you no longer want to talk about it.">
                        <Chip
                            onDelete={() => clearContextFile()}
                            color="primary"
                            label={contextFile}
                        />
                    </Tooltip>
                </Box>
            )}
            <Box sx={{ display: "flex", marginTop: "1rem", marginBottom: "1rem" }}>
                <FormControl sx={{ flexGrow: "1" }} variant="filled">
                    <InputLabel id="model-select-label">Select Model</InputLabel>
                    <Select
                        labelId="model-select-label"
                        value={selectedModel || ""}
                        onChange={handleModelChange}
                    >
                        <MenuItem value={undefined} disabled>
                            Select a model
                        </MenuItem>
                        <MenuItem value={undefined}>Default</MenuItem>
                        {models.map((model) => (
                            <MenuItem key={model} value={model}>
                                {model}
                            </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText id="my-helper-text">
                        Select the model to use for the next question. Otherwise the
                        model will default to {defaultModel}.
                    </FormHelperText>
                </FormControl>
            </Box>
        </Container>
    );
}

export default Chatbot;

const ChatMessage = memo(({ message, streaming = false }: ChatMessageProps) => {
    const isAIMessage = message.type === "ai";
    const senderName = isAIMessage ? "ChatMancer" : "You";
    const avatarSrc = isAIMessage ? `/chatmancer.webp` : `cat.webp`;

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: isAIMessage ? "flex-start" : "flex-end",
                margin: isAIMessage ? "10px auto 10px 10px" : "10px 10px 10px auto",
                backgroundColor: isAIMessage ? "#f5f5f5" : "blue",
                color: isAIMessage ? "black" : "white",
                borderRadius: isAIMessage ? "10px 10px 10px 0" : "10px 10px 0 10px",
                padding: "10px",
                width: "fit-content",
                maxWidth: "90%",
            }}
        >
            <Message content={message.content} streaming={streaming} />

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
            {isAIMessage && message?.model && (
                <Typography
                    variant="caption"
                    sx={{
                        alignSelf: "flex-start",
                        marginTop: "5px",
                        color: "#888",
                    }}
                >
                    {message.model}
                </Typography>
            )}
        </Box>
    );
});

export { ChatMessage };
