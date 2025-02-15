import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Typography, 
  IconButton, 
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  Portal,
  FormControlLabel,
  Checkbox,
  Paper,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Badge from '@mui/material/Badge';

// Add this style to prevent text selection
const noSelectStyle = {
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none',
  KhtmlUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  userSelect: 'none',
};

const FieldInfoTooltip = ({ children }) => (
  <Tooltip
    title={
      <Box sx={{ p: 1 }}>
        <Typography variant="subtitle2" gutterBottom>Field Information</Typography>
        <Typography variant="body2">• Label: The display name of the field</Typography>
        <Typography variant="body2">• Placeholder: Helper text shown in the form</Typography>
        <Typography variant="body2">• Type: The input type (e.g., text, date)</Typography>
        <Typography variant="body2">• Attribute: Unique identifier for the field</Typography>
      </Box>
    }
    arrow
    placement="top"
  >
    {children}
  </Tooltip>
);

const JsonEditor = ({ fields, sections, setSections, onFieldAssign, onFieldsUpdate }) => {
  // Add state for drag position
  const [dragPosition, setDragPosition] = React.useState({ x: 0, y: 0 });
  const [editingField, setEditingField] = useState(null);

  // Add state for managing options
  const [editingOptions, setEditingOptions] = useState([]);

  // Add new state
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [newField, setNewField] = useState({
    label: '',
    type: 'input',
    attributeName: '',
    placeholder: '',
    metadata: null
  });

  // Add state for managing new field options
  const [newFieldOptions, setNewFieldOptions] = useState([]);

  // Add field type options
  const FIELD_TYPES = [
    'input',
    'datetime',
    'currency',
    'textarea',
    'checkbox',
    'checkboxWithOther',
    'radio',
    'radioWithOther',
    'decision',
    'inlineInput'
  ];

  // Add mouse move handler
  React.useEffect(() => {
    const handleMouseMove = (e) => {
      setDragPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const unassignedFields = fields.filter(field => !field.sectionId);

  const handleAddSection = () => {
    const newSectionId = `section-${sections.length}`;
    setSections([...sections, {
      id: newSectionId,
      title: `New Section ${sections.length + 1}`,
      attributeName: `section${sections.length + 1}`,
      subtitle: '',
      goTo: '',
    }]);
  };

  const handleRemoveSection = (sectionId) => {
    fields.forEach(field => {
      if (field.sectionId === sectionId) {
        onFieldAssign(field.id, null);
      }
    });
    setSections(sections.filter(section => section.id !== sectionId));
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    // Skip if dropped in the same spot
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Find the field being dragged
    const draggedField = fields.find(f => f.id === draggableId);
    if (!draggedField) {
      return;
    }

    console.log('Moving field with metadata:', {
      field: draggedField,
      metadata: draggedField.metadata,
      from: source.droppableId,
      to: destination.droppableId
    });

    // If dropping into a section
    if (destination.droppableId.startsWith('section-')) {
      onFieldAssign(draggableId, destination.droppableId);
    }
    // If dropping back to unassigned
    else if (destination.droppableId === 'unassigned') {
      onFieldAssign(draggableId, null);
    }
  };

  const handleFieldEdit = (field) => {
    setEditingField({ ...field });
    // Initialize options editing state
    setEditingOptions(field.metadata?.options || []);
  };

  const handleSaveEdit = () => {
    if (editingField) {
      const updatedField = {
        ...editingField,
        // Remove field-level goTo for decision fields
        ...(editingField.type === 'decision' && editingField.goTo && { goTo: undefined }),
        metadata: {
          ...editingField.metadata,
          options: editingOptions.map(option => ({
            ...option,
            // Ensure goTo is included for decision field options
            ...(editingField.type === 'decision' && { goTo: option.goTo || null })
          }))
        }
      };

      const updatedFields = fields.map(field => 
        field.id === updatedField.id ? updatedField : field
      );
      onFieldsUpdate(updatedFields);
      setEditingField(null);
      setEditingOptions([]);
    }
  };

  // Add option management functions
  const handleAddOption = () => {
    setEditingOptions([
      ...editingOptions,
      { value: '', text: '', goTo: null }
    ]);
  };

  const handleRemoveOption = (index) => {
    setEditingOptions(editingOptions.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index, property, value) => {
    const updatedOptions = [...editingOptions];
    updatedOptions[index] = {
      ...updatedOptions[index],
      [property]: value
    };
    setEditingOptions(updatedOptions);
  };

  // Add handler for creating new field
  const handleCreateField = () => {
    const fieldId = `field-${Date.now()}`;
    const createdField = {
      id: fieldId,
      ...newField,
      order: fields.length + 1,
      constraint: null,
      constraintId: null,
      info: null,
      hint: null,
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
      metadata: newField.type === 'inlineInput' 
        ? {
            content: [{
              attributeName: '',
              placeholder: '',
              postLabel: '',
              preLabel: '',
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
        : ['checkbox', 'checkboxWithOther', 'radio', 'radioWithOther', 'decision'].includes(newField.type)
          ? { options: newFieldOptions }
          : null,
      sectionId: null
    };

    onFieldsUpdate([...fields, createdField]);
    setCreateDialogOpen(false);
    // Reset form
    setNewField({
      label: '',
      type: 'input',
      attributeName: '',
      placeholder: '',
      metadata: null
    });
    setNewFieldOptions([]); // Reset options
  };

  // Add option management functions for new field
  const handleAddNewOption = () => {
    setNewFieldOptions([
      ...newFieldOptions,
      { value: '', text: '', goTo: null }
    ]);
  };

  const handleRemoveNewOption = (index) => {
    setNewFieldOptions(newFieldOptions.filter((_, i) => i !== index));
  };

  const handleNewOptionChange = (index, field, value) => {
    const newOptions = [...newFieldOptions];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setNewFieldOptions(newOptions);
  };

  // Helper function to get available sections for goTo
  const getAvailableSections = (currentSectionId = null) => {
    return sections
      .filter(section => section.id !== currentSectionId) // Exclude current section
      .map(section => ({
        value: section.attributeName,
        label: section.title,
      }));
  };

  // Modify the option rendering for both edit and create dialogs
  const renderOptionFields = (option, index, isEditing = false, fieldType, sectionId = null) => {
    const handleChange = isEditing ? handleOptionChange : handleNewOptionChange;
    
    return (
      <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <TextField
          label="Value"
          value={option.value}
          onChange={(e) => handleChange(index, 'value', e.target.value)}
          size="small"
          sx={{ minWidth: 120 }}
        />
        <TextField
          label="Text"
          value={option.text}
          onChange={(e) => handleChange(index, 'text', e.target.value)}
          size="small"
          sx={{ minWidth: 120 }}
        />
        {fieldType === 'decision' && (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Go To Section</InputLabel>
            <Select
              value={option.goTo || ''}
              onChange={(e) => handleChange(index, 'goTo', e.target.value)}
              label="Go To Section"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {getAvailableSections(sectionId).map((section) => (
                <MenuItem key={section.value} value={section.value}>
                  {section.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        <IconButton 
          onClick={() => isEditing ? handleRemoveOption(index) : handleRemoveNewOption(index)}
          color="error"
          size="small"
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    );
  };

  // Update the Edit Dialog content
  const renderEditDialog = () => {
    if (!editingField) return null;

    const isOptionType = ['checkbox', 'checkboxWithOther', 'radio', 'radioWithOther', 'decision'].includes(editingField.type);

    return (
      <Dialog open={!!editingField} onClose={() => setEditingField(null)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Field</DialogTitle>
        <DialogContent>
          {/* Basic properties for non-inlineInput fields */}
          {editingField.type !== 'inlineInput' && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 500 }}>
                Basic Properties
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Label"
                  value={editingField.label || ''}
                  onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                  sx={{ flexGrow: 1 }}
                />
                <TextField
                  label="Placeholder"
                  value={editingField.placeholder || ''}
                  onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
                  sx={{ flexGrow: 1 }}
                />
                <TextField
                  label="Attribute Name"
                  value={editingField.attributeName || ''}
                  onChange={(e) => setEditingField({ ...editingField, attributeName: e.target.value })}
                  sx={{ flexGrow: 1 }}
                />
              </Box>
            </Box>
          )}

          {/* InlineInput specific fields */}
          {editingField.type === 'inlineInput' && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" color="primary" gutterBottom>
                Inline Input Properties
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Attribute Name"
                  value={editingField.metadata?.content[0]?.attributeName || ''}
                  onChange={(e) => {
                    const updatedField = {
                      ...editingField,
                      metadata: {
                        ...editingField.metadata,
                        content: [{
                          ...editingField.metadata.content[0],
                          attributeName: e.target.value
                        }]
                      }
                    };
                    setEditingField(updatedField);
                  }}
                  fullWidth
                />
                <TextField
                  label="Pre Label"
                  value={editingField.metadata?.content[0]?.preLabel || ''}
                  onChange={(e) => {
                    const updatedField = {
                      ...editingField,
                      metadata: {
                        ...editingField.metadata,
                        content: [{
                          ...editingField.metadata.content[0],
                          preLabel: e.target.value
                        }]
                      }
                    };
                    setEditingField(updatedField);
                  }}
                  fullWidth
                  multiline
                />
                <TextField
                  label="Post Label"
                  value={editingField.metadata?.content[0]?.postLabel || ''}
                  onChange={(e) => {
                    const updatedField = {
                      ...editingField,
                      metadata: {
                        ...editingField.metadata,
                        content: [{
                          ...editingField.metadata.content[0],
                          postLabel: e.target.value
                        }]
                      }
                    };
                    setEditingField(updatedField);
                  }}
                  fullWidth
                  multiline
                />
                <TextField
                  label="Width"
                  value={editingField.metadata?.content[0]?.width || ''}
                  onChange={(e) => {
                    const updatedField = {
                      ...editingField,
                      metadata: {
                        ...editingField.metadata,
                        content: [{
                          ...editingField.metadata.content[0],
                          width: e.target.value
                        }]
                      }
                    };
                    setEditingField(updatedField);
                  }}
                  placeholder="e.g., 100px"
                  fullWidth
                />

                {/* Preview Section */}
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: 'background.paper', 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Preview
                  </Typography>
                  <Typography sx={{ 
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    color: 'text.primary',
                    '& .inline-input': {
                      color: 'primary.main',
                      fontWeight: 'medium',
                      bgcolor: 'action.hover',
                      px: 0.5,
                      py: 0.25,
                      borderRadius: 0.5
                    }
                  }}>
                    {editingField.metadata?.content[0]?.preLabel || ''}
                    <span className="inline-input">
                      {`{{${editingField.metadata?.content[0]?.attributeName || ''}}}`}
                    </span>
                    {editingField.metadata?.content[0]?.postLabel || ''}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Options Section - Only show for option type fields */}
          {isOptionType && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Options
              </Typography>
              {editingOptions.map((option, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  {/* Existing option fields */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      label="Value"
                      value={option.value}
                      onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                      size="small"
                      sx={{ flexGrow: 1 }}
                    />
                    <TextField
                      label="Text"
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                      size="small"
                      sx={{ flexGrow: 1 }}
                    />
                  </Box>

                  {/* Add Go To section for decision field options */}
                  {editingField.type === 'decision' && (
                    <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                      <InputLabel>Go To Section</InputLabel>
                      <Select
                        value={option.goTo || ''}
                        onChange={(e) => handleOptionChange(index, 'goTo', e.target.value)}
                        label="Go To Section"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {sections.map((section) => (
                          <MenuItem key={section.id} value={section.attributeName}>
                            {section.title} ({section.attributeName})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {/* Summary controls */}
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <InputLabel>Deal Summary</InputLabel>
                      <Select
                        value={option.dealSummary === undefined ? 'exclude' : (option.dealSummary ? 'show' : 'hide')}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleOptionChange(index, 'dealSummary', 
                            value === 'exclude' ? undefined : value === 'show'
                          );
                        }}
                        label="Deal Summary"
                      >
                        <MenuItem value="exclude">Do not include</MenuItem>
                        <MenuItem value="hide">Include (Hidden)</MenuItem>
                        <MenuItem value="show">Include (Shown)</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <InputLabel>Form Summary</InputLabel>
                      <Select
                        value={option.formSummary === undefined ? 'exclude' : (option.formSummary ? 'show' : 'hide')}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleOptionChange(index, 'formSummary', 
                            value === 'exclude' ? undefined : value === 'show'
                          );
                        }}
                        label="Form Summary"
                      >
                        <MenuItem value="exclude">Do not include</MenuItem>
                        <MenuItem value="hide">Include (Hidden)</MenuItem>
                        <MenuItem value="show">Include (Shown)</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={option.formUpload || false}
                          onChange={(e) => handleOptionChange(index, 'formUpload', e.target.checked)}
                        />
                      }
                      label="Include in Upload"
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingField(null)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Update the Create Dialog content
  const renderCreateDialog = () => (
    <Dialog
      open={isCreateDialogOpen}
      onClose={() => {
        setCreateDialogOpen(false);
        setNewFieldOptions([]);
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Create New Field</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="Label"
            value={newField.label}
            onChange={(e) => setNewField({ ...newField, label: e.target.value })}
            fullWidth
            required
          />
          <TextField
            select
            label="Field Type"
            value={newField.type}
            onChange={(e) => {
              const type = e.target.value;
              setNewField({ 
                ...newField, 
                type,
                metadata: ['checkbox', 'checkboxWithOther', 'radio', 'radioWithOther', 'decision'].includes(type)
                  ? { options: [] }
                  : null
              });
              // Reset options when changing type
              if (!['checkbox', 'checkboxWithOther', 'radio', 'radioWithOther', 'decision'].includes(type)) {
                setNewFieldOptions([]);
              }
            }}
            fullWidth
            required
          >
            {FIELD_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Attribute Name"
            value={newField.attributeName}
            onChange={(e) => setNewField({ 
              ...newField, 
              attributeName: e.target.value.toLowerCase().replace(/\s+/g, '')
            })}
            fullWidth
            required
            helperText="Unique identifier for the field (no spaces)"
          />
          <TextField
            label="Placeholder"
            value={newField.placeholder}
            onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
            fullWidth
          />

          {/* Options section for parent fields */}
          {['checkbox', 'checkboxWithOther', 'radio', 'radioWithOther', 'decision'].includes(newField.type) && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Options
              </Typography>
              <Stack spacing={2}>
                {newFieldOptions.map((option, index) => 
                  renderOptionFields(option, index, false, newField.type)
                )}
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddNewOption}
                  variant="outlined"
                >
                  Add Option
                </Button>
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {
          setCreateDialogOpen(false);
          setNewFieldOptions([]);
        }}>
          Cancel
        </Button>
        <Button 
          onClick={handleCreateField}
          variant="contained"
          disabled={
            !newField.label || 
            !newField.type || 
            !newField.attributeName ||
            (['checkbox', 'checkboxWithOther', 'radio', 'radioWithOther', 'decision'].includes(newField.type) && 
             newFieldOptions.length === 0)
          }
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Add this function to handle field property changes
  const handleFieldPropertyChange = (fieldId, property, value) => {
    const updatedFields = fields.map(field => {
      if (field.id === fieldId) {
        // For Deal Summary and Form Summary, handle the display property
        if (property === 'dealSummary' || property === 'formSummary') {
          if (value === undefined) {
            // "Do not include" - remove from summary
            const { [property]: _, ...rest } = field;
            return rest;
          } else {
            // Include in summary with display value
            return {
              ...field,
              [property]: value // true for "Shown", false for "Hidden"
            };
          }
        }
        
        // For other properties (like formUpload), just set the value
        return {
          ...field,
          [property]: value
        };
      }
      return field;
    });
    onFieldsUpdate(updatedFields);
  };

  const renderFieldContent = (field, isInSection) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', py: 0.5 }}>
      <DragIndicatorIcon sx={{ mr: 1.5, mt: 0.5, opacity: 0.4 }} />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        {/* Top row - Label and edit button */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'space-between',
          gap: 2,
          mb: 1
        }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 500,
              color: 'common.white',
              lineHeight: 1.3,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-word',
              minWidth: 0,
              flexGrow: 1,
              mt: -0.5
            }}
          >
            {field.type === 'inlineInput' 
              ? field.metadata?.content[0]?.attributeName || 'Unnamed Field'
              : field.label || 'Unnamed Field'}
          </Typography>
          <IconButton 
            onClick={() => handleFieldEdit(field)}
            size="small"
            sx={{ 
              color: 'primary.main',
              opacity: 0.7,
              '&:hover': {
                opacity: 1,
                bgcolor: 'rgba(0, 168, 150, 0.1)'
              }
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Field info row */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mb: isInSection && field.type === 'inlineInput' ? 2 : 0  // Add margin if preview will show
        }}>
          <Chip
            label={field.type}
            size="small"
            sx={{ 
              height: 20,
              fontSize: '0.75rem',
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              color: 'common.white',
              '& .MuiChip-label': {
                px: 1,
                fontWeight: 400
              }
            }}
          />
          <Typography 
            variant="caption" 
            sx={{ 
              opacity: 0.7,
              color: 'common.white',
              fontSize: '0.75rem',
              flexGrow: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {field.attributeName || 'No attribute name'}
          </Typography>
        </Box>

        {/* Preview for inlineInput fields when in section */}
        {isInSection && field.type === 'inlineInput' && (
          <Box sx={{ 
            mt: 2,
            pt: 2,
            pr: 2,
            borderTop: '1px solid',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            width: '100%'
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap'
              }}
            >
              {field.metadata?.content[0]?.preLabel || ''}
              <span style={{ 
                color: '#00a896',
                backgroundColor: 'rgba(0, 168, 150, 0.1)',
                padding: '2px 4px',
                borderRadius: '4px',
                margin: '0 4px',
                display: 'inline-block',
                wordBreak: 'keep-all'
              }}>
                {`{{${field.metadata?.content[0]?.attributeName || ''}}}`}
              </span>
              {field.metadata?.content[0]?.postLabel || ''}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  const handleFieldUpdate = (fieldId, updatedField) => {
    const newFields = fields.map(field => 
      field.id === fieldId ? updatedField : field
    );
    onFieldsUpdate(newFields);
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title="Form Structure"
          subheader="Configure form sections and fields"
          sx={noSelectStyle}
        />
        <Divider />
        <CardContent sx={noSelectStyle}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Organize your form fields into sections
            </Typography>
            <Button 
              startIcon={<AddIcon />} 
              variant="contained" 
              onClick={handleAddSection}
            >
              Add Section
            </Button>
          </Box>
        </CardContent>
      </Card>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={3}>
          {/* Left Column - Available Fields */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader 
                title={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h6">Available Fields</Typography>
                    <Tooltip 
                      title="Drag these fields into sections on the right to organize your form"
                      arrow
                    >
                      <InfoIcon fontSize="small" sx={{ opacity: 0.7 }} />
                    </Tooltip>
                  </Stack>
                }
                action={
                  <Button
                    startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                    onClick={() => setCreateDialogOpen(true)}
                    variant="outlined"
                    size="small"
                    sx={{
                      py: 0.3,
                      px: 1,
                      minHeight: 0,
                      fontSize: '0.75rem',
                      lineHeight: 1.5,
                      height: 24,
                      mt: 0.5,
                    }}
                  >
                    Create Field
                  </Button>
                }
                subheader="Drag fields to sections →"
              />
              <Divider />
              <CardContent>
                <Droppable droppableId="unassigned">
                  {(provided, snapshot) => (
                    <List
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        minHeight: 100,
                        bgcolor: snapshot.isDraggingOver ? 'rgba(0, 168, 150, 0.1)' : 'transparent',
                        border: '1px dashed',
                        borderColor: snapshot.isDraggingOver ? '#00a896' : 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 1,
                        p: 1
                      }}
                    >
                      {unassignedFields.map((field, index) => (
                        <Draggable
                          key={field.id}
                          draggableId={field.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <>
                              <ListItem
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{
                                  ...noSelectStyle,
                                  bgcolor: snapshot.isDragging ? 'primary.dark' : 'background.paper',
                                  mb: 1,
                                  borderRadius: 1,
                                  border: '1px solid',
                                  borderColor: snapshot.isDragging ? '#00a896' : 'rgba(255, 255, 255, 0.1)',
                                  cursor: 'grab',
                                  '&:hover': {
                                    bgcolor: 'rgba(0, 168, 150, 0.1)',
                                  }
                                }}
                              >
                                {renderFieldContent(field, false)}
                              </ListItem>
                              {snapshot.isDragging && (
                                <Portal>
                                  <ListItem
                                    sx={{
                                      ...noSelectStyle,
                                      position: 'fixed',
                                      top: dragPosition.y,
                                      left: dragPosition.x,
                                      transform: 'translate(-50%, -50%)',  // Center on cursor
                                      width: 'auto',
                                      maxWidth: '400px',
                                      bgcolor: 'primary.dark',
                                      borderRadius: 1,
                                      border: '1px solid',
                                      borderColor: '#00a896',
                                      zIndex: 9999,
                                      boxShadow: '0 5px 10px rgba(0,0,0,0.2)',
                                      pointerEvents: 'none',
                                      opacity: 0.9,
                                    }}
                                  >
                                    {renderFieldContent(field, false)}
                                  </ListItem>
                                </Portal>
                              )}
                            </>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </List>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Sections */}
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              {sections.map((section, index) => (
                <Card key={section.id}>
                  <CardHeader
                    action={
                      <IconButton 
                        onClick={() => handleRemoveSection(section.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                    title={
                      <Box display="flex" gap={2}>
                        <TextField
                          label="Section Title"
                          value={section.title}
                          onChange={(e) => {
                            const newSections = [...sections];
                            newSections[index] = { ...section, title: e.target.value };
                            setSections(newSections);
                          }}
                          variant="standard"
                        />
                        <TextField
                          label="Attribute Name"
                          value={section.attributeName}
                          onChange={(e) => {
                            const newSections = [...sections];
                            newSections[index] = { 
                              ...section, 
                              attributeName: e.target.value.toLowerCase().replace(/\s+/g, '')
                            };
                            setSections(newSections);
                          }}
                          variant="standard"
                          helperText="Used for navigation between sections"
                        />
                      </Box>
                    }
                  />
                  <CardContent>
                    <Box display="flex" gap={2} mb={2}>
                      <TextField
                        label="Subtitle"
                        value={section.subtitle}
                        onChange={(e) => {
                          const newSections = [...sections];
                          newSections[index] = { ...section, subtitle: e.target.value };
                          setSections(newSections);
                        }}
                        fullWidth
                      />
                      <TextField
                        label="Go To"
                        value={section.goTo}
                        onChange={(e) => {
                          const newSections = [...sections];
                          newSections[index] = { ...section, goTo: e.target.value };
                          setSections(newSections);
                        }}
                        fullWidth
                        helperText="Enter the attribute name of the target section"
                      />
                    </Box>
                    <Divider />
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        Section Fields (Drop Here ↓)
                      </Typography>
                      <Droppable droppableId={section.id}>
                        {(provided, snapshot) => (
                          <List
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            sx={{
                              minHeight: 100,
                              bgcolor: snapshot.isDraggingOver ? 'rgba(0, 168, 150, 0.1)' : 'transparent',
                              border: '1px dashed',
                              borderColor: snapshot.isDraggingOver ? '#00a896' : 'rgba(255, 255, 255, 0.1)',
                              borderRadius: 1,
                              p: 1
                            }}
                          >
                            {fields
                              .filter(field => field.sectionId === section.id)
                              .map((field, index) => (
                                <Draggable
                                  key={field.id}
                                  draggableId={field.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => (
                                    <>
                                      <ListItem
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        sx={{
                                          ...noSelectStyle,
                                          bgcolor: snapshot.isDragging ? 'primary.dark' : 'background.paper',
                                          mb: 1,
                                          borderRadius: 1,
                                          border: '1px solid',
                                          borderColor: snapshot.isDragging ? '#00a896' : 'rgba(255, 255, 255, 0.1)',
                                          cursor: 'grab',
                                          '&:hover': {
                                            bgcolor: 'rgba(0, 168, 150, 0.1)',
                                          }
                                        }}
                                      >
                                        {renderFieldContent(field, true)}
                                      </ListItem>
                                      {snapshot.isDragging && (
                                        <Portal>
                                          <ListItem
                                            sx={{
                                              ...noSelectStyle,
                                              position: 'fixed',
                                              top: dragPosition.y,
                                              left: dragPosition.x,
                                              transform: 'translate(-50%, -50%)',  // Center on cursor
                                              width: 'auto',
                                              maxWidth: '400px',
                                              bgcolor: 'primary.dark',
                                              borderRadius: 1,
                                              border: '1px solid',
                                              borderColor: '#00a896',
                                              zIndex: 9999,
                                              boxShadow: '0 5px 10px rgba(0,0,0,0.2)',
                                              pointerEvents: 'none',
                                              opacity: 0.9,
                                            }}
                                          >
                                            {renderFieldContent(field, true)}
                                          </ListItem>
                                        </Portal>
                                      )}
                                    </>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                          </List>
                        )}
                      </Droppable>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </DragDropContext>

      {renderEditDialog()}
      {renderCreateDialog()}
    </Box>
  );
};

export default JsonEditor; 