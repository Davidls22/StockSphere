
# StockSphere

StockSphere is a comprehensive financial analysis tracking app designed to help users monitor their stock investments and stay updated with the latest market trends. The app features user authentication, stock tracking, portfolio management, and alert notifications, making it a robust tool for both novice and experienced investors.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features
- **User Authentication**: Secure login and registration.
- **Stock Tracking**: Search and track various stocks.
- **Portfolio Management**: Add stocks to your portfolio and view detailed analytics.
- **Alerts**: Set and receive alerts for stock price changes.
- **News Updates**: Get the latest news related to tracked stocks.

## Technologies Used
### Backend
- **Node.js**: JavaScript runtime for building the backend server.
- **Express.js**: Web framework for Node.js.
- **MongoDB**: NoSQL database for storing user and stock data.
- **Mongoose**: ODM for MongoDB.
- **JWT**: JSON Web Tokens for authentication.
- **bcrypt**: Library for hashing passwords.

### Frontend
- **React Native**: Framework for building mobile applications.
- **Expo**: Toolset for developing React Native apps.
- **React Navigation**: Navigation library for React Native.
- **react-native-svg-charts**: Library for data visualization.

## Installation
### Prerequisites
- Node.js and npm installed
- MongoDB instance running
- Expo CLI installed

### Backend Setup
1. Clone the repository:
   \`\`\`sh
   git clone https://github.com/Davidls22/StockSphere.git
   \`\`\`
2. Navigate to the backend directory:
   \`\`\`sh
   cd StockSphere/backend
   \`\`\`
3. Install dependencies:
   \`\`\`sh
   npm install
   \`\`\`
4. Create a \`.env\` file in the backend directory and add your environment variables:
   \`\`\`env
   PORT=8080
   MONGO_URI=your_mongo_uri
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
   NEWS_API_KEY=your_news_api_key
   JWT_SECRET=your_jwt_secret
   \`\`\`
5. Start the backend server:
   \`\`\`sh
   npm run dev
   \`\`\`

### Frontend Setup
1. Navigate to the frontend directory:
   \`\`\`sh
   cd StockSphere/frontend
   \`\`\`
2. Install dependencies:
   \`\`\`sh
   npm install
   \`\`\`
3. Start the Expo development server:
   \`\`\`sh
   expo start
   \`\`\`

## Usage
1. Open the Expo Go app on your mobile device.
2. Scan the QR code displayed in the terminal after running \`expo start\`.
3. Register a new account or log in with existing credentials.
4. Use the app to search for stocks, manage your portfolio, set alerts, and stay updated with the latest stock news.

## API Endpoints
### Authentication
- \`POST /api/auth/register\`: Register a new user.
- \`POST /api/auth/login\`: Log in an existing user.

### Alerts
- \`GET /api/alerts/:userId\`: Get alerts for a specific user.
- \`POST /api/alerts\`: Create a new alert.
- \`DELETE /api/alerts/:alertId\`: Delete an alert.

### Stocks
- \`GET /api/stocks/stock/historical/:symbol\`: Get historical data for a stock.
- \`GET /api/stocks/stock/news/:symbol\`: Get news for a stock.

## Contributing
1. Fork the repository.
2. Create a new branch (\`git checkout -b feature/your-feature\`).
3. Commit your changes (\`git commit -m 'Add some feature'\`).
4. Push to the branch (\`git push origin feature/your-feature\`).
5. Open a pull request.
