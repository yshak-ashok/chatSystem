import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { TimestampFormatPipe } from '../../pipes/timestamp-format.pipe';
import { Message } from '../../interfaces/chatInterface';
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NgOptimizedImage, TimestampFormatPipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit ,AfterViewChecked {
  constructor(
    private authService: AuthService,
    private chatService: ChatService
  ) {}

  userImage: string = 'assets/user/profile_card.webp';
  userList: any[]=[];
  userId: any;
  receiverId: string = '';
  senderId: string = '';
  receiver: any;
  sender: any;
  messageText: string = '';
  roomId: string = '';
  isText: boolean = false;
  groupedMessageArray: { date: string; messages: any[] }[] = [];
  @ViewChild('chatContainer', { static: false }) chatContainer!: ElementRef;
  ngOnInit(): void {
    this.userId = this.authService.getuserId();
    this.fetchUserList();
    this.subscribeToStatusUpdates();
    this.subscribeToMessageUpdates();
  }

  fetchUserList(): void {
    this.authService.getUsers(this.userId._id).subscribe({
      next: (res) => {
        this.userList = res.users;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  subscribeToStatusUpdates(): void {
    this.chatService
      .getStatus()
      .subscribe((data: { id: string; isActive: boolean; userId: string }) => {
        this.updateStatus(data);
      });
  }

  subscribeToMessageUpdates(): void {
    this.chatService.getMessage().subscribe((data: Message) => {
      this.updateMessageData(data);
    });
  }

  ngAfterViewChecked(): void {
    if (this.chatContainer) {
      this.scrollToBottom();
    }
  }

  updateStatus(data: any): void {
    this.authService.getUsers(this.userId._id).subscribe({
      next: (res) => {
        this.userList = res.users;
        const user = this.userList.find(
          (user: { _id: any }) => user._id === data.userId
        );
        if (user && data.userId === this.receiverId) {
          this.receiver.isActive = user.isActive;
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  updateMessageData(data: any): void {
    this.authService.getUserData(this.receiverId).subscribe({
      next: (res) => {
        this.receiver = res.userData;
        this.newMessageArrayByDate([data]);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  selectedUserHandler(selectedUserId: string): void {
    this.receiverId = selectedUserId;
    this.senderId = this.userId._id;
    this.authService.getUsers(this.userId._id).subscribe({
      next: (res) => {
        this.userList = res.users;
        this.chatService
          .createChatRoom(this.receiverId, this.senderId)
          .subscribe({
            next: (res) => {
              this.roomId = res[0]._id;
              this.authService.getUserData(this.receiverId).subscribe({
                next: (res) => {
                  this.receiver = res.userData;
                  this.authService.getUserData(this.senderId).subscribe({
                    next: (res) => {
                      this.sender = res.userData;
                      this.chatService.getRoomData(this.roomId).subscribe({
                        next: (res) => {
                          if (res!==null) {
                            this.groupedMessageArray = [];
                            this.groupMessageArrayByDate(res);
                          }else{
                            this.groupedMessageArray = [];
                          }
                        },
                        error: (err) => {
                            console.log(err);
                        },
                      });
                      this.join(this.sender.name, this.roomId);
                    },
                    error: (err) => {
                      console.error(err);
                    },
                  });
                },
                error: (err) => {
                  console.error(err);
                },
              });
            },
            error: (err) => {
              console.error(err);
            },
          });
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  join(username: string, roomId: string): void {
    this.chatService.joinRoom({ user: username, room: roomId });
  }
  textData() {
    this.isText = this.messageText.trim().length > 0;
    if (!this.isText) {
      this.messageText = '';
    }
  }
  sendMessage() {
    const timestamp = new Date().toISOString();
    this.chatService.sendWebSocket({
      user: this.sender.name,
      room: this.roomId,
      message: this.messageText,
      id: this.senderId,
      timestamp: timestamp,
    });
    this.messageText = '';
    this.textData();
  }
  scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop =
        this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  groupMessageArrayByDate(messageData: any[]) {
    const groupedMessages: any = {};
    messageData.forEach((message) => {
      const date = new Date(message.timestamp).toDateString();
      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      groupedMessages[date].push(message);
    });
    this.groupedMessageArray = Object.keys(groupedMessages).map((date) => ({
      date: date,
      messages: groupedMessages[date],
    }));
  }
  newMessageArrayByDate(messageData: any[]) {
    messageData.forEach((newMessage) => {
      const newMessageDate = new Date(newMessage.timestamp).toDateString();
      const existingDateIndex = this.groupedMessageArray.findIndex(
        (group) => group.date === newMessageDate
      );
      if (existingDateIndex !== -1) {
        this.groupedMessageArray[existingDateIndex].messages.push(newMessage);
      } else {
        this.groupedMessageArray.push({
          date: newMessageDate,
          messages: [newMessage],
        });
      }
    });
  }
}
