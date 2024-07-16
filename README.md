# ExpressType

ExpressType is an open-source API template for [Express](https://expressjs.com/) and [Typescript](https://typescriptlang.org). ExpressType makes it easy to create and deploy APIs in seconds. ExpressType

## How It Works

ExpressType is a template that provides a basic structure for building APIs with Express and Typescript. It includes a set of predefined routes, middleware, and utilities that make it easy to get started with API development. I have also included a `vercel.json` file, this is the configuration file for Vercel that is used to deploy the API to the cloud.

### FAQ

- What is Bun?

Bun is a fast, modern runtime for JavaScript. It is designed to be a lightweight alternative to Node.js, with a focus on performance and security.

- What is Express?

Express is a minimal and flexible Node.js web application framework that provides a robust set of features for building web applications and APIs. It is designed to be simple and easy to use, while also providing a powerful and flexible platform for building complex web applications.

- What is Vercel?

Vercel is a cloud platform for hosting, deploying, and scaling web applications. It provides a simple and intuitive interface for deploying and managing applications, and offers a range of features and tools to help developers build and scale their applications.

- What is TypeScript?

TypeScript is a superset of JavaScript that adds static typing and other features to the language. It is designed to improve the development experience and catch errors early in the development process.

- Is ExpressType Open-Source?

Yes, ExpressType is open-source and available on GitHub. You can find the source code for ExpressType on the [ExpressType GitHub repository](https://github.com/creative-tutorials/expresstype.v2).

- Is there a Documentation?

There is no actual documentation for ExpressType. However, if you find any issues or have any suggestions, please feel free to open an issue on the [ExpressType GitHub repository](https://github.com/creative-tutorials/expresstype.v2).

## Installation

To get started with ExpressType, follow these steps:

1. ### Clone the Repository (using Git)

Clone the ExpressType repository to your local machine using `git clone`:

```bash
git clone https://github.com/creative-tutorials/expresstype.v2.git my-express-app
```

1. ### Clone the Repository (using Bun)

To clone the ExpressType repository using Bun, run the following command:

```bash
bun create github.com/creative-tutorials/expresstype.v2 my-express-app
```

1. ### Cloning a specifc version

To clone a specific version of the ExpressType repository, you can use the following command:

```bash
git clone -b v1.0.3 https://github.com/creative-tutorials/expresstype.v2.git my-express-app
```

> [!TIP]
> When you run the `bun create` command, Bun will automatically install the necessary dependencies and set up the project structure for you.

---

1. ### Navigate to The Project Directory

Change your current working directory to the project folder

```bash
cd my-express-app
```

1. ### Installing Dependencies

To make ExpressType work, you need to install the necessary dependencies. You can run the following command to install the dependencies:

```bash
bun install
```

> [!TIP]  
> I recommend using the `bun install` command to install dependencies. It is much faster and easier than using `npm install` or `yarn install`.

---

## TypeScript Configuration

> [!NOTE]  
> Ensure that TypeScript is set up for your project. You can edit the `tsconfig.json` file to configure TypeScript for your project.

### Authentication

To implement authentication in your application, I recommend using the `clerk`. Clerk is a simple and secure authentication solution that provides a robust set of features for building secure and scalable applications. To authenticate your requests, you can use the `@clerk/clerk-sdk-node` package. This package provides a set of functions that you can use to authenticate requests and manage user sessions. See more information about [Authenticating your API Requests](https://clerk.com/blog/how-to-authenticate-api-requests-with-clerk-express)

> [!IMPORTANT]
> If you have issues deploying your API to Vercel, you should check the following:

- Make sure you have the latest version of the Vercel CLI installed.
- Check if your `build` folder is published to Github, and it's not ignored in your `.gitignore` file.
- If you are importing a function from a file, make sure it ends with `.js` and not `.ts`.
  ![alt text](image.png)
  ![alt text](image-1.png)

## License

This project is licensed under the MIT License - see the [LICENSE](/LICENSE) file for details.
