# Backend URL Files

Use these files to switch the frontend between local and deployed API URLs.

- `localhost.env` - local backend URL
- `deploy.env` - deployed Render backend URL

Scripts:

- `npm run env:local` - copy `localhost.env` into `.env.local`
- `npm run env:deploy` - copy `deploy.env` into `.env.local`
- `npm run dev` - automatically loads `localhost.env`
- `npm run build` - automatically loads `deploy.env`
- `npm run start` - automatically loads `deploy.env`

The generated `.env.local` remains ignored by git.