import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './adapter/in/http/swagger';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from './generated/prisma/client';
import { PrismaCartRepository } from './adapter/out/persistence/PrismaCartRepository';
import { PrismaProductRepository } from './adapter/out/persistence/PrismaProductRepository';
import { PrismaUserRepository } from './adapter/out/persistence/PrismaUserRepository';
import { PrismaOrderRepository } from './adapter/out/persistence/PrismaOrderRepository';
import { MockPaymentGateway } from './adapter/out/payment/MockPaymentGateway';
import { PrismaAuthRepository } from './adapter/out/persistence/PrismaAuthRepository';
import { BcryptPasswordHasher } from './adapter/out/security/BcryptPasswordHasher';
import { JwtTokenIssuer } from './adapter/out/security/JwtTokenIssuer';
import { CartService } from './domain/cart/CartService';
import { OrderService } from './domain/order/OrderService';
import { AuthService } from './domain/auth/AuthService';
import { ProductService } from './domain/product/ProductService';
import { createCartController } from './adapter/in/http/CartController';
import { createOrderController } from './adapter/in/http/OrderController';
import { createAuthController } from './adapter/in/http/AuthController';
import { createProductController } from './adapter/in/http/ProductController';
import { errorHandler } from './adapter/in/http/errorHandler';

// Composition root: the only place that knows about concrete adapters and
// wires them into the domain's ports. Nothing above this layer imports Express/Prisma directly.
const dbUrl = new URL(process.env.DATABASE_URL!);
const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: Number(dbUrl.port) || 3306,
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.replace(/^\//, ''),
});
const prisma = new PrismaClient({ adapter });
const cartRepository = new PrismaCartRepository(prisma);
const productRepository = new PrismaProductRepository(prisma);
const userRepository = new PrismaUserRepository(prisma);
const orderRepository = new PrismaOrderRepository(prisma);
const paymentGateway = new MockPaymentGateway();
const cartUseCase = new CartService(cartRepository, productRepository, userRepository);
const orderUseCase = new OrderService(
  orderRepository,
  paymentGateway,
  cartRepository,
  productRepository,
  userRepository,
);
const authRepository = new PrismaAuthRepository(prisma);
const passwordHasher = new BcryptPasswordHasher();
const tokenIssuer = new JwtTokenIssuer(process.env.JWT_SECRET!);
const authUseCase = new AuthService(authRepository, userRepository, passwordHasher, tokenIssuer);
const productUseCase = new ProductService(productRepository);

const app = express();
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', createCartController(cartUseCase, tokenIssuer));
app.use('/api', createOrderController(orderUseCase, tokenIssuer));
app.use('/api', createAuthController(authUseCase));
app.use('/api', createProductController(productUseCase));
app.use(errorHandler);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`listening on port ${PORT}`));
