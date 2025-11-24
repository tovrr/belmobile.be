# Project Overview

This project is a multi-language e-commerce website for "belmobile". It appears to be a full-featured online store with a customer-facing front-end and a comprehensive admin panel for managing the store's content and operations.

**Key Technologies:**

*   **Frontend:** React, Vite, TypeScript, Tailwind CSS
*   **Routing:** React Router
*   **State Management:** React Context
*   **Key Libraries:**
    *   `@google/generative-ai`: Suggests integration with Google's generative AI, possibly for features like a chat assistant.
    *   `firebase`: Indicates the use of Firebase for backend services like authentication, database, or storage.
    *   `leaflet`: Used for displaying interactive maps, likely for the "Store Locator" feature.
    *   `recharts`: A charting library, which could be used in the admin dashboard for analytics.
*   **Backend:** A simple Express server is used to serve the built React application, which is a common pattern for single-page applications (SPAs).

**Architecture:**

The application is structured as a single-page application (SPA). It uses a component-based architecture with a clear separation of concerns.

*   **`src/components`:** Contains reusable UI components.
*   **`src/pages`:** Contains the main pages of the application.
*   **`src/context`:**  Manages global state using React's Context API. There are contexts for Shop, Data, Language, and Theme.
*   **`src/hooks`:**  Contains custom React hooks, such as `useLanguage` for managing the application's language.
*   **`src/utils`:**  Likely contains utility functions.
*   **Admin Panel:** A separate section of the application under the `/admin` route provides a comprehensive interface for managing the store.

# Building and Running

**Development:**

To run the application in development mode:

```bash
npm install
npm run dev
```

This will start a development server, typically on `http://localhost:3000`.

**Production Build:**

To create a production build of the application:

```bash
npm run build
```

This will generate a `dist` directory with the optimized and minified application files.

**Running the Production Build:**

To serve the production build:

```bash
npm run start
```

This will start a simple Express server that serves the files from the `dist` directory.

# Development Conventions

*   **TypeScript:** The project uses TypeScript for static typing, which helps to improve code quality and maintainability.
*   **Tailwind CSS:** The use of Tailwind CSS suggests a utility-first approach to styling.
*   **Component-Based Architecture:** The code is organized into reusable components, which is a standard practice in modern web development.
*   **Multi-language Support:** The application is designed to support multiple languages (en, fr, nl), with language selection managed through the URL and a `LanguageProvider`.
*   **Routing:** The application uses React Router for client-side routing, with a clear separation of public and admin routes.
