import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  AuthUser,
  RegistrarUsuarioPayload,
  ResetSenhaPayload,
  TipoPessoaItem,
  UsuarioResumo
} from '../models/types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;
  private storageKey = 'painel_saida_user';

  public currentUser = signal<AuthUser | null>(this.loadStoredUser());

  private loadStoredUser(): AuthUser | null {
    try {
      const raw = sessionStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async login(userId: string, senha: string): Promise<AuthUser> {
    const user = await firstValueFrom(
      this.http.post<AuthUser>(`${this.apiUrl}/login`, { userId, senha })
    );
    this.currentUser.set(user);
    sessionStorage.setItem(this.storageKey, JSON.stringify(user));
    return user;
  }

  async registrarUsuario(payload: RegistrarUsuarioPayload): Promise<AuthUser> {
    return firstValueFrom(
      this.http.post<AuthUser>(`${this.apiUrl}/registrar`, payload)
    );
  }

  async atualizarUsuario(id: number, payload: RegistrarUsuarioPayload): Promise<AuthUser> {
    return firstValueFrom(
      this.http.put<AuthUser>(`${this.apiUrl}/usuarios/${id}`, payload)
    );
  }

  async resetSenha(payload: ResetSenhaPayload): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.post<{ message: string }>(`${this.apiUrl}/reset-senha`, payload)
    );
  }

  async getTiposPessoa(): Promise<TipoPessoaItem[]> {
    return firstValueFrom(
      this.http.get<TipoPessoaItem[]>(`${this.apiUrl}/tipos-pessoa`)
    );
  }

  async getUsuarios(): Promise<UsuarioResumo[]> {
    return firstValueFrom(
      this.http.get<UsuarioResumo[]>(`${this.apiUrl}/usuarios`)
    );
  }

  logout() {
    this.currentUser.set(null);
    sessionStorage.removeItem(this.storageKey);
    this.router.navigate(['/login']);
  }
}
