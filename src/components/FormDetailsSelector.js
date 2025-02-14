import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  MenuItem,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemIcon,
  IconButton,
  Stack,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { STATE_NUMBERS, generateUniqueId, formatFormId } from '../utils/formIdUtils';

// Add no-select style
const noSelectStyle = {
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none',
  KhtmlUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  userSelect: 'none',
};

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const PREDEFINED_CATEGORIES = [
  'salesContract',
  'clientRelationshipAgreements',
  'addendaToContract',
  'disclosures',
  'closing',
  'notices',
  'earnestMoney',
  'other'
];

// Function to load categories from localStorage
const loadSavedCategories = () => {
  const savedCategories = localStorage.getItem('customCategories');
  if (savedCategories) {
    try {
      const parsed = JSON.parse(savedCategories);
      return [...PREDEFINED_CATEGORIES, ...parsed];
    } catch (e) {
      console.error('Error loading saved categories:', e);
      return PREDEFINED_CATEGORIES;
    }
  }
  return PREDEFINED_CATEGORIES;
};

const FormDetailsSelector = ({ formDetails, onFormDetailsChange }) => {
  const [openNewCategory, setOpenNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [categories, setCategories] = useState(loadSavedCategories);

  useEffect(() => {
    // Update form ID when state changes (keep this for backend reference)
    if (formDetails.locale) {
      const stateNumber = STATE_NUMBERS[formDetails.locale] || '0000';
      const newFormId = formatFormId(stateNumber);
      onFormDetailsChange({
        ...formDetails,
        formId: newFormId
      });
    }
  }, [formDetails.locale]);

  // Function to save custom categories
  const saveCategories = (updatedCategories) => {
    const customCategories = updatedCategories.filter(
      cat => !PREDEFINED_CATEGORIES.includes(cat)
    );
    localStorage.setItem('customCategories', JSON.stringify(customCategories));
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    if (field === 'category' && value === 'new') {
      setOpenNewCategory(true);
      return;  // Don't update formDetails yet
    }
    onFormDetailsChange({
      ...formDetails,
      [field]: value
    });
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      const categoryValue = newCategory.trim();
      setCategories(prev => {
        const updated = [...prev, categoryValue];
        saveCategories(updated);
        return updated;
      });
      onFormDetailsChange({
        ...formDetails,
        category: categoryValue
      });
      setNewCategory('');
      setOpenNewCategory(false);
    }
  };

  const handleDeleteCategory = (categoryToDelete) => {
    // Update categories list
    setCategories(prev => {
      const updated = prev.filter(cat => cat !== categoryToDelete);
      saveCategories(updated);
      return updated;
    });

    // If the deleted category was selected, reset the form details category
    if (formDetails.category === categoryToDelete) {
      onFormDetailsChange({
        ...formDetails,
        category: ''
      });
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader 
        title="Form Details"
        subheader="Configure form metadata"
        sx={noSelectStyle}
      />
      <Divider />
      <CardContent sx={{ 
        ...noSelectStyle,
        px: 3,  // Add horizontal padding
        pb: 3   // Add bottom padding
      }}>
        <Stack spacing={3}>
          <Grid 
            container 
            spacing={3}
            sx={{ 
              width: '100%',
              mx: 'auto'  // Center the grid
            }}
          >
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="State/Locale"
                value={formDetails.locale || ''}
                onChange={handleChange('locale')}
                helperText="Select the state for this form"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {US_STATES.map((state) => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Form Type"
                value={formDetails.type || ''}
                onChange={handleChange('type')}
                helperText="Enter the type of form"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Form Name"
                value={formDetails.name || ''}
                onChange={handleChange('name')}
                helperText="Enter the full name of the form"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Short Name"
                value={formDetails.shortName || ''}
                onChange={handleChange('shortName')}
                helperText="Enter a short name for the form"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Category"
                value={formDetails.category || ''}
                onChange={handleChange('category')}
                helperText="Select or add a new category"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem 
                    key={category} 
                    value={category}
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{category}</span>
                    {!PREDEFINED_CATEGORIES.includes(category) && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteCategory(category);
                        }}
                        sx={{ 
                          ml: 1,
                          opacity: 0.7,
                          '&:hover': { opacity: 1 }
                        }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    )}
                  </MenuItem>
                ))}
                <MenuItem 
                  value="new"
                  sx={{
                    borderTop: 1,
                    borderColor: 'divider',
                    mt: 1,
                    color: 'primary.main'
                  }}
                >
                  <AddIcon sx={{ mr: 1 }} /> Add New Category
                </MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Stack>
      </CardContent>

      <Dialog 
        open={openNewCategory} 
        onClose={() => {
          setOpenNewCategory(false);
          setNewCategory('');
        }}
      >
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            variant="outlined"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddCategory();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenNewCategory(false);
            setNewCategory('');
          }}>
            Cancel
          </Button>
          <Button onClick={handleAddCategory} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default FormDetailsSelector; 