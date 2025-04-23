import React from "react";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

import { ChatMessage, ChatMessage as ChatMessageType } from "./Chatbot";

type VirtualMessageListProps = {
    messages: ChatMessageType[];
};

const VirtualMessageList: React.FC<VirtualMessageListProps> = ({ messages }) => {
    const itemSize = 120;

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
        <div style={style}>
            <ChatMessage message={messages[index]} />
        </div>
    );

    return (
        <AutoSizer>
            {({ height, width }) => (
                <List
                    height={height}
                    width={width}
                    itemCount={messages.length}
                    itemSize={itemSize}
                >
                    {Row}
                </List>
            )}
        </AutoSizer>
    );
};

export default React.memo(VirtualMessageList);
