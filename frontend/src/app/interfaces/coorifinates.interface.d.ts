import { CropperPosition } from "ngx-image-cropper/public-api";


export interface cooridinates{
    width: number;
    height: number;
    cropperPosition: CropperPosition;
    imagePosition: CropperPosition;
    offsetImagePosition?: CropperPosition;
}