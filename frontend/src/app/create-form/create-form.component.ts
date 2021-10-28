import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ImageCroppedEvent } from 'ngx-image-cropper';


@Component({
  selector: 'app-create-form',
  templateUrl: './create-form.component.html',
  styleUrls: ['./create-form.component.scss']
})
export class CreateFormComponent implements OnInit {

  
  taxonomyVariableType: Observable<{ idType: string; valueType: string; }[]> | undefined;
  constructor() { }
  editMode = true;
  //dataPanelType:Observable<{id:string;editMode:Boolean;value:String}[]> |undefined;
  ngOnInit(): void {

    this.taxonomyVariableType = of(
      [
        { idType: '1', valueType: 'String' },
        { idType: '2', valueType: 'Liczba' },
        { idType: '3', valueType: 'Data' },
        { idType: '4', valueType: 'PESEL' }
      ]
    )

  }
  name = 'Angular';
  Wartosc = "";
  mainImageEvent: any = "";

  croppedImage: any = '';

  fileImportEvent(event: any): void {
    this.mainImageEvent = event;
  }

  fileChangeEvent() {
    this.editMode = !this.editMode;
    console.log(this.editMode);
  }

  

  debugModeType = false;

 

  
  activateDebug(): void {
    this.debugModeType = !this.debugModeType
  }

  addNewFormField(): void {

  }
  

  imageLoaded() {
    // show cropper
  }
  cropperReady() {
    // cropper ready
  }
  loadImageFailed() {
    // show message
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

}

