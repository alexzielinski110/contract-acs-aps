import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppLayoutComponent {
  isToggled = true
  toggleClassName = 'toggled'

  onClickToggleMenu($event) {
    this.isToggled = !this.isToggled

    this.toggleClassName = this.isToggled ? 'toggled' : 'non-toggled'
  }
}
