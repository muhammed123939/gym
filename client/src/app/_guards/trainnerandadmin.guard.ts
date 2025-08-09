import { CanActivateFn } from '@angular/router';
import { TrainnerService } from '../_services/trainner.service';
import { AdminService } from '../_services/admin.service';
import { ToastrService } from 'ngx-toastr';
import { inject } from '@angular/core';

export const trainnerandadminGuard: CanActivateFn = (route, state) => {
  
  
    const trainnerService = inject(TrainnerService);
    const adminService = inject(AdminService);
    const toastr = inject(ToastrService);
  
    if (trainnerService.currentTrainner()||adminService.currentAdmin()) {
      return true;
    }
    else {
      toastr.error('you shall not pass');
      return false;
    }
};
