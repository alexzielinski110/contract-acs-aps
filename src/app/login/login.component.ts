import { UserPreferencesService } from '@alfresco/adf-core';
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: [
    'img#adf-login-img-logo { max-height: 100px !important}',
    '.adf-error-container { height: auto !important }',
    '.adf-login-controls { margin-bottom: 0 !important; padding-bottom: 0 !important }'
  ],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent {
  constructor(
    private userPreferences: UserPreferencesService
  ) {}
  
  onSuccess(event) {
    this.userPreferences.setStoragePrefix('session')
    this.userPreferences.set('username', event.username)

    
  }
}
