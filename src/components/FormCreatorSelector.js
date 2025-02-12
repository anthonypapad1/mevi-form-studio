import React from 'react';
import { 
  FormGroup, 
  FormControlLabel, 
  Checkbox, 
  Card,
  CardContent,
  CardHeader,
  Divider
} from '@mui/material';

// Add no-select style
const noSelectStyle = {
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none',
  KhtmlUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  userSelect: 'none',
};

const FormCreatorSelector = ({ selectedCreators, onCreatorsChange }) => {
  const creatorRoles = [
    { 
      key: 'team.buy', 
      label: 'Buyer Agent',
    },
    { 
      key: 'team.sell', 
      label: 'Seller Agent',
    }
  ];

  const handleChange = (role) => {
    const newCreators = selectedCreators.includes(role)
      ? selectedCreators.filter(r => r !== role)
      : [...selectedCreators, role];
    onCreatorsChange(newCreators);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader 
        title="Form Creator Roles"
        subheader="Select who can create this form"
        sx={noSelectStyle}
      />
      <Divider />
      <CardContent sx={noSelectStyle}>
        <FormGroup row>
          {creatorRoles.map((role) => (
            <FormControlLabel
              key={role.key}
              control={
                <Checkbox
                  checked={selectedCreators.includes(role.key)}
                  onChange={() => handleChange(role.key)}
                  sx={{
                    '&.Mui-checked': {
                      color: '#00a896',
                    },
                  }}
                />
              }
              label={role.label}
              sx={{ mr: 4 }}
            />
          ))}
        </FormGroup>
      </CardContent>
    </Card>
  );
};

export default FormCreatorSelector; 