import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, OnInit, signal } from '@angular/core';
import { Admin } from '../_models/admin';
import { Adminmember } from '../_models/adminmember';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  
  private http = inject(HttpClient);
  httpOptions={
    headers : new HttpHeaders({'Content-Type':'application/json; charset=utf-8'})
  };
  baseurl = environment.apiUrl;
  currentAdmin = signal<Admin | null>(null);

    deleteadmin(id:number){
  return this.http.delete(this.baseurl + `admin/${id}` );
  }

  getMembers() : Observable <Adminmember[]>{
    return this.http.get<Adminmember[]>(this.baseurl + 'admin/getadmins' , this.httpOptions);
    }
  
  updateAdmin(member:Adminmember){
    return this.http.put(this.baseurl + 'admin/' , member)
  }
    
  getuserbyid(id:number): Observable <Adminmember> {
    return this.http.get<Adminmember>(this.baseurl + `admin/${id}` , this.httpOptions);
  }

  login(model: any) {
    return this.http.post<Admin>(this.baseurl + 'admin/loginadmin', model).pipe(
      map(loggedadmin => {
        if (loggedadmin) {
          localStorage.setItem('adminloginstorage', JSON.stringify(loggedadmin));
          this.currentAdmin.set(loggedadmin);
        }
      })
    )
  }

  register(model: any) {
    return this.http.post<Admin>(this.baseurl + 'admin/registeradmin', model)
  }
  
setAdmin(setadmin: Admin) {
  this.currentAdmin.set(setadmin);
}

  logout() {
    localStorage.removeItem('adminloginstorage');
    this.currentAdmin.set(null);
  }
   
}
