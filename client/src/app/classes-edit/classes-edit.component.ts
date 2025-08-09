import { Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { JsonPipe, NgIf } from '@angular/common';
import { Classes } from '../_models/classes';
import { ClassesService } from '../_services/classes.service';
import { AdminService } from '../_services/admin.service';

@Component({
  selector: 'app-classes-edit',
  standalone: true,
  imports: [FormsModule, JsonPipe, NgIf],
  templateUrl: './classes-edit.component.html',
  styleUrl: './classes-edit.component.css'
})
export class ClassesEditComponent implements OnInit {

  @ViewChild('editForm') editForm?: NgForm;
  @HostListener('window:beforeunload', ['event']) notify($event: any) {
    if (this.editForm?.dirty) {
      $event.returnValue = true;
    }
  }
  private toastr = inject(ToastrService);
  selectedclass?: Classes;
  classid?: number;
  originalclass?: Classes;

  constructor(public classService: ClassesService, public adminservice: AdminService,
    private myroute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {

    if (this.adminservice.currentAdmin()?.cando) {
      this.classid = this.myroute.snapshot.params['id'];
      this.loadclass(this.classid!);
    }


    else {
      this.toastr.error("you shall not pass")
    }

  }

  loadclass(classid: number) {
    this.classService.getClassbyid(classid).subscribe({
      next: (x) => {
        this.selectedclass = { ...x };
        this.originalclass = { ...x }; // store original state for comparison
      },
      error: (err) => this.toastr.error(err.error),
    });

  }

  edit() {
    if (!this.hasChanges()) {
      this.toastr.info('No changes to save.');
      return;
    }

    const updatedClass: Classes = {
      id: this.selectedclass!.id!,
      name: this.selectedclass!.name!
    };


    this.classService.updateClass(updatedClass as Classes).subscribe({
      next: _ => {
        this.toastr.success('Class edited successfully');
        this.editForm?.reset(this.editForm?.value);

        this.originalclass = { ...updatedClass }; // refresh original
      },
      error: err => this.toastr.error('Update failed')
    });
  }

  hasChanges(): boolean {
    if (!this.selectedclass || !this.originalclass) return false;

    const keys: (keyof Classes)[] = ['id', 'name'];

    return keys.some((key) => this.selectedclass![key] !== this.originalclass![key]);
  }

}
