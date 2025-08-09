import { ClientService } from '../_services/client.service';
import { ToastrService } from 'ngx-toastr';
import { inject } from '@angular/core';

export function authclientGuard() {

  const accountclientService = inject(ClientService);
  const toastr = inject(ToastrService);

  if (accountclientService.currentClient()) {
    return true;
  }
  else {
    toastr.error('you shall not pass');
    return false;
  }
}
