import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialMediaSection } from './social-media-section';

describe('SocialMediaSection', () => {
  let component: SocialMediaSection;
  let fixture: ComponentFixture<SocialMediaSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialMediaSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialMediaSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
