import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../_services/admin.service';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgIf, TitleCasePipe } from '@angular/common';
import { ClientService } from '../_services/client.service';
import { TrainnerService } from '../_services/trainner.service';
//added
@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [FormsModule, BsDropdownModule, RouterLink, RouterLinkActive, TitleCasePipe, NgIf],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})

export class NavComponent implements OnInit {
  
  adminService = inject(AdminService);
  trainnerService = inject(TrainnerService);
  clientService = inject(ClientService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  selectedUserType: string = 'admin';
  model: any = {};
  modeltrainner: any = {};
  modelclient: any = {};
  navname? : string ; 
  name? : string ; 

  ngOnInit() {
    this.setUser();
    if (this.isLoggedIn()) {
      this.navname = 'sidebar';
    } 
    else {
      this.navname = 'fixed-top';
    }
  }
  
  setUser() {
    if (this.adminService.currentAdmin()) {
      this.name = this.adminService.currentAdmin()?.username;
    } 
    else if (this.trainnerService.currentTrainner()) {
      this.name = this.trainnerService.currentTrainner()?.name;
    } 
    else if (this.clientService.currentClient()) {
      this.name = this.clientService.currentClient()?.name;
    } 
    else {
      this.name = ''; // Reset the name if no user is logged in
    }
  }

  isLoggedIn(): boolean {
    return !!(
      this.adminService.currentAdmin() ||
      this.trainnerService.currentTrainner() ||
      this.clientService.currentClient()
    );
  }
  
  login() {
    this.adminService.login(this.model).subscribe({
      next: _ => {
        this.router.navigateByUrl('/'), 
        this.navname='sidebar' ;
        this.name = this.adminService.currentAdmin()?.username
      } ,
      error: error => this.toastr.error(error.error)
    }
    )
  }

  logintrainner() {
    this.trainnerService.login(this.modeltrainner).subscribe({
      next: _ => {
        this.router.navigateByUrl('/'), 
        this.navname='sidebar' ;
        this.name = this.trainnerService.currentTrainner()?.name
      } ,
      error: error => this.toastr.error(error.error)
    }
    )
  }

  loginclient() {
    this.clientService.login(this.modelclient).subscribe({
      next: _ => {
        this.router.navigateByUrl('/'), 
        this.navname='sidebar' ;
        this.name = this.clientService.currentClient()?.name
      } ,
      error: error => this.toastr.error(error.error)
    }
    )
  }

  logout() {
    this.adminService.logout();
    this.router.navigateByUrl('/');
    this.navname='fixed-top' ;
    this.name = '';
  }

  logoutclient() {
    this.clientService.logout();
    this.router.navigateByUrl('/');
    this.navname='fixed-top' ;
    this.name = '';
  }


  logouttrainner() {
    this.trainnerService.logout();
    this.router.navigateByUrl('/');
    this.navname='fixed-top';
    this.name = '';
  }

}
