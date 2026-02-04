import { Component, OnInit, OnDestroy, HostListener, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, catchError, tap } from 'rxjs/operators';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../models/user.model';
import { SearchDropdownComponent } from './search-dropdown/search-dropdown.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatInputModule,
    MatFormFieldModule,
    SearchDropdownComponent
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly searchSubject = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  searchValue = '';
  searchResult: User | null = null;
  showDropdown = false;
  loading = false;
  notFound = false;
  isResultActive = false;

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(value => {
        if (!value) {
          this.resetSearch();
          return;
        }
        this.loading = true;
        this.notFound = false;
        this.searchResult = null;
        this.showDropdown = true;
      }),
      switchMap(value => {
        if (!value) return of(null);
        const id = parseInt(value, 10);
        if (isNaN(id) || id < 1) {
          this.loading = false;
          this.notFound = true;
          return of(null);
        }
        return this.userService.getUser(id).pipe(
          catchError(() => {
            this.notFound = true;
            return of(null);
          })
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.loading = false;
      if (user) {
        this.searchResult = user;
        this.notFound = false;
        this.isResultActive = true;
      }
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtered = input.value.replace(/[^0-9]/g, '');
    this.searchValue = filtered;
    input.value = filtered;
    this.searchSubject.next(filtered);
  }

  onFocus(): void {
    if (this.searchValue && (this.searchResult || this.notFound)) {
      this.showDropdown = true;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-container')) {
      this.showDropdown = false;
      this.isResultActive = false;
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.showDropdown) return;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        if (this.searchResult) {
          this.isResultActive = true;
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (this.isResultActive && this.searchResult) {
          this.selectUser(this.searchResult);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.showDropdown = false;
        this.isResultActive = false;
        break;
    }
  }

  selectUser(user: User): void {
    this.router.navigate(['/users', user.id]);
    this.resetSearch();
  }

  private resetSearch(): void {
    this.searchValue = '';
    this.searchResult = null;
    this.showDropdown = false;
    this.loading = false;
    this.notFound = false;
    this.isResultActive = false;
  }
}
