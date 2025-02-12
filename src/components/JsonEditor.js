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
    
    // Log the drag operation
    console.log('Drag operation:', {
      draggableId,
      source,
      destination
    });

    if (!destination) {
      console.log('No valid destination');
      return;
    }

    // Skip if dropped in the same spot
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      console.log('Dropped in same location');
      return;
    }

    // Find the field being dragged
    const draggedField = fields.find(f => f.id === draggableId);
    if (!draggedField) {
      console.log('Field not found:', draggableId);
      return;
    }

    console.log('Moving field:', {
      field: draggedField,
      from: source.droppableId,
      to: destination.droppableId
    });

    // If dropping into a section
    if (destination.droppableId.startsWith('section-')) {
      console.log('Assigning to section:', destination.droppableId);
      onFieldAssign(draggableId, destination.droppableId);
    }
    // If dropping back to unassigned
    else if (destination.droppableId === 'unassigned') {
      console.log('Unassigning field');
      onFieldAssign(draggableId, null);
    }
  };

  const handleFieldEdit = (field) => {
    setEditingField({ ...field });
  };

  const handleSaveEdit = () => {
    if (editingField) {
      const updatedFields = fields.map(field => 
        field.id === editingField.id ? editingField : field
      );
      onFieldsUpdate(updatedFields);
      setEditingField(null);
    }
  };

  const renderFieldContent = (field, isInSection) => (
    <>
      <Box sx={{ 
        mr: 1, 
        color: 'text.secondary',
        display: 'flex',
        alignItems: 'center'
      }}>
        <DragIndicatorIcon />
      </Box>
      <ListItemText
        primary={
          <Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 1
            }}>
              <Stack spacing={0.5} flex={1}>
                <Typography variant="subtitle1" sx={{ 
                  ...noSelectStyle,
                  fontWeight: 500,
                  color: 'primary.light'
                }}>
                  {field.label || 'Unnamed Field'}
                </Typography>
                {field.placeholder && (
                  <Typography 
                    variant="h6"
                    sx={{ 
                      fontSize: '1rem',
                      color: 'text.primary',
                      opacity: 0.9,
                      fontWeight: 400,
                      letterSpacing: '0.01em'
                    }}
                  >
                    {field.placeholder}
                  </Typography>
                )}
              </Stack>
              <Tooltip title="Edit field details" arrow>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFieldEdit(field);
                  }}
                  sx={{ 
                    opacity: 0.7,
                    '&:hover': { opacity: 1 }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        }
        secondary={
          <Box sx={noSelectStyle}>
            <Stack spacing={2}>
              {/* Technical Details */}
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                flexWrap: 'wrap',
                mt: 1
              }}>
                <Chip 
                  label={field.type}
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(0, 168, 150, 0.1)',
                    borderColor: 'primary.main',
                    '& .MuiChip-label': {
                      fontWeight: 500
                    }
                  }}
                />
                <Chip 
                  label={field.attributeName}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    '& .MuiChip-label': {
                      opacity: 0.7,
                      fontSize: '0.75rem'
                    }
                  }}
                />
              </Box>

              {/* Summary Settings - only shown when in a section */}
              {isInSection && (
                <Box sx={{ 
                  borderTop: 1, 
                  borderColor: 'divider', 
                  pt: 2,
                  mt: 1
                }}>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      display: 'block', 
                      mb: 1,
                      fontWeight: 500
                    }}
                  >
                    Summary Settings
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Select
                      size="small"
                      value={field.formSummary ? (field.summaryDisplay ? 'displayed' : 'hidden') : 'none'}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleFieldUpdate(field.id, {
                          ...field,
                          formSummary: value !== 'none',
                          summaryDisplay: value === 'displayed'
                        });
                      }}
                      sx={{ 
                        minWidth: 150,
                        '& .MuiSelect-select': {
                          fontSize: '0.875rem'
                        }
                      }}
                      native
                    >
                      <option value="none">Not in Form Summary</option>
                      <option value="displayed">Form Summary (Displayed)</option>
                      <option value="hidden">Form Summary (Hidden)</option>
                    </Select>
                    
                    <Select
                      size="small"
                      value={field.dealSummary ? (field.summaryDisplay ? 'displayed' : 'hidden') : 'none'}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleFieldUpdate(field.id, {
                          ...field,
                          dealSummary: value !== 'none',
                          summaryDisplay: value === 'displayed'
                        });
                      }}
                      sx={{ 
                        minWidth: 150,
                        '& .MuiSelect-select': {
                          fontSize: '0.875rem'
                        }
                      }}
                      native
                    >
                      <option value="none">Not in Deal Summary</option>
                      <option value="displayed">Deal Summary (Displayed)</option>
                      <option value="hidden">Deal Summary (Hidden)</option>
                    </Select>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>
        }
      />

      {/* Field Edit Dialog */}
      <Dialog 
        open={Boolean(editingField)} 
        onClose={() => setEditingField(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Field</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Label"
              fullWidth
              value={editingField?.label || ''}
              onChange={(e) => setEditingField(prev => ({
                ...prev,
                label: e.target.value
              }))}
            />
            <TextField
              label="Placeholder"
              fullWidth
              value={editingField?.placeholder || ''}
              onChange={(e) => setEditingField(prev => ({
                ...prev,
                placeholder: e.target.value
              }))}
            />
            <TextField
              label="Attribute Name"
              fullWidth
              value={editingField?.attributeName || ''}
              onChange={(e) => setEditingField(prev => ({
                ...prev,
                attributeName: e.target.value
              }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingField(null)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </>
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
    </Box>
  );
};

export default JsonEditor; 