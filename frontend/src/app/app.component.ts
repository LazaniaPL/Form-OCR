import { Component } from '@angular/core';
import { createWorker } from 'tesseract.js';
import { DomSanitizer } from '@angular/platform-browser';
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
