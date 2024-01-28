import { useEffect, useState } from 'react';
import { Avatar, Box, Button, Container, Paper, TextField, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CircularProgress from '@mui/material/CircularProgress';

export interface ChatMessage{
        type: "human" | "ai";
        content: string;
}

export interface ChatMessageProps {
  message: ChatMessage
}

const isProduction = import.meta.env.MODE === 'production'
const apiRootPath = isProduction ? '' : '/api';

export function Chatbot(){
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const fetchChatHistory = async () => {
        try {
          const response = await fetch(`${apiRootPath}/chat`);
          const data = await response.json();
          console.log(data)
          setMessages(data.response.messages);
        } catch (error) {
          console.error('Error fetching chat history:', error);
        }
      };
      fetchChatHistory();
    }, []);

    //const [isImageCommand, setIsImageCommand] = useState(false);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        //if (value.startsWith('/image')) {
        //    setIsImageCommand(true);
        //} else {
        //    setIsImageCommand(false);
        //}
        setInputValue(value);
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
          const response = await fetch(`${apiRootPath}/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: trimmedInput }),
          });
          const data = await response.json();

          if (data && data.response) {
            console.log(data.response)

            setMessages((prevMessages) => [...prevMessages, {
              type: "ai",
              content: data.response,
            }]);
          }
        } catch (error) {
          console.error('Error sending message:', error);
        } finally{
            setLoading(false)
            setInputValue(''); // Clear the input field after sending the message
        }
      }
  };
  return (
    <Container maxWidth='xl' component='div' sx={{ pl: '0', pr: '0', pb: 0, height: '100vh'}}>
        <Paper elevation={3} sx={{ overflowY: 'auto', pb: 0 }}>
            {messages.map((message, index) => (
              <>
                <ChatMessage key={index} message={message} />
              </>
            ))}
            {loading &&
                <Box sx={{ display: 'flex' }}>
                    <CircularProgress />
                </Box>
            }
            {loading && <Typography variant="body1">Loading AskGpt Response...</Typography>}
        </Paper>
        <Box sx={{ display: 'flex', marginTop: '10px', gap: '10px' }}>
            <TextField
              disabled={loading}
              fullWidth
              label="Type your message"
              variant="outlined"
              value={inputValue}

              onChange={handleInputChange}
            />
            <Button disabled={!inputValue || loading} variant="contained" color="primary" onClick={handleSendMessage}>
                <SendIcon />

            </Button>
        </Box>
    </Container>

  );
}

export default Chatbot;

const ChatMessage = ({ message }: ChatMessageProps)=> {
    const isAIMessage = message.type === 'ai';
    const senderName = isAIMessage ? 'AskGpt' : 'You';
    const avatarSrc = isAIMessage ? `/ai.webp` : `cat.webp`;

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
        {message.content.startsWith('Here is the image you requested:') ? (
          <>
              <Typography variant="body1" gutterBottom>Here is the image you requested:</Typography>
              <a href={message.content.replace('Here is the image you requested: ', '')} target="_blank" rel="noopener noreferrer">
                <Avatar   sx={{ width: 100, height: 100 }} src={message.content.replace('Here is the image you requested: ', '')} alt="Generated" />
              </a>

          </>
        ) : (
          <Typography variant="body1" gutterBottom>{message.content}</Typography>
        )}
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
