import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideIconsModule } from '../../../../icons';
import { User } from '../../../../core/models/user.model';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-skills-section',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideIconsModule],
  templateUrl: './skills-section.html',
  styleUrls: ['./skills-section.scss'],
})
export class SkillsSection {

  @Input() user!: User | null;

  editMode = signal(false);
  tempSkills = signal<string[]>([]);
  newSkill = signal('');

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.tempSkills.set([...(this.user?.skills || [])]);
  }

  enableEdit() {
    this.editMode.set(true);
    this.tempSkills.set([...(this.user?.skills || [])]);
  }

  addSkill() {
    const value = this.newSkill().trim();
    if (!value) return;
    this.tempSkills.update(arr => [...arr, value]);
    this.newSkill.set('');
  }

  removeSkill(index: number) {
    this.tempSkills.update(arr => arr.filter((_, i) => i !== index));
  }

  save() {
    if (!this.user) return;

    this.userService.updateUser({
      ...this.user,
      skills: this.tempSkills()
    });

    this.user = {
      ...this.user,
      skills: [...this.tempSkills()]
    };

    this.editMode.set(false);
  }

  cancel() {
    this.editMode.set(false);
    this.tempSkills.set([...(this.user?.skills || [])]);
  }
}
