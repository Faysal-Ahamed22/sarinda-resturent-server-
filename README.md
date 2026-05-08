# Sarinda Restaurant Server

A Node.js/Express backend server for the Sarinda Restaurant management system with MongoDB integration, JWT authentication, and admin role-based access control.

## Features

- **User Authentication**: JWT-based token authentication with 7-day expiration
- **Role-Based Access**: Admin and user roles with different permission levels
- **Menu Management**: CRUD operations for menu items
- **Reviews System**: Users can submit and view restaurant reviews
- **Shopping Cart**: Add/remove items from cart
- **Booking System**: Users can book tables with admin confirmation
- **Error Handling**: Comprehensive try-catch error handling on all endpoints
- **CORS Support**: Cross-origin requests enabled
- **MongoDB Integration**: Secure connection with MongoDB Atlas

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **Deployment**: Vercel
- **Security**: dotenv for environment variables

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Vercel account (for deployment)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Faysal-Ahamed22/sarinda-resturent-server-.git
cd sarinda-resturent-server-
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file** in the root directory
```env
PORT=5000
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
ACCESS_TOKEN_SECRET=your_secret_key
```

4. **Run locally**
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /jwt` - Generate JWT token

### Menu
- `GET /menu` - Get all menu items
- `GET /menu/:id` - Get single menu item
- `POST /menu` - Create menu item (admin only)
- `PATCH /menu/:id` - Update menu item (admin only)
- `DELETE /menu/:id` - Delete menu item (admin only)

### Reviews
- `GET /reviews` - Get all reviews (or filter by email)
- `POST /reviews` - Submit a review (authenticated)

### Cart
- `GET /carts` - Get all cart items (authenticated)
- `POST /carts` - Add item to cart (authenticated)
- `DELETE /carts/:id` - Remove item from cart (authenticated)

### Users
- `GET /users` - Get user data (authenticated)
- `POST /users` - Create new user
- `PATCH /users/:id/role` - Update user role (admin only)
- `DELETE /users/:id` - Delete user (admin only)

### Bookings
- `GET /bookings` - Get bookings by email (authenticated)
- `POST /bookings` - Create booking (authenticated)
- `PATCH /bookings/:id/confirm` - Confirm booking (admin only)
- `DELETE /bookings/:id` - Cancel booking (admin only)

### Health Check
- `GET /` - Returns "cooking"

## Authentication

Include JWT token in request headers:
```
Authorization: Bearer <your_jwt_token>
```

## Deployment

Deployed on Vercel at: [https://sarinda-server.vercel.app](https://sarinda-server.vercel.app)

### Deploy to Vercel
```bash
vercel --prod
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `DB_USER` | MongoDB username |
| `DB_PASS` | MongoDB password |
| `ACCESS_TOKEN_SECRET` | JWT secret key |

## Project Structure

```
sarinda-server/
├── index.js           # Main server file
├── package.json       # Dependencies
├── vercel.json        # Vercel config
├── .env              # Environment variables
└── README.md         # This file
```

## Database Collections

- `menu` - Restaurant menu items
- `reviews` - Customer reviews
- `carts` - Shopping cart items
- `users` - User accounts
- `bookings` - Table bookings

## Error Handling

All endpoints include comprehensive error handling with:
- Try-catch blocks for error catching
- Meaningful HTTP status codes
- Detailed error messages in responses
- Console logging for debugging

## Security Features

- JWT-based authentication
- Environment variables for sensitive data
- Admin role verification middleware
- CORS protection
- MongoDB connection with Stable API version

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Author

Faysal Ahamed

## Support

For issues and questions, please open an issue on GitHub.

---

**Last Updated**: May 2026
**Production URL**: https://sarinda-server.vercel.app
