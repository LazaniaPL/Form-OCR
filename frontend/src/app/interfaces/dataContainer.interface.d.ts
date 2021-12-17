import { cooridinates } from "./coorifinates.interface";

export interface DataContainer {
    id: number;
    nameOfVar: string;
    taxonomyVariableTypeID: string;
    value: string;
    cooridinates: cooridinates|null;
  }
