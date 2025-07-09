'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [messageContent, setMessageContent] = useState('');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !recipient.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor, ingrese un mensaje y un destinatario.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Placeholder for actual API call to send message
      // In a real implementation, this would call an API endpoint
      // that integrates with Twilio (WhatsApp/SMS) or Telegram API.
      console.log(`Sending message to ${recipient}: ${messageContent}`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      toast({
        title: 'Éxito',
        description: 'Mensaje enviado correctamente (simulado).',
      });
      setMessageContent('');
      setRecipient('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Error al enviar el mensaje.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'COMPLEX_ADMIN' && user.role !== 'STAFF')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mensajería Digital</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Enviar Mensaje</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="recipient">Destinatario (Número de Teléfono o ID de Usuario)</Label>
            <Input 
              id="recipient" 
              value={recipient} 
              onChange={(e) => setRecipient(e.target.value)} 
              placeholder="Ej: +573001234567 o ID de Usuario"
            />
          </div>
          <div>
            <Label htmlFor="messageContent">Mensaje</Label>
            <Textarea 
              id="messageContent" 
              value={messageContent} 
              onChange={(e) => setMessageContent(e.target.value)} 
              rows={5} 
              placeholder="Escribe tu mensaje aquí..."
            />
          </div>
          <Button onClick={handleSendMessage} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Enviar Mensaje
          </Button>
        </div>
      </div>

      <div className="mt-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Historial de Mensajes (Próximamente)</h2>
        <p className="text-gray-600">El historial de mensajes y la integración con plataformas como WhatsApp o Telegram se implementarán en futuras actualizaciones.</p>
      </div>
    </div>
  );
}
