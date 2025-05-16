# Overview

[LIVE DEPLOYMENT OF THE PROJECT](https://cse340-ts-project.web.app/)

The goal of this project was to build a user authentication system in TypeScript that allows users to create a profile and log in. A key aspect was to provide modern login options, so I integrated "Sign in with Google" as an alternative to site-specific credentials, with the aim to eventually support other OAuth providers.

Given the need for secure profile storage and backend logic, I chose Firebase as the backend solution. This allowed for easier integration of features like storing user profiles in Firestore, managing login credentials with Firebase Authentication, and handling profile updates via Firebase Cloud Functions.

I specifically wanted to build this in TypeScript to demonstrate my ability to develop complex features using this widely-adopted language. This project is also a direct learning step towards enhancing my existing website, the [Azeroth AI Reporter](https://www.azerothreporter.com/) (source: [GitHub](https://github.com/TheGeneticsGuy/warcraft-ai)). My vision is to enable user accounts there, allowing generated AI reports to be saved, recalled, and potentially analyzed over time—a skill this current project directly helps me develop.

[Software Demo Video](https://youtu.be/gGohKS7AjmE)

# Development Environment

This project was developed using **Visual Studio Code (VS Code)** as the primary code editor. Key development tools included:

- **Node.js and npm:** For managing project dependencies, running scripts, and providing the JavaScript runtime.
- **TypeScript:** As the primary programming language, adding static typing to JavaScript.
- **ESLint and Prettier:** For code linting and formatting to maintain code quality and consistency.
- **Firebase CLI:** For initializing Firebase services, running local emulators, and deploying the project.
- **Firebase Emulators:** For local testing of Authentication, Firestore, Cloud Functions, and Hosting.
- **esbuild:** As the JavaScript bundler to process TypeScript files for browser compatibility.

The core programming language used was **TypeScript**. Key libraries and frameworks utilized include:

- **Firebase SDK (Client-side):** Specifically `firebase/app`, `firebase/auth`, `firebase/firestore` (though Firestore interaction was primarily via backend functions), and `firebase/functions` (for calling backend functions).
- **Firebase Admin SDK (Server-side in Cloud Functions):** For backend operations, interacting with Authentication and Firestore securely.
- **Firebase Functions:** For writing serverless backend logic (user profile management).
- **Standard Web Technologies:** HTML5, CSS3 for the frontend structure and styling.

# Useful Websites

- [Firebase Official Documentation](https://firebase.google.com/docs)
- [Total TypeScript](https://www.totaltypescript.com/) - This is an AMAZING resource to crash course you
- [The TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) - The Official Handbook
- [Frontend Masters](https://frontendmasters.com/courses/typescript-v4/) - PAID, but it is HIGHLY recommended and I found it worth it.

# Future Work

- Add additional authentication logins besides Google
- Integrate this feature work into some of my other projects, like [Azeroth Reporter](https://www.azerothreporter.com/)
- Update the Profile to be more feature rich. Right now I only have name and bio.
