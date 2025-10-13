import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadosMedicos } from './resultados-medicos';

describe('ResultadosMedicos', () => {
  let component: ResultadosMedicos;
  let fixture: ComponentFixture<ResultadosMedicos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadosMedicos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultadosMedicos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
