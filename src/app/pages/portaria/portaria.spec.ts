import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Portaria } from './portaria';

describe('Portaria', () => {
  let component: Portaria;
  let fixture: ComponentFixture<Portaria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Portaria],
    }).compileComponents();

    fixture = TestBed.createComponent(Portaria);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
