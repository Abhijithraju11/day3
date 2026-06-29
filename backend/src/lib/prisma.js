// PrismaClient is the auto-generated, type-safe database client.
// We export a SINGLE shared instance so the whole app reuses one connection pool.
// PrismaClient connects lazily on the first query and creates a pool automatically,
// so creating a new client per import would waste connections.
// Docs: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-management
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
