# Breet Shopping Cart API

A scalable shopping cart system API built with Node.js, MongoDB, and Redis. This platform allows multiple users to purchase products from a shared inventory while maintaining data consistency and preventing overselling.

## Features

- Product inventory management
- Shopping cart operations
- Concurrent checkout handling
- Redis caching for improved performance
- Rate limiting for API protection
- Input validation and error handling

## Tech Stack

- Node.js
- TypeScript
- Express.js
- MongoDB
- Redis
- Express Validator
- Helmet (Security)
- CORS

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis
- npm or yarn

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd shopping-cart-api
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory

4. Start the development server:

```bash
npm run dev
```

## API Documentation

### Products

#### Create Product

```http
POST /api/products
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product Description",
  "price": 99.99,
  "stock": 100,
  "category": "Category"
}
```

#### Get Product

```http
GET /api/products/:id
```

#### Update Stock

```http
PATCH /api/products/:id/stock
Content-Type: application/json

{
  "quantity": 50
}
```

#### List Products

```http
GET /api/products?page=1&limit=10
```

#### Search Products

```http
GET /api/products/search?query=search_term
```

### Cart

#### Get Cart

```http
GET /api/carts/:userId
```

#### Add Item to Cart

```http
POST /api/carts/:userId/items
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 1
}
```

#### Remove Item from Cart

```http
DELETE /api/carts/:userId/items/:productId
```

#### Update Cart Item

```http
PATCH /api/carts/:userId/items/:productId
Content-Type: application/json

{
  "quantity": 2
}
```

#### Checkout

```http
POST /api/carts/:userId/checkout
```

## Error Handling

The API uses standard HTTP status codes and returns error messages in the following format:

```json
{
  "error": "Error message description"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. By default:

- 100 requests per 15 minutes per IP
- Configurable through environment variables

## Caching Strategy

- Product data: Cached for 1 hour
- Cart data: Cached for 30 minutes
- Stock locks: Held for 5 minutes during checkout

## Concurrency Handling

The system uses Redis locks to prevent race conditions during:

- Stock updates
- Cart modifications
- Checkout process

## Security

- Helmet.js for security headers
- CORS enabled
- Input validation
- Rate limiting
- Error handling

## Development

To run the development server with hot reloading in dev environment using nodemon:

```bash
npm run dev
```

To build for production:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Testing

## License

ISC
