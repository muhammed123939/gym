import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../_services/admin.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgIf, TitleCasePipe, NgFor, AsyncPipe } from '@angular/common';
import { ClientService } from '../_services/client.service';
import { TrainnerService } from '../_services/trainner.service';
import { NotificationService } from '../_services/notification.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [
    AsyncPipe,
    FormsModule,
    BsDropdownModule,
    RouterLink,
    RouterLinkActive,
    TitleCasePipe,
    NgIf,
    NgFor,
  ],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  adminService = inject(AdminService);
  trainnerService = inject(TrainnerService);
  clientService = inject(ClientService);
  notificationService = inject(NotificationService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  unreadCount: number = 0;
  selectedUserType: string = 'admin';
  name?: string;

  model: any = {};
  modeltrainner: any = {};
  modelclient: any = {};
  navname?: string;

  constructor() {
    this.notificationService.unreadCount$.subscribe(count => this.unreadCount = count);
  }

  ngOnInit() {
    this.setUser();
    this.navname = this.isLoggedIn() ? 'sidebar' : 'fixed-top';

    const user = this.getCurrentUser();
    if (user?.id) {
      this.notificationService.loadUnread(user.id);
    }
  }

  setUser() {
    if (this.adminService.currentAdmin()) {
      this.name = this.adminService.currentAdmin()?.username;
    } else if (this.trainnerService.currentTrainner()) {
      this.name = this.trainnerService.currentTrainner()?.name;
    } else if (this.clientService.currentClient()) {
      this.name = this.clientService.currentClient()?.name;
    } else {
      this.name = '';
    }
  }

  isLoggedIn(): boolean {
    return !!(
      this.adminService.currentAdmin() ||
      this.trainnerService.currentTrainner() ||
      this.clientService.currentClient()
    );
  }

  getCurrentUser() {
    return (
      this.adminService.currentAdmin() ||
      this.trainnerService.currentTrainner() ||
      this.clientService.currentClient()
    );
  }

  onBellClick() {
    const user = this.getCurrentUser();
    if (user?.id) {
      this.notificationService.markAsRead(user.id);
    }
  }

  markAllAsRead() {
    const user = this.getCurrentUser();
    if (user?.id) {
      this.notificationService.markAsRead(user.id);
    }
  }

  // --- login / logout ---
  login() {
    this.adminService.login(this.model).subscribe({
      next: () => {
        this.router.navigateByUrl('/');
        this.navname = 'sidebar';
        this.setUser();
      },
      error: error => this.toastr.error(error.error)
    });
  }

  logintrainner() {
    this.trainnerService.login(this.modeltrainner).subscribe({
      next: () => {
        this.router.navigateByUrl('/');
        this.navname = 'sidebar';
        this.setUser();
      },
      error: error => this.toastr.error(error.error)
    });
  }

  loginclient() {
    this.clientService.login(this.modelclient).subscribe({
      next: () => {
        this.router.navigateByUrl('/');
        this.navname = 'sidebar';
        this.setUser();
      },
      error: error => this.toastr.error(error.error)
    });
  }

  logout() {
    this.adminService.logout();
    this.resetNav();
  }

  logouttrainner() {
    this.trainnerService.logout();
    this.resetNav();
  }

  logoutclient() {
    this.clientService.logout();
    this.resetNav();
  }

  private resetNav() {
    this.router.navigateByUrl('/');
    this.navname = 'fixed-top';
    this.name = '';
  }
}
