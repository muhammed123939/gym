import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { jwtInterceptor } from './_interceptor/jwt.interceptor';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors  } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { loadingInterceptor } from './_interceptor/loading.interceptor';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(BsDropdownModule.forRoot()),
    provideAnimations() , 
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor , loadingInterceptor ])) , 
    provideToastr({
      positionClass : 'toast-bottom-right'
    })  , 
    importProvidersFrom(NgxSpinnerModule)
    ]
};