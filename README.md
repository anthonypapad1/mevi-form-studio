# Mevi Form Studio  

A specialized form builder application for creating and managing form definitions for the Mevi platform.  

## Getting Started  

### Prerequisites  
- Node.js (v14 or higher)  
- npm or yarn  

### Installation  

1. Clone the repository:  
   ```bash
   git clone https://github.com/your-username/mevi-form-studio.git
   cd mevi-form-studio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at http://localhost:3004.

## Features
- Drag-and-drop interface for form building
- Section-based form organization
- Multiple field types support:
  - Input
  - Datetime
  - Currency
  - Textarea
  - Checkbox (with Other option)
  - Radio (with Other option)
  - Decision
- Form summary configuration
- JSON preview and download
- Form definition upload

## Project Structure

```
src/
├── components/
│   ├── FileUpload.js       # Handles form definition uploads
│   ├── JsonEditor.js       # Main form builder interface
│   └── Preview.js          # JSON preview and download
├── App.js                  # Main application component
└── index.js                # Application entry point
```

## Form Definitions

Example form definitions can be found in:
- exampleJSON1.csv
- JSON Example/ directory

These examples demonstrate the expected structure and format of form definitions.

## Available Scripts
- `npm start` - Runs the app in development mode on http://localhost:3004
- `npm test` - Launches the test runner
- `npm run build` - Creates a production build in the build folder
