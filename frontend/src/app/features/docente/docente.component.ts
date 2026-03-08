import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-docente',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './docente.component.html',
  styleUrls: ['./docente.component.css']
})
export class DocenteComponent {

  constructor(private authService: AuthService) {}

  logout(){
    this.authService.logout();
  }

}