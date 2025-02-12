import React from 'react';
import { 
  Box, 
  FormGroup, 
  FormControlLabel, 
  Checkbox, 
  Typography,
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

const SignerRoleSelector = ({ selectedRoles, onRolesChange }) => {
  const roles = [
    { 
      key: 'client.buy', 
      label: 'Buyer',
      details: {
        integrationRole: 'Buyer',
        meviDealRole: 'client.buy',
        min: 1,
        max: 6,
        default: 2,
        additionalSignaturePage: 3
      }
    },
    { 
      key: 'client.sell', 
      label: 'Seller',
      details: {
        integrationRole: 'Seller',
        meviDealRole: 'client.sell',
        min: 1,
        max: 6,
        default: 2,
        additionalSignaturePage: 3
      }
    },
    { 
      key: 'team.buy', 
      label: 'Buyer Agent',
      details: {
        integrationRole: 'BuyerAgent',
        meviDealRole: 'team.buy',
        min: 1,
        max: 1,
        default: 1
      }
    },
    { 
      key: 'team.sell', 
      label: 'Seller Agent',
      details: {
        integrationRole: 'SellerAgent',
        meviDealRole: 'team.sell',
        min: 1,
        max: 1,
        default: 1
      }
    }
  ];

  const handleChange = (role) => {
    const newRoles = selectedRoles.includes(role)
      ? selectedRoles.filter(r => r !== role)
      : [...selectedRoles, role];
    onRolesChange(newRoles);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader 
        title="Signer Roles"
        subheader="Select the roles that will be signing this form"
        sx={noSelectStyle}
      />
      <Divider />
      <CardContent sx={noSelectStyle}>
        <FormGroup row>
          {roles.map((role) => (
            <FormControlLabel
              key={role.key}
              control={
                <Checkbox
                  checked={selectedRoles.includes(role.key)}
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

export default SignerRoleSelector; 