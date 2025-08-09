import { Routes } from '@angular/router';
import { AdminListComponent } from './admin-list/admin-list.component';
import { AdminEditComponent } from './admin-edit/admin-edit.component';
import { AdminregisterComponent } from './adminregister/adminregister.component';
import { AppComponent } from './app.component';
import { authGuard } from './_guards/auth-admin.guard';
import { SlideshowComponent } from './slide-show/slide-show.component';
import { authclientGuard } from './_guards/authclient.guard';
import { TrainnerEditComponent } from './trainner-edit/trainner-edit.component';
import { ClientListComponent } from './client-list/client-list.component';
import { ClientRegisterComponent } from './client-register/client-register.component';
import { ClientEditComponent } from './client-edit/client-edit.component';
import { TrainnerListComponent } from './trainner-list/trainner-list.component';
import { ClassesRegisterComponent } from './classes-register/classes-register.component';
import { ClassesListComponent } from './classes-list/classes-list.component';
import { ClassesEditComponent } from './classes-edit/classes-edit.component';
import { TrainnerRegisterComponent } from './trainner-register/trainner-register.component';
import { authtrainnerGuard } from './_guards/authtrainner.guard';
import { AppointmentRegisterComponent } from './appointment-register/appointment-register.component';
import { AppointmentListComponent } from './appointment-list/appointment-list.component';
import { AppointmentEditComponent } from './appointment-edit/appointment-edit.component';
import { anyAuthGuard } from './_guards/any-auth.guard';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { trainnerandadminGuard } from './_guards/trainnerandadmin.guard';
2
export const routes: Routes = [
     { path: '', component: SlideshowComponent },
     { path: 'verify-email', component: VerifyEmailComponent },

     {
          path: '',
          runGuardsAndResolvers: 'always',
          canActivate: [authGuard],
          children: [
               { path: 'adminRegister', component: AdminregisterComponent },
               { path: 'appointmentRegister', component: AppointmentRegisterComponent },
               { path: 'trainnerregister', component: TrainnerRegisterComponent },
               { path: 'clientregister', component: ClientRegisterComponent },
               { path: 'classregister', component: ClassesRegisterComponent },

               { path: 'adminlist', component: AdminListComponent },
               { path: 'trainnerlist', component: TrainnerListComponent},
               { path: 'classeslist', component: ClassesListComponent},

               { path: 'editadmin/:id', component: AdminEditComponent },
               { path: 'edittrainner/:id', component: TrainnerEditComponent },
               { path: 'editclient/:id', component: ClientEditComponent } ,
               { path: 'editclass/:id', component: ClassesEditComponent }
          ]
     }
     ,
       {
          path: '',
          runGuardsAndResolvers: 'always',
          canActivate: [authtrainnerGuard],
          children: [
               { path: 'edittrainner', component: TrainnerEditComponent } 
          ]
     } 
   
     ,
       {
          path: '',
          runGuardsAndResolvers: 'always',
          canActivate: [trainnerandadminGuard],
          children: [
               { path: 'clientlist', component: ClientListComponent }
          ]
     } 
     ,

     {
          path: '',
          runGuardsAndResolvers: 'always',
          canActivate: [authclientGuard],
          children: [
               { path: 'editclient', component: ClientEditComponent }
          ]
     }
     ,
          {
          path: '',
          runGuardsAndResolvers: 'always',
          canActivate: [anyAuthGuard],
          children: [
          { path: 'appointmentedit/:id', component: AppointmentEditComponent },
          { path: 'appointmentList', component: AppointmentListComponent },
          { path: 'appointmentList/:id', component: AppointmentListComponent }
          ]
          }

     ,
     { path: '**', component: AppComponent, pathMatch: 'full' }];





