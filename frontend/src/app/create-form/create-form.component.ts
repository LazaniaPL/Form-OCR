import { Component, OnInit,ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ImageCroppedEvent,ImageCropperComponent } from 'ngx-image-cropper';
import { MatSelectChange } from "@angular/material/select";
import { createWorker } from 'tesseract.js';


@Component({
  selector: 'app-create-form',
  templateUrl: './create-form.component.html',
  styleUrls: ['./create-form.component.scss']
})
export class CreateFormComponent implements OnInit {
  @ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent;
  worker: Tesseract.Worker = createWorker();
  isReady: boolean;
  imageChangedEvent: any;
  base64Image: any;
  ocrResult: string;
  croppedImage: any = '';
  isScanning: boolean;

  constructor() {
    this.initialize();
  }
  initialize(): void {
    // Called as early as possible
    (async () => {
      await this.worker.load();
      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');
      this.isReady = true;
    })();
    this.taxonomyVariableType = of(
      [
        { idType: '1', valueType: 'String' },
        { idType: '2', valueType: 'Liczba' },
        { idType: '3', valueType: 'Data' },
        { idType: '4', valueType: 'PESEL' },
      ]
    )
  }
  
  ngcontainer = [
    {
      "id": 1,
      "nameOfVar": "",
      "taxonomyVariableTypeID": '1',
      "value": ""
    }
  ]


  handleFileInput(event): void {
    //  console.log(event);

    if (event.target.files && event.target.files[0]) {
      let reader = new FileReader();
      this.imageChangedEvent = event;

      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.base64Image = event.target.result;
      };
      reader = null;
    }
  }
  scanOCR() {
    this.isScanning = true;
    this.imageCropper.imageFile = this.croppedImage;
    this.imageCropper.crop();
    this.imageChangedEvent = null;
    this.doOCR(this.croppedImage);
  }
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent): void {
    console.log(event);
    this.croppedImage = event.base64;
    console.log(this.imageCropper);

  }

  doOCR(base64Image: string): void {
    this.ocrResult = 'Scanning';
    console.log(`Started: ${new Date()}`);
    (async image => {
      if (this.isReady) {
        const data = await this.worker.recognize(image);
        console.log(data);
        this.ocrResult = data.data.text;
      }
      // await this.worker.terminate();
      console.log(`Stopped: ${new Date()}`);
    })(base64Image);

  }

  transform(): string {
    return this.base64Image;
  }


  croppedImages = [{
    
  }]

  taxonomyVariableType: Observable<{ idType: string; valueType: string; }[]> | undefined;
  
  editMode = true;
  //dataPanelType:Observable<{id:string;editMode:Boolean;value:String}[]> |undefined;
  ngOnInit(): void {

    //this.addFormContainer();
  }
  selectedValue(event: MatSelectChange, id: any) {


    console.log(event.value);
    console.log(id);
  }
  name = 'Angular';

  mainImageEvent: any = "";


  fileImportEvent(event: any): void {
    this.mainImageEvent = event;
  }

  lastId: any = "";
/** 
  fileChangeEvent(id: any) {
    if (id != this.lastId) {
      this.editMode = true;
    } else {
      this.editMode = !this.editMode;
    }
    console.log(this.editMode);

    this.lastId = id;
  }

  imageCropped(event: ImageCroppedEvent,id:any) {
    
    if (!this.croppedImages[id]){

    this.croppedImages.push({
      "id": id,
      "croppedImage":event.base64
    });
  }
    this.croppedImages[id]={
      "id":id,
      "croppedImage":event.base64
    };
    //this.croppedImage = event.base64;
  }
*/
  addFormContainer() {

    

    this.ngcontainer.push({
      "id": (this.ngcontainer.length + 1),
      "nameOfVar": "",
      "taxonomyVariableTypeID": '1',
      "value": ""
    });
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
 



}

