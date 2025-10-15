import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarMedico } from './navbar-medico';

describe('NavbarMedico', () => {
  let component: NavbarMedico;
  let fixture: ComponentFixture<NavbarMedico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarMedico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarMedico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
