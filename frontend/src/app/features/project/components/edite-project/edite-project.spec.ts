import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditeProject } from './edite-project';

describe('EditeProject', () => {
  let component: EditeProject;
  let fixture: ComponentFixture<EditeProject>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditeProject]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditeProject);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
