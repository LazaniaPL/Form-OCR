import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecFormComponent } from './exec-form.component';

describe('ExecFormComponent', () => {
  let component: ExecFormComponent;
  let fixture: ComponentFixture<ExecFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExecFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
