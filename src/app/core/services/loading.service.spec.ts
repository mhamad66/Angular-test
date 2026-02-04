import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with loading as false', () => {
    expect(service.isLoading).toBeFalse();
  });

  it('should set loading to true when show() is called', () => {
    service.show();
    expect(service.isLoading).toBeTrue();
  });

  it('should set loading to false when hide() is called after show()', () => {
    service.show();
    service.hide();
    expect(service.isLoading).toBeFalse();
  });

  it('should track multiple concurrent requests', () => {
    service.show();
    service.show();
    service.show();
    expect(service.isLoading).toBeTrue();

    service.hide();
    expect(service.isLoading).toBeTrue();

    service.hide();
    expect(service.isLoading).toBeTrue();

    service.hide();
    expect(service.isLoading).toBeFalse();
  });

  it('should not go below zero request count', () => {
    service.hide();
    service.hide();
    expect(service.isLoading).toBeFalse();

    service.show();
    expect(service.isLoading).toBeTrue();
  });

  it('should emit loading state changes via observable', (done) => {
    const states: boolean[] = [];

    service.loading$.subscribe(loading => {
      states.push(loading);
      if (states.length === 3) {
        expect(states).toEqual([false, true, false]);
        done();
      }
    });

    service.show();
    service.hide();
  });
});
