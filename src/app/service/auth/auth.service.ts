import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, map, Observable} from "rxjs";
import {Router} from "@angular/router";
import {UserToken} from "../../model/user-token";

const API_URL = `${environment.apiUrl}`;
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public currentUserSubject: BehaviorSubject<UserToken>;
  public currentUser: Observable<UserToken>;

  constructor(private http: HttpClient,
              private router: Router) {
    // @ts-ignore
    this.currentUserSubject = new BehaviorSubject<UserToken>(JSON.parse(sessionStorage.getItem('user')));
    this.currentUser = this.currentUserSubject.asObservable();
  }
  login(email: string, password: string) {
    return this.http.post<any>(API_URL + '/login', {email, password})
      .pipe(map(user => {
        sessionStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      }));
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  logout() {
    sessionStorage.removeItem('user');
    // @ts-ignore
    this.currentUserSubject.next(null);
    this.router.navigateByUrl('login');
  }

  isLoggedIn() {
    const currentUser = this.getCurrentUser();
    const loggedIn = !!(currentUser);
    return loggedIn;
  }

  isMerchant() {
    if (!this.isLoggedIn()) {
      return null;
    }
    const isMerchant = this.getCurrentUser().roles[0].authority === `ROLE_MERCHANT`;
    return isMerchant;
  }

  getCurrentUser() {
    // @ts-ignore
    return JSON.parse(sessionStorage.getItem('user'));
  }

  getCurrentUserId() {
    // @ts-ignore
    const currentUser = JSON.parse(sessionStorage.getItem('user'));
    if (currentUser == null) {
      return null;
    }
    return currentUser.id;
  }
}
