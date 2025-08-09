import { JsonPipe, NgIf } from '@angular/common';
import { Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AppointmentService } from '../_services/appointment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Appointment } from '../_models/appointment';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../_services/admin.service';
import { ClientService } from '../_services/client.service';
import { TrainnerService } from '../_services/trainner.service';
import { PhotoEditorComponent } from "../photo-editor/photo-editor.component";

@Component({
  selector: 'app-appointment-edit',
  standalone: true,
  imports: [FormsModule, JsonPipe, NgIf, PhotoEditorComponent],
  templateUrl: './appointment-edit.component.html',
  styleUrl: './appointment-edit.component.css'
})
export class AppointmentEditComponent implements OnInit {

  @ViewChild('editForm') editForm?: NgForm;
  @HostListener('window:beforeunload', ['event']) notify($event: any) {
    if (this.editForm?.dirty) {
      $event.returnValue = true;
    }
  }
  private toastr = inject(ToastrService);
  selectedappointment?: Appointment;
  appointmentid?: number;
  originalAppointment?: Appointment;

  constructor(public adminService: AdminService, public clientService: ClientService,
    public trainnerService: TrainnerService, public appointmentService: AppointmentService, private myroute: ActivatedRoute,
    private router: Router) { }

  isFutureOrToday(date: string | Date): boolean {
    const selectedDate = new Date(date);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    return selectedDate >= today;
  }

  ngOnInit(): void {
    this.appointmentid = this.myroute.snapshot.params['id'];
    this.loadappointment(this.appointmentid!);
  }

  loadappointment(appointmentid: number) {

    if (this.adminService.currentAdmin()) {
      this.appointmentService.getappointmentbyid(appointmentid).subscribe({
        next: (x) => {
          this.selectedappointment = { ...x };
          this.originalAppointment = { ...x }; // store original state for comparison
        }, // Assign the fetched patient data
        error: (err) => this.toastr.error(err.error), // Display the error message
      });
    }

    if (this.clientService.currentClient()) {
      this.appointmentService.getappointmentbyclientedit(appointmentid, this.clientService.currentClient()?.id!).subscribe({
        next: (x) => {
          this.selectedappointment = { ...x };
          this.originalAppointment = { ...x }; // store original state for comparison
        }, // Assign the fetched patient data
        error: (err) => this.toastr.error(err.error), // Display the error message
      });
    }

    if (this.trainnerService.currentTrainner()) {
      this.appointmentService.getappointmentbytrainneredit(appointmentid, this.trainnerService.currentTrainner()?.id!).subscribe({
        next: (x) => {
          this.selectedappointment = { ...x };
          this.originalAppointment = { ...x }; // store original state for comparison
        }, // Assign the fetched patient data
        error: (err) => this.toastr.error(err.error), // Display the error message
      });
    }
  }

  deletePhoto(id: number) {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    this.clientService.deletephoto(id).subscribe({
      next: () => {
        if (this.selectedappointment) {
          this.selectedappointment.hasPhoto = false;
          this.selectedappointment.publicId = undefined;
        }
        this.toastr.success('Photo deleted successfully');
      },
      error: () => {
        this.toastr.error('Failed to delete photo');
      }
    });
  }

  edit() {

    if (!this.hasChanges()) {
      this.toastr.info('No changes to save.');
      return;
    }

    if (!this.isFutureOrToday(this.selectedappointment!.date!)) {
      this.toastr.error('You can’t choose a date in the past.');
      return;
    }
    const updatedAppointment: Appointment = {
      id: this.selectedappointment!.id!,
      date: this.selectedappointment!.date!,
      trainnerId: this.selectedappointment!.trainnerId!,
      adminId: this.selectedappointment!.adminId!,
      clientId: this.selectedappointment!.clientId!,
      clientcase: this.selectedappointment!.clientcase!,
      clientcomment: this.selectedappointment!.clientcomment!,
      classId: this.selectedappointment!.classId,
      time: this.selectedappointment!.time!
    };
    this.appointmentService.updateAppointment(updatedAppointment as Appointment).subscribe({
      next: _ => {
        this.toastr.success('Appointment edited successfully');
        this.editForm?.reset(this.editForm?.value);

        this.originalAppointment = { ...updatedAppointment }; // refresh original
      },
      error: err => this.toastr.error('Update failed')
    });
  }

  hasChanges(): boolean {
    if (!this.selectedappointment || !this.originalAppointment) return false;

    const keys: (keyof Appointment)[] = ['id', 'date', 'trainnerId', 'adminId', 'clientId',
      'clientcase', 'clientcomment', 'time'];

    return keys.some((key) => this.selectedappointment![key] !== this.originalAppointment![key]);
  }
}
