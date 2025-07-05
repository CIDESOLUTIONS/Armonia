;

export interface Tenant {
  id: number;
  name: string;
  schemaName: string;
  createdAt: Date;
}

export interface ResidentialComplex {
  id: number;
  name: string;
  address: string | null;
  createdAt: Date;
  schemaName: string;
  totalUnits: number;
}

export class ManualPrismaClient extends BasePrismaClient {
  private tenantSchema: string;

  constructor(tenantSchema: string = 'public') {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL no está definida en las variables de entorno');
    }
    super({
      datasources: {
        db: {
          url: `${databaseUrl.split('?')[0]}?schema=${tenantSchema}`,
        },
      },
    });
    this.tenantSchema = tenantSchema;
  }

  setTenantSchema(schema: string) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL no está definida en las variables de entorno');
    }
    this.tenantSchema = schema;
    this.$disconnect().then(() => {
      // @ts-ignore
      this._engineConfig.datasources = {
        db: {
          url: `${databaseUrl.split('?')[0]}?schema=${schema}`,
        },
      };
      // @ts-ignore
      this.$connect();
    });
  }

  manualTenant = {
    create: async (data: { data: { name: string; schemaName: string } }) => {
      return this.$executeRawUnsafe(
        `INSERT INTO "${this.tenantSchema}"."Tenant" (name, "schemaName", "createdAt") VALUES ($1, $2, NOW()) RETURNING *`,
        data.data.name,
        data.data.schemaName
      );
    },
    findMany: async () => {
      return this.$executeRawUnsafe(`SELECT * FROM "${this.tenantSchema}"."Tenant"`);
    },
    findUnique: async (data: { where: { id: number } }) => {
      return this.$executeRawUnsafe(
        `SELECT * FROM "${this.tenantSchema}"."Tenant" WHERE id = $1 LIMIT 1`,
        data.where.id
      );
    },
  };

  manualResidentialComplex = {
    create: async (data: { data: { name: string; totalUnits: number } }) => {
      return this.$executeRawUnsafe(
        `INSERT INTO "${this.tenantSchema}"."ResidentialComplex" (name, "totalUnits", "createdAt") VALUES ($1, $2, NOW()) RETURNING *`,
        data.data.name,
        data.data.totalUnits
      );
    },
    findMany: async () => {
      return this.$executeRawUnsafe(`SELECT * FROM "${this.tenantSchema}"."ResidentialComplex"`);
    },
  };

  manualAssembly = {
    create: async (data: { data: { title: string; type: string; date: string; description: string | null; agenda: unknown; organizerId: number; complexId: number } }) => {
      return this.$executeRawUnsafe(
        `INSERT INTO "${this.tenantSchema}"."Assembly" (title, type, date, description, status, quorum, agenda, "organizerId", "complexId", "createdAt") 
         VALUES ($1, $2, $3, $4, 'PENDING', 0, $5::jsonb, $6, $7, NOW()) RETURNING *`,
        data.data.title,
        data.data.type,
        data.data.date,
        data.data.description,
        JSON.stringify(data.data.agenda),
        data.data.organizerId,
        data.data.complexId
      );
    },
    findMany: async () => {
      return this.$queryRawUnsafe(`SELECT * FROM "${this.tenantSchema}"."Assembly"`);
    },
  };
}

export const prisma = new ManualPrismaClient();