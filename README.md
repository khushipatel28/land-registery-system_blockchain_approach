# Land Registration System with Blockchain Integration

A full-stack application for land registration and ownership transfer using blockchain technology.

## Features

- User registration and authentication (Buyers and Sellers)
- Land registration with document upload to IPFS
- Land verification by inspectors
- Land purchase requests and ownership transfer
- Blockchain integration for secure transactions
- Modern UI with animations

## Tech Stack

- Frontend: React.js, Tailwind CSS, Framer Motion
- Backend: Node.js, Express, MongoDB
- Blockchain: Solidity, Hardhat, Ganache
- Web3: Web3.js, MetaMask
- Storage: IPFS for document storage

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- MetaMask browser extension
- Ganache (for local blockchain)
- IPFS API key (optional)

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd land-registration-blockchain
```

2. Install dependencies for all parts:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install

# Install blockchain dependencies
cd ../blockchain
npm install
```

3. Set up environment variables:

Create `.env` files in both server and client directories:

Server (.env):
```
MONGODB_URI=your_mongodb_uri
PORT=5000
JWT_SECRET=your_jwt_secret
IPFS_API_URL=your_ipfs_api_url
ETHEREUM_RPC_URL=http://127.0.0.1:7545
PRIVATE_KEY=your_private_key
SMART_CONTRACT_ADDRESS=your_contract_address
```

Client (.env):
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SMART_CONTRACT_ADDRESS=your_contract_address
```

4. Deploy smart contract:
```bash
cd blockchain
npx hardhat compile
npx hardhat run scripts/deploy.js --network ganache
```

5. Start the development servers:

```bash
# Start backend server
cd server
npm run dev

# Start frontend development server
cd client
npm start
```

6. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage

1. Register as a buyer or seller
2. Connect your MetaMask wallet
3. Sellers can register new lands
4. Inspectors verify land registrations
5. Buyers can browse and purchase verified lands
6. Sellers can accept/reject purchase requests
7. Ownership is transferred via smart contract

## Project Structure

```
land-registration-blockchain/
│
├── client/                     # Frontend (React + Tailwind + Web3.js)
│   ├── public/
│   │   └── ...
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contracts/
│   │   ├── utils/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── ...
│   ├── tailwind.config.js
│   ├── package.json
│
├── server/                     # Backend (Node.js + Express + MongoDB)
│   ├── controllers/
│   │   └── ...
│   ├── models/
│   │   └── ...
│   ├── routes/
│   │   └── ...
│   ├── uploads/
│   │   └── ...
│   ├── middleware/
│   │   └── ...
│   ├── config/
│   │   └── ...
│   ├── server.js
│   ├── package.json
│
├── blockchain/                 # Smart Contracts using Hardhat
│   ├── contracts/
│   │   └── LandRegistry.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── hardhat.config.js
│   ├── artifacts/
│   │   └── ...
│   ├── package.json
│
├── .env
├── README.md
```

## Security Considerations

- All sensitive data is stored in environment variables
- JWT authentication for API endpoints
- Smart contract security measures
- IPFS for decentralized document storage
- MetaMask for secure wallet connection

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 