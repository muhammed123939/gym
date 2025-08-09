import { CanActivateFn } from '@angular/router';
import { TrainnerService} from '../_services/trainner.service';
import { AdminService } from '../_services/admin.service';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ClientService } from '../_services/client.service';


export const anyAuthGuard: CanActivateFn = (route, state) => {

  const trainnerService = inject(TrainnerService);
  const clientService = inject(ClientService);
  const adminService = inject(AdminService);
  const toastr = inject(ToastrService);

  if (clientService.currentClient()||trainnerService.currentTrainner()||adminService.currentAdmin()) {
    return true;
  }
  else {
    toastr.error('you shall not pass');
    return false;
  }
}







