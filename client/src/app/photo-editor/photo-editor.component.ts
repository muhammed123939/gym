import { Component, inject, Input, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { FileUploader, FileUploadModule } from 'ng2-file-upload';
import { DecimalPipe, NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Router } from '@angular/router';
import { TrainnerService } from '../_services/trainner.service';
import { ClientService } from '../_services/client.service';

@Component({
  selector: 'app-photo-editor',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, NgStyle, FileUploadModule, DecimalPipe],
  templateUrl: './photo-editor.component.html',
  styleUrl: './photo-editor.component.css'
})

export class PhotoEditorComponent implements OnInit {
  constructor(public trainnerservice: TrainnerService, public clientservice: ClientService,
    private router: Router) { }

  uploader?: FileUploader;
  hasBaseDropZoneOver = false;
  baseUrl = environment.apiUrl;
  url!: string;
  @Input() appointmentId!: number;
  @Input() trainnerid!: number;

  ngOnInit(): void {
    if (this.trainnerservice.currentTrainner()) {
      const trainnerId = this.trainnerservice.currentTrainner()!.id;
      this.url = `${this.baseUrl}photo/add-photo/${trainnerId}`;
    }

    if (this.clientservice.currentClient()) {
      const clientId = this.clientservice.currentClient()!.id;
      this.url = `${this.baseUrl}photo/add-clientphoto/${this.appointmentId}/${clientId}/${this.trainnerid}`;
    }

    this.initializeUploader();
  }

  fileOverBase(e: any) {
    this.hasBaseDropZoneOver = e;
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: this.url,
      authToken: 'Bearer ' + this.trainnerservice.currentTrainner()?.token,
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024
    });

    this.uploader.onAfterAddingFile = (file) => {
      if (this.uploader!.queue.length > 1) {
        this.uploader!.removeFromQueue(file);
      }
      file.withCredentials = false
    }

    if (this.trainnerservice.currentTrainner()) {
      this.uploader.onSuccessItem = (item, response, status, headers) => {
        this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
          this.router.navigate(["/edittrainner"]);
        });
      }
    }

    if (this.clientservice.currentClient()) {
      this.uploader.onSuccessItem = (item, response, status, headers) => {
        this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
          this.router.navigate([`/appointmentedit/${this.appointmentId}`]);
        });
      }
    }

  }
}
