import React from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";

type ChatInputProps = {
    inputValue: string;
    loading: boolean;
    contextFile: string | null;
    fileInputKey: number;
    handleSendMessage: () => void;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleUploadClick: () => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const ChatInput: React.FC<ChatInputProps> = React.memo(
    ({
        inputValue,
        loading,
        contextFile,
        fileInputKey,
        handleSendMessage,
        handleInputChange,
        handleUploadClick,
        handleFileChange,
    }) => {
        return (
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
        );
    },
);

export default ChatInput;
