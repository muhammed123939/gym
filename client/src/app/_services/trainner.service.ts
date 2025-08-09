import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Trainner } from '../_models/trainner';
import { TrainnerMember } from '../_models/trainner-member';
import { Admin } from '../_models/admin.Added';
import { ClientMember } from '../_models/client-member';
import { Client } from '../_models/client';


@Injectable({
  providedIn: 'root'
})
export class TrainnerService {

  private http = inject(HttpClient);
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
  };
  baseurl = environment.apiUrl;

  currentTrainner = signal<Trainner | null>(null);

  deletetrainner(id: number) {
    return this.http.delete(this.baseurl + `trainner/${id}`);
  }

  updateSchedule(trainnerId: number, scheduleData: { schedule: { day: number, startTime: string, endTime: string }[], classIds: number[] }) {
    return this.http.put(this.baseurl + `trainner/updateTrainnerschedule/${trainnerId}`, scheduleData);
  }

  updatetrainner(member: TrainnerMember) {
    return this.http.put(this.baseurl + 'trainner/', member)
  }

  gettrainnerbyid(id: number): Observable<TrainnerMember> {
    return this.http.get<TrainnerMember>(this.baseurl + `trainner/${id}`, this.httpOptions);
  }

  gettrainnerappointment(id: number): Observable<Admin[]> {
    return this.http.get<Admin[]>(this.baseurl + `trainner/appointmentsbytrainner/${id}`, this.httpOptions);
  }

  getadmins(): Observable<Admin[]> {
    return this.http.get<Admin[]>(this.baseurl + 'trainner/adminaddedthetrainner', this.httpOptions);
  }

  searchtrainner(term: string): Observable<TrainnerMember[]> {
    return this.http.get<TrainnerMember[]>(this.baseurl + `trainner/search?term=${term}`);
  }

  gettrainners(): Observable<TrainnerMember[]> {
    return this.http.get<TrainnerMember[]>(this.baseurl + 'trainner/', this.httpOptions);
  }

  login(model: any) {
    return this.http.post<Trainner>(this.baseurl + 'trainner/logintrainner', model).pipe(
      map(loggedtrainner => {
        if (loggedtrainner) {
          localStorage.setItem('trainnerloginstorage', JSON.stringify(loggedtrainner));
          this.currentTrainner.set(loggedtrainner);
        }
      })
    )
  }

  register(model: any) {
    return this.http.post<Trainner>(this.baseurl + 'trainner/trainnerregister', model)
  }

  setcurrenttrainner(settrainner: Trainner) {
    this.currentTrainner.set(settrainner);
  }

  logout() {
    localStorage.removeItem('trainnerloginstorage');
    this.currentTrainner.set(null);
  }
}

