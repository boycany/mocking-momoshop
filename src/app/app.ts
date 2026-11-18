import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CategoryNav } from './core/layout/category-nav/category-nav';
import { Footer } from './core/layout/footer/footer';
import { Header } from './core/layout/header/header';
import { UtilityBar } from './core/layout/utility-bar/utility-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UtilityBar, Header, CategoryNav, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
