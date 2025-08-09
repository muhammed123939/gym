import { JsonPipe, NgIf } from '@angular/common';
import { Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ClientMember } from '../_models/client-member';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../_services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../_services/client.service';

@Component({
  selector: 'app-client-edit',
  standalone: true,
  imports: [TabsModule, FormsModule, JsonPipe, NgIf],
  templateUrl: './client-edit.component.html',
  styleUrl: './client-edit.component.css'
})
export class ClientEditComponent implements OnInit{
  
  @ViewChild('editForm') editForm?: NgForm;
    @HostListener('window:beforeunload', ['event']) notify($event: any) {
      if (this.editForm?.dirty) {
        $event.returnValue = true;
      }
    }
  
  selecteduser? : ClientMember;
  clientid? : number ; 
  private toastr = inject(ToastrService);
  confirmPassword: string = '';
  passwordTouched: boolean = false;
  originalUser?: ClientMember;

    constructor(  public adminservice :AdminService ,  public clientservice :ClientService  , 
       private router : Router  , private myroute: ActivatedRoute ) { }
 
    ngOnInit(): void {

      if(this.clientservice.currentClient()){
        this.clientid=this.clientservice.currentClient()?.id;
        this.loadclient(this.clientid!);
       }
  
      else{
        this.clientid = this.myroute.snapshot.params['id'] ;
        if(this.clientid)
        this.loadclient(this.clientid!);
      }
  }

  loadclient(clientId: number): void {
    this.clientservice.getclientbyid(clientId).subscribe({
      next: (x) => {
        this.selecteduser = { ...x };
        this.originalUser = { ...x }; // store original state for comparison
      },
      error: (err) => this.toastr.error(err.error),
     });
  }
   
  edit() {

    if (!this.hasChanges()) {
      this.toastr.info('No changes to save.');
      return;
    }
  
    if (this.passwordTouched && this.selecteduser?.password !== this.confirmPassword) {
      this.toastr.error('Passwords do not match');
      return;
    }
    
    const updatedUser: ClientMember = {
      id: this.selecteduser!.id!,
      name: this.selecteduser!.name!,
      dateOfBirth: this.selecteduser!.dateOfBirth!,
      
      age: this.selecteduser!.age!,
      gender: this.selecteduser!.gender!,
      mobileNumber : this.selecteduser!.mobileNumber! , 
      adminId: this.selecteduser!.adminId!,
      nationalNumber: this.selecteduser!.nationalNumber! , 
      password: this.selecteduser?.password   // will be deleted if needed
    };
    
  
    if (
      !this.passwordTouched ||
      !this.selecteduser?.password ||
      this.selecteduser.password.trim().length === 0
    ) {
      delete updatedUser.password;
    }
      
    this.clientservice.updateClient(this.editForm?.value).subscribe({
      next: _ => {
        this.toastr.success('Client edited successfully');
        this.editForm?.reset(this.editForm?.value);
        this.confirmPassword = '';
        this.passwordTouched = false;
  
        this.originalUser = { ...updatedUser }; // refresh original
      },
      error: err => this.toastr.error('Update failed')
    });

  }

      hasChanges(): boolean {
        if (!this.selecteduser || !this.originalUser) return false;
      
      
        const keys: (keyof ClientMember)[] = ['id', 'name','dateOfBirth','age','gender','mobileNumber','adminId' , 'nationalNumber'];
    
        return keys.some((key) => this.selecteduser![key] !== this.originalUser![key]) ||
        (this.passwordTouched && this.selecteduser?.password?.trim().length > 0);
      }

    onMemberChange(event: ClientMember) {
    this.selecteduser = event;
    }


}
