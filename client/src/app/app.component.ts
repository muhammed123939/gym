import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from "./nav/nav.component";
import { AdminService } from './_services/admin.service';
import { NgxSpinnerComponent } from 'ngx-spinner';
import { TrainnerService } from './_services/trainner.service';
import { ClientService } from './_services/client.service';
import { SignalRService } from './_services/signalr.service';
import { NotificationService } from './_services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavComponent, NgxSpinnerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'client';

  constructor(
    private signalRService: SignalRService,
    private notificationService: NotificationService // ✅ inject NotificationService
  ) {}

  public adminservice = inject(AdminService);
  public trainnerservice = inject(TrainnerService);
  public clientservice = inject(ClientService);

  ngOnInit(): void {
    console.log("AppComponent initialized ✅");

    const who = this.getCurrentUser();
    console.log("Current user detected:", who);

    if (who.role && who.id) {
      // ✅ Start SignalR
      this.signalRService.startConnection(who.role, who.id);
      this.signalRService.addNotificationListener();

      // ✅ Load unread notifications when user comes online
      this.notificationService.loadUnread(who.id);
    }

    // hydrate services
    this.setCurrentAdmin();
    this.setCurrentTrainner();
    this.setCurrentClient();
  }

  private getCurrentUser(): { role: 'admin' | 'trainer' | 'client' | null, id: number | null } {
    const adminStr = localStorage.getItem('adminloginstorage');
    const clientStr = localStorage.getItem('clientloginstorage');
    const trainnerStr = localStorage.getItem('trainnerloginstorage');

    if (adminStr) {
      const admin = JSON.parse(adminStr);
      return { role: 'admin', id: admin.adminId ?? admin.id ?? null };
    }
    if (clientStr) {
      const client = JSON.parse(clientStr);
      return { role: 'client', id: client.clientId ?? client.id ?? null };
    }
    if (trainnerStr) {
      const trainner = JSON.parse(trainnerStr);
      return { role: 'trainer', id: trainner.trainnerId ?? trainner.id ?? null };
    }
    return { role: null, id: null };
  }

  private setCurrentAdmin() {
    const s = localStorage.getItem('adminloginstorage');
    if (!s) return;
    this.adminservice.currentAdmin.set(JSON.parse(s));
  }

  private setCurrentClient() {
    const s = localStorage.getItem('clientloginstorage');
    if (!s) return;
    this.clientservice.currentClient.set(JSON.parse(s));
  }

  private setCurrentTrainner() {
    const s = localStorage.getItem('trainnerloginstorage');
    if (!s) return;
    this.trainnerservice.currentTrainner.set(JSON.parse(s));
  }
}
