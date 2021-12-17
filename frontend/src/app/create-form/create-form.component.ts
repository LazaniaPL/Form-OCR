import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  CropperPosition,
  ImageCroppedEvent,
  ImageCropperComponent,
} from 'ngx-image-cropper';
import { MatSelectChange } from '@angular/material/select';
import { createWorker } from 'tesseract.js';
import { saveAs } from 'file-saver';
//import { ngcontainer } from '../interfaces/ngcontainer.interface';
import { cooridinates } from '../interfaces/coorifinates.interface';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DataContainer } from '../interfaces/dataContainer.interface';

@Component({
  selector: 'app-create-form',
  templateUrl: './create-form.component.html',
  styleUrls: ['./create-form.component.scss'],
})
export class CreateFormComponent implements OnInit {
  form: FormGroup;

  // ngcontainer: ngcontainer[] = [
  //   {
  //     "id": 1,
  //     "nameOfVar": "",
  //     "taxonomyVariableTypeID": '1',
  //     "value": "",
  //     "cooridinates": null
  //   }
  // ]

  worker: Tesseract.Worker = createWorker();
  isReadyTeserakForWork: boolean;
  imageChangedEvent: any;
  selectedFile: any;
  base64Image: any;
  //ocrResult: string;
  croppedImage: any = '';
  isScanning: boolean;
  actualCooridinates: cooridinates;

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
          base64: this.fb.control(''),
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
          base64: this.fb.control(''),
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

  onClickChangeImage(amount: number) {
    if (
      this.currentImage + amount > 0 &&
      this.currentImage + amount <= this.lastImage
    ) {
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
        // handle data processing
      };
      reader.readAsText(event.target.files[0]);

      // this.formPage.controls.forEach((e) => {
      //   (e.get('formArrContainer') as FormArray).controls.forEach((event) => {
      //     this.pushNewFormArrayElement();
      //   });
      // });

      // this.ngcontainer.forEach(e => {
      //   this.addFormContainer()
      // })
    }
  }

  scanOcrParams() {}


  doTest() {
    this.formArr2(this.currentImage - 1).controls.forEach((arrEl) => {
      this.imageCropper.cropper = (
        arrEl.get('cooridinates').value as cooridinates
      ).cropperPosition;
      this.imageCropper.crop();
    });
  }

  doTestOCR() {
    const rectanglesForOCR = [];
    this.formArr2(this.currentImage - 1).controls.forEach((arrEl) => {
      console.log('doTestOCR');
      const elRectangle = (arrEl.get('cooridinates').value as cooridinates);
      rectanglesForOCR.push(
          {
            left: elRectangle.cropperPosition.x1,
            top: elRectangle.cropperPosition.y2,
            width: elRectangle.cropperPosition.x2 - elRectangle.cropperPosition.x1,
            height: elRectangle.cropperPosition.y2 -elRectangle.cropperPosition.y1,
          }
      );
    });
    (async () => {
      for (let i = 0; i < rectanglesForOCR.length; i++) {
        const {
          data: { text },
        } = await this.worker.recognize(this.imageChangedEvent, {
          rectangle: rectanglesForOCR[i],
        });
        this.formArr2(this.currentImage - 1).controls[i].get('value').setValue(text);
      }
      await this.worker.terminate();
    })();
  }

  // doOcrMultiTest() {
  //   const rectangles = [
  //     {
  //       left: 49,
  //       top: 114,
  //       width: 346 - 49,
  //       height: 139 - 114,
  //     },
  //     {
  //       left: 188,
  //       top: 470,
  //       width: 318 - 188,
  //       height: 508 - 470,
  //     },
  //   ];

  //   (async () => {
  //     const values = [];
  //     for (let i = 0; i < rectangles.length; i++) {
  //       const {
  //         data: { text },
  //       } = await this.worker.recognize(this.imageChangedEvent, {
  //         rectangle: rectangles[i],
  //       });
  //       values.push(text);
  //     }
  //     console.log(values);
  //     await this.worker.terminate();
  //   })();
  // }



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
    // this.formArr2(this.currentImage - 1).controls.forEach((arrEl) => {
    //   console.log(
    //     'imageCropped petla ',
    //     arrEl,
    //     (arrEl.get('cooridinates').value as cooridinates).cropperPosition,
    //     this.actualCooridinates.cropperPosition,
    //     (arrEl.get('cooridinates').value as cooridinates).cropperPosition ===
    //       this.actualCooridinates.cropperPosition
    //   );
    //   if (
    //     (arrEl.get('cooridinates').value as cooridinates).cropperPosition.x1 ===
    //       this.actualCooridinates.cropperPosition.x1 &&
    //     (arrEl.get('cooridinates').value as cooridinates).cropperPosition.x2 ===
    //       this.actualCooridinates.cropperPosition.x2 &&
    //     (arrEl.get('cooridinates').value as cooridinates).cropperPosition.y1 ===
    //       this.actualCooridinates.cropperPosition.y1 &&
    //     (arrEl.get('cooridinates').value as cooridinates).cropperPosition.y2 ===
    //       this.actualCooridinates.cropperPosition.y2
    //   ) {
    //     console.log('imageCropped spelniony warunek');
    //     arrEl.get('base64').setValue(event.base64);
    //   }
    //   // this.imageCropper.crop();
    // });

    this.croppedImage = event.base64;
    console.log(
      'scanOCR=>imageCropped',
      this.actualCooridinates,
      this.imageCropper
    );
    //console.log(this.imageCropper);

    console.log('AfterScan', this.form.getRawValue());
  }

  checkCord(firstCord: cooridinates, secondCord: cooridinates) {}

  doOcrParams(id): void {
    //(this.formArr.controls[id] as FormGroup).get('cooridinates');
    // this.doOCR(,id)
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

  activateDebug(): void {
    this.debugModeType = !this.debugModeType;

    // (this.formArr.controls[1] as FormGroup).get('cooridinates').get('cropperPosition').setValue(this.imageCropper.cropper)
  }

  saveCustomForm(): void {
    const formValues: any[] = this.formArr2(0).getRawValue();

    formValues.map((item) => {
      item.value = '';
      item.base64 = '';
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
