import 'dotenv/config';
import express from 'express';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from './generated/prisma/client';
import { PrismaCartRepository } from './adapter/out/persistence/PrismaCartRepository';
import { CartService } from './domain/cart/CartService';
import { createCartController } from './adapter/in/http/CartController';

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
const cartUseCase = new CartService(cartRepository);

const app = express();
app.use(express.json());
app.use('/api', createCartController(cartUseCase));

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`listening on port ${PORT}`));
