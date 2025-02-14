import React, { useState } from 'react';
import { Container, Paper, Typography, Box, ThemeProvider, CssBaseline, Stack, Button } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import FileUpload from './components/FileUpload';
import JsonEditor from './components/JsonEditor';
import Preview from './components/Preview';
import SignerRoleSelector from './components/SignerRoleSelector';
import FormCreatorSelector from './components/FormCreatorSelector';
import FormDetailsSelector from './components/FormDetailsSelector';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import './App.css';

// Revert the dark theme configuration
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00a896',
      light: '#33b9aa',
      dark: '#007a6d',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#0a1929',
      paper: 'rgba(19, 47, 76, 0.4)',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
          backdropFilter: 'blur(20px)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(20px)',
        },
      },
    },
  },
  typography: {
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
});

function App() {
  const [fields, setFields] = useState([]);
  const [sections, setSections] = useState([{
    id: 'section-0',
    title: 'Default Section',
    attributeName: 'defaultSection',
    subtitle: '',
    goTo: ''
  }]); // Initialize with default section
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedCreators, setSelectedCreators] = useState([]); // Removed default ['team.buy']
  const [formDetails, setFormDetails] = useState({
    locale: '',
    type: '',
    name: '',
    shortName: '',
    category: ''  // Add category to formDetails
  });
  const [resetFileUpload, setResetFileUpload] = useState(false);  // Add this state

  const handleFileUpload = (fields) => {
    console.log('handleFileUpload received fields:', fields);
    setFields(fields);
  };

  const handleFieldAssignment = (fieldId, sectionId) => {
    console.log('Assigning field:', fieldId, 'to section:', sectionId);
    setFields(prevFields => {
      const newFields = prevFields.map(field => {
        if (field.id === fieldId) {
          // Preserve all field properties, including metadata
          return { 
            ...field,
            sectionId,
            metadata: field.metadata  // Explicitly preserve metadata
          };
        }
        return field;
      });
      console.log('Updated fields with metadata:', newFields);
      return newFields;
    });
  };

  const handleRolesChange = (newRoles) => {
    setSelectedRoles(newRoles);
  };

  const handleCreatorsChange = (newCreators) => {
    setSelectedCreators(newCreators);
  };

  const handleFormDetailsChange = (newDetails) => {
    setFormDetails(newDetails);
  };

  const handleFieldsUpdate = (updatedFields) => {
    setFields(updatedFields);
  };

  const handleDiscard = () => {
    // Reset all state to initial values
    setFields([]);
    setSections([{
      id: 'section-0',
      title: 'Default Section',
      attributeName: 'defaultSection',
      subtitle: '',
      goTo: ''
    }]);
    setSelectedRoles([]);
    setSelectedCreators([]);
    setFormDetails({
      locale: '',
      type: '',
      name: '',
      shortName: '',
      category: ''
    });
    setResetFileUpload(prev => !prev);  // Toggle reset trigger
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', pb: 4 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 2, 
            mb: 3,
            background: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
            backdropFilter: 'blur(20px)',
            borderRadius: 0,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Container>
            <Stack direction="row" alignItems="center" spacing={2}>
              <img 
                src="/mevi-logo.svg"
                alt="Mevi Logo"
                style={{ 
                  height: '50px',
                  filter: 'drop-shadow(0 0 20px rgba(0, 168, 150, 0.3))'
                }}
              />
              <Typography 
                variant="h4"
                component="h1" 
                sx={{ 
                  color: '#fff',
                  fontWeight: 'bold',
                  textShadow: '0 0 20px rgba(0, 168, 150, 0.3)',
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                  letterSpacing: '0.02em'
                }}
              >
                Mevi Form Studio
              </Typography>
            </Stack>
          </Container>
        </Paper>

        <Container>
          <Paper
            elevation={24}
            sx={{ 
              p: 3,
              background: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box flex={1}>
                <FileUpload 
                  onUpload={handleFileUpload} 
                  resetTrigger={resetFileUpload}
                  disabled={!!fields.length}
                />
              </Box>
              {fields.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={handleDiscard}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&:hover': {
                      borderColor: 'error.main',
                      bgcolor: 'rgba(244,67,54,0.08)'
                    }
                  }}
                >
                  Discard & Start Over
                </Button>
              )}
            </Stack>
          </Paper>
          
          {fields.length === 0 && (
            <Paper
              elevation={24}
              sx={{ 
                p: 4,
                mt: 4,
                textAlign: 'center',
                background: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Fields Added Yet
              </Typography>
              <Typography color="text.secondary">
                Upload a CSV file to start building your form
              </Typography>
            </Paper>
          )}

          {fields.length > 0 && (
            <>
              <Box sx={{ mt: 4 }}>
                <FormDetailsSelector 
                  formDetails={formDetails}
                  onFormDetailsChange={handleFormDetailsChange}
                />
                <FormCreatorSelector 
                  selectedCreators={selectedCreators}
                  onCreatorsChange={handleCreatorsChange}
                />
                <SignerRoleSelector 
                  selectedRoles={selectedRoles}
                  onRolesChange={handleRolesChange}
                />
                
                <Paper 
                  elevation={24}
                  sx={{ 
                    p: 3, 
                    mb: 3,
                    background: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <JsonEditor 
                    fields={fields}
                    sections={sections}
                    setSections={setSections}
                    onFieldAssign={handleFieldAssignment}
                    onFieldsUpdate={handleFieldsUpdate}
                  />
                </Paper>
                
                <Paper 
                  elevation={24}
                  sx={{ 
                    p: 3,
                    background: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <Preview 
                    fields={fields}
                    sections={sections}
                    selectedRoles={selectedRoles}
                    selectedCreators={selectedCreators}
                    formDetails={formDetails}
                  />
                </Paper>
              </Box>
            </>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
