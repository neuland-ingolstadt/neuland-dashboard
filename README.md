# Neuland Dashboard

## Description

This is a dashboard for the [neuland.app](https://neuland.app) and [Neuland Next](https://next.neuland.app) app.
Here you can manage the university sports courses and in-app announcements.

## Installation

1. Clone the repository
2. Create a `.env.local` file in the root directory and add the variables seen in the `.env.example` file
3. Run `bun install`
4. Run `bun dev` to start the development server
5. Visit `http://localhost:3000`

## Notice

> [!CAUTION]
> Bun does not fully support this project. That's why the `Dockerfile` does still use `npm` and not `bun`.
> Please use `bun` for development and `npm` for production!
