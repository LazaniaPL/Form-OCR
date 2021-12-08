import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { MatSelectChange } from "@angular/material/select";
import { createWorker } from 'tesseract.js';
import { saveAs } from 'file-saver';
import { ngcontainer } from '../interfaces/ngcontainer.interface';
import { cooridinates } from '../interfaces/coorifinates.interface';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-create-form',
  templateUrl: './create-form.component.html',
  styleUrls: ['./create-form.component.scss']
})







export class CreateFormComponent implements OnInit {
  form:FormGroup

  ngcontainer :ngcontainer[] = [
    {
      "id": 1,
      "nameOfVar": "",
      "taxonomyVariableTypeID": '1',
      "value": "",
      "cooridinates": null
    }
  ]


  @ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent;
  worker: Tesseract.Worker = createWorker();
  isReady: boolean;
  imageChangedEvent: any;
  selectedFile: any;
  base64Image: any;
  //ocrResult: string;
  croppedImage: any = '';
  isScanning: boolean;
  cooridinates: cooridinates;

  constructor(
    private fb: FormBuilder
  ) {
    
    this.initialize();
  }
  initialize(): void {
    // Called as early as possible
    (async () => {
      await this.worker.load();
      await this.worker.loadLanguage('pol');
      await this.worker.initialize('pol');
      this.isReady = true;
    })();
  }
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

  loadCustomForm(event): void {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = (e) => {
        //this.ngcontainer=reader.result;
        this.ngcontainer=JSON.parse(reader.result.toString());
        console.log(reader.result.toString());
        // handle data processing
      };
      reader.readAsText(event.target.files[0]);
    }
  }
  scanOCR(id) {
    this.isScanning = true;
    this.imageCropper.imageFile = this.croppedImage;
    this.imageCropper.crop();
    //this.imageChangedEvent = null;
    this.doOCR(this.croppedImage, id);
  }
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent): void {
    console.log(event);


    this.cooridinates = {
      "width": event.width,
      "height": event.height,
      "cropperPosition": event.cropperPosition,
      "imagePosition": event.imagePosition,
      "offsetImagePosition": event.offsetImagePosition
    };

    this.croppedImage = event.base64;
    console.log(this.imageCropper);

  }

  doOCR(base64Image: string, id): void {
    //this.ocrResult = 'Scanning';
    console.log(`Started: ${new Date()}`);
    (async image => {
      if (this.isReady) {
        const data = await this.worker.recognize(image);
        console.log(data);
        this.ngcontainer = this.ngcontainer.map(item => {
          if (item.id == id) {
            item.value = data.data.text;
            item.cooridinates = this.cooridinates;
            console.log('Koordynaty' + item.cooridinates);

          }

          return item;
        });

        //this.ocrResult = data.data.text;
      }
      // await this.worker.terminate();
      console.log(`Stopped: ${new Date()}`);
    })(base64Image);

  }

  transform(): string {
    return this.base64Image;
  }




  taxonomyVariableType: Observable<{ idType: string; valueType: string; }[]> | undefined;

  editMode = true;
  //dataPanelType:Observable<{id:string;editMode:Boolean;value:String}[]> |undefined;
  ngOnInit(): void {


    this.form = this.fb.group({})

    this.taxonomyVariableType = of(
      [
        { idType: '1', valueType: 'String' },
        { idType: '2', valueType: 'Liczba' },
        { idType: '3', valueType: 'Data' },
        { idType: '4', valueType: 'PESEL' },
      ]
    )
    //this.addFormContainer();
  }
  selectedValue(event: MatSelectChange, id: any) {


    console.log(event.value);
    console.log(id);
  }
  name = 'Angular';
  /**
    mainImageEvent: any = "";
  
  
  
    fileImportEvent(event: any): void {
      this.mainImageEvent = event;
    }
  
    lastId: any = "";
  
   
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
      "value": "",
      "cooridinates": null
    });
  }

  debugModeType = false;

  activateDebug(): void {
    this.debugModeType = !this.debugModeType
  }

  saveCustomForm(): void {

    const ngNoValue = this.ngcontainer.map(item => {
      item.value = "";

      return item;
    });

    const blob = new Blob([JSON.stringify(ngNoValue)], { type: 'application/json' });
    const current = new Date();


    const timestamp = current.getTime();

    saveAs(blob, `plik ${timestamp}.json`);
  }



}

