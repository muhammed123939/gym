import { Component, inject, OnInit} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { AdminService } from '../_services/admin.service';
import { TextInputComponent } from "../_forms/text-input/text-input.component";
import { JsonPipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, TextInputComponent, JsonPipe],
  templateUrl: './adminregister.component.html',
  styleUrl: './adminregister.component.css'
})

export class AdminregisterComponent implements OnInit {
  private AdminService = inject(AdminService);
  private fb = inject(FormBuilder); //using reactive forms
  toastr = inject(ToastrService);
  registerForm: FormGroup = new FormGroup({});
  validationErrors: string[] | undefined;

  ngOnInit(): void {
    this.initializeForm()
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      adminname: ['', Validators.required],
      adminpassword: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', [Validators.required, this.matchValues('adminpassword')]]
    });//next part to avoid changes in password text
    this.registerForm.controls['adminpassword'].valueChanges.subscribe({
      next: () => this.registerForm.controls['confirmPassword'].updateValueAndValidity()
    })
  }
  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value === control.parent?.get(matchTo)?.value ? null : { isMatching: true }
    }
  }

  register() {
  this.AdminService.register(this.registerForm.value).subscribe({
    next: _ => this.toastr.success('Admin Added successfully'),
    error: (err) => {
      const errorMessage = err.error?.message || 'An error occurred';
      this.toastr.error(errorMessage);
    }
  });
}

}

