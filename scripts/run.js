"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.NODE_ADDRESS = void 0;
var casper_js_sdk_1 = require("casper-js-sdk");
var bytes_1 = require("@ethersproject/bytes");
var blake = require("blakejs");
exports.NODE_ADDRESS = "http://65.108.9.249:7777/rpc";
var client = new casper_js_sdk_1.CasperServiceByJsonRPC(exports.NODE_ADDRESS);
var BRIDGE_CONTRACT_HASH = '007c0c86b8a8b7bc19eb288875c203421d24f365972d8220a2fb855971166b8d';
var LOCK_DEPLOY_HASH = 'b8dc91fec7e625b913b545cf7208c9a75b86846ac4c4916c44063c64d66a4eeb';
var API = /** @class */ (function () {
    function API() {
    }
    API.prototype.getStateRootHash = function () {
        return __awaiter(this, void 0, void 0, function () {
            var block;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, client.getLatestBlockInfo()];
                    case 1:
                        block = (_a.sent()).block;
                        if (block) {
                            return [2 /*return*/, block.header.state_root_hash];
                        }
                        else {
                            throw Error("Problem when calling getLatestBlockInfo");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    API.prototype.getDeployInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var client;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = new casper_js_sdk_1.CasperServiceByJsonRPC(exports.NODE_ADDRESS);
                        return [4 /*yield*/, client.getDeployInfo(LOCK_DEPLOY_HASH)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    API.prototype.getLockId = function () {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var deployInfo, deployArgs, lockIdEl;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.getDeployInfo()];
                    case 1:
                        deployInfo = _d.sent();
                        deployArgs = (_c = (_b = (_a = deployInfo.deploy) === null || _a === void 0 ? void 0 : _a.session) === null || _b === void 0 ? void 0 : _b.StoredContractByHash) === null || _c === void 0 ? void 0 : _c.args;
                        console.log('deployArgs:', deployArgs);
                        lockIdEl = deployArgs.find(function (param) { return param[0] === 'lock_id'; });
                        console.log('lock id:', lockIdEl);
                        console.log(JSON.stringify(lockIdEl[1].parsed, null, 2));
                        return [2 /*return*/, lockIdEl[1].parsed];
                }
            });
        });
    };
    API.prototype.getContractData = function (nodeAddress, stateRootHash, contractHash, path) {
        if (path === void 0) { path = []; }
        return __awaiter(this, void 0, void 0, function () {
            var client, blockState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = new casper_js_sdk_1.CasperServiceByJsonRPC(nodeAddress);
                        return [4 /*yield*/, client.getBlockState(stateRootHash, "hash-".concat(contractHash), path)];
                    case 1:
                        blockState = _a.sent();
                        return [2 /*return*/, blockState];
                }
            });
        });
    };
    API.prototype.getContractDataByHash = function (erc20ContractHash) {
        return __awaiter(this, void 0, void 0, function () {
            var stateRootHash, contractData, _a, contractPackageHash, namedKeys, namedKeysParsed;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getStateRootHash()];
                    case 1:
                        stateRootHash = _b.sent();
                        return [4 /*yield*/, this.getContractData(exports.NODE_ADDRESS, stateRootHash, erc20ContractHash)];
                    case 2:
                        contractData = _b.sent();
                        _a = contractData.Contract, contractPackageHash = _a.contractPackageHash, namedKeys = _a.namedKeys;
                        namedKeysParsed = namedKeys.reduce(function (acc, val) {
                            var _a;
                            return __assign(__assign({}, acc), (_a = {}, _a[_this.camelCased(val.name)] = val.key, _a));
                        }, {});
                        return [2 /*return*/, { namedKeys: namedKeysParsed, contractPackageHash: contractPackageHash }];
                }
            });
        });
    };
    API.prototype.camelCased = function (myString) {
        return myString.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
    };
    API.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var lockId, namedKeys, locksURef, itemKey, finalBytes, blaked, encodedBytes, storedValue, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.getLockId()];
                    case 1:
                        lockId = _c.sent();
                        return [4 /*yield*/, this.getContractDataByHash(BRIDGE_CONTRACT_HASH)];
                    case 2:
                        namedKeys = (_c.sent()).namedKeys;
                        console.log('namedKeys', namedKeys);
                        locksURef = namedKeys.locks;
                        itemKey = Buffer.from(lockId).toString("base64");
                        finalBytes = (0, bytes_1.concat)([
                            casper_js_sdk_1.CLValueParsers.toBytes(new casper_js_sdk_1.CLString(lockId)).unwrap()
                        ]);
                        blaked = blake.blake2b(finalBytes, undefined, 32);
                        encodedBytes = Buffer.from(blaked).toString("hex");
                        console.log('encodedBytes', encodedBytes);
                        _b = (_a = client).getDictionaryItemByURef;
                        return [4 /*yield*/, this.getStateRootHash()];
                    case 3: return [4 /*yield*/, _b.apply(_a, [_c.sent(), lockId,
                            locksURef,
                            { rawData: true }])];
                    case 4:
                        storedValue = _c.sent();
                        console.log('lock result:', storedValue);
                        return [2 /*return*/];
                }
            });
        });
    };
    return API;
}());
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var api;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                api = new API();
                return [4 /*yield*/, api.run()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
