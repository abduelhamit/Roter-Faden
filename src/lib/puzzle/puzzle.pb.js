/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-mixed-operators, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars, default-case, jsdoc/require-param*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
const $Object = $util.global.Object, $undefined = $util.global.undefined, $Error = $util.global.Error, $RangeError = $util.global.RangeError, $Array = $util.global.Array, $TypeError = $util.global.TypeError, $String = $util.global.String;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const roterfaden = $root.roterfaden = (() => {

    /**
     * Namespace roterfaden.
     * @exports roterfaden
     * @namespace
     */
    const roterfaden = {};

    roterfaden.Word = (function() {

        /**
         * Properties of a Word.
         * @typedef {Object} roterfaden.Word.$Properties
         * @property {Array.<number>|null} [path] Word path
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a Word.
         * @memberof roterfaden
         * @interface IWord
         * @augments roterfaden.Word.$Properties
         * @deprecated Use roterfaden.Word.$Properties instead.
         */

        /**
         * Shape of a Word.
         * @typedef {roterfaden.Word.$Properties} roterfaden.Word.$Shape
         */

        /**
         * Constructs a new Word.
         * @memberof roterfaden
         * @classdesc Represents a Word.
         * @constructor
         * @param {roterfaden.Word.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const Word = function (properties) {
            this.path = [];
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * Word path.
         * @member {Array.<number>} path
         * @memberof roterfaden.Word
         * @instance
         */
        Word.prototype.path = $util.emptyArray;

        /**
         * Creates a new Word instance using the specified properties.
         * @function create
         * @memberof roterfaden.Word
         * @static
         * @param {roterfaden.Word.$Properties=} [properties] Properties to set
         * @returns {roterfaden.Word} Word instance
         * @type {{
         *   (properties: roterfaden.Word.$Shape): roterfaden.Word & roterfaden.Word.$Shape;
         *   (properties?: roterfaden.Word.$Properties): roterfaden.Word;
         * }}
         */
        Word.create = function(properties) {
            return new Word(properties);
        };

        /**
         * Encodes the specified Word message. Does not implicitly {@link roterfaden.Word.verify|verify} messages.
         * @function encode
         * @memberof roterfaden.Word
         * @static
         * @param {roterfaden.Word.$Properties} message Word message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Word.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.path != null && message.path.length)
                writer.uint32(/* id 1, wireType 2 =*/10).uint32s(message.path);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified Word message, length delimited. Does not implicitly {@link roterfaden.Word.verify|verify} messages.
         * @function encodeDelimited
         * @memberof roterfaden.Word
         * @static
         * @param {roterfaden.Word.$Properties} message Word message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Word.encodeDelimited = function(message, writer) {
            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
        };

        /**
         * Decodes a Word message from the specified reader or buffer.
         * @function decode
         * @memberof roterfaden.Word
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {roterfaden.Word & roterfaden.Word.$Shape} Word
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Word.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end, message;
            if (length === $undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw $RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = _target || new $root.roterfaden.Word();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType === 2) {
                            if (!(message.path && message.path.length))
                                message.path = [];
                            reader.uint32s(message.path);
                            continue;
                        }
                        if (wireType !== 0)
                            break;
                        if (!(message.path && message.path.length))
                            message.path = [];
                        message.path.push(reader.uint32());
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (length !== $undefined) {
                if (reader.pos !== end)
                    throw $RangeError("index out of range");
                reader.len = length;
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes a Word message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof roterfaden.Word
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {roterfaden.Word & roterfaden.Word.$Shape} Word
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Word.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.size());
        };

        /**
         * Verifies a Word message.
         * @function verify
         * @memberof roterfaden.Word
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Word.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.path != null && $Object.hasOwnProperty.call(message, "path")) {
                if (!$Array.isArray(message.path))
                    return "path: array expected";
                for (let i = 0; i < message.path.length; ++i)
                    if (!$util.isInteger(message.path[i]))
                        return "path: integer[] expected";
            }
            return null;
        };

        /**
         * Creates a Word message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof roterfaden.Word
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {roterfaden.Word} Word
         */
        Word.fromObject = function (object, _depth) {
            if (object instanceof $root.roterfaden.Word)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".roterfaden.Word: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.roterfaden.Word();
            if (object.path) {
                if (!$Array.isArray(object.path))
                    throw $TypeError(".roterfaden.Word.path: array expected");
                message.path = $Array(object.path.length);
                for (let i = 0; i < object.path.length; ++i)
                    message.path[i] = object.path[i] >>> 0;
            }
            return message;
        };

        /**
         * Creates a plain object from a Word message. Also converts values to other types if specified.
         * @function toObject
         * @memberof roterfaden.Word
         * @static
         * @param {roterfaden.Word} message Word
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Word.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.arrays || options.defaults)
                object.path = [];
            if (message.path && message.path.length) {
                object.path = $Array(message.path.length);
                for (let j = 0; j < message.path.length; ++j)
                    object.path[j] = message.path[j];
            }
            return object;
        };

        /**
         * Converts this Word to JSON.
         * @function toJSON
         * @memberof roterfaden.Word
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Word.prototype.toJSON = function() {
            return Word.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for Word
         * @function getTypeUrl
         * @memberof roterfaden.Word
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        Word.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/roterfaden.Word";
        };

        return Word;
    })();

    roterfaden.Puzzle = (function() {

        /**
         * Properties of a Puzzle.
         * @typedef {Object} roterfaden.Puzzle.$Properties
         * @property {string|null} [clue] Puzzle clue
         * @property {string|null} [letters] Puzzle letters
         * @property {Array.<roterfaden.Word.$Properties>|null} [words] Puzzle words
         * @property {Array.<number>|null} [faden] Puzzle faden
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */

        /**
         * Properties of a Puzzle.
         * @memberof roterfaden
         * @interface IPuzzle
         * @augments roterfaden.Puzzle.$Properties
         * @deprecated Use roterfaden.Puzzle.$Properties instead.
         */

        /**
         * Shape of a Puzzle.
         * @typedef {roterfaden.Puzzle.$Properties} roterfaden.Puzzle.$Shape
         */

        /**
         * Constructs a new Puzzle.
         * @memberof roterfaden
         * @classdesc Represents a Puzzle.
         * @constructor
         * @param {roterfaden.Puzzle.$Properties=} [properties] Properties to set
         * @property {Array.<Uint8Array>} [$unknowns] Unknown fields preserved while decoding when enabled
         */
        const Puzzle = function (properties) {
            this.words = [];
            this.faden = [];
            if (properties)
                for (let keys = $Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        };

        /**
         * Puzzle clue.
         * @member {string} clue
         * @memberof roterfaden.Puzzle
         * @instance
         */
        Puzzle.prototype.clue = "";

        /**
         * Puzzle letters.
         * @member {string} letters
         * @memberof roterfaden.Puzzle
         * @instance
         */
        Puzzle.prototype.letters = "";

        /**
         * Puzzle words.
         * @member {Array.<roterfaden.Word.$Properties>} words
         * @memberof roterfaden.Puzzle
         * @instance
         */
        Puzzle.prototype.words = $util.emptyArray;

        /**
         * Puzzle faden.
         * @member {Array.<number>} faden
         * @memberof roterfaden.Puzzle
         * @instance
         */
        Puzzle.prototype.faden = $util.emptyArray;

        /**
         * Creates a new Puzzle instance using the specified properties.
         * @function create
         * @memberof roterfaden.Puzzle
         * @static
         * @param {roterfaden.Puzzle.$Properties=} [properties] Properties to set
         * @returns {roterfaden.Puzzle} Puzzle instance
         * @type {{
         *   (properties: roterfaden.Puzzle.$Shape): roterfaden.Puzzle & roterfaden.Puzzle.$Shape;
         *   (properties?: roterfaden.Puzzle.$Properties): roterfaden.Puzzle;
         * }}
         */
        Puzzle.create = function(properties) {
            return new Puzzle(properties);
        };

        /**
         * Encodes the specified Puzzle message. Does not implicitly {@link roterfaden.Puzzle.verify|verify} messages.
         * @function encode
         * @memberof roterfaden.Puzzle
         * @static
         * @param {roterfaden.Puzzle.$Properties} message Puzzle message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Puzzle.encode = function (message, writer, _depth) {
            if (!writer)
                writer = $Writer.create();
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            if (message.clue != null && $Object.hasOwnProperty.call(message, "clue"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.clue);
            if (message.letters != null && $Object.hasOwnProperty.call(message, "letters"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.letters);
            if (message.words != null && message.words.length)
                for (let i = 0; i < message.words.length; ++i)
                    $root.roterfaden.Word.encode(message.words[i], writer.uint32(/* id 3, wireType 2 =*/26).fork(), _depth + 1).ldelim();
            if (message.faden != null && message.faden.length)
                writer.uint32(/* id 4, wireType 2 =*/34).uint32s(message.faden);
            if (message.$unknowns != null && $Object.hasOwnProperty.call(message, "$unknowns"))
                for (let i = 0; i < message.$unknowns.length; ++i)
                    writer.raw(message.$unknowns[i]);
            return writer;
        };

        /**
         * Encodes the specified Puzzle message, length delimited. Does not implicitly {@link roterfaden.Puzzle.verify|verify} messages.
         * @function encodeDelimited
         * @memberof roterfaden.Puzzle
         * @static
         * @param {roterfaden.Puzzle.$Properties} message Puzzle message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Puzzle.encodeDelimited = function(message, writer) {
            return this.encode(message, (writer || $Writer.create()).fork()).ldelim();
        };

        /**
         * Decodes a Puzzle message from the specified reader or buffer.
         * @function decode
         * @memberof roterfaden.Puzzle
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {roterfaden.Puzzle & roterfaden.Puzzle.$Shape} Puzzle
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Puzzle.decode = function (reader, length, _end, _depth, _target) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $Reader.recursionLimit)
                throw $Error("max depth exceeded");
            let end, message;
            if (length === $undefined)
                end = reader.len;
            else {
                end = reader.pos + length;
                if (end > reader.len)
                    throw $RangeError("index out of range");
                length = reader.len;
                reader.len = end;
            }
            message = _target || new $root.roterfaden.Puzzle();
            while (reader.pos < end) {
                let start = reader.pos;
                let tag = reader.tag();
                if (tag === _end) {
                    _end = $undefined;
                    break;
                }
                let wireType = tag & 7;
                switch (tag >>>= 3) {
                case 1: {
                        if (wireType !== 2)
                            break;
                        message.clue = reader.stringVerify();
                        continue;
                    }
                case 2: {
                        if (wireType !== 2)
                            break;
                        message.letters = reader.stringVerify();
                        continue;
                    }
                case 3: {
                        if (wireType !== 2)
                            break;
                        if (!(message.words && message.words.length))
                            message.words = [];
                        message.words.push($root.roterfaden.Word.decode(reader, reader.size(), $undefined, _depth + 1));
                        continue;
                    }
                case 4: {
                        if (wireType === 2) {
                            if (!(message.faden && message.faden.length))
                                message.faden = [];
                            reader.uint32s(message.faden);
                            continue;
                        }
                        if (wireType !== 0)
                            break;
                        if (!(message.faden && message.faden.length))
                            message.faden = [];
                        message.faden.push(reader.uint32());
                        continue;
                    }
                }
                reader.skipType(wireType, _depth, tag);
                if (!reader.discardUnknown) {
                    $util.makeProp(message, "$unknowns", false);
                    (message.$unknowns || (message.$unknowns = [])).push(reader.raw(start, reader.pos));
                }
            }
            if (length !== $undefined) {
                if (reader.pos !== end)
                    throw $RangeError("index out of range");
                reader.len = length;
            }
            if (_end !== $undefined)
                throw $Error("missing end group");
            return message;
        };

        /**
         * Decodes a Puzzle message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof roterfaden.Puzzle
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {roterfaden.Puzzle & roterfaden.Puzzle.$Shape} Puzzle
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Puzzle.decodeDelimited = function(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.size());
        };

        /**
         * Verifies a Puzzle message.
         * @function verify
         * @memberof roterfaden.Puzzle
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Puzzle.verify = function (message, _depth) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                return "max depth exceeded";
            if (message.clue != null && $Object.hasOwnProperty.call(message, "clue"))
                if (!$util.isString(message.clue))
                    return "clue: string expected";
            if (message.letters != null && $Object.hasOwnProperty.call(message, "letters"))
                if (!$util.isString(message.letters))
                    return "letters: string expected";
            if (message.words != null && $Object.hasOwnProperty.call(message, "words")) {
                if (!$Array.isArray(message.words))
                    return "words: array expected";
                for (let i = 0; i < message.words.length; ++i) {
                    let error = $root.roterfaden.Word.verify(message.words[i], _depth + 1);
                    if (error)
                        return "words." + error;
                }
            }
            if (message.faden != null && $Object.hasOwnProperty.call(message, "faden")) {
                if (!$Array.isArray(message.faden))
                    return "faden: array expected";
                for (let i = 0; i < message.faden.length; ++i)
                    if (!$util.isInteger(message.faden[i]))
                        return "faden: integer[] expected";
            }
            return null;
        };

        /**
         * Creates a Puzzle message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof roterfaden.Puzzle
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {roterfaden.Puzzle} Puzzle
         */
        Puzzle.fromObject = function (object, _depth) {
            if (object instanceof $root.roterfaden.Puzzle)
                return object;
            if (!$util.isObject(object))
                throw $TypeError(".roterfaden.Puzzle: object expected");
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let message = new $root.roterfaden.Puzzle();
            if (object.clue != null)
                message.clue = $String(object.clue);
            if (object.letters != null)
                message.letters = $String(object.letters);
            if (object.words) {
                if (!$Array.isArray(object.words))
                    throw $TypeError(".roterfaden.Puzzle.words: array expected");
                message.words = $Array(object.words.length);
                for (let i = 0; i < object.words.length; ++i) {
                    if (!$util.isObject(object.words[i]))
                        throw $TypeError(".roterfaden.Puzzle.words: object expected");
                    message.words[i] = $root.roterfaden.Word.fromObject(object.words[i], _depth + 1);
                }
            }
            if (object.faden) {
                if (!$Array.isArray(object.faden))
                    throw $TypeError(".roterfaden.Puzzle.faden: array expected");
                message.faden = $Array(object.faden.length);
                for (let i = 0; i < object.faden.length; ++i)
                    message.faden[i] = object.faden[i] >>> 0;
            }
            return message;
        };

        /**
         * Creates a plain object from a Puzzle message. Also converts values to other types if specified.
         * @function toObject
         * @memberof roterfaden.Puzzle
         * @static
         * @param {roterfaden.Puzzle} message Puzzle
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Puzzle.toObject = function (message, options, _depth) {
            if (!options)
                options = {};
            if (_depth === $undefined)
                _depth = 0;
            if (_depth > $util.recursionLimit)
                throw $Error("max depth exceeded");
            let object = {};
            if (options.arrays || options.defaults) {
                object.words = [];
                object.faden = [];
            }
            if (options.defaults) {
                object.clue = "";
                object.letters = "";
            }
            if (message.clue != null && $Object.hasOwnProperty.call(message, "clue"))
                object.clue = message.clue;
            if (message.letters != null && $Object.hasOwnProperty.call(message, "letters"))
                object.letters = message.letters;
            if (message.words && message.words.length) {
                object.words = $Array(message.words.length);
                for (let j = 0; j < message.words.length; ++j)
                    object.words[j] = $root.roterfaden.Word.toObject(message.words[j], options, _depth + 1);
            }
            if (message.faden && message.faden.length) {
                object.faden = $Array(message.faden.length);
                for (let j = 0; j < message.faden.length; ++j)
                    object.faden[j] = message.faden[j];
            }
            return object;
        };

        /**
         * Converts this Puzzle to JSON.
         * @function toJSON
         * @memberof roterfaden.Puzzle
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Puzzle.prototype.toJSON = function() {
            return Puzzle.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the type url for Puzzle
         * @function getTypeUrl
         * @memberof roterfaden.Puzzle
         * @static
         * @param {string} [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns {string} The type url
         */
        Puzzle.getTypeUrl = function(prefix) {
            if (prefix === $undefined)
                prefix = "type.googleapis.com";
            return prefix + "/roterfaden.Puzzle";
        };

        return Puzzle;
    })();

    return roterfaden;
})();

export {
  $root as default
};
