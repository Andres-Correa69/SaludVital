import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertasSalud } from './alertas-salud';

describe('AlertasSalud', () => {
  let component: AlertasSalud;
  let fixture: ComponentFixture<AlertasSalud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertasSalud]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertasSalud);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
