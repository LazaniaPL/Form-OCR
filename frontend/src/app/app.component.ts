import { Component } from '@angular/core';
import { createWorker } from 'tesseract.js';
import { DomSanitizer } from '@angular/platform-browser';
declare const Buffer
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'tesseract-ocr-reader';
  constructor() {


  }
}
