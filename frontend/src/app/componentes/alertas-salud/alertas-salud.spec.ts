import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertasSaludComponent } from './alertas-salud';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AlertasSaludComponent', () => {
  let component: AlertasSaludComponent;
  let fixture: ComponentFixture<AlertasSaludComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertasSaludComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertasSaludComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
