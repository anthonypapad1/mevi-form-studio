import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import Papa from 'papaparse';

const VALID_FIELD_TYPES = [
  'input',
  'datetime',
  'currency',
  'textarea',
  'checkbox',
  'checkboxWithOther',
  'radio',
  'radioWithOther',
  'decision',
  'data',
  'dataWithInput',
  'inlineInput'
];

const FileUpload = ({ onUpload, resetTrigger, disabled }) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFile(null);
  }, [resetTrigger]);

  const processCSV = (results) => {
    const { data } = results;
    console.log('Starting processCSV with data:', data);
    
    const fields = [];
    let currentParentField = null;
    let order = 1;

    data.forEach((row, index) => {
      if (!row.Field || !row.fieldType) {
        console.log('Skipping empty row:', row);
        return;
      }

      const fieldType = row.fieldType === 'dateTime' ? 'datetime' : row.fieldType;

      if (!VALID_FIELD_TYPES.includes(fieldType)) {
        console.error(`Invalid field type at row ${index + 1}: ${fieldType}`);
        return;
      }

      if (fieldType === 'data' || fieldType === 'dataWithInput') {
        if (!currentParentField) {
          console.error(`Orphaned data field at row ${index + 1}: ${row.Field}`);
          return;
        }

        // Create option object matching the JSON Example structure
        const option = {
          value: row.Field,
          text: row.Label
        };

        // Add goTo for decision fields
        if (currentParentField.type === 'decision') {
          option.goTo = null;
        }

        // Initialize metadata if not exists
        if (!currentParentField.metadata) {
          currentParentField.metadata = { options: [] };
        }

        // Add option to parent field's metadata
        currentParentField.metadata.options.push(option);
        console.log(`Added option to ${currentParentField.type}:`, option);
        console.log('Current parent field metadata:', currentParentField.metadata);

        // Handle dataWithInput for "Other" fields
        if (fieldType === 'dataWithInput') {
          const otherInput = {
            attributeName: row.Field,
            placeholder: row.Placeholder || 'details...',
            validation: {
              min: null,
              max: null,
              minLength: null,
              maxLength: null,
              patterns: null,
              required: true
            },
            validationErrorMessage: 'Required',
            value: null
          };

          if (currentParentField.type === 'checkboxWithOther') {
            currentParentField.metadata.other = {
              checkbox: {
                text: row.Label,
                value: row.Field.replace('Input', '')
              },
              input: otherInput
            };
          } else if (currentParentField.type === 'radioWithOther') {
            currentParentField.metadata.other = {
              radio: {
                text: row.Label,
                value: row.Field.replace('Input', '')
              },
              input: otherInput
            };
          }
        }
      } else {
        // Create new parent field
        const newField = {
          id: `field-${row.Field}`,
          order: order++,
          type: fieldType,
          constraint: null,
          constraintId: null,
          placeholder: row.Placeholder || null,
          info: null,
          hint: null,
          label: row.Label || null,
          attributeName: row.Field,
          eventTrigger: null,
          value: null,
          validation: {
            min: null,
            max: null,
            minLength: null,
            maxLength: null,
            patterns: null,
            required: true
          },
          validationErrorMessage: 'Required',
          metadata: fieldType === 'inlineInput'
            ? {
                content: [{
                  attributeName: row.Field,
                  placeholder: row.Placeholder || '',
                  preLabel: '',  // Will be set in edit mode
                  postLabel: '', // Will be set in edit mode
                  validation: {
                    min: null,
                    max: null,
                    minLength: null,
                    maxLength: null,
                    patterns: null,
                    required: null
                  },
                  validationErrorMessage: null,
                  value: null,
                  width: '100px'
                }]
              }
            : (fieldType === 'radio' || 
               fieldType === 'checkbox' || 
               fieldType === 'checkboxWithOther' || 
               fieldType === 'radioWithOther' || 
               fieldType === 'decision'
              ? { options: [] }
              : null),
          sectionId: null
        };

        console.log('Creating new field with type:', fieldType);
        console.log('Initial metadata:', newField.metadata);
        fields.push(newField);
        
        // Set as current parent if it's a field that can have options
        if (['checkbox', 'checkboxWithOther', 'radio', 'radioWithOther', 'decision'].includes(fieldType)) {
          currentParentField = newField;
          console.log('Set as current parent field:', currentParentField);
        } else {
          currentParentField = null;
        }
      }
    });

    console.log('Final processed fields:', fields);
    onUpload(fields);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: (results) => {
          console.log('Raw Papa Parse results:', results);
          
          const cleanData = results.data
            .filter(row => row.Field && row.fieldType)
            .filter(row => row.Field !== 'exampleJSON');

          console.log('Clean data before processing:', cleanData);
          processCSV({ data: cleanData });
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