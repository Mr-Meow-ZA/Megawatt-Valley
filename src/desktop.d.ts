export {};
declare global {
  interface Window {
    megawattDesktop?: {
      version:string;
      readSaves():string[];
      writeSave(raw:string):boolean;
      clearSave():boolean;
      preferences():{fps:30|60};
      confirmClose(ok:boolean):void;
      onCommand(callback:(command:string)=>void):()=>void;
    };
  }
}
