import { Component, inject } from '@angular/core';
import { Admin } from '../_models/admin.Added';
import { ClientMember } from '../_models/client-member';
import { ClientService } from '../_services/client.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../_services/admin.service';
import { TrainnerService } from '../_services/trainner.service';
import { ToastrService } from 'ngx-toastr';

// @ts-ignore
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.js';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent {
  toastr = inject(ToastrService);
  adminadded: Array<Admin> = [];
  clients: ClientMember[] | null = null;
  searchTerm: string = '';
  offer: string = '';
  selectedImage: string | null = null;

  constructor(public clientservice: ClientService, private router: Router,
    public adminservice: AdminService, public trainnerService: TrainnerService) {
  }

  ngOnInit(): void {

    if (this.adminservice.currentAdmin()) {

      this.clientservice.getadmins().subscribe(x => {
        this.adminadded = x;
      });
    }

    if (this.trainnerService.currentTrainner()) {
      this.clientservice.getclientsoftrainner(this.trainnerService.currentTrainner()?.id!).subscribe(x => {
        this.clients = x;
      });
    }
  }

  edititem(client: ClientMember) {
    this.router.navigateByUrl(`editclient/${client.id}`);
  }

  signupClient() {
    this.router.navigateByUrl("/clientregister");
  }

  submitOffer() {
    if (!this.offer.trim()) {
      this.toastr.error("Offer cannot be empty.");
      return;
    }

    this.clientservice.offer(this.offer).subscribe({
      next: (response: any) => {
        this.toastr.success(response); // e.g., "Offer sent to all verified clients."
        this.offer = ''; // clear the input
      },
      error: (err) => {
        this.toastr.error(err.error || "Failed to send offer.");
      }
    });
  }

  deleteitem(client: any) {

    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${client.name}. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.clientservice.deleteclient(client.id).subscribe(() => {
          this.clients = this.clients!.filter(a => a.id !== client.id);
          Swal.fire('Deleted!', `${client.name} has been deleted.`, 'success');
        });
      }
    });
  }

  onSearchChange(): void {
    const term = this.searchTerm.trim();

    if (!term) {
      return;
    }

    this.clientservice.searchclients(term).subscribe(results => {
      this.clients = results;
    });
  }

  openImage(publicId?: string) {
  if (!publicId) {
    this.toastr.error("No photo available for this client.");
    return;
  }
  this.selectedImage = `https://res.cloudinary.com/dixiryhwa/image/upload/${publicId}.jpg`;

  const modalElement = document.getElementById('imageModal');
  if (modalElement) {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }
}


}
