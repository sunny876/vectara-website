# Vectara Website UI

A modern web application template for building semantic search and document management interfaces powered by Vectara.

## Features

- Clean, intuitive user interface
- Document management system
- Semantic search capabilities
- Responsive design for all devices
- Customizable branding and theming

## Tech Stack

- React.js
- TypeScript
- SCSS for styling
- Vectara for semantic search functionality
- Netlify for deployment

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vectara-website-ui.git
cd vectara-website-ui
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
REACT_APP_CORPUS_KEY=your_corpus_key
REACT_APP_CUSTOMER_ID=your_customer_id
REACT_APP_API_KEY=your_api_key
REACT_APP_ENDPOINT=your_endpoint
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## Project Structure

```
vectara-website-ui/
├── public/              # Static files
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts
│   ├── hooks/         # Custom React hooks
│   ├── styles/        # Global styles and themes
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   └── views/         # Page components
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```

## Customization

### Branding
1. Replace the logo in `public/client_assets/` with your organization's logo
2. Update the favicon in `public/client_assets/`
3. Modify the theme colors in `src/styles/_variables.scss`

### Content
1. Update document types and categories in `src/view/controls/DocumentList.tsx`
2. Modify the navigation structure in `src/App.tsx`
3. Customize the search interface in `src/view/controls/SearchBox.tsx`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Deployment

The application is configured for deployment on Netlify. To deploy:

1. Build the application:
```bash
npm run build
```

2. Deploy to Netlify:
```bash
npx netlify deploy --prod --dir=build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please visit the [Vectara Documentation](https://docs.vectara.com) or contact Vectara support.
