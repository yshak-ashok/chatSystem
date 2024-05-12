export interface Message {
  date: string;
  messages: { user: string; message: string; id: string; timestamp: any };
}
