import { ChangeEvent, FC, memo, useCallback, useMemo, useState } from "react";
import { TextField, InputAdornment, IconButton, Button } from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";

type ChatInputProps = {
    loading: boolean;
    contextFile: string | null;
    fileInputKey: number;
    handleSendMessage: (message: string) => void;
    handleUploadClick: () => void;
    handleFileChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
};

const ChatInput: FC<ChatInputProps> = memo(
    ({
        loading,
        contextFile,
        fileInputKey,
        handleSendMessage,
        handleUploadClick,
        handleFileChange,
    }) => {
        const onFileChange = useCallback(
            async (event: ChangeEvent<HTMLInputElement>) => {
                await handleFileChange(event);
            },
            [handleFileChange],
        );

        const [inputValue, setInputValue] = useState("");
        const handleInputChange = useCallback(
            (event: ChangeEvent<HTMLInputElement>) => {
                setInputValue(event.target.value);
            },
            [],
        );
        const inputProps = useMemo(
            () => ({
                startAdornment: !contextFile && (
                    <InputAdornment position="start">
                        <IconButton onClick={handleUploadClick} edge="start">
                            <AttachFileIcon />
                            <input
                                disabled={!!contextFile}
                                type="file"
                                id="file-upload-input"
                                style={{ display: "none" }}
                                onChange={onFileChange}
                                accept=".pdf"
                                max={1}
                                key={fileInputKey}
                            />
                        </IconButton>
                    </InputAdornment>
                ),
            }),
            [contextFile, handleUploadClick, onFileChange, fileInputKey],
        );

        return (
            <>
                <TextField
                    disabled={loading}
                    fullWidth
                    multiline
                    maxRows={5}
                    label="Type your message"
                    variant="outlined"
                    value={inputValue}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            handleSendMessage(inputValue);
                            setInputValue("");
                        }
                    }}
                    onChange={handleInputChange}
                    InputProps={inputProps}
                />
                <Button
                    disabled={loading}
                    variant="contained"
                    color="success"
                    onClick={() => {
                        handleSendMessage(inputValue);
                        setInputValue("");
                    }}
                >
                    <SendIcon />
                </Button>
            </>
        );
    },
);

export default ChatInput;
