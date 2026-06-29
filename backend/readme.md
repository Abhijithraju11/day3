# Link Vault — Backend

Express API for the Link Vault app. Handles links, collections, and tags, with Clerk for auth and Prisma + MongoDB for storage.

## Prerequisites

- Node.js 22+ (uses the native `--env-file` flag, no `dotenv` needed)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account — the free M0 tier works. Prisma needs a replica set, which Atlas provides by default.
- A [Clerk](https://clerk.com) account for authentication.

## Setup

Install dependencies first. (If you've used a Node project before, you know the command.)

Create a `.env` file in this folder. Use `.env.example` for the list of keys you need.

Your `DATABASE_URL` comes from Atlas (Connect → Drivers) and looks like:

```
mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<DATABASE_NAME>?retryWrites=true&w=majority
```

Replace `<DATABASE_NAME>` with whatever you want the database called, e.g. `linkvault`. Leave it out and Mongo won't know which database to use.

Your Clerk secret key comes from the Clerk Dashboard → **API keys**.

Before connecting, allowlist your IP in Atlas. Go to **Network Access** → **Add IP Address**. You can add your current IP, or use `0.0.0.0/0` to allow access from anywhere — fine for local development and demos, but not something you'd leave on for a real deployment. You'll also need a database user under **Database Access** with a username and password; those go into the `DATABASE_URL`.

Sync the schema to the database and generate the Prisma client:

```bash
npx prisma db push
npx prisma generate
```

`db push` reads `schema.prisma`, creates the collections, and sets up indexes. Run it again whenever you change the schema. (MongoDB doesn't use migrations — `db push` is the workflow.)

Start the server:

```bash
npm run dev
```

It should come up on `http://localhost:3000`.

## Your task

`src/routes/tags.js` is mounted but empty. Implement the CRUD handlers (GET, POST, PUT, DELETE). The other route files (`links.js`, `collections.js`) are your reference — the patterns are identical.

Every handler should scope its queries by the logged-in user (`req.user.id`) so people only ever touch their own data. Follow how the existing routes do it.

## Useful docs

- **Prisma + MongoDB guide:** https://www.prisma.io/docs/orm/overview/databases/mongodb
- **Prisma CRUD reference:** https://www.prisma.io/docs/orm/prisma-client/queries/crud
- **Express routing:** https://expressjs.com/en/guide/routing.html
- **Clerk Express SDK:** https://clerk.com/docs/reference/express/overview
- **HTTP status codes:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

## Notes

- Keep `.env` out of version control. Only `.env.example` should be committed.
- If `npx prisma db push` can't connect, the usual causes are a wrong password, a missing database name in `DATABASE_URL`, or your IP not being allowlisted in Atlas (Network Access).
