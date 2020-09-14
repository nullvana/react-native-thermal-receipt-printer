var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { Buffer } from "buffer";
import EPToolkit from "escpos-printer-toolkit";
import * as iconv from "iconv-lite";
import { NativeEventEmitter, NativeModules, Platform } from "react-native";
var RNUSBPrinter = NativeModules.RNUSBPrinter;
var RNBLEPrinter = NativeModules.RNBLEPrinter;
var RNNetPrinter = NativeModules.RNNetPrinter;
var textTo64Buffer = function (text, opts) {
    var defaultOptions = {
        beep: false,
        cut: false,
        tailingLine: false,
        encoding: "UTF8",
        base64: true,
    };
    var options = __assign(__assign({}, defaultOptions), opts);
    var buffer = EPToolkit.exchange_text(text, options);
    return options.base64 ? buffer.toString("base64") : buffer.toString();
};
var billTo64Buffer = function (text, opts) {
    var defaultOptions = {
        beep: true,
        cut: true,
        encoding: "UTF8",
        tailingLine: true,
        base64: true,
    };
    var options = __assign(__assign({}, defaultOptions), opts);
    var buffer = EPToolkit.exchange_text(text, options);
    return options.base64 ? buffer.toString("base64") : buffer.toString();
};
var textPreprocessingIOS = function (text) {
    var options = {
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
export var USBPrinter = {
    init: function () {
        return new Promise(function (resolve, reject) {
            return RNUSBPrinter.init(function () { return resolve(); }, function (error) { return reject(error); });
        });
    },
    getDeviceList: function () {
        return new Promise(function (resolve, reject) {
            return RNUSBPrinter.getDeviceList(function (printers) { return resolve(printers); }, function (error) { return reject(error); });
        });
    },
    connectPrinter: function (vendorId, productId) {
        return new Promise(function (resolve, reject) {
            return RNUSBPrinter.connectPrinter(vendorId, productId, function (printer) { return resolve(printer); }, function (error) { return reject(error); });
        });
    },
    closeConn: function () {
        return new Promise(function (resolve) {
            RNUSBPrinter.closeConn();
            resolve();
        });
    },
    printText: function (text, opts) {
        if (opts === void 0) { opts = {}; }
        return RNUSBPrinter.printRawData(textTo64Buffer(text, opts), function (error) { return console.warn(error); });
    },
    printBill: function (text, opts) {
        if (opts === void 0) { opts = {}; }
        return RNUSBPrinter.printRawData(billTo64Buffer(text, opts), function (error) { return console.warn(error); });
    },
};
export var BLEPrinter = {
    init: function () {
        return new Promise(function (resolve, reject) {
            return RNBLEPrinter.init(function () { return resolve(); }, function (error) { return reject(error); });
        });
    },
    getDeviceList: function () {
        return new Promise(function (resolve, reject) {
            return RNBLEPrinter.getDeviceList(function (printers) { return resolve(printers); }, function (error) { return reject(error); });
        });
    },
    connectPrinter: function (inner_mac_address) {
        return new Promise(function (resolve, reject) {
            return RNBLEPrinter.connectPrinter(inner_mac_address, function (printer) { return resolve(printer); }, function (error) { return reject(error); });
        });
    },
    closeConn: function () {
        return new Promise(function (resolve) {
            RNBLEPrinter.closeConn();
            resolve();
        });
    },
    printText: function (text, opts) {
        if (opts === void 0) { opts = {}; }
        if (Platform.OS === "ios") {
            // console.log("nullvana\n" + Buffer.from(text).toString("hex"));
            // RNBLEPrinter.printRawData(text, opts, (error: Error) => console.warn(error));
            console.log("nullvana text\n" + Buffer.from(text).toString("hex"));
            var encText = iconv.encode(text, "euc-kr");
            console.log("nullvana encText\n" + Buffer.from(encText).toString("hex"));
            RNBLEPrinter.printRawData(encText, opts, function (error) { return console.warn(error); });
        }
        else {
            RNBLEPrinter.printRawData(textTo64Buffer(text, opts), function (error) { return console.warn(error); });
        }
    },
    printBill: function (text, opts) {
        if (opts === void 0) { opts = {}; }
        if (Platform.OS === "ios") {
            var processedText = textPreprocessingIOS(text);
            RNBLEPrinter.printRawData(processedText.text, processedText.opts, function (error) { return console.warn(error); });
        }
        else {
            RNBLEPrinter.printRawData(billTo64Buffer(text, opts), function (error) { return console.warn(error); });
        }
    },
};
export var NetPrinter = {
    init: function () {
        return new Promise(function (resolve, reject) {
            return RNNetPrinter.init(function () { return resolve(); }, function (error) { return reject(error); });
        });
    },
    getDeviceList: function () {
        return new Promise(function (resolve, reject) {
            return RNNetPrinter.getDeviceList(function (printers) { return resolve(printers); }, function (error) { return reject(error); });
        });
    },
    connectPrinter: function (host, port) {
        return new Promise(function (resolve, reject) {
            return RNNetPrinter.connectPrinter(host, port, function (printer) { return resolve(printer); }, function (error) { return reject(error); });
        });
    },
    closeConn: function () {
        return new Promise(function (resolve) {
            RNNetPrinter.closeConn();
            resolve();
        });
    },
    printText: function (text, opts) {
        if (opts === void 0) { opts = {}; }
        if (Platform.OS === "ios") {
            var encText = iconv.encode(text, "euc-kr");
            console.log("nullvana encText\n" + Buffer.from(encText).toString("hex"));
            encText = Buffer.concat([Buffer.from([0x1b, 0x40]), encText]);
            RNNetPrinter.printRawData(encText, opts, function (error) { return console.warn(error); });
        }
        else {
            var encText = iconv.encode(text, "euc-kr");
            encText = Buffer.concat([Buffer.from([0x1b, 0x40]), encText]);
            RNNetPrinter.printRawData(encText.toString("base64"), function (error) { return console.warn(error); });
        }
    },
    printBill: function (text, opts) {
        if (opts === void 0) { opts = {}; }
        if (Platform.OS === "ios") {
            var processedText = textPreprocessingIOS(text);
            RNNetPrinter.printRawData(processedText.text, processedText.opts, function (error) { return console.warn(error); });
        }
        else {
            RNNetPrinter.printRawData(billTo64Buffer(text, opts), function (error) { return console.warn(error); });
        }
    },
};
export var NetPrinterEventEmitter = new NativeEventEmitter(RNNetPrinter);
