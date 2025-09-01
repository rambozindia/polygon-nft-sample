This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

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

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Backend API

The backend server provides an API for admin actions.

### Running the server

```bash
node ../smart-contract/server.js
```

### API Endpoints

#### Upload a file

*   **URL:** `/upload`
*   **Method:** `POST`
*   **Body:** `multipart/form-data` with a `file` field.

**Example:**
```bash
curl -X POST -F "file=@/path/to/your/image.png" http://localhost:3001/upload
```

#### Mint an NFT

*   **URL:** `/mint`
*   **Method:** `POST`
*   **Body:** `json`
    *   `recipient` (string, required): The address to receive the NFT.
    *   `tokenURI` (string, required): The URL of the NFT's metadata (from the `/upload` endpoint).

**Example:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"recipient":"0x...", "tokenURI":"http://localhost:3001/uploads/..."}' http://localhost:3001/mint
```

#### Withdraw USDT

*   **URL:** `/withdraw`
*   **Method:** `POST`
*   **Body:** `json`
    *   `recipient` (string, required): The address to receive the USDT.
    *   `amount` (string, required): The amount of USDT to withdraw.

**Example:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"recipient":"0x...", "amount":"100"}' http://localhost:3001/withdraw
```

#### Assign an NFT

*   **URL:** `/assign`
*   **Method:** `POST`
*   **Body:** `json`
    *   `recipient` (string, required): The address to receive the NFT.
    *   `tokenId` (string, required): The ID of the NFT to assign.

**Example:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"recipient":"0x...", "tokenId":"0"}' http://localhost:3001/assign
```
