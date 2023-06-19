import React, { useRef } from 'react';
import { Box, Button, IconButton, TextField } from '@mui/material';
import { AttachFile } from '@mui/icons-material';

interface FileInputProps {
  label: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  acceptedFileTypes?: string;
  fileName ?:string;
}

const FileInput: React.FC<FileInputProps> = ({ label, onChange, acceptedFileTypes, fileName }) => {
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
        max={1}
      />
      <TextField
        label={label}
        fullWidth
        value={fileName}
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
