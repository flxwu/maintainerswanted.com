/*!
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const is_1 = __importDefault(require("is"));
const firestore_proto_api_1 = require("../protos/firestore_proto_api");
const timestamp_1 = require("./timestamp");
const field_value_1 = require("./field-value");
const validate_1 = require("./validate");
const path_1 = require("./path");
const convert_1 = require("./convert");
const geo_point_1 = require("./geo-point");
/**
 * Serializer that is used to convert between JavaScripts types and their
 * Firestore Protobuf representation.
 *
 * @private
 */
class Serializer {
    constructor(firestore, timestampsInSnapshotsEnabled) {
        this.timestampsInSnapshotsEnabled = timestampsInSnapshotsEnabled;
        // Instead of storing the `firestore` object, we store just a reference to
        // its `.doc()` method. This avoid a circular reference, which breaks
        // JSON.stringify().
        this.createReference = path => firestore.doc(path);
    }
    /**
     * Encodes a JavaScrip object into the Firestore 'Fields' representation.
     *
     * @private
     * @param obj The object to encode.
     * @returns The Firestore 'Fields' representation
     */
    encodeFields(obj) {
        const fields = {};
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                const val = this.encodeValue(obj[prop]);
                if (val) {
                    fields[prop] = val;
                }
            }
        }
        return fields;
    }
    /**
     * Encodes a JavaScript value into the Firestore 'Value' representation.
     *
     * @private
     * @param val The object to encode
     * @returns The Firestore Proto or null if we are deleting a field.
     */
    encodeValue(val) {
        if (val instanceof field_value_1.FieldTransform) {
            return null;
        }
        if (is_1.default.string(val)) {
            return {
                stringValue: val,
            };
        }
        if (is_1.default.bool(val)) {
            return {
                booleanValue: val,
            };
        }
        if (is_1.default.integer(val)) {
            return {
                integerValue: val,
            };
        }
        // Integers are handled above, the remaining numbers are treated as doubles
        if (is_1.default.number(val)) {
            return {
                doubleValue: val,
            };
        }
        if (is_1.default.date(val)) {
            const timestamp = timestamp_1.Timestamp.fromDate(val);
            return {
                timestampValue: {
                    seconds: timestamp.seconds,
                    nanos: timestamp.nanoseconds,
                },
            };
        }
        if (val === null) {
            return {
                nullValue: firestore_proto_api_1.google.protobuf.NullValue.NULL_VALUE,
            };
        }
        if (val instanceof Buffer || val instanceof Uint8Array) {
            return {
                bytesValue: val,
            };
        }
        if (typeof val === 'object' && 'toProto' in val &&
            typeof val.toProto === 'function') {
            return val.toProto();
        }
        if (val instanceof Array) {
            const array = {
                arrayValue: {},
            };
            if (val.length > 0) {
                array.arrayValue.values = [];
                for (let i = 0; i < val.length; ++i) {
                    const enc = this.encodeValue(val[i]);
                    if (enc) {
                        array.arrayValue.values.push(enc);
                    }
                }
            }
            return array;
        }
        if (typeof val === 'object' && isPlainObject(val)) {
            const map = {
                mapValue: {},
            };
            // If we encounter an empty object, we always need to send it to make sure
            // the server creates a map entry.
            if (!is_1.default.empty(val)) {
                map.mapValue.fields = this.encodeFields(val);
                if (is_1.default.empty(map.mapValue.fields)) {
                    return null;
                }
            }
            return map;
        }
        throw validate_1.customObjectError(val);
    }
    /**
     * Decodes a single Firestore 'Value' Protobuf.
     *
     * @private
     * @param proto - A Firestore 'Value' Protobuf.
     * @returns The converted JS type.
     */
    decodeValue(proto) {
        const valueType = convert_1.detectValueType(proto);
        switch (valueType) {
            case 'stringValue': {
                return proto.stringValue;
            }
            case 'booleanValue': {
                return proto.booleanValue;
            }
            case 'integerValue': {
                return Number(proto.integerValue);
            }
            case 'doubleValue': {
                return Number(proto.doubleValue);
            }
            case 'timestampValue': {
                const timestamp = timestamp_1.Timestamp.fromProto(proto.timestampValue);
                return this.timestampsInSnapshotsEnabled ? timestamp :
                    timestamp.toDate();
            }
            case 'referenceValue': {
                const resourcePath = path_1.ResourcePath.fromSlashSeparatedString(proto.referenceValue);
                return this.createReference(resourcePath.relativeName);
            }
            case 'arrayValue': {
                const array = [];
                if (is_1.default.array(proto.arrayValue.values)) {
                    for (const value of proto.arrayValue.values) {
                        array.push(this.decodeValue(value));
                    }
                }
                return array;
            }
            case 'nullValue': {
                return null;
            }
            case 'mapValue': {
                const obj = {};
                const fields = proto.mapValue.fields;
                for (const prop in fields) {
                    if (fields.hasOwnProperty(prop)) {
                        obj[prop] = this.decodeValue(fields[prop]);
                    }
                }
                return obj;
            }
            case 'geoPointValue': {
                return geo_point_1.GeoPoint.fromProto(proto.geoPointValue);
            }
            case 'bytesValue': {
                return proto.bytesValue;
            }
            default: {
                throw new Error('Cannot decode type from Firestore Value: ' +
                    JSON.stringify(proto));
            }
        }
    }
}
exports.Serializer = Serializer;
/**
 * Verifies that 'obj' is a plain JavaScript object that can be encoded as a
 * 'Map' in Firestore.
 *
 * @private
 * @param input - The argument to verify.
 * @returns 'true' if the input can be a treated as a plain object.
 */
function isPlainObject(input) {
    return (typeof input === 'object' && input !== null &&
        (Object.getPrototypeOf(input) === Object.prototype ||
            Object.getPrototypeOf(input) === null));
}
exports.isPlainObject = isPlainObject;
