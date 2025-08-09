
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Classes } from '../_models/classes';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../_services/admin.service';
import { Router } from '@angular/router';
import { TrainnerService } from '../_services/trainner.service';
import { TextInputComponent } from '../_forms/text-input/text-input.component';
import { JsonPipe, NgFor } from '@angular/common';
import { ClassesService } from '../_services/classes.service';

@Component({
  selector: 'app-trainner-register',
  standalone: true,
   imports: [ReactiveFormsModule, TextInputComponent, JsonPipe, FormsModule , NgFor],
  templateUrl: './trainner-register.component.html',
  styleUrl: './trainner-register.component.css'
})
export class TrainnerRegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  registerForm!: FormGroup;
  classes: Array<Classes> = [];
  toastr = inject(ToastrService);

  constructor(
    public adminService: AdminService,
    public classesservice: ClassesService,
    private router: Router,
    public trainnerService: TrainnerService
  ) {}

  ngOnInit(): void {
    this.classesservice.getClasses().subscribe(x => {
      this.classes = x;
    });
    this.initializeForm();
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      trainnername: ['', Validators.required],
      adminId: [this.adminService.currentAdmin()?.id, Validators.required],
      dateOfBirth: ['', Validators.required]
    });
  }
  
  register() {
    if (this.registerForm.invalid) return;
    this.trainnerService.register(this.registerForm.value).subscribe({
      next: _ => this.toastr.success('trainner Added successfully'),
      error: err => this.toastr.error(err.error)
    });
  }
  
}

