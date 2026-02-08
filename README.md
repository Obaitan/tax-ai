This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Tax Matters AI Assistant

This application provides an AI-powered assistant for Nigerian tax law questions using Gemini 3 and file search capabilities.

### Uploading Tax Law Documents

To upload PDF documents from the `lib/data/files/` directory to the Gemini file search store:

```bash
npm run upload-tax-files
```

This will:
- Upload all PDF files in `lib/data/files/` to Gemini's file search store
- Delete the local files after successful upload
- Provide detailed progress and error reporting

### Managing File Search Store

**Create fresh store with only Nigeria Tax Act 2025.pdf:**
```bash
npm run recreate-filestore
```

This command creates a new file search store with only the Nigeria Tax Act 2025.pdf document. Use this if you need to start fresh with just the required document.

**Requirements:**
- Set `GOOGLE_GEMINI_API_KEY` in your `.env` file
- Place PDF files in `lib/data/files/` directory

### Bank statement uploads (client upload to Vercel Blob)

The bank statement analyser uploads PDFs from the browser to Vercel Blob. Set `STATEMENT_READ_WRITE_TOKEN` in your `.env` (from your Vercel Blob store). The token is used by the `/api/uploads` route to issue client upload tokens.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
