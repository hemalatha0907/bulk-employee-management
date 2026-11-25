# PeopleDesk Employee Directory

A React and Express employee directory backed by MongoDB Atlas.

## Features

- Add employee IDs, names, phone numbers, emails, job titles, and monthly salaries.
- Sort the directory by employee ID or employee name (A–Z).
- Search by name, ID, phone number, email, or job title.
- Edit employee details, or delete employee records.

## Run locally

1. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` to your own MongoDB Atlas connection string.
2. From this folder, install dependencies with `npm install`.
3. Start the API from the `backend` folder with `node server.js`.
4. In a separate terminal, from this folder, start the frontend with `npm run dev`.

Employee records are saved in MongoDB Atlas. An internet connection and a running API are required to add, update, delete, or load records. Employee IDs are entered manually and must be unique; they are stored in uppercase.

Never upload `backend/.env`; it contains your database credentials. The example file contains placeholders only.

On startup, the API removes the obsolete unique `employeeId` index from existing employee collections when present.

The API listens on port `5000`, which is the address configured in the frontend.

## Production build

From this folder, run:

```sh
npm run build
```
