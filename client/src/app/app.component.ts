import { Component, inject, NgModule, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent } from "./nav/nav.component";
import { AdminService } from './_services/admin.service';
import { SlideshowComponent } from "./slide-show/slide-show.component";
import { NgxSpinnerComponent } from 'ngx-spinner';
import { TrainnerService } from './_services/trainner.service';
import { ClientService } from './_services/client.service';


@Component({
  selector: 'app-root'  , 
  standalone: true,
  imports: [RouterOutlet, NavComponent ,NgxSpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit {
  public adminservice = inject(AdminService);
  public trainnerservice = inject(TrainnerService);
  public clientservice = inject(ClientService);
  
  title = 'client';
    
  ngOnInit(): void {
    this.setCurrentAdmin();
    this.setCurrentTrainner();
    this.setCurrentClient();
  }

  setCurrentAdmin() {
    const adminString = localStorage.getItem('adminloginstorage');
    if (!adminString) return; // end and returning null 
    const admin = JSON.parse(adminString);
    this.adminservice.currentAdmin.set(admin);
  }
   
  setCurrentClient() {
    const clientString = localStorage.getItem('clientloginstorage');
    if (!clientString) return; // end and returning null 
    const client = JSON.parse(clientString);
    this.clientservice.currentClient.set(client);
  }
  setCurrentTrainner() {
    const trainnerString = localStorage.getItem('trainnerloginstorage');
    if (!trainnerString) return; // end and returning null 
    const trainner = JSON.parse(trainnerString);
    this.trainnerservice.currentTrainner.set(trainner);
  }
  
}




