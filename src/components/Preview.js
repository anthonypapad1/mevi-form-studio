import React from 'react';
import { Box, Button, Typography } from '@mui/material';

const Preview = ({ fields, sections, selectedRoles = [], selectedCreators = [], formDetails = {} }) => {
  const generateSignaturesJSON = () => {
    if (!selectedRoles || selectedRoles.length === 0) {
      return {};
    }

    const signaturesTemplate = {
      'client.buy': {
        integrationRole: 'Buyer',
        meviDealRole: 'client.buy',
        min: 1,
        max: 6,
        default: 2,
        additionalSignaturePage: 3,
        signatures: Array.from({ length: 6 }, (_, i) => ({
          signerKey: `Buyer${i + 1}`,
          email: `Buyer${i + 1}@mevi.io`
        }))
      },
      'client.sell': {
        integrationRole: 'Seller',
        meviDealRole: 'client.sell',
        min: 1,
        max: 6,
        default: 2,
        additionalSignaturePage: 3,
        signatures: Array.from({ length: 6 }, (_, i) => ({
          signerKey: `Seller${i + 1}`,
          email: `Seller${i + 1}@mevi.io`
        }))
      },
      'team.buy': {
        integrationRole: 'BuyerAgent',
        meviDealRole: 'team.buy',
        min: 1,
        max: 1,
        default: 1,
        signatures: [{
          signerKey: 'BuyerAgent1',
          email: 'BuyerAgent1@mevi.io'
        }]
      },
      'team.sell': {
        integrationRole: 'SellerAgent',
        meviDealRole: 'team.sell',
        min: 1,
        max: 1,
        default: 1,
        signatures: [{
          signerKey: 'SellerAgent1',
          email: 'SellerAgent1@mevi.io'
        }]
      }
    };

    return Object.fromEntries(
      selectedRoles.map(role => [role, signaturesTemplate[role]])
    );
  };

  const generateSummaryJSON = (summaryType) => {
    // Get fields that are included in this summary type (either shown or hidden)
    const summaryFields = fields.filter(field => field[summaryType] !== undefined);
    
    return Object.fromEntries(
      summaryFields.map(field => [
        field.attributeName,
        {
          label: field.label || null,
          type: field.type,
          display: field[summaryType] // true for "Shown", false for "Hidden"
        }
      ])
    );
  };

  const generateJson = () => {
    const orderedSections = [...sections].map((section, index) => ({
      ...section,
      originalIndex: index
    }));

    // Get formUploadData from fields marked for upload
    const formUploadData = fields
      .filter(field => field.formUpload)
      .map(field => field.attributeName)
      .filter(Boolean);

    // Get first section's attribute name for default start section
    const startSectionAttributeName = sections[0]?.attributeName || null;

    const form = {
      id: formDetails.formId || '00000000-0000-0000-0000-000000000000',
      version: "1.0.0",
      metadata: {
        category: formDetails.category || null,
        order: null,
        meviDealRoleCreator: selectedCreators,
        otherSideCanUpload: true,
        formUploadData: formUploadData,
        settings: {
          type: {}  // Empty by default
        }
      },
      formJSON: {
        locale: formDetails.locale || null,
        type: formDetails.type || null,
        name: formDetails.name || null,
        shortName: formDetails.shortName || null,
        status: "new",
        startSectionAttributeName: startSectionAttributeName,
        lineNumbers: true,
        formData: [{
          status: "draft",
          sections: orderedSections
            .sort((a, b) => a.originalIndex - b.originalIndex)
            .map(section => {
              const { originalIndex, ...sectionWithoutIndex } = section;
              const sectionFields = fields
                .filter(field => field.sectionId === section.id)
                .map(field => ({
                  order: field.order,
                  type: field.type,
                  constraint: field.constraint || null,
                  constraintId: field.constraintId || null,
                  placeholder: field.placeholder || null,
                  info: field.info || null,
                  hint: field.hint || null,
                  label: field.label,
                  attributeName: field.attributeName,
                  eventTrigger: field.eventTrigger || null,
                  value: field.value || null,
                  validation: field.validation || null,
                  validationErrorMessage: field.validationErrorMessage || null,
                  metadata: field.metadata ? {
                    ...field.metadata,
                    options: field.metadata.options || []
                  } : null
                }));

              return {
                fields: sectionFields,
                type: sectionWithoutIndex.type || "data",
                attributeName: sectionWithoutIndex.attributeName,
                title: sectionWithoutIndex.title,
                subtitle: sectionWithoutIndex.subtitle || null,
                description: sectionWithoutIndex.description || null,
                info: sectionWithoutIndex.info || null,
                goTo: sectionWithoutIndex.goTo || null
              };
            })
        }]
      },
      dealSummaryJSON: generateSummaryJSON('dealSummary'),
      formSummaryJSON: generateSummaryJSON('formSummary'),
      signaturesJSON: generateSignaturesJSON(),
      rulesJSON: {
        draft: {
          getDesignatedSigners: {
            contract: selectedRoles
          }
        },
        executed: {
          setDesignatedSigners: {
            contract: selectedRoles
          }
        }
      }
    };

    return JSON.stringify(form, null, 2);
  };

  const handleDownload = () => {
    const json = generateJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Just use the form type for the filename
    const formType = formDetails.type ? formDetails.type.toLowerCase().replace(/\s+/g, '-') : 'form-definition';
    a.download = `${formType}.json`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  function syntaxHighlight(json) {
    if (!json) return '';
    
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = 'number';
      let style = 'color: #b5cea8;';  // Numbers
      
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
          style = 'color: #9cdcfe;';  // Property names
        } else {
          cls = 'string';
          style = 'color: #ce9178;';  // Strings
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
        style = 'color: #569cd6;';  // Booleans
      } else if (/null/.test(match)) {
        cls = 'null';
        style = 'color: #569cd6;';  // Null
      }
      
      return '<span style="' + style + '">' + match + '</span>';
    })
    .replace(/[{}\[\]]/g, function(match) {
      return '<span style="color: #d4d4d4;">' + match + '</span>';  // Brackets
    })
    .replace(/,/g, '<span style="color: #d4d4d4;">,</span>');  // Commas
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          JSON Preview
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => {
              navigator.clipboard.writeText(generateJson());
            }}
            sx={{ mr: 1 }}
          >
            Copy to Clipboard
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleDownload}
          >
            Download JSON
          </Button>
        </Box>
      </Box>
      
      <pre
        style={{
          backgroundColor: '#1e1e1e',  // VS Code dark theme background
          color: '#d4d4d4',           // Default text color
          padding: '1rem',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '14px',
          fontFamily: '"Consolas", "Monaco", "Courier New", monospace',
        }}
        dangerouslySetInnerHTML={{ __html: syntaxHighlight(generateJson()) }}
      />
    </Box>
  );
};

export default Preview; 