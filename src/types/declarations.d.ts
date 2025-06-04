// Global module declarations

declare module 'nodemailer' {
  export interface Transport {
    sendMail(mailOptions: unknown): Promise<unknown>;
  }

  export function createTransport(options: unknown): Transport;
}

declare module 'mongoose' {
  export interface Schema {
    add(obj: unknown): Schema;
    pre(method: string, fn: (next: () => void) => void): Schema;
    set(option: string, value: unknown): Schema;
    virtual(name: string): unknown;
    index(fields: Record<string, unknown>, options?: unknown): Schema;
  }

  export interface Model<T> {
    find(conditions: Record<string, unknown>, projection?: Record<string, unknown>, options?: unknown): Promise<T[]>;
    findById(id: string | number, projection?: Record<string, unknown>, options?: unknown): Promise<T | null>;
    findOne(conditions: Record<string, unknown>, projection?: Record<string, unknown>, options?: unknown): Promise<T | null>;
    create(doc: unknown): Promise<T>;
    updateOne(conditions: Record<string, unknown>, doc: Record<string, unknown>, options?: unknown): Promise<unknown>;
    deleteOne(conditions: unknown): Promise<unknown>;
    findOneAndUpdate(conditions: Record<string, unknown>, update: Record<string, unknown>, options?: unknown): Promise<T | null>;
  }

  export interface Document {
    save(): Promise<this>;
    toObject(): unknown;
  }

  export function model<T>(name: string, schema: Schema): Model<T>;
  export function Schema(definition: Record<string, unknown>, options?: unknown): Schema;
}

declare module '@hookform/resolvers/zod' {
  export function zodResolver(schema: unknown): unknown;
}

declare module 'react-hook-form' {
  export function useForm(config?: Record<string, unknown>): Record<string, unknown>;
  export function Controller(props: Record<string, unknown>): JSX.Element;
}

declare module '@/components/ui/form' {
  export function Form(props: Record<string, unknown>): JSX.Element;
  export function FormField(props: Record<string, unknown>): JSX.Element;
  export function FormItem(props: Record<string, unknown>): JSX.Element;
  export function FormLabel(props: Record<string, unknown>): JSX.Element;
  export function FormControl(props: Record<string, unknown>): JSX.Element;
  export function FormDescription(props: Record<string, unknown>): JSX.Element;
  export function FormMessage(props: Record<string, unknown>): JSX.Element;
  export function useFormField(): Record<string, unknown>;
}

declare module '@/components/ui/dialog' {
  export function Dialog(props: Record<string, unknown>): JSX.Element;
  export function DialogContent(props: Record<string, unknown>): JSX.Element;
  export function DialogDescription(props: Record<string, unknown>): JSX.Element;
  export function DialogFooter(props: Record<string, unknown>): JSX.Element;
  export function DialogHeader(props: Record<string, unknown>): JSX.Element;
  export function DialogTitle(props: Record<string, unknown>): JSX.Element;
  export function DialogTrigger(props: Record<string, unknown>): JSX.Element;
}

declare module '@/components/ui/tabs' {
  export function Tabs(props: Record<string, unknown>): JSX.Element;
  export function TabsContent(props: Record<string, unknown>): JSX.Element;
  export function TabsList(props: Record<string, unknown>): JSX.Element;
  export function TabsTrigger(props: Record<string, unknown>): JSX.Element;
}

declare module '@/lib/db' {
  export const pool: Record<string, unknown>;
}

declare module '../../utils/errors' {
  export class NotFoundError extends Error {}
  export class ValidationError extends Error {}
  export class AuthorizationError extends Error {}
}

declare module '@/hooks/use-auth' {
  export default function useAuth(): Record<string, unknown>;
}
