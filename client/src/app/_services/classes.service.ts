import { inject, Injectable } from '@angular/core';
import { Classes } from '../_models/classes';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClassesService{
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
  };

  getTrainnerclasses(id :number ): Observable<Classes[]> {
    return this.http.get<Classes[]>(this.baseUrl + `classes/getTrainnerclass/${id}`);
  }

  getClasses(): Observable<Classes[]> {
    return this.http.get<Classes[]>(this.baseUrl + `classes/getall`, this.httpOptions);
  }

  register(model: any) {
    return this.http.post(this.baseUrl + `classes/add`, model)
  }

  deleteClass(id: number) {
    return this.http.delete(this.baseUrl + `classes/${id}`);
  }

  getClassbyid(id: number): Observable<Classes> {
    return this.http.get<Classes>(this.baseUrl + `classes/getclass/${id}`, this.httpOptions);
  } 
  
  updateClass(member: Classes) {
    return this.http.put(this.baseUrl + 'classes/', member)
  }
  
}
