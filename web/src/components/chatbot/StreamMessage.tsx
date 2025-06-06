import { FC, memo, useEffect, useState } from "react";
import useSWRSubscription, { SWRSubscriptionOptions } from "swr/subscription";
import { Box } from "@mui/material";
import apiPath from "../../lib/apiPath";
import { ChatMessage } from "./Chatbot";
const END_OF_STREAM = "end_of_stream";

function subscribeToSSE(url: string, { next }: SWRSubscriptionOptions): () => void {
    const es = new EventSource(url, { withCredentials: true });

    es.onmessage = (e) => {
        next(undefined, e.data);
    };
    es.onerror = (err) => {
        console.error("SSE error:", err);
        es.close();
    };
    es.addEventListener(END_OF_STREAM, () => {
        next(null, END_OF_STREAM);
        es.close();
    });

    return () => es.close();
}
interface StreamingChatMessageProps {
    question: string | null;
    model: string;
    onComplete?: () => void;
}

const StreamMessage: FC<StreamingChatMessageProps> = ({
    question,
    model,
    onComplete,
}) => {
    const [text, setText] = useState("");
    const [started, setStarted] = useState(false);

    // Reset when question changes
    useEffect(() => {
        setText("");
        setStarted(false);
    }, [question]);

    const { data: chunk, error } = useSWRSubscription<string, any>(
        `${apiPath().apiRootPath}/chat/stream?question=${encodeURIComponent(
            question ?? "",
        )}&model=${model}`,
        subscribeToSSE,
    );

    // append normal chunks
    useEffect(() => {
        if (!chunk) return;

        if (chunk === END_OF_STREAM) {
            onComplete?.();
            setText("");
        } else {
            setText((t) => t + chunk);
            console.log(text);
        }
    }, [chunk, onComplete]);

    // When the stream closes or errors
    useEffect(() => {
        if ((chunk === undefined && error) || (started && chunk === undefined)) {
            onComplete?.();
        }
    }, [chunk, error, started, onComplete]);

    return (
        <Box
            component="pre"
            sx={{
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
            }}
        >
            <ChatMessage
                streaming={true}
                message={{
                    content: text,
                    type: "ai",
                    model: model,
                    content_type: "text",
                }}
            />
        </Box>
    );
};

export default memo(StreamMessage);
