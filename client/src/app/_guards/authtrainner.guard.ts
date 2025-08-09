import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { TrainnerService } from '../_services/trainner.service';
import { ToastrService } from 'ngx-toastr';

export const authtrainnerGuard: CanActivateFn = (route, state) => {
 const trainnerService = inject(TrainnerService);
   const toastr = inject(ToastrService);
 
   if (trainnerService.currentTrainner()) {
     return true;
   }
 
   else {
     toastr.error('you shall not pass');
     return false;
   }
  };