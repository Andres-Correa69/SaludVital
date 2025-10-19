import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadosMedicosComponent } from './resultados-medicos';

describe('ResultadosMedicos', () => {
  let component: ResultadosMedicosComponent;
  let fixture: ComponentFixture<ResultadosMedicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadosMedicosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultadosMedicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
