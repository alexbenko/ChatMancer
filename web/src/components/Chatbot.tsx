import { ChangeEvent, useEffect, useState } from 'react';
import { Avatar, Box, Button, Paper, TextField, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CircularProgress from '@mui/material/CircularProgress';

export interface ChatMessage{
        type: "human" | "ai";
        content: string;
}

export interface ChatMessageProps {
  message: ChatMessage
}


const ChatMessage = ({ message }: ChatMessageProps)=> {
    const isAIMessage = message.type === 'ai';
    const senderName = isAIMessage ? 'MedaMate' : 'You';
    const avatarSrc = isAIMessage ? '/ai.webp' : '/me.png';

    return (
      <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isAIMessage ? 'flex-start' : 'flex-end',
            maxWidth: '70%',
            margin: isAIMessage ? '10px auto 10px 10px' : '10px 10px 10px auto',
            backgroundColor: isAIMessage ? '#f5f5f5' : 'blue',
            color: isAIMessage ? 'black' : 'white',
            borderRadius: isAIMessage ? '10px 10px 10px 0' : '10px 10px 0 10px',
            padding: '10px',
        }}
      >
        <Typography variant="body1" gutterBottom>{message.content}</Typography>
        <Avatar alt={senderName} src={avatarSrc} />
        <Typography
          variant="subtitle2"
          sx={{
            alignSelf: isAIMessage ? 'flex-start' : 'flex-end',
            marginTop: '10px',
          }}
        >
          {senderName}
        </Typography>

      </Box>
    );
};

export function Chatbot(){
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const fetchChatHistory = async () => {
        try {
          const response = await fetch('/api/chat');
          const data = await response.json();
          console.log(data)
          setMessages(data.response.messages);
        } catch (error) {
          console.error('Error fetching chat history:', error);
        }
      };
      fetchChatHistory();
    }, []);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleSendMessage = async () => {
      const trimmedInput = inputValue.trim();
      if (trimmedInput) {
        try {
          setMessages([...messages, {
            type: "human",
            content: trimmedInput,
          }]);
          setLoading(true)
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: trimmedInput }),
          });
          const data = await response.json();
                    // Sending POST request to the server

          if (data && data.response) {
            console.log(data.response)
            setLoading(false)
            setMessages((prevMessages) => [...prevMessages, {
              type: "ai",
              content: data.response,
            }]);
          }
        } catch (error) {
          console.error('Error sending message:', error);
        } finally{
            setInputValue(''); // Clear the input field after sending the message
        }
    }
    };
  return (
    <Box sx={{width: '80%'}}>
        <Paper elevation={3} sx={{ padding: '20px', maxHeight: '500px', overflowY: 'auto' }}>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {loading &&
                <Box sx={{ display: 'flex' }}>
                    <CircularProgress />
                </Box>
            }
            {loading && <Typography variant="body1">Loading MedaMate Response...</Typography>}
        </Paper>
        <Box sx={{ display: 'flex', marginTop: '10px', gap: '10px' }}>
            <TextField
              fullWidth
              label="Type your message"
              variant="outlined"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <Button disabled={!inputValue} variant="contained" color="primary" onClick={handleSendMessage}>
                <SendIcon />

            </Button>
        </Box>
    </Box>

  );
}

export default Chatbot;
