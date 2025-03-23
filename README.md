
# BlockchAIn - Web3 AI Agent Platform

<div align="center">
  <img src="./blockchAIn.jpeg" alt="BlockchAIn Logo" width="512">
  <h3>Where Blockchain meets Artificial Intelligence</h3>
</div>

## 📖 Overview

BlockchAIn is a cutting-edge platform that bridges Web3 technology with AI capabilities, providing a seamless interface for creating, managing, and interacting with intelligent agents. These agents can perform a variety of blockchain-related tasks, provide insights on crypto projects, and help users navigate the complex world of Web3xAI.

The platform features a clean, minimalist interface designed for both beginners and experienced blockchain enthusiasts, allowing anyone to leverage the power of AI within the Web3 ecosystem.

## ✨ Key Features

- **AI Agent Creation**: Generate specialized AI agents tailored to your Web3 project needs
- **Web3 Integration**: Connect your wallet and interact with blockchain data
- **Agent Interaction**: Communicate with your agents through an intuitive chat interface
- **Web3 Blend**: Create multiple specialized agents for complex Web3 projects
- **Conversation History**: Track and review all interactions with your agents
- **Secure NFT-Based Identity**: Agents are tied to secure NFT hashes

## 🛠️ Technologies

### Frontend
- React
- TypeScript
- Framer Motion (animations)
- Tailwind CSS
- shadcn/ui components
- Axios for API requests

### Backend
- FastAPI (Python)
- Web3.py for blockchain interactions
- Language model integration
- JSON for state management

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- Yarn or npm
- Git
- MetaMask or another Web3 wallet

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/blockchAIn.git

cd blockchAIn/frontend

# Install dependencies
npm install
# or
yarn install

# Start development server
npm run dev
# or
yarn dev
```

### Backend Setup

```bash
# Navigate to backend directory
git clone https://github.com/yourusername/blockchAIn.git

cd blockchAIn/backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload --port 8080
```

## 🚀 Usage Guide

### Connecting Your Wallet

1. Open the application in your browser at `http://localhost:5173`
2. Click the "Connect Wallet" button in the top navigation
3. Follow the MetaMask (or other wallet) prompts to connect

### Creating an Agent

1. Navigate to the "Create Agent" tab
2. Enter a detailed prompt describing the agent's purpose and knowledge areas
3. Click "Create Agent" and wait for the generation to complete
4. Your new agent will appear in the agent list

### Using Web3 Blend

1. Navigate to the "Web3 Blend" tab
2. Enter a description of your Web3 project
3. Click "Generate Web3 Agents" to create specialized agents
4. Select an agent from the dropdown
5. Enter your query or instructions
6. Click "Run Agent" to get a response

### Interacting with Agents

1. Select an agent from your list
2. Type your message in the chat interface
3. The agent will respond based on its specialized knowledge
4. All conversations are saved and can be reviewed in the "History" tab

## 📂 Project Structure

```
blockchAIn/
├── frontend/                  # React frontend application
│   ├── public/                # Static files
│   ├── src/                   # Source code
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service integrations
│   │   ├── styles/            # CSS and style files
│   │   └── main.tsx           # Entry point
│   └── package.json           # Frontend dependencies
├── backend/                   # FastAPI backend
│   ├── app/                   # Application code
│   │   ├── api/               # API routes
│   │   │   └── web3_routes/   # Web3 related endpoints
│   │   ├── web3_agents/       # Web3 agent implementation
│   │   └── main.py            # Entry point
│   ├── requirements.txt       # Backend dependencies
│   └── user_data/             # User and agent data storage
└── README.md                  # This file
```

## 🔌 API Endpoints

### Web3 Manager API

- `GET /blend/web3_manager/{user_id}/agents` - Get all agents for a user
- `POST /blend/web3_manager/{user_id}/create-agents` - Create new agents for a Web3 project
- `POST /blend/web3_manager/{user_id}/run-agent` - Run an agent with specific instructions

### Aigent API

- `POST /aigent/create-agent` - Create a single agent with specific capabilities
- `POST /aigent/interact` - Interact with an existing agent
- `GET /aigent/history/{nft_hash}` - Get conversation history for an agent

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in both frontend and backend directories:

#### Frontend (.env)
```
VITE_API_URL=http://localhost:8080
VITE_ENABLE_MOCK_DATA=false
```

#### Backend (.env)
```
GEMINI_API_KEY=your_gemini_api_key
CDP_API_KEY=your_cdp_api_key
CDP_PRIVATE_KEY=cdp_private_key
WALLET_PRIVATE_KEY=wallet_private_key
ALCHEMY_URL=alchemy_url
WALLET_ADDRESS=wallet_address
GOOGLE_API_KEY=your_gemini_api_key
```

## 🤝 Contributing

We welcome contributions to BlockchAIn! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please make sure to update tests as appropriate and adhere to the code style guidelines.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Thanks to all contributors who have helped build this platform
- Special thanks to the Web3 and AI communities for inspiration and support

---

<div align="center">
  <p>Built with ❤️ by the BlockchAIn Team</p>
</div>
