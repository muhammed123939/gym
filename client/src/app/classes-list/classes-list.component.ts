import { NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Classes } from '../_models/classes';
import { AdminService } from '../_services/admin.service';
import { ClassesService } from '../_services/classes.service';


@Component({
  selector: 'app-classes-list',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule],
  templateUrl: './classes-list.component.html',
  styleUrl: './classes-list.component.css'
})
export class ClassesListComponent implements OnInit{
  classes: Array<Classes> = [];
  private toastr = inject(ToastrService);

  constructor(public adminservice: AdminService, private router: Router, private classesservice: ClassesService) {
  }

  ngOnInit(): void {
    if (this.adminservice.currentAdmin()?.cando) {
      this.classesservice.getClasses().subscribe(x => {
        this.classes = x;
      });
    }

    else {
      this.toastr.error("you shall not pass")
    }
  }

  signup() {
    this.router.navigateByUrl("/classregister");
  }

  edititem(classs: Classes) {
    this.router.navigateByUrl(`editclass/${classs.id}`);
  }

  deleteitem(classs: Classes) {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete class whose Name =  ${classs.name}. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.classesservice.deleteClass(classs.id).subscribe(() => {
          this.classes = this.classes.filter(a => a.id !== classs.id);
          Swal.fire('Deleted!', `${classs.name} has been deleted.`, 'success');
        });
      }
    });
  }

}

