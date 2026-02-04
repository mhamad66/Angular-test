import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { PageResponse, User } from '../../models/user.model';
import { environment } from '../../../environments/environment';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: 1,
    email: 'george.bluth@reqres.in',
    first_name: 'George',
    last_name: 'Bluth',
    avatar: 'https://reqres.in/img/faces/1-image.jpg'
  };

  const mockPageResponse: PageResponse = {
    page: 1,
    per_page: 6,
    total: 12,
    total_pages: 2,
    data: [mockUser]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.clearCache();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers', () => {
    it('should fetch users from API', () => {
      service.getUsers(1).subscribe(response => {
        expect(response.data.length).toBe(1);
        expect(response.data[0]).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/users?page=1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPageResponse);
    });

    it('should return cached response on subsequent calls', () => {
      service.getUsers(1).subscribe();
      const req = httpMock.expectOne(`${environment.apiBaseUrl}/users?page=1`);
      req.flush(mockPageResponse);

      service.getUsers(1).subscribe(response => {
        expect(response).toEqual(mockPageResponse);
      });

      httpMock.expectNone(`${environment.apiBaseUrl}/users?page=1`);
    });

    it('should cache users from page response', () => {
      service.getUsers(1).subscribe();
      const req = httpMock.expectOne(`${environment.apiBaseUrl}/users?page=1`);
      req.flush(mockPageResponse);

      service.getUser(1).subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      httpMock.expectNone(`${environment.apiBaseUrl}/users/1`);
    });
  });

  describe('getUser', () => {
    it('should fetch single user from API', () => {
      service.getUser(1).subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/users/1`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockUser });
    });

    it('should return cached user on subsequent calls', () => {
      service.getUser(1).subscribe();
      const req = httpMock.expectOne(`${environment.apiBaseUrl}/users/1`);
      req.flush({ data: mockUser });

      service.getUser(1).subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      httpMock.expectNone(`${environment.apiBaseUrl}/users/1`);
    });
  });

  describe('clearCache', () => {
    it('should clear all caches', () => {
      service.getUsers(1).subscribe();
      const req = httpMock.expectOne(`${environment.apiBaseUrl}/users?page=1`);
      req.flush(mockPageResponse);

      service.clearCache();

      service.getUsers(1).subscribe();
      httpMock.expectOne(`${environment.apiBaseUrl}/users?page=1`);
    });
  });
});
