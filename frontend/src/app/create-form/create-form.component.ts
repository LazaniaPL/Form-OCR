import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CropperPosition, ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { MatSelectChange } from "@angular/material/select";
import { createWorker } from 'tesseract.js';
import { saveAs } from 'file-saver';
//import { ngcontainer } from '../interfaces/ngcontainer.interface';
import { cooridinates } from '../interfaces/coorifinates.interface';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-create-form',
  templateUrl: './create-form.component.html',
  styleUrls: ['./create-form.component.scss']
})



export class CreateFormComponent implements OnInit {
  form: FormGroup

  // ngcontainer: ngcontainer[] = [
  //   {
  //     "id": 1,
  //     "nameOfVar": "",
  //     "taxonomyVariableTypeID": '1',
  //     "value": "",
  //     "cooridinates": null
  //   }
  // ]


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


  ngOnInit(): void {


    this.form = this.fb.group({

      //formArrContainer: this.fb.array([]),
      formArrPage: this.fb.array([])
    })

    this.taxonomyVariableType = of(
      [
        { idType: '1', valueType: 'String' },
        { idType: '2', valueType: 'Liczba' },
        { idType: '3', valueType: 'Data' },
        { idType: '4', valueType: 'PESEL' },
      ]
    )
    //this.addFormContainer();
    this.formPage.push(
      this.fb.group({
        formArrContainer: this.fb.array([])
      })
    )
    this.addFormArrayElement();

  }

  images: any[];
  currentImage: number = 0;
  lastImage: number = 0;

  createArrayFormPage(numberOfImages: number): void {

    for (let index = 0; index < numberOfImages; index++) {
      const element = numberOfImages;


      (this.form.get("formArrPage") as FormArray).push(
        this.fb.group({
          formArrContainer: this.fb.array([])
        })
      )

      this.formArr2(element).push(
        this.fb.group({
          id: this.fb.control(this.formArr2(element).length),
          nameOfVar: this.fb.control(""),
          taxonomyVariableTypeID: this.fb.control(""),
          value: this.fb.control(""),
          cooridinates: this.fb.control(null)
        })
      )

    }

  }

  handleFileInput(event): void {
    //  console.log(event);

    if (event.target.files && event.target.files[0]) {


      this.images = event.target.files;
      this.currentImage = 1;
      this.lastImage = this.images.length;
      this.setImages(this.currentImage - 1);

    }
  }

  onClickChangeImage(amount: number) {


    if (this.currentImage + amount > 0 && this.currentImage + amount <= this.lastImage) {
      this.currentImage = this.currentImage + amount;
      this.setImages(this.currentImage - 1);
    }
  }

  setImages(index: number): void {
    let reader = new FileReader();

    this.imageChangedEvent = this.images[index];

    reader.readAsDataURL(this.images[index]);
    reader.onload = (event: any) => {
      this.base64Image = event.target.result;
    };
    reader = null;
  }

  loadCustomForm(event): void {
    if (this.currentImage != 0) {
      this.currentImage = 1;
      this.setImages(this.currentImage);
    }
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = (e) => {
        //this.ngcontainer=reader.result;
        //this.ngcontainer = JSON.parse(reader.result.toString());
        this.formPage.controls
        
        this.formPage.controls.forEach(e=>{
          (e.get('formArrContainer')as FormArray).patchValue(JSON.parse(reader.result.toString()))
        })
        
        console.log(reader.result.toString());
        // handle data processing
      };
      reader.readAsText(event.target.files[0]);


      this.formPage.controls.forEach(e=>{
        

        (e.get('formArrContainer')as FormArray).controls.forEach(event=>{
          this.addFormArrayElement()
        })
      })

      // this.ngcontainer.forEach(e => {
      //   this.addFormContainer()
      // })
     
    }
  }


  scanOcrParams() {

  }



  scanOCR(id,pageID) {
    this.isScanning = true;
    this.imageCropper.imageFile = this.croppedImage;
    this.imageCropper.crop();
    //this.imageChangedEvent = null;
    this.doOCR(this.croppedImage, id,pageID);
  }
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent): void {
//console.log(event);
   // console.log(event.base64);

    this.cooridinates = {
      "width": event.width,
      "height": event.height,
      "cropperPosition": event.cropperPosition,
      "imagePosition": event.imagePosition,
      "offsetImagePosition": event.offsetImagePosition
    };

    this.croppedImage = event.base64;
    //console.log(this.imageCropper);

  }


  doOcrParams(id): void {
    //(this.formArr.controls[id] as FormGroup).get('cooridinates');


    // this.doOCR(,id)
  }


  doOCR(base64Image: string, id,pageID): void {
    //this.ocrResult = 'Scanning';
    console.log(`Started: ${new Date()}`);
    (async image => {
      if (this.isReady) {
        const data = await this.worker.recognize(image);
       // console.log(data);
   
        (this.formArr2(pageID).controls[id] as FormGroup).get('value').patchValue(data.data.text);
        (this.formArr2(pageID).controls[id] as FormGroup).get('cooridinates').patchValue(this.cooridinates);


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

  // get formArr() {
  //   return this.form.get('formArrContainer') as FormArray;
  // }

  get formPage() {
    return this.form.get('formArrPage') as FormArray;
  }

  formArr2(id) {
    return (this.form.get('formArrPage') as FormArray).controls[id].get('formArrContainer') as FormArray;
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
  
  addFormArrayElement() {

    this.formPage.controls.forEach(element => {
      (element.get("formArrContainer")  as FormArray).push(
        this.fb.group({

          id: this.fb.control((element.get("formArrContainer")  as FormArray).length),
          nameOfVar: this.fb.control(""),
          taxonomyVariableTypeID: this.fb.control(""),
          value: this.fb.control(""),
          cooridinates: this.fb.control(null)
        })
      )

    });




    // this.formArr.push(
    //   this.fb.group({
    //     id: this.fb.control(this.ngcontainer.length),
    //     nameOfVar: this.fb.control(""),
    //     taxonomyVariableTypeID: this.fb.control(""),
    //     value: this.fb.control(""),
    //     cooridinates: this.fb.control(null)
    //   })
    // )
  }

  debugModeType = false;

  activateDebug(): void {
    this.debugModeType = !this.debugModeType;

    // (this.formArr.controls[1] as FormGroup).get('cooridinates').get('cropperPosition').setValue(this.imageCropper.cropper)

  }

  saveCustomForm(): void {

    // const ngNoValue = this.ngcontainer.map(item => {
    //   item.value = "";

    //   return item;
    // });

    const blob = new Blob([JSON.stringify(this.formArr2(0).getRawValue())], { type: 'application/json' });
    const current = new Date();


    const timestamp = current.getTime();

    saveAs(blob, `plik ${timestamp}.json`);
  }

}
