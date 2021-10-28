import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { CreateFormComponent } from './create-form/create-form.component';
import { StartMenuComponent } from './start-menu/start-menu.component';

const routes: Routes = [
  {path: '', component: StartMenuComponent,},
  {path: 'formularz', component: CreateFormComponent,},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
