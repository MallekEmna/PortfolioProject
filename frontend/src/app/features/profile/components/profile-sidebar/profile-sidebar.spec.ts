import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LucideIconsModule } from '../../../../icons';
import { ProfileSidebarComponent } from './profile-sidebar';

describe('ProfileSidebarComponent', () => {
  let component: ProfileSidebarComponent;
  let fixture: ComponentFixture<ProfileSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProfileSidebarComponent,
        LucideIconsModule // important pour éviter les erreurs d’icônes
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
