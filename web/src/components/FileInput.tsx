import React, { useRef } from 'react';
import { Box, Button, IconButton, TextField } from '@mui/material';
import { AttachFile } from '@mui/icons-material';

interface FileInputProps {
  label: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  acceptedFileTypes?: string;
}

const FileInput: React.FC<FileInputProps> = ({ label, onChange, acceptedFileTypes }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <Box
      onClick={handleButtonClick}
      sx={{cursor: 'pointer'}}
    >
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
      />
      <TextField
        label={label}
        fullWidth
        InputProps={{
          startAdornment: (
            <IconButton >
              <AttachFile />
            </IconButton>
          ),
          readOnly: true
        }}
      />
    </Box>
  );
};

export default FileInput;
