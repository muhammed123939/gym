import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Client } from '../_models/client';
import { ClientMember } from '../_models/client-member';
import { Admin } from '../_models/admin.Added';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private http = inject(HttpClient);
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
  };
  baseurl = environment.apiUrl;

  currentClient = signal<Client | null>(null);

  
  deletephoto(id: number) {
    return this.http.delete(this.baseurl + `client/deletephoto/${id}`);
  }

  deleteclient(id: number) {
    return this.http.delete(this.baseurl + `client/${id}`);
  }

  getclientbyid(id: number): Observable<ClientMember> {
    return this.http.get<ClientMember>(this.baseurl + `client/client/${id}`, this.httpOptions);
  }

  getadmins(): Observable<Admin[]> {
    return this.http.get<Admin[]>(this.baseurl + 'client/adminaddedtheClient', this.httpOptions);
  }

  updateClient(member: ClientMember) {
    return this.http.put(this.baseurl + 'client/', member)
  }

  searchclients(term: string): Observable<ClientMember[]> {
    return this.http.get<ClientMember[]>(this.baseurl + `client/search?term=${term}`);
  }

  getclients(): Observable<ClientMember[]> {
    return this.http.get<ClientMember[]>(this.baseurl + 'client/', this.httpOptions);
  }

    getclientsoftrainner(id:number): Observable<ClientMember[]> {
    return this.http.get<ClientMember[]>(this.baseurl + `client/getclientstrainner/${id}`, this.httpOptions);
  }

  login(model: any) {
    return this.http.post<Client>(this.baseurl + 'client/login', model).pipe(
      map(loggedclient => {
        if (loggedclient) {
          localStorage.setItem('clientloginstorage', JSON.stringify(loggedclient));
          this.currentClient.set(loggedclient);
        }
      })
    )
  }

  offer(offer: string) {
    return this.http.post(this.baseurl + 'client/offer', JSON.stringify(offer), {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text'
    });
  }

  register(model: any) {
    return this.http.post<Client>(this.baseurl + 'client/clientregister', model)
  }

  setcurrentClient(setclient: Client) {
    this.currentClient.set(setclient);
  }

  logout() {
    localStorage.removeItem('clientloginstorage');
    this.currentClient.set(null);
  }
}
