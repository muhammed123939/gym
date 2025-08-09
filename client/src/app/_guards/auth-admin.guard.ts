import { CanActivateFn } from '@angular/router';
import { AdminService } from '../_services/admin.service';
import { ToastrService } from 'ngx-toastr';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const adminService = inject(AdminService);
  const toastr = inject(ToastrService);

  if (adminService.currentAdmin()) {
    return true;
  }

  else {
    toastr.error('you shall not pass');
    return false;
  }

};
