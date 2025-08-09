import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextInputComponent } from '../_forms/text-input/text-input.component';
import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { TrainnerMember } from '../_models/trainner-member';
import { ClientMember } from '../_models/client-member';
import { AppointmentService } from '../_services/appointment.service';
import { AdminService } from '../_services/admin.service';
import { ClientService } from '../_services/client.service';
import { TrainnerService } from '../_services/trainner.service';
import { Schedule } from '../_models/schedule';
import { ClassesService } from '../_services/classes.service';
import { Classes } from '../_models/classes';

@Component({
  selector: 'app-appointment-register',
  standalone: true,
  imports: [ReactiveFormsModule, TextInputComponent, JsonPipe, FormsModule, NgIf , NgFor],
  templateUrl: './appointment-register.component.html',
  styleUrl: './appointment-register.component.css'
})
export class AppointmentRegisterComponent implements OnInit {

  fb = inject(FormBuilder);
  registerForm: FormGroup = new FormGroup({});
  validationErrors: string[] | undefined;
  toastr = inject(ToastrService);
  trainners: Array<TrainnerMember> = [];
  clients: Array<ClientMember> = [];
  classess: Array<Classes> = [];
  schedule: Array<Schedule> = [];
  dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
 selectedTrainnerId :number | undefined;
 
  constructor(public appointmentService: AppointmentService, public adminService: AdminService,
    public trainnerService: TrainnerService, public clientService: ClientService , public classesService: ClassesService) { }

  ngOnInit(): void {
    this.trainnerService.gettrainners().subscribe(x => {
      this.trainners = x;
    });

    this.clientService.getclients().subscribe(x => {
      this.clients = x;
    });

    this.initializeForm()
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      trainnerId: ['', Validators.required],
      adminId: [this.adminService.currentAdmin()?.id, Validators.required],
      clientId: ['', Validators.required],
      classId: ['', Validators.required],
      date: ['', [Validators.required, this.futureDateValidator]],
      time: ['', Validators.required],
    });
  }

  onTrainnerChange(event: Event) {
    this.schedule=[];
    this.classess=[];
     this.selectedTrainnerId = Number((event.target as HTMLSelectElement).value);
    if (this.selectedTrainnerId) {
      this.getTrainnerschedule(this.selectedTrainnerId);
      this.getTrainnerclasses(this.selectedTrainnerId);
    }
  }
  
  getTrainnerschedule (id :number){
    this.appointmentService.gettrainnerschedule(id).subscribe(x => {
      this.schedule = x;
    });
  }

    getTrainnerclasses (id : number){
    this.classesService.getTrainnerclasses(id).subscribe(x => {
      this.classess = x;
    });
  }

  // Date must be today or in the future
  futureDateValidator(control: any) {
    const selectedDate = new Date(control.value);
    const today = new Date();
    // Reset time so we only compare dates
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate >= today ? null : { dateInPast: true };
  }

  register() {
    this.appointmentService.register(this.registerForm.value).subscribe({
      next:_ => this.toastr.success('Appointment Added successfully') , 
      error: (err) => this.toastr.error(err.error), // Display the error message
    });
  }

}