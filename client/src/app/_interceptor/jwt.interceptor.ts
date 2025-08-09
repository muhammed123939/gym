import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AdminService } from '../_services/admin.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const adminService = inject (AdminService);
  if(adminService.currentAdmin()){
    req=req.clone({
      setHeaders:{
          Authorization: `Bearer ${adminService.currentAdmin()?.token}`
      }
    })
  }

  return next(req);
};
