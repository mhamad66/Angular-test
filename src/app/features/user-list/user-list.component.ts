import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from '../../core/services/user.service';
import { User, PageResponse } from '../../models/user.model';
import { UserCardComponent } from '../../shared/components/user-card/user-card.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    UserCardComponent
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit, OnDestroy {
  private readonly userService = inject(UserService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  users: User[] = [];
  currentPage = 1;
  totalPages = 1;
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const page = parseInt(params['page'], 10);
        if (isNaN(page) || page < 1) {
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { page: 1 },
            replaceUrl: true
          });
          return;
        }
        this.currentPage = page;
        this.loadUsers();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    this.userService.getUsers(this.currentPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PageResponse) => {
          this.users = response.data;
          this.totalPages = response.total_pages;
          this.loading = false;
          this.cdr.markForCheck();

          if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.goToPage(1);
          }
        },
        error: () => {
          this.error = 'Failed to load users. Please try again.';
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  goToPage(page: number): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      replaceUrl: false
    });
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  retry(): void {
    this.loadUsers();
  }
}
