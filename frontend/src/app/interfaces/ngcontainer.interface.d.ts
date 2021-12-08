import { cooridinates } from "./coorifinates.interface";

export interface ngcontainer {
    id: number;
    nameOfVar: string;
    taxonomyVariableTypeID: string;
    value: string;
    cooridinates: cooridinates|null;
  }