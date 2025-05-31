// src/app/api/pqr/[id]/route.ts
;
import { z } from 'zod';
;

const updateSchema = z.object({
  status: z.enum(['open', 'in_progress', 'closed']).optional(),
  response: z.string().optional(),
});
