# Tax AI

**Tax AI** is an advanced, AI-powered platform designed to simplify tax compliance and financial analysis for Nigerian taxpayers and businesses. Leveraging the power of Google's Gemini 3 models, it provides accurate, context-aware answers to tax questions, estimates tax liabilities, and analyzes financial documents with ease.

## 🚀 Key Modules

The application consists of three core modules, each designed to address specific taxation needs in Nigeria:

### 1. AI Tax Assistant (`/tools/ai-chat`)

A smart conversational interface that allows users to ask complex questions about Nigerian tax laws.

- **Powered by Gemini 3**: Utilizes advanced LLMs with Retrieval-Augmented Generation (RAG).
- **Legal Context**: Grounded in the **Nigeria Tax Act 2025** and other relevant tax litigations.
- **Features**: Provides citations, source references, and context-aware responses to ensure accuracy.

### 2. Tax Estimator (`/tools/tax-estimator`)

A robust tool for calculating projected tax liabilities for different entity types.

- **Personal Income Tax (PIT)**: Estimates tax for individuals based on employment income, benefits, and statutory deductions.
- **Company Income Tax (CIT)**: Calculates tax obligations for corporate entities.
- **Features**: Interactive step-by-step questionnaire, detailed breakdown of calculations, and PDF export of estimates.

### 3. Bank Statement Analyzer (`/tools/bank-statement`)

An intelligent document processing tool for analyzing financial statements.

- **PDF Analysis**: Parses uploaded bank statement PDFs to extract transaction data.
- **Credit Analysis**: Identifies, categorizes, and summarizes credit transactions.
- **Privacy First**: Secure upload and processing using Vercel Blob and efficient parsing logic.

## 🛠️ Technologies Used

This project is built with a modern, scalable tech stack, ensuring performance and maintainability:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI & Styling**:
  - [React 19](https://react.dev/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Shadcn UI](https://ui.shadcn.com/) (Radix UI)
  - [Lucide React](https://lucide.dev/) (Icons)
- **AI & Integrations**:
  - [Google Gemini API](https://ai.google.dev/) (`@google/genai`)
  - [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (File Storage)
- **PDF Processing**: `pdf-parse`, `jspdf`, `jspdf-autotable`

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js 18+ installed
- A Google Cloud project with Gemini API access
- A Vercel account (for Blob storage)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/tax-ai.git
   cd tax-ai
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and configure the following keys:

   ```env
   # API Key for Google Gemini Models
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key

   # Vercel Blob Token for file uploads
   STATEMENT_READ_WRITE_TOKEN=your_vercel_blob_token
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🗂️ Project Structure

- `app/`: Next.js App Router pages and API routes.
  - `tools/`: Contains the main feature modules (AI Chat, Estimator, Bank Analyzer).
- `components/`: Reusable UI components.
- `lib/`: Utility functions, API clients, and shared logic.
- `public/`: Static assets.
- `scripts/`: Helper scripts for data uploads and file store management.

### Helper Scripts

- **Upload Tax Files**: Uploads PDFs from `lib/data/files/` to Gemini's file search store.
  ```bash
  npm run upload-tax-files
  ```
- **Cleanup Filestore**: tools to manage the Gemini file store.
  ```bash
  npm run cleanup-filestore
  ```

## 📄 License

This project is available for use under the [MIT License](LICENSE).
