import { useEffect, useRef, useState } from 'react';
import { Avatar, Box, Container, Paper, TextField, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CircularProgress from '@mui/material/CircularProgress';
import { LoadingButton } from '@mui/lab';
import ReactMarkdown from 'react-markdown';

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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView();
    }
  }, [messages]);


  return (
    <Container maxWidth='xl' component='div' sx={{height: '90vh', minHeight: '100vh', pl: '0', pr: '0'}}>
        <Paper elevation={3} sx={{ padding: '20px', maxHeight: '90vh', overflowY: 'auto',minHeight: '85vh' }}>
            {messages.map((message, index) => (
              <>
                <ChatMessage key={index} message={message} />
              </>
            ))}
            <div ref={messagesEndRef} />

            {loading &&
                <Box sx={{ display: 'flex' }}>
                    <CircularProgress />
                    <Typography variant="body1">Loading AskGpt Response...</Typography>
                </Box>
            }

        </Paper>
        <Box sx={{ display: 'flex', marginTop: '10px', gap: '10px' }}>
            <TextField
              disabled={loading}
              fullWidth
              multiline
              label="Type your message"
              variant="outlined"
              value={inputValue}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSendMessage();
                }
              }}
              onChange={handleInputChange}
            />
            <LoadingButton loading={loading} disabled={!inputValue || loading} variant="contained" color="primary" onClick={handleSendMessage}>
                <SendIcon />

            </LoadingButton>
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
          <Typography component='div' variant="body1" gutterBottom>
              <ReactMarkdown >
                {message.content}
              </ReactMarkdown>
          </Typography>
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
