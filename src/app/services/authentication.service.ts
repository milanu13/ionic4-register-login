import { Platform, LoadingController, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

const TOKEN_KEY = 'auth-token';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  
  authenticationState = new BehaviorSubject(false);

  constructor(
    private http: HttpClient,
    private loadingController: LoadingController,
    private storage: Storage, 
    private plt: Platform,
    private router: Router,
    public alertController: AlertController
    ) { 
    this.plt.ready().then(() => {
      this.checkToken();
    });
  }

  checkToken() {
    this.storage.get(TOKEN_KEY).then(res => {
      if (res) {
        this.authenticationState.next(true);
      }
    })
  }

  register(values) {
    
    const uploadData = new FormData(); // declar form object
    uploadData.append('username', values.username);
    uploadData.append('name', values.name);
    uploadData.append('lastname', values.lastname);
    uploadData.append('email', values.email);
    uploadData.append('gender', values.gender);
    uploadData.append('country', values.country_phone.country);
    uploadData.append('phone', values.country_phone.phone);
    uploadData.append('password', values.matching_passwords.password);
    uploadData.append('confirm_password', values.matching_passwords.confirm_password);
    uploadData.append('terms', values.terms);
    
    this.loadingController.create({keyboardClose: true, message: 'Loging In ...'})
      .then(loadingEl => {
        loadingEl.present(); // show loading
        this.http.post<any>('http://example.com/api', uploadData)
        .subscribe(
          res => {
            loadingEl.dismiss(); // hide loading
            // example return data 
            // res = { isSuccess: true, tokenKey: 'token-key', others: 'others..' }
            if (res.isSuccess) { 
              return this.storage.set(TOKEN_KEY, res.tokenKey).then(() => {
                this.authenticationState.next(true);
              });
            } else {
              this.registerFailedAlert('Please register with valid data!');
            }
          },
          err => {
            console.log(err);
          }
        );
      });
  }

  login(values) {
    
    const uploadData = new FormData(); // declar form object
    uploadData.append('email', values.email);
    uploadData.append('password', values.password);
    
    this.loadingController.create({keyboardClose: true, message: 'Loging In ...'})
      .then(loadingEl => {
        loadingEl.present(); // show loading
        this.http.post<any>('http://example.com/api', uploadData)
        .subscribe(
          res => {
            loadingEl.dismiss(); // hide loading
            // example return data 
            // res = { isSuccess: true, tokenKey: 'token-key', others: 'others..' }
            if (res.isSuccess) { 
              return this.storage.set(TOKEN_KEY, res.tokenKey).then(() => {
                this.authenticationState.next(true);
              });
            } else {
              this.loginFailedAlert();
              this.logout();
            }
          },
          err => {
            this.logout();
            console.log(err);
          }
        );
      });
  }

  logout() {
    return this.storage.remove(TOKEN_KEY).then(() => {
      this.authenticationState.next(false);
      this.router.navigate(['login']);
    });
  }
 
  isAuthenticated() {
    if (!this.authenticationState.value) {
      this.router.navigate(['login']);
    }
    return this.authenticationState.value;
  }

  async registerFailedAlert(str) {
    const alert = await this.alertController.create({
      header: 'Registration Invalid!',
      message: str,
      buttons: ['OK']
    });

    await alert.present();
  } 

  async loginFailedAlert() {
    const alert = await this.alertController.create({
      header: 'Login Invalid!',
      message: 'Please login with valid username and password.',
      buttons: ['OK']
    });

    await alert.present();
  }

}
