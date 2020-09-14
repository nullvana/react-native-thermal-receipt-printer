import EPToolkit from "escpos-printer-toolkit";
import * as iconv from "iconv-lite";
import { NativeEventEmitter, NativeModules, Platform } from "react-native";

const RNUSBPrinter = NativeModules.RNUSBPrinter;
const RNBLEPrinter = NativeModules.RNBLEPrinter;
const RNNetPrinter = NativeModules.RNNetPrinter;

interface PrinterOptions {
  beep?: boolean;
  cut?: boolean;
  tailingLine?: boolean;
  base64?: boolean;
  encoding?: string;
}

interface IUSBPrinter {
  device_name: string;
  vendor_id: number;
  product_id: number;
}

interface IBLEPrinter {
  device_name: string;
  inner_mac_address: string;
}

interface INetPrinter {
  device_name: string;
  host: string;
  port: number;
}

const textTo64Buffer = (text: string, opts: PrinterOptions) => {
  const defaultOptions = {
    beep: false,
    cut: false,
    tailingLine: false,
    encoding: "UTF8",
    base64: true,
  };

  const options = {
    ...defaultOptions,
    ...opts,
  };
  const buffer = EPToolkit.exchange_text(text, options);
  return options.base64 ? buffer.toString("base64") : buffer.toString();
};

const billTo64Buffer = (text: string, opts: PrinterOptions) => {
  const defaultOptions = {
    beep: true,
    cut: true,
    encoding: "UTF8",
    tailingLine: true,
    base64: true,
  };
  const options = {
    ...defaultOptions,
    ...opts,
  };
  const buffer = EPToolkit.exchange_text(text, options);
  return options.base64 ? buffer.toString("base64") : buffer.toString();
};

const textPreprocessingIOS = (text: string) => {
  let options = {
    beep: true,
    cut: true,
  };
  return {
    text: text
      .replace(/<\/?CB>/g, "")
      .replace(/<\/?C>/g, "")
      .replace(/<\/?B>/g, ""),
    opts: options,
  };
};

export const USBPrinter = {
  init: (): Promise<void> =>
    new Promise((resolve, reject) =>
      RNUSBPrinter.init(
        () => resolve(),
        (error: Error) => reject(error)
      )
    ),

  getDeviceList: (): Promise<IUSBPrinter[]> =>
    new Promise((resolve, reject) =>
      RNUSBPrinter.getDeviceList(
        (printers: IUSBPrinter[]) => resolve(printers),
        (error: Error) => reject(error)
      )
    ),

  connectPrinter: (vendorId: string, productId: string): Promise<IUSBPrinter> =>
    new Promise((resolve, reject) =>
      RNUSBPrinter.connectPrinter(
        vendorId,
        productId,
        (printer: IUSBPrinter) => resolve(printer),
        (error: Error) => reject(error)
      )
    ),

  closeConn: (): Promise<void> =>
    new Promise((resolve) => {
      RNUSBPrinter.closeConn();
      resolve();
    }),

  printText: (text: string, opts: PrinterOptions = {}): void =>
    RNUSBPrinter.printRawData(textTo64Buffer(text, opts), (error: Error) => console.warn(error)),

  printBill: (text: string, opts: PrinterOptions = {}): void =>
    RNUSBPrinter.printRawData(billTo64Buffer(text, opts), (error: Error) => console.warn(error)),
};

export const BLEPrinter = {
  init: (): Promise<void> =>
    new Promise((resolve, reject) =>
      RNBLEPrinter.init(
        () => resolve(),
        (error: Error) => reject(error)
      )
    ),

  getDeviceList: (): Promise<IBLEPrinter[]> =>
    new Promise((resolve, reject) =>
      RNBLEPrinter.getDeviceList(
        (printers: IBLEPrinter[]) => resolve(printers),
        (error: Error) => reject(error)
      )
    ),

  connectPrinter: (inner_mac_address: string): Promise<IBLEPrinter> =>
    new Promise((resolve, reject) =>
      RNBLEPrinter.connectPrinter(
        inner_mac_address,
        (printer: IBLEPrinter) => resolve(printer),
        (error: Error) => reject(error)
      )
    ),

  closeConn: (): Promise<void> =>
    new Promise((resolve) => {
      RNBLEPrinter.closeConn();
      resolve();
    }),

  printText: (text: string, opts: PrinterOptions = {}): void => {
    let encText = iconv.encode(text, "euc-kr");
    if (Platform.OS === "ios") {
      RNBLEPrinter.printRawData(encText.toString("hex"), opts, (error: Error) => console.warn(error));
    } else {
      RNBLEPrinter.printRawData(encText.toString("base64"), (error: Error) => console.warn(error));
    }
  },

  printBill: (text: string, opts: PrinterOptions = {}): void => {
    if (Platform.OS === "ios") {
      const processedText = textPreprocessingIOS(text);
      RNBLEPrinter.printRawData(processedText.text, processedText.opts, (error: Error) => console.warn(error));
    } else {
      RNBLEPrinter.printRawData(billTo64Buffer(text, opts), (error: Error) => console.warn(error));
    }
  },
};

export const NetPrinter = {
  init: (): Promise<void> =>
    new Promise((resolve, reject) =>
      RNNetPrinter.init(
        () => resolve(),
        (error: Error) => reject(error)
      )
    ),

  getDeviceList: (): Promise<INetPrinter[]> =>
    new Promise((resolve, reject) =>
      RNNetPrinter.getDeviceList(
        (printers: INetPrinter[]) => resolve(printers),
        (error: Error) => reject(error)
      )
    ),

  connectPrinter: (host: string, port: string): Promise<INetPrinter> =>
    new Promise((resolve, reject) =>
      RNNetPrinter.connectPrinter(
        host,
        port,
        (printer: INetPrinter) => resolve(printer),
        (error: Error) => reject(error)
      )
    ),

  closeConn: (): Promise<void> =>
    new Promise((resolve) => {
      RNNetPrinter.closeConn();
      resolve();
    }),

  printText: (text: string, opts = {}): void => {
    let encText = iconv.encode(text, "euc-kr");
    if (Platform.OS === "ios") {
      RNNetPrinter.printRawData(encText.toString("hex"), opts, (error: Error) => console.warn(error));
    } else {
      RNNetPrinter.printRawData(encText.toString("base64"), (error: Error) => console.warn(error));
    }
  },

  printBill: (text: string, opts = {}): void => {
    if (Platform.OS === "ios") {
      const processedText = textPreprocessingIOS(text);
      RNNetPrinter.printRawData(processedText.text, processedText.opts, (error: Error) => console.warn(error));
    } else {
      RNNetPrinter.printRawData(billTo64Buffer(text, opts), (error: Error) => console.warn(error));
    }
  },
};

export const NetPrinterEventEmitter = new NativeEventEmitter(RNNetPrinter);
