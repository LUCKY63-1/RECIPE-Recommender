# RecipeRec - AI-Powered Recipe Recommendation Engine

RecipeRec is a modern web application that leverages AI to provide personalized recipe recommendations based on user preferences and available ingredients. Built with Angular, this application helps users discover new recipes, plan meals, and reduce food waste.

## 🌟 Features

- **AI-Powered Recipe Generation**: Generate personalized recipes using advanced LLM technology
- **Smart Search**: Find recipes based on available ingredients and dietary preferences
- **Favorites System**: Save and manage your favorite recipes
- **Internationalization**: Multi-language support (English, Hindi, Marathi)
- **Theme Switching**: Light and dark mode support
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Dietary Preferences**: Filter recipes based on dietary restrictions and cuisine preferences

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd reciperec
```

2. Install dependencies:
```bash
npm install
```

### Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

### Backend Server

The application also requires a backend server for AI recipe generation. Navigate to the `server` directory and run:

```bash
cd server
npm install
npm start
```

## 🛠️ Development

### Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

### Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

### Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

### Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## 📁 Project Structure

```
reciperec/
├── src/
│   ├── app/
│   │   ├── components/          # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── services/           # Angular services
│   │   ├── models/             # TypeScript interfaces
│   │   └── pipes/              # Custom pipes
│   ├── assets/                 # Static assets
│   └── environments/           # Environment configurations
├── server/                     # Node.js backend server
└── public/                     # Public assets
```

## 🎨 Technologies Used

### Frontend
- **Angular 20** - Modern web framework
- **Bootstrap 5** - UI framework
- **Bootstrap Icons** - Icon library
- **RxJS** - Reactive programming
- **@ngx-translate** - Internationalization

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **SQLite** - Database
- **Supabase** - Authentication

## 🚀 Deployment

### Production Build

```bash
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory and ready for deployment.

### Environment Setup

Create a `.env` file in the `server` directory with the following variables:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

## 🙏 Acknowledgments

- Angular CLI for the powerful scaffolding tools
- Bootstrap for the responsive UI framework
- All the open-source libraries that made this project possible
