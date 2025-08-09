import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TrainnerMember } from '../_models/trainner-member';
import { Classes } from '../_models/classes';
import { Admin } from '../_models/admin.Added';
import { AdminService } from '../_services/admin.service';
import { Router } from '@angular/router';
import { TrainnerService } from '../_services/trainner.service';
import { Photo } from '../_models/photo';
import { ClassesService } from '../_services/classes.service';
import Swal from 'sweetalert2';
import { PhotoService } from '../_services/photo.service';
import { Schedule } from '../_models/schedule';
import { AppointmentService } from '../_services/appointment.service';

@Component({
  selector: 'app-trainner-list',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule],
  templateUrl: './trainner-list.component.html',
  styleUrl: './trainner-list.component.css'
})
export class TrainnerListComponent implements OnInit {
  trainners: Array<TrainnerMember> = [];

  adminadded: Array<Admin> = [];
  photos: Array<Photo> = [];
  trainnerSchedulesMap: { [key: number]: Schedule[] } = {};
  dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  constructor(public classservice: ClassesService, public adminservice: AdminService, public appointmentService: AppointmentService,
    public photoservice: PhotoService, private router: Router, private trainnerservice: TrainnerService) {
  }

  ngOnInit(): void {

    this.appointmentService.getalltrainnerschedule().subscribe(x => {
      // Reset the map to avoid stale data
      this.trainnerSchedulesMap = {};

      for (const sched of x) {
        if (!this.trainnerSchedulesMap[sched.trainnerId]) {
          this.trainnerSchedulesMap[sched.trainnerId] = [];
        }
        this.trainnerSchedulesMap[sched.trainnerId].push(sched);
      }
    });
    this.photoservice.getTrainnersphotos().subscribe(x => {
      this.photos = x;
    });

    this.trainnerservice.gettrainners().subscribe(trainners => {
      this.trainners = trainners;

      // Now that trainners are loaded, loop and fetch their classes
      this.trainners.forEach(trainner => {
        this.classservice.getTrainnerclasses(trainner.id).subscribe(classes => {
          trainner.classList = classes;
        });
      });
    });
    // this.classservice.getClasses().subscribe(x => {
    //   this.classes = x;
    // });

    this.trainnerservice.getadmins().subscribe(x => {
      this.adminadded = x;
    });
  };


  groupSchedulesByTime(schedules: Schedule[]): { [timeKey: string]: string[] } {
    const grouped: { [timeKey: string]: string[] } = {};

    for (const sched of schedules) {
      const key = `${sched.startTime} - ${sched.endTime}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }

      const dayName = this.dayNames[+sched.dayOfWeek];
      if (!grouped[key].includes(dayName)) {
        grouped[key].push(dayName);
      }
    }

    return grouped;
  }

   appointments(trainnerid: number) {
    this.router.navigateByUrl(`appointmentList/${trainnerid}`);
   }

  edititem(trainner: TrainnerMember) {

    this.router.navigateByUrl(`edittrainner/${trainner.id}`);

  }

  signuptrainner() {
    this.router.navigateByUrl("/trainnerregister");
  }


  deleteitem(trainner: TrainnerMember) {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${trainner.name}. This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.trainnerservice.deletetrainner(trainner.id).subscribe(() => {
          this.trainners = this.trainners.filter(a => a.id !== trainner.id);
          Swal.fire('Deleted!', `${trainner.name} has been deleted.`, 'success');
        });
      }
    });
  }
}
