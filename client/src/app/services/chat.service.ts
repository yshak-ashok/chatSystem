import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { authURL } from '../serverURL';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: Socket;
  private serverURL = 'http://localhost:5000';
  constructor(private http: HttpClient) {
    this.socket = io(this.serverURL, {
      transports: ['websocket', 'pulling', 'flashsocket'],
    });
  }

  createChatRoom(receiverID: string, senderID: string): Observable<any> {
    const userIds = { receiverID: receiverID, senderID: senderID };
    return this.http.post<any>(`${authURL}/createChatRoom`, userIds);
  }
  sendWebSocket(data: any): void {
    this.socket.emit('message', data);
  }
  joinRoom(data: any): void {
    this.socket.emit('join', data);
  }
  joinUser(data:any):void{
    this.socket.emit('userJoin', data);
  }
  userStatus(data: any) {
    this.socket.emit('status', data);
  }
  getStatus(): Observable<any> {
    return new Observable<{ id: string; isActive: boolean,userId:string }>((observer) => {
      this.socket.on('userStatus', (data) => {
        observer.next(data);
      });
      return () => {
        console.log('disconnect');
        
        this.socket.disconnect();
      };
    });
  }
  getMessage(): Observable<any> {
    return new Observable<{ user: string; message: string; id: string, timestamp:any }>(
      (observer) => {
        this.socket.on('new message', (data) => {
          observer.next(data);
        });
        return () => {
          this.socket.disconnect();
        };
      }
    );
  }


  getRoomData(roomId: any): Observable<any> {
    return this.http.get(`${authURL}/messages?id=${roomId}`);
  }
}
