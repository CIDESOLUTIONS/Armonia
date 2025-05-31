// Global module declarations

declare module 'nodemailer' {
  export interface Transport {
    sendMail(mailOptions: unknown): Promise<any>;
  }

  export function createTransport(options: unknown): Transport;
}

declare module 'mongoose' {
  export interface Schema {
    add(obj: unknown): Schema;
    pre(method: string, fn: Function): Schema;
    set(option: string, value: unknown): Schema;
    virtual(name: string): unknown;
    index(fields: any, options?: unknown): Schema;
  }

  export interface Model<T> {
    find(conditions: any, projection?: any, options?: unknown): Promise<T[]>;
    findById(id: any, projection?: any, options?: unknown): Promise<T | null>;
    findOne(conditions: any, projection?: any, options?: unknown): Promise<T | null>;
    create(doc: unknown): Promise<T>;
    updateOne(conditions: any, doc: any, options?: unknown): Promise<any>;
    deleteOne(conditions: unknown): Promise<any>;
    findOneAndUpdate(conditions: any, update: any, options?: unknown): Promise<T | null>;
  }

  export interface Document {
    save(): Promise<this>;
    toObject(): unknown;
  }

  export function model<T>(name: string, schema: Schema): Model<T>;
  export function Schema(definition: any, options?: unknown): Schema;
}

declare module '@hookform/resolvers/zod' {
  export function zodResolver(schema: unknown): unknown;
}

declare module 'react-hook-form' {
  export function useForm(config?: unknown): unknown;
  export function Controller(props: unknown): JSX.Element;
}

declare module '@/components/ui/form' {
  export function Form(props: unknown): JSX.Element;
  export function FormField(props: unknown): JSX.Element;
  export function FormItem(props: unknown): JSX.Element;
  export function FormLabel(props: unknown): JSX.Element;
  export function FormControl(props: unknown): JSX.Element;
  export function FormDescription(props: unknown): JSX.Element;
  export function FormMessage(props: unknown): JSX.Element;
  export function useFormField(): unknown;
}

declare module '@/components/ui/dialog' {
  export function Dialog(props: unknown): JSX.Element;
  export function DialogContent(props: unknown): JSX.Element;
  export function DialogDescription(props: unknown): JSX.Element;
  export function DialogFooter(props: unknown): JSX.Element;
  export function DialogHeader(props: unknown): JSX.Element;
  export function DialogTitle(props: unknown): JSX.Element;
  export function DialogTrigger(props: unknown): JSX.Element;
}

declare module '@/components/ui/tabs' {
  export function Tabs(props: unknown): JSX.Element;
  export function TabsContent(props: unknown): JSX.Element;
  export function TabsList(props: unknown): JSX.Element;
  export function TabsTrigger(props: unknown): JSX.Element;
}

declare module '@/lib/db' {
  export const pool: unknown;
}

declare module '../../utils/errors' {
  export class NotFoundError extends Error {}
  export class ValidationError extends Error {}
  export class AuthorizationError extends Error {}
}

declare module '@/hooks/use-auth' {
  export default function useAuth(): unknown;
}
