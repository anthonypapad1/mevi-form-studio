import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import Papa from 'papaparse';

const FileUpload = ({ onUpload, resetTrigger, disabled }) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFile(null);
  }, [resetTrigger]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          const transformedData = results.data.slice(1).map(row => ({
            field: row[0]?.trim(),
            fieldType: row[1]?.trim(),
            placeholder: row[2]?.trim()
          }));

          console.log('Transformed data:', transformedData);
          onUpload(transformedData);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        }
      });
    }
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        accept=".csv"
        style={{ display: 'none' }}
        id="raised-button-file"
        type="file"
        onChange={handleFileChange}
        disabled={disabled}
      />
      <Stack direction="row" alignItems="center" spacing={2}>
        <label htmlFor="raised-button-file">
          <Button 
            variant="contained" 
            component="span"
            disabled={disabled}
            sx={{
              bgcolor: disabled ? 'action.disabledBackground' : 'primary.main',
              '&:hover': {
                bgcolor: disabled ? 'action.disabledBackground' : 'primary.dark'
              }
            }}
          >
            {disabled ? 'CSV File Loaded' : 'Choose CSV File'}
          </Button>
        </label>
        <Typography 
          variant="caption" 
          sx={{ 
            color: disabled ? 'text.disabled' : 'text.secondary'
          }}
        >
          {disabled 
            ? 'Click "Discard & Start Over" to upload a new CSV file'
            : 'Upload a CSV file with columns: field, fieldType, placeholder'
          }
        </Typography>
      </Stack>
    </Box>
  );
};

export default FileUpload; 