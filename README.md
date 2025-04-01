# Library Management API Service

A simple GraphQL API service built with Node.js, TypeScript, Apollo Server, Prisma, and SQLite for managing books, authors, users, and tracking borrowed books.

## Overview

This project provides a backend service allowing clients to perform CRUD (Create, Read, Update, Delete) operations on library resources like books and authors, manage users, and handle the borrowing and returning of books. The API is exposed via GraphQL.

## Features

* **Book Management:** Add, update, delete, and list books.
* **Author Management:** Add, update, delete, and list authors.
* **User Management:** Add and list users.
* **Borrowing System:** Mark books as borrowed by users and handle returns.
* **Relationship Queries:** Fetch books by a specific author, authors of a specific book, and books borrowed by a user.
* **Filtering:** List books optionally filtered by author or borrowed status.

## Tech Stack

* **Backend Framework:** Node.js with TypeScript
* **API Layer:** Apollo Server (GraphQL)
* **Database ORM:** Prisma
* **Database:** SQLite
* **Containerization:** Docker
* Before you begin, ensure you have the following installed on your system:

* Node.js 
* npm 
* Docker & Docker Compose

  Steps to run the project
* Clone the Repository (or set up files)
* Install Dependencies
* Set Up Environment Variables
* Apply Database Migrations
* Generate Prisma Client
* Start the Development Server
