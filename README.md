# Angular Quiz - User Management App

An Angular SPA that lists users from the Reqres API with pagination, user detail pages, instant ID search, caching, and global loading feedback.

## Setup

```bash
cd angular-quiz
npm install
```

## Run the app

```bash
ng serve
```

Then open `http://localhost:4200/`.

## Build

```bash
ng build --configuration production
```

Build output is written to `dist/`.

## Tests

```bash
ng test
```

## Notes

- API base URL is configured in `src/environments/environment.ts`.
- Caching and loading state are handled in core services and an HTTP interceptor.
