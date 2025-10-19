import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadosMedicosComponent } from './resultados-medicos';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ResultadosMedicosComponent', () => {
  let component: ResultadosMedicosComponent;
  let fixture: ComponentFixture<ResultadosMedicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadosMedicosComponent, HttpClientTestingModule]
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
