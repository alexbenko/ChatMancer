import { TextField, Button, Typography, Box } from '@mui/material';
import { ChangeEvent, FormEvent, ReactNode, useState } from 'react';
interface PasswordProtectedProps {
  children: ReactNode;
}
const isProduction = import.meta.env.MODE === 'production'
const apiRootPath = isProduction ? '' : '/api';
function PasswordProtected({ children }: PasswordProtectedProps) {
  const [password, setPassword] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch(apiRootPath + '/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        const { message } = await response.json();
        setError(message);
      }
    } catch (error) {
      setError('An error occurred while verifying the password.');
    }
  };

  if (isAuthenticated) {
    return children;
  }

  return (
    <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          minHeight: '100vh',
          margin: '0 auto',
          justifyContent: 'center', // Vertically aligns the form to the center
          alignItems: 'center', // Horizontally aligns the form to the center
        }}
    >
      <TextField

        type="password"
        value={password}
        onChange={handlePasswordChange}
        label="Password"
      />
      <Button type="submit">Submit</Button>
      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
}

export default PasswordProtected;
