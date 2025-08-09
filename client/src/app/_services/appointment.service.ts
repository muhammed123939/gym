import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Admin } from '../_models/admin.Added';
import { Appointment } from '../_models/appointment';
import { Observable } from 'rxjs';
import { Schedule } from '../_models/schedule';
import { Trainner } from '../_models/trainner';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
  };

  getappointmentsbydate(date: Date): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.baseUrl + `appointment/getappointmentsbydate/${date}`, this.httpOptions);
  }

  getClasses(): Observable<Admin[]> {
    return this.http.get<Admin[]>(this.baseUrl + 'appointment/getClasses', this.httpOptions);
  }

    getTrainners(): Observable<Admin[]> {
    return this.http.get<Admin[]>(this.baseUrl + 'appointment/getTrainners', this.httpOptions);
  }

  getClients(): Observable<Admin[]> {
    return this.http.get<Admin[]>(this.baseUrl + 'appointment/getClients', this.httpOptions);
  }

  getAdmins(): Observable<Admin[]> {
    return this.http.get<Admin[]>(this.baseUrl + 'appointment/getAdmins', this.httpOptions);
  }

  gettrainnerschedule(id: number) {
      return this.http.get<Schedule[]>(this.baseUrl + `appointment/trainnerSchedule/${id}`, this.httpOptions);
  }
  
  getalltrainnerschedule() {
      return this.http.get<Schedule[]>(this.baseUrl + `appointment/getschedulesalltrainners`, this.httpOptions);
  }

  register(model: any) {
    return this.http.post(this.baseUrl + 'appointment/registerappointment', model)
  }

  deleteappointment(id: number) {
    return this.http.delete(this.baseUrl + `appointment/${id}`);
  }

  getappointmentbyid(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(this.baseUrl + `appointment/getappointment/${id}`, this.httpOptions);
  } 

  getappointmentsbyclient(idclient :number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.baseUrl + `appointment/GetAppointmentsByClient/${idclient}`, this.httpOptions);
  }

  getappointmentbyclientedit(idappointment: number , idclient: number): Observable<Appointment> {
    return this.http.get<Appointment>(this.baseUrl + `appointment/GetAppointmentsByClientedit/${idappointment}/${idclient}`, this.httpOptions);
  } 

    getappointmentsbytrainner(idtrainner :number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.baseUrl + `appointment/GetAppointmentsByTrainner/${idtrainner}`, this.httpOptions);
  }

  getappointmentbytrainneredit(idappointment: number , idtrainner: number): Observable<Appointment> {
    return this.http.get<Appointment>(this.baseUrl + `appointment/getappointmentbytrainneredit/${idappointment}/${idtrainner}`, this.httpOptions);
  }


  updateAppointment(member: Appointment) {
    return this.http.put(this.baseUrl + 'appointment/', member)
  }

}
