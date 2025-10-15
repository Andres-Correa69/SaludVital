import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { Api } from './api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  protected readonly usuarios = signal<any[]>([]);
  private readonly api = inject(Api);

  ngOnInit(): void {
    this.api.getUsuarios().subscribe(data => {
      this.usuarios.set(data);
    });
  }
}
