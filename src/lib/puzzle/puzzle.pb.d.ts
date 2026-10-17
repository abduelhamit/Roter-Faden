import * as $protobuf from "protobufjs";
import Long = require("long");

/** Namespace roterfaden. */
export namespace roterfaden {

    /**
     * Properties of a Word.
     * @deprecated Use roterfaden.Word.$Properties instead.
     */
    interface IWord extends roterfaden.Word.$Properties {
    }

    /** Represents a Word. */
    class Word {

        /**
         * Constructs a new Word.
         * @param [properties] Properties to set
         */
        constructor(properties?: roterfaden.Word.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Word path. */
        path: number[];

        /**
         * Creates a new Word instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Word instance
         */
        static create(properties: roterfaden.Word.$Shape): roterfaden.Word & roterfaden.Word.$Shape;
        static create(properties?: roterfaden.Word.$Properties): roterfaden.Word;

        /**
         * Encodes the specified Word message. Does not implicitly {@link roterfaden.Word.verify|verify} messages.
         * @param message Word message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: roterfaden.Word.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Word message, length delimited. Does not implicitly {@link roterfaden.Word.verify|verify} messages.
         * @param message Word message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: roterfaden.Word.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Word message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {roterfaden.Word & roterfaden.Word.$Shape} Word
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): roterfaden.Word & roterfaden.Word.$Shape;

        /**
         * Decodes a Word message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {roterfaden.Word & roterfaden.Word.$Shape} Word
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): roterfaden.Word & roterfaden.Word.$Shape;

        /**
         * Verifies a Word message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Word message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Word
         */
        static fromObject(object: { [k: string]: any }): roterfaden.Word;

        /**
         * Creates a plain object from a Word message. Also converts values to other types if specified.
         * @param message Word
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: roterfaden.Word, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Word to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for Word
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Word {

        /** Properties of a Word. */
        interface $Properties {

            /** Word path */
            path?: (number[]|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a Word. */
        type $Shape = roterfaden.Word.$Properties;
    }

    /**
     * Properties of a Puzzle.
     * @deprecated Use roterfaden.Puzzle.$Properties instead.
     */
    interface IPuzzle extends roterfaden.Puzzle.$Properties {
    }

    /** Represents a Puzzle. */
    class Puzzle {

        /**
         * Constructs a new Puzzle.
         * @param [properties] Properties to set
         */
        constructor(properties?: roterfaden.Puzzle.$Properties);

        /** Unknown fields preserved while decoding when enabled */
        $unknowns?: Uint8Array[];

        /** Puzzle clue. */
        clue: string;

        /** Puzzle letters. */
        letters: string;

        /** Puzzle words. */
        words: roterfaden.Word.$Properties[];

        /** Puzzle faden. */
        faden: number[];

        /**
         * Creates a new Puzzle instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Puzzle instance
         */
        static create(properties: roterfaden.Puzzle.$Shape): roterfaden.Puzzle & roterfaden.Puzzle.$Shape;
        static create(properties?: roterfaden.Puzzle.$Properties): roterfaden.Puzzle;

        /**
         * Encodes the specified Puzzle message. Does not implicitly {@link roterfaden.Puzzle.verify|verify} messages.
         * @param message Puzzle message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encode(message: roterfaden.Puzzle.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Puzzle message, length delimited. Does not implicitly {@link roterfaden.Puzzle.verify|verify} messages.
         * @param message Puzzle message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        static encodeDelimited(message: roterfaden.Puzzle.$Properties, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Puzzle message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns {roterfaden.Puzzle & roterfaden.Puzzle.$Shape} Puzzle
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): roterfaden.Puzzle & roterfaden.Puzzle.$Shape;

        /**
         * Decodes a Puzzle message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns {roterfaden.Puzzle & roterfaden.Puzzle.$Shape} Puzzle
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): roterfaden.Puzzle & roterfaden.Puzzle.$Shape;

        /**
         * Verifies a Puzzle message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Puzzle message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Puzzle
         */
        static fromObject(object: { [k: string]: any }): roterfaden.Puzzle;

        /**
         * Creates a plain object from a Puzzle message. Also converts values to other types if specified.
         * @param message Puzzle
         * @param [options] Conversion options
         * @returns Plain object
         */
        static toObject(message: roterfaden.Puzzle, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Puzzle to JSON.
         * @returns JSON object
         */
        toJSON(): { [k: string]: any };

        /**
         * Gets the type url for Puzzle
         * @param [prefix] Custom type url prefix, defaults to `"type.googleapis.com"`
         * @returns The type url
         */
        static getTypeUrl(prefix?: string): string;
    }

    namespace Puzzle {

        /** Properties of a Puzzle. */
        interface $Properties {

            /** Puzzle clue */
            clue?: (string|null);

            /** Puzzle letters */
            letters?: (string|null);

            /** Puzzle words */
            words?: (roterfaden.Word.$Properties[]|null);

            /** Puzzle faden */
            faden?: (number[]|null);

            /** Unknown fields preserved while decoding when enabled */
            $unknowns?: Uint8Array[];
        }

        /** Shape of a Puzzle. */
        type $Shape = roterfaden.Puzzle.$Properties;
    }
}
