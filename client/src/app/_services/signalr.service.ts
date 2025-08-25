import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hubConnection?: signalR.HubConnection;

  constructor(private toastr: ToastrService) { }

  startConnection(role: string, userId: number) {
  if (this.hubConnection?.state === signalR.HubConnectionState.Connected) return;

  this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(`https://localhost:5000/hubs/notification?role=${role}&userId=${userId}`, {
      withCredentials: true
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information) // 👈 log all messages
    .build();

  this.hubConnection.start()
    .then(() => {
      console.log(`✅ SignalR Connected: role=${role}, userId=${userId}`);
      this.addNotificationListener(); // 👈 REGISTER handler after connect
    })
    .catch(err => console.error('❌ SignalR start error: ', err));
}


addNotificationListener() {
  if (!this.hubConnection) return;

  // Remove old listener first to avoid duplicates
  this.hubConnection.off('ReceiveNotification');

  this.hubConnection.on('ReceiveNotification', (user: string, message: string) => {
    console.log(`📢 Notification from ${user}: ${message}`);
    // this.toastr.success(message, 'New Notification');
  });
}


  // (Optional) If you want the client to trigger sending
  sendNotification(role: string, id: number, message: string) {
    if (!this.hubConnection) return;
    this.hubConnection.invoke('SendNotification', role, id.toString(), message)
      .catch(err => console.error('❌ sendNotification error: ', err));
  }
}
