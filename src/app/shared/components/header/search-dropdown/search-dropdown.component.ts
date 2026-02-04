import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../../models/user.model';

@Component({
  selector: 'app-search-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-dropdown.component.html',
  styleUrls: ['./search-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchDropdownComponent {
  @Input() user: User | null = null;
  @Input() loading = false;
  @Input() notFound = false;
  @Input() isActive = false;
  @Output() selectUser = new EventEmitter<User>();

  onSelect(): void {
    if (this.user) {
      this.selectUser.emit(this.user);
    }
  }
}
