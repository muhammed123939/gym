import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { JsonPipe } from '@angular/common';
import { TextInputComponent } from '../_forms/text-input/text-input.component';
import { AdminService } from '../_services/admin.service';
import { ClassesService } from '../_services/classes.service';

@Component({
  selector: 'app-classes-register',
  standalone: true,
  imports: [ReactiveFormsModule, TextInputComponent, JsonPipe, FormsModule],
  templateUrl: './classes-register.component.html',
  styleUrl: './classes-register.component.css'
})
export class ClassesRegisterComponent implements OnInit {

  fb = inject(FormBuilder);
  registerForm: FormGroup = new FormGroup({});
  validationErrors: string[] | undefined;
  toastr = inject(ToastrService);


  constructor(public adminservice: AdminService, public classService: ClassesService) { }

  ngOnInit(): void {
    if (this.adminservice.currentAdmin()?.cando) {
      this.initializeForm()
    }
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],    
    });
  }

register() {
  console.log('Submitting form:', this.registerForm.value);
  this.classService.register(this.registerForm.value).subscribe({
      next: _ => this.toastr.success('Class Added successfully'),
      error: err => this.toastr.error(err.error)
    });
}

}

