import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import {

  ImageCroppedEvent,
  ImageCropperComponent,
} from 'ngx-image-cropper';
import { MatSelectChange } from '@angular/material/select';
import { createWorker } from 'tesseract.js';
import { saveAs } from 'file-saver';
//import { ngcontainer } from '../interfaces/ngcontainer.interface';
import { cooridinates } from '../interfaces/coorifinates.interface';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DataContainer } from '../interfaces/dataContainer.interface';


@Component({
  selector: 'app-create-form',
  templateUrl: './create-form.component.html',
  styleUrls: ['./create-form.component.scss'],
})
export class CreateFormComponent implements OnInit {
  form: FormGroup;



  worker: Tesseract.Worker = createWorker();
  isReadyTeserakForWork: boolean;
  imageChangedEvent: any;
  selectedFile: any;
  base64Image: any;
  //ocrResult: string;
  croppedImage: any = '';
  isScanning: boolean;
  actualCooridinates: cooridinates;
  OcrWorking:boolean;

  images: any[];
  currentImage: number = 0;
  lastImage: number = 0;

  debugModeType = false;

  taxonomyVariableType:
    | Observable<{ idType: string; valueType: string }[]>
    | undefined;

  editMode = true;

  name = 'Angular';

  selectedTemplate: DataContainer[];

  @ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent;

  constructor(private fb: FormBuilder) {
    this.initializeTessaract();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      //formArrContainer: this.fb.array([]),
      formArrPage: this.fb.array([]),
    });

    this.taxonomyVariableType = of([
      { idType: '1', valueType: 'String' },
      { idType: '2', valueType: 'Liczba' },
      { idType: '3', valueType: 'Data' },
      { idType: '4', valueType: 'PESEL' },
    ]);
    //this.addFormContainer();
    this.formPage.push(
      this.fb.group({
        formArrContainer: this.fb.array([]),
      })
    );
    // this.pushNewFormArrayElement();
  }

  initializeTessaract(): void {
    // Called as early as possible
    (async () => {
      await this.worker.load();
      await this.worker.loadLanguage('pol');
      await this.worker.initialize('pol');
      this.isReadyTeserakForWork = true;
    })();
  }

  createArrayFormPage(numberOfImages: number, template: DataContainer[]): void {
    this.form = this.fb.group({
      formArrPage: this.fb.array([]),
    });

    for (let index = 0; index < numberOfImages; index++) {
      const element = numberOfImages;

      this.formPage.push(
        this.fb.group({
          formArrContainer: this.fb.array([]),
        })
      );
    }
    this.createArrayFormElement(template);
  }

  createArrayFormElement(template: DataContainer[]) {
    this.formPage.controls.forEach((element) => {
      template.forEach((templateEl) => {
        // Template jako stary obiekt kontenerek, dodać by pola formularza się dodawały
        const groupToPush = this.fb.group({
          id: this.fb.control(
            (element.get('formArrContainer') as FormArray).length
          ),
          nameOfVar: this.fb.control(''),
          taxonomyVariableTypeID: this.fb.control(''),
          value: this.fb.control(''),
          cooridinates: this.fb.control(null),
        });
        groupToPush.patchValue(templateEl);
        (element.get('formArrContainer') as FormArray).push(groupToPush);
      });
    });
  }

  pushNewFormArrayElement() {
    this.formPage.controls.forEach((element) => {
      (element.get('formArrContainer') as FormArray).push(
        this.fb.group({
          id: this.fb.control(
            (element.get('formArrContainer') as FormArray).length
          ),
          nameOfVar: this.fb.control(''),
          taxonomyVariableTypeID: this.fb.control(''),
          value: this.fb.control(''),
          cooridinates: this.fb.control(null),
        })
      );
    });
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

  async onClickChangeImage(amount: number) {
    if (
      this.currentImage + amount > 0 &&
      this.currentImage + amount <= this.lastImage
    ) {
      this.currentImage = this.currentImage + amount;
      this.setImages(this.currentImage - 1);
      await this.doOCRMultiple();
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
      this.setImages(this.currentImage - 1);
    }
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = (e) => {
        //this.ngcontainer=reader.result;
        // //this.ngcontainer = JSON.parse(reader.result.toString());
        this.selectedTemplate = JSON.parse(reader.result.toString());
        this.createArrayFormPage(this.lastImage, this.selectedTemplate);
        console.log(
          'loadCustomForm',
          reader.result.toString(),
          this.form.getRawValue()
        );
        this.doOCRMultiple();
        // handle data processing
      };
      reader.readAsText(event.target.files[0]);

    }
  }

  async doOCRMultiple() {
    console.log('current image', this.currentImage, this.formPage.getRawValue());
    const rectanglesForOCR = [];
    let checkAllReadyDone = false;
    let result: {
      data: { text }
    };

    this.formArr2(this.currentImage - 1).controls.forEach((arrEl) => {
      const elRectangle = arrEl.get('cooridinates').value as cooridinates;
      const valueTemp = arrEl.get('value').value as String;
      if (valueTemp != '') {
        checkAllReadyDone = true;
        //break;
      }
      rectanglesForOCR.push({
        left: elRectangle.imagePosition.x1,
        top: elRectangle.imagePosition.y1,
        width: elRectangle.width,
        height: elRectangle.height,
      });
    });
    if (!checkAllReadyDone) {
      let fieldInProgress = true;

      for (let i = 0; i < rectanglesForOCR.length; i++) {
        console.log( this.currentImage, i);
        await this.worker.recognize(this.imageChangedEvent, {
          rectangle: rectanglesForOCR[i],
        })
        .then( data => {
          result = data;
          console.log(result, i);
          fieldInProgress = true;
        })
        .finally(() => {
          fieldInProgress = false
        });

        const theLoop: () => void = async () => {
          console.log('w loop', this.currentImage, i, fieldInProgress);
          if (!fieldInProgress) {
            console.log('no wreszcie', this.currentImage, i, result);
            this.formArr2(this.currentImage - 1)
            .controls[i].get('value')
            .setValue(result.data.text);
          } else {
            this.timeout(300);
            theLoop();
          }
        };
        theLoop();
      }

    }
    if (this.currentImage === this.lastImage) {
      this.OcrWorking = false;
    } else {
      console.log('jeszcze nie current image', this.currentImage, this.lastImage);
    }
  }

  timeout(ms) { //pass a time in milliseconds to this function
    return new Promise(resolve => setTimeout(resolve, ms));
  }



  scanOCR(idContainer: number, pageID: number) {
    this.isScanning = true;
    this.imageCropper.imageFile = this.croppedImage;
    this.imageCropper.crop();
    //this.imageChangedEvent = null;
    this.doOCR(this.croppedImage, idContainer, pageID);
  }
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent): void {
    //console.log(event);
    // console.log(event.base64);

    this.actualCooridinates = {
      width: event.width,
      height: event.height,
      cropperPosition: event.cropperPosition,
      imagePosition: event.imagePosition,
      offsetImagePosition: event.offsetImagePosition,
    };


    this.croppedImage = event.base64;
    console.log(
      'scanOCR=>imageCropped',
      this.actualCooridinates,
      this.imageCropper
    );
    //console.log(this.imageCropper);

    console.log('AfterScan', this.form.getRawValue());
  }

  doOCR(base64Image: string, id, pageID): void {
    //this.ocrResult = 'Scanning';
    console.log(`Started: ${new Date()}`);
    (async (image) => {
      if (this.isReadyTeserakForWork) {
        const data = await this.worker.recognize(image);
        // console.log(data);

        (this.formArr2(pageID).controls[id] as FormGroup)
          .get('value')
          .patchValue(data.data.text);
        (this.formArr2(pageID).controls[id] as FormGroup)
          .get('cooridinates')
          .patchValue(this.actualCooridinates);

        //this.ocrResult = data.data.text;
      }
      // await this.worker.terminate();
      console.log(`Stopped: ${new Date()}`);
    })(base64Image);
  }

  transform(): string {
    return this.base64Image;
  }

  //dataPanelType:Observable<{id:string;editMode:Boolean;value:String}[]> |undefined;

  // get formArr() {
  //   return this.form.get('formArrContainer') as FormArray;
  // }

  selectedValue(event: MatSelectChange, id: any) {
    console.log(event.value);
    console.log(id);
  }


  activateDebug(): void {
    this.debugModeType = !this.debugModeType;

    // (this.formArr.controls[1] as FormGroup).get('cooridinates').get('cropperPosition').setValue(this.imageCropper.cropper)
  }
  async saveFile() {
    const formPage: any[] = this.formPage.getRawValue();
    const amount = 1;
    this.OcrWorking = true;

    // this.onClickChangeImage(1);
    console.log('form before', formPage);
    while (this.currentImage + amount <= this.lastImage) {
      console.log('on save', this.currentImage);
      await this.onClickChangeImage(1);
    }

    const theLoop: () => void = () => {
      if (!this.OcrWorking) {
        const blob = new Blob([JSON.stringify(this.formPage.getRawValue())], {
          type: 'application/json',
        });

        const current = new Date();
        const timestamp = current.getTime();
        saveAs(blob, `plik z wynikami ${timestamp}.json`);
      } else {
        console.log('nie ostatni plik');
        setTimeout(() => {
          theLoop();
        }, 200);
      }
    };
    theLoop();
  }

  saveCustomForm(): void {
    const formValues: any[] = this.formArr2(0).getRawValue();

    formValues.map((item) => {
      item.value = '';

      return item;
    });

    const blob = new Blob([JSON.stringify(formValues)], {
      type: 'application/json',
    });
    const current = new Date();

    const timestamp = current.getTime();

    saveAs(blob, `plik ${timestamp}.json`);
  }

  get formPage() {
    return this.form.get('formArrPage') as FormArray;
  }

  formArr2(id) {
    return (this.form.get('formArrPage') as FormArray).controls[id].get(
      'formArrContainer'
    ) as FormArray;
  }
}
