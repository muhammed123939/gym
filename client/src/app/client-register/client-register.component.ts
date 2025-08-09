import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ClientService } from '../_services/client.service';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../_services/admin.service';
import { TextInputComponent } from '../_forms/text-input/text-input.component';
import { JsonPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-client-register',
  standalone: true,
  imports: [ReactiveFormsModule, TextInputComponent, JsonPipe, FormsModule, NgIf],
  templateUrl: './client-register.component.html',
  styleUrl: './client-register.component.css'
})
export class ClientRegisterComponent implements OnInit {
  fb = inject(FormBuilder);
  registerForm: FormGroup = new FormGroup({});
  validationErrors: string[] | undefined;
  toastr = inject(ToastrService);

  constructor(public clientservice: ClientService, public adminService: AdminService) { }

  ngOnInit(): void {
    this.initializeForm()
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      gender: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.maxLength(11)]],
      dateOfBirth: ['', Validators.required],
      adminId: [this.adminService.currentAdmin()?.id, Validators.required],
      email: ['', [Validators.required, Validators.email, this.validEmailDomainValidator]],

      nationalnumber: ['', [Validators.required, Validators.pattern(/^\d{14}$/), this.simpleNationalIdValidator]]
    });
  }

  validEmailDomainValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    if (!email) return null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; // more strict than Angular default

    return emailRegex.test(email) ? null : { invalidEmailFormat: true };
  }

  simpleNationalIdValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) return null;

    if (!/^\d{14}$/.test(value)) return { invalidFormat: true };

    const year = parseInt(value.substring(1, 3), 10);
    const month = parseInt(value.substring(3, 5), 10);
    const day = parseInt(value.substring(5, 7), 10);
    const century = value[0] === '2' ? 1900 : value[0] === '3' ? 2000 : null;

    if (!century) return { invalidCentury: true };

    const birthDate = new Date(century + year, month - 1, day);
    if (
      birthDate.getFullYear() !== century + year ||
      birthDate.getMonth() !== month - 1 ||
      birthDate.getDate() !== day
    ) {
      return { invalidDate: true };
    }

    return null;
  }

  register() {
    this.clientservice.register(this.registerForm.value).subscribe({
      next: (response: any) => {
        // Show backend message
        this.toastr.success(response.message);
      },
      error: (err) => {
        this.toastr.error(err.error); // Display error message from backend
      }
    });
  }

}


