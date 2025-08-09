import { JsonPipe, NgFor, NgIf } from '@angular/common';
import { Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PhotoEditorComponent } from '../photo-editor/photo-editor.component';
import { Photo } from '../_models/photo';
import { TrainnerMember } from '../_models/trainner-member';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../_services/admin.service';
import { TrainnerService } from '../_services/trainner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PhotoService } from '../_services/photo.service';
import { ClassesService } from '../_services/classes.service';

@Component({
  selector: 'app-trainner-edit',
  standalone: true,
  imports: [TabsModule, FormsModule, JsonPipe, NgIf, PhotoEditorComponent, NgFor],
  templateUrl: './trainner-edit.component.html',
  styleUrl: './trainner-edit.component.css'
})
export class TrainnerEditComponent implements OnInit {

  @ViewChild('editForm') editForm?: NgForm;

  availableDays: number[] = [];
  startTime: string = '';
  endTime: string = '';

  myphotos: Array<Photo> = [];
  trainneridbytrainner?: number;
  trainneridbyadmin?: number;
  selecteduser?: TrainnerMember;
  confirmPassword: string = '';
  passwordTouched: boolean = false;
  originalUser?: TrainnerMember;

  schedulePerDay: { [dayIndex: number]: { startTime: string, endTime: string } } = {};
  allClasses: { id: number, name: string }[] = [];
  selectedClassIds: number[] = [];

  private toastr = inject(ToastrService);

  @HostListener('window:beforeunload', ['event']) notify($event: any) {
    if (this.editForm?.dirty) {
      $event.returnValue = true;
    }
  }

  constructor(public adminservice: AdminService,
    public trainnerservice: TrainnerService, public classesService: ClassesService, public photoservice: PhotoService, private myroute: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {

    this.classesService.getClasses().subscribe({
      next: res => this.allClasses = res,
      error: err => this.toastr.error('Failed to load classes')
    });

    if (this.trainnerservice.currentTrainner()) {
      this.trainneridbytrainner = this.trainnerservice.currentTrainner()?.id;
      this.loadtrainner(this.trainneridbytrainner!);
    }

    else {
      this.trainneridbyadmin = this.myroute.snapshot.params['id'];
      this.loadtrainner(this.trainneridbyadmin!);
    }
  }

  onClassCheckboxChange(event: Event, classId: number) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!this.selectedClassIds.includes(classId)) {
        this.selectedClassIds.push(classId);
      }
    }
  }

  onDayCheckboxChange(event: any) {
    const day = +event.target.value;
    if (event.target.checked) {
      if (!this.availableDays.includes(day)) {
        this.availableDays.push(day);
        this.schedulePerDay[day] = { startTime: '', endTime: '' };
      }
    } else {
      this.availableDays = this.availableDays.filter(d => d !== day);
      delete this.schedulePerDay[day];
    }
  }

  loadtrainner(trainnerid: number) {
    this.photoservice.getTrainnerphoto(trainnerid).subscribe(x => this.myphotos = x);

    this.trainnerservice.gettrainnerbyid(trainnerid).subscribe({
      next: (x) => {
        this.selecteduser = { ...x };
        this.originalUser = { ...x };

        // this.selectedClassIds = x.classIds ||= []; // 👈 Fill selected class IDs
      },
      error: (err) => this.toastr.error(err.error),
    });

  }

  hasBasicChanges(): boolean {
    if (!this.selecteduser || !this.originalUser) return false;

    return (
      this.selecteduser.name !== this.originalUser.name ||
      this.selecteduser.dateOfBirth !== this.originalUser.dateOfBirth ||
      this.selecteduser.age !== this.originalUser.age ||
      this.selecteduser.trainnerPrice !== this.originalUser.trainnerPrice ||
      (this.passwordTouched && this.selecteduser?.password?.trim().length! > 0)
    );
  }

  hasScheduleChanges(): boolean {
    const originalClassIds = this.originalUser?.classIds || [];
    const currentClassIds = this.selectedClassIds;

    const classIdsChanged = originalClassIds.toString() !== currentClassIds.toString();
    const daysChanged = Object.keys(this.schedulePerDay).length !== this.availableDays.length;

    return classIdsChanged || daysChanged;
  }

  edit() {

    const updatedUser: any = {
      id: this.selecteduser!.id!,
      name: this.selecteduser!.name!,
      dateOfBirth: this.selecteduser!.dateOfBirth!,
      age: this.selecteduser!.age!,
      adminId: this.selecteduser!.adminId!,
      password: this.selecteduser?.password,
      trainnerPrice: this.selecteduser!.trainnerPrice!
    };

    if (this.hasBasicChanges()) {

      if (this.passwordTouched && this.selecteduser?.password !== this.confirmPassword) {
        this.toastr.error('Passwords do not match');
        return;
      }

      // Remove password if not changed
      if (!this.passwordTouched || !this.selecteduser?.password?.trim()) {
        delete updatedUser.password;
      }

      this.trainnerservice.updatetrainner(updatedUser).subscribe({
        next: () => this.toastr.success('Trainer basic info updated'),
        error: err => {
          console.error('Update failed:', err);
          this.toastr.error(err.error || 'Update failed');
        }
      });
    }

    const scheduleToSend = this.availableDays.map(day => ({
      day,
      startTime: this.schedulePerDay[day].startTime,
      endTime: this.schedulePerDay[day].endTime
    }));


    // ✅ 1. Handle SCHEDULE Update
    if (this.hasScheduleChanges()) {
      if (this.availableDays.length === 0 || this.selectedClassIds.length === 0) {
        this.toastr.error('Please choose at least one day and one class');
        return;
      }

      this.trainnerservice.updateSchedule(this.selecteduser!.id!, {
        schedule: scheduleToSend,
        classIds: this.selectedClassIds
      }).subscribe({
        next: () => this.toastr.success('Schedule & classes updated'),
        error: err => this.toastr.error(err.error || 'Failed to update schedule')
      });
    }

    // ✅ 2. Handle BASIC INFO Update
    if (!this.hasBasicChanges() && !this.hasScheduleChanges()) {
      this.toastr.info('No changes to save.');
    }
  }

  onMemberChange(event: TrainnerMember) {
    this.selecteduser = event;
  }

}




