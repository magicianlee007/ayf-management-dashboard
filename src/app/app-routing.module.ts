import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EthComponent } from './eth/eth.component';
import { MaticComponent } from './matic/matic.component';

const routes: Routes = [
  { path: 'eth', component: EthComponent },
  { path: 'matic', component: MaticComponent },
  { path: '', redirectTo: '/eth', pathMatch: 'full' }, // redirect to `first-component`
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
