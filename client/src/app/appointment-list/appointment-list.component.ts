import { Component, inject, OnInit } from '@angular/core';
import { Appointment } from '../_models/appointment';
import { AdminService } from '../_services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../_services/appointment.service';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Admin } from '../_models/admin.Added';
import Swal from 'sweetalert2';
import { TrainnerService } from '../_services/trainner.service';
import { ClientService } from '../_services/client.service';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.css'
})
export class AppointmentListComponent implements OnInit {
  appointments: Array<Appointment> = [];

  admins: Array<Admin> = [];
  clients: Array<Admin> = [];
  trainners: Array<Admin> = [];
  classes: Array<Admin> = [];

  private fb = inject(FormBuilder); //using reactive forms
  registerForm: FormGroup = new FormGroup({});
  private toastr = inject(ToastrService);
  constructor(public adminservice: AdminService, private router: Router, public clientService: ClientService,
    public trainnerService: TrainnerService, private appointmentService: AppointmentService , private myroute: ActivatedRoute,) {
  }

  ngOnInit(): void {
    this.initializeForm();
    if(this.myroute.snapshot.params['id'])
    {
      this.appointmentService.getappointmentsbytrainner(this.myroute.snapshot.params['id']).subscribe(x => {
        this.appointments = x;
      });

    }

    if (this.clientService.currentClient()) {
      this.appointmentService.getappointmentsbyclient(this.clientService.currentClient()?.id!).subscribe(x => {
        this.appointments = x;
      });

    }

    if (this.trainnerService.currentTrainner()) {
      this.appointmentService.getappointmentsbytrainner(this.trainnerService.currentTrainner()?.id!).subscribe(x => {
        this.appointments = x;
      });

    }

    this.appointmentService.getAdmins().subscribe(x => {
      this.admins = x;
    });


    this.appointmentService.getClasses().subscribe(x => {
      this.classes = x;
    });

    this.appointmentService.getClients().subscribe(y => {
      this.clients = y;
    });

    this.appointmentService.getTrainners().subscribe(z => {
      this.trainners = z;
    });

  }

  initializeForm() {
    this.registerForm = this.fb.group({
      date: ['', Validators.required]
    });
  }


  getappointments() {
    const date = this.registerForm.value.date;
    console.log(date);
    this.appointmentService.getappointmentsbydate(date).subscribe({
      next: (x) => (this.appointments = x),
      error: (err) => this.toastr.error(err.error)
    });

  }

  signup() {
    this.router.navigateByUrl("/appointmentRegister");
  }

  edititem(appointment: Appointment) {

    this.router.navigateByUrl(`appointmentedit/${appointment.id}`);

  }


  deleteitem(appointment: Appointment) {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete appointment whose ID =  ${appointment.id}. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.appointmentService.deleteappointment(appointment.id).subscribe(() => {
          this.appointments = this.appointments.filter(a => a.id !== appointment.id);
          Swal.fire('Deleted!', `${appointment.id} has been deleted.`, 'success');
        });
      }
    });
  }
}
