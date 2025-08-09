import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent implements OnInit {
  message: string = '';
  loading = true;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      this.http.get(`http://localhost:5001/api/client/verify-email?token=${token}`, { responseType: 'text' })
        .subscribe({
          next: res => {
            this.message = res;
            this.loading = false;
          },
          error: err => {
            this.message = 'Verification failed: ' + err.error;
            this.loading = false;
          }
        });
    } else {
      this.message = 'No token found in URL.';
      this.loading = false;
    }
  }
}
