# Overview

The goal of this small project was to build a small user authentication system that allows a user to create a profile and login to the site with their now saved profile. I also wanted to be able to allow the user the modern equivalent of choosing what service to use for login, so rather than creating a unique login just for my site, they can use their Google login. Eventually, I want to expand to other optional logins, but Google will be the proof-of-concept since it is so widely used.

Since the logic of this can be a bit complex, and the need of hosting the stored profiles, I worked with Firebase to integrate the feature more easily into
the site, which ultimately required the app to connect to the Firebase servers to store, retrieve, and update profile information, as well as securely store the login authorization info.

Given that TypeScript is a widely used platform, I wanted this useful feature to be built in TypesScript as a proof-of-concept of my ability to build a complex feature in TypeScript.

One of the KEY reasons I also wanted to learn this is I recently deployed a fun website called [Azeroth AI Reporter](https://www.azerothreporter.com/), but the generated profile reports by an LLM are only stored locally. The source GitHub code is [HERE](https://github.com/TheGeneticsGuy/warcraft-ai). I would love to be able to allow users to create their create their own profiles so that reports can be stored and recalled, maybe even used in future analysis in comparison to new reports to determine an evolution of a player. So, this project allows me to learn a skill that I can bring to a real-world deployment of one of my own personal projects as well.

[Software Demo Video](http://youtube.link.goes.here)

# Development Environment

{Describe the tools that you used to develop the software}

{Describe the programming language that you used and any libraries.}

- ESLint Enabled
- Prettier Enabled
- Firebase tools installed

`npm install -g firebase-tools`

# Useful Websites

- [Firebase Official Documentation](https://firebase.google.com/docs)
- [Total TypeScript](https://www.totaltypescript.com/) - This is an AMAZING resource to crash course you
- [The TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) - The Official Handbook
- [Frontend Masters](https://frontendmasters.com/courses/typescript-v4/) - PAID, but it is HIGHLY recommended and I found it worth it.

# Future Work

- Add additional authentication logins besides Google
- Integrate this feature work into some of my other projects, like [Azeroth Reporter](https://www.azerothreporter.com/)
- Update the Profile to be more feature rich. Right now I only have name and bio.
