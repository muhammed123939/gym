import { Component, inject, input } from '@angular/core';
import { Adminmember } from '../_models/adminmember';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminService } from '../_services/admin.service';

@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [NgIf , NgFor ],
  templateUrl: './admin-list.component.html',
  styleUrl: './admin-list.component.css'
})
export class AdminListComponent {

  admins : Array<Adminmember>=[];
  constructor(  public adminservice : AdminService ,  private router : Router  ){

  }

  ngOnInit(): void {
    this.adminservice.getMembers().subscribe(x=>{
      this.admins=x;
    });
}


signup(){
  this.router.navigateByUrl("/adminRegister"); 
  }
  
edititem(admin:Adminmember){
  
this.router.navigateByUrl(`editadmin/${admin.id}`);

}


deleteitem(admin:Adminmember){
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${admin.name}. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminservice.deleteadmin(admin.id).subscribe(() => {
          this.admins = this.admins!.filter(a => a.id !== admin.id);
          Swal.fire('Deleted!', `${admin.name} has been deleted.`, 'success');
        });
      }
    });
  }


}