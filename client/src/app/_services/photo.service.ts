import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Photo } from '../_models/photo';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  private http = inject(HttpClient);
  httpOptions={
    headers : new HttpHeaders({'Content-Type':'application/json; charset=utf-8'})
  };
  baseurl = environment.apiUrl;
  
  
    getTrainnersphotos(): Observable <Photo[]> {
        return this.http.get<Photo[]>(this.baseurl + `photo/GetTrainnersphotos` , this.httpOptions);
      }
  
      getTrainnerphoto(trainnerId:number) : Observable <Photo[]> {
        return this.http.get<Photo[]>(this.baseurl + `photo/Gettrainnerphoto/${trainnerId}`, this.httpOptions);
      }
}
