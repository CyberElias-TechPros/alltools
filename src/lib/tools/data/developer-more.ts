import type { ToolDefinition } from "../types";

/**
 * Section F additions — formatters, minifiers, converters, generators and the
 * two QR tools. Every one of these runs in the browser: no formatting service,
 * no upload endpoint, no API key.
 */
export const developerMoreTools: ToolDefinition[] = [
  {
    slug: "json-validator",
    name: "JSON Validator",
    category: "developer",
    tagline: "Check JSON and get the exact line and column of the first error.",
    intent: "validate json online",
    keywords: [
      "json validator",
      "validate json",
      "json checker",
      "json syntax checker",
      "is my json valid",
      "json error line",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 95,
    addedAt: "2025-02-04",
    seoTitle: "JSON Validator — Find the Exact Error Line and Column",
    seoDescription:
      "Paste JSON and see immediately whether it is valid, plus the line and column of the first syntax error and the size, depth and key count of the document.",
    content: {
      intro: [
        "A payload that looks fine in an editor can still fail in production because of one trailing comma or a single quote. This validator runs the browser's own JSON parser and turns its error into a line and column you can jump to.",
        "It also reports structural facts — top-level type, key count, nesting depth and byte size — which is useful when deciding whether a response is nested too deeply or larger than you expected.",
      ],
      howTo: [
        "Paste the JSON you want to check.",
        "Read the result banner: valid, or the exact line and column of the first error.",
        "For an error, look at the quoted source line with the caret pointing at the offending character.",
        "Copy the error message if you need to paste it into a ticket.",
      ],
      method: {
        title: "How validation works",
        paragraphs: [
          "The document is passed to JSON.parse. That parser implements RFC 8259 exactly, which means it rejects trailing commas, comments, single-quoted strings, unquoted keys, NaN and Infinity — all JavaScript conveniences that JSON does not allow.",
          "V8 reports the failure as an offset. Counting newlines up to that offset gives the line, and the characters after the last newline give the column. Nothing is repaired for you: a validator that silently fixes input teaches the wrong lesson.",
        ],
        formula: "line = newlines before error offset + 1; column = offset − start of that line + 1",
      },
      examples: [
        {
          title: "Trailing comma in an array",
          steps: ["Paste an object with }, ] before the closing bracket.", "The banner reports invalid JSON.", "Delete the comma at the reported line and validate again."],
          result: "Invalid JSON — Expected double-quoted property name in JSON at position 48",
        },
        {
          title: "Checking a large API response",
          steps: ["Paste the response body.", "Confirm the banner says valid.", "Read the key count and depth to see whether the payload is paginated sensibly."],
          result: "Valid JSON · object · 1,284 keys · depth 6 · 96.4 KB",
        },
      ],
      limitations: [
        "This checks syntax, not schema: a document can be perfectly valid JSON and still be the wrong shape for your API.",
        "Duplicate keys are accepted by the parser and collapse to the last value, as the specification allows.",
        "Very large documents (over roughly 50 MB) may exhaust the tab's memory.",
      ],
      faqs: [
        {
          q: "Why is my JSON invalid when JavaScript accepts it?",
          a: "JavaScript object literals allow trailing commas, single quotes, unquoted keys and comments. JSON allows none of those, so code that works in a .js file fails when parsed as JSON.",
        },
        {
          q: "Does it check my JSON Schema?",
          a: "No. This tool verifies syntax only. Schema validation needs the schema document itself and is a different job.",
        },
        {
          q: "Is my payload uploaded anywhere?",
          a: "No. Parsing happens in the tab, so internal API responses and tokens stay on your machine.",
        },
        {
          q: "Can it pretty-print as well?",
          a: "Yes — the JSON Formatter tool on this site reprints valid documents with your chosen indentation, and the JSON Minifier removes the whitespace again.",
        },
      ],
    },
  },
  {
    slug: "json-minifier",
    name: "JSON Minifier",
    category: "developer",
    tagline: "Strip every unnecessary byte from JSON without changing its meaning.",
    intent: "minify json",
    keywords: [
      "json minifier",
      "minify json",
      "compress json",
      "json without whitespace",
      "json one line",
      "reduce json size",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 86,
    addedAt: "2025-02-04",
    seoTitle: "JSON Minifier — Compress JSON to a Single Line",
    seoDescription:
      "Remove indentation and line breaks from JSON in your browser. See the byte saving, optionally sort keys for stable diffs, and download the result.",
    content: {
      intro: [
        "Whitespace is meaningless in JSON, but it can account for a third of a response's size. Minifying re-serialises the parsed value with no indentation, so what ships is the data and nothing else.",
        "Because the document is parsed first, minification also validates it. Invalid input is rejected with the parser's message instead of being chopped up textually.",
      ],
      howTo: [
        "Paste the JSON you want to compress.",
        "Choose Minify for a single line, or Compact to keep two-space indentation without blank lines.",
        "Enable key sorting if you want two documents to diff cleanly.",
        "Copy or download the result — the byte saving is shown underneath.",
      ],
      method: {
        title: "Why this is safe",
        paragraphs: [
          "The tool calls JSON.parse and then JSON.stringify with an indent of zero. Nothing inside a string is touched, so values containing spaces, tabs or braces survive intact — a regex-based minifier would corrupt them.",
          "Sorting keys recursively produces deterministic output. JSON objects are unordered, so this changes only the printed order, never the data.",
        ],
        formula: "output = JSON.stringify(JSON.parse(input))",
      },
      examples: [
        {
          title: "Compressing a config file",
          steps: ["Paste a 12 KB pretty-printed configuration.", "Choose Minify.", "Read the saving in the footer and copy the output."],
          result: "12.4 KB → 7.9 KB · 36% smaller",
        },
        {
          title: "Stable diffs for two payloads",
          steps: ["Minify the first payload with key sorting on.", "Do the same for the second.", "Compare the two lines in a diff tool."],
          result: "Key order is alphabetical at every level",
        },
      ],
      limitations: [
        "Minification does not compress — Gzip or Brotli on the wire will still do far more, and this output should be compressed in transit too.",
        "Numbers are re-serialised by the JavaScript engine, so a value like 1.0 becomes 1.",
        "Comments are not part of JSON; if your input has them, it will fail validation rather than being stripped.",
      ],
      faqs: [
        {
          q: "Does minifying change my data?",
          a: "No. Whitespace outside strings carries no meaning in JSON. Values, key names and array order are preserved.",
        },
        {
          q: "Why did 1.50 become 1.5?",
          a: "The parser converts numbers to IEEE-754 doubles and reprints them. The numeric value is identical; trailing zeros are formatting only.",
        },
        {
          q: "Should I minify JSON in an API response?",
          a: "Yes, but let your server do it at response time so the source you maintain stays readable. This tool is for one-off payloads, fixtures and logs.",
        },
        {
          q: "Does it handle arrays at the top level?",
          a: "Yes. Any valid JSON document — object, array, string, number or null — can be minified.",
        },
      ],
    },
  },
  {
    slug: "json-to-csv-converter",
    name: "JSON to CSV Converter",
    category: "developer",
    tagline: "Turn an array of JSON objects into a spreadsheet-ready CSV file.",
    intent: "convert json to csv",
    keywords: [
      "json to csv",
      "json to csv converter",
      "export json to excel",
      "convert json array to csv",
      "json to spreadsheet",
      "json csv online",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 90,
    addedAt: "2025-02-05",
    seoTitle: "JSON to CSV Converter — Export JSON as a Spreadsheet",
    seoDescription:
      "Convert a JSON array into CSV in your browser. Nested objects become dotted columns, arrays are preserved, and quoting follows RFC 4180 so Excel opens it cleanly.",
    content: {
      intro: [
        "Exporting an API response into a spreadsheet is usually a five-step detour through a script. This converter reads the JSON, works out the union of every key, and writes a header row plus one line per record.",
        "Nested objects are flattened into dotted column names so that `customer.name` becomes its own column instead of a blob of JSON inside a cell.",
      ],
      howTo: [
        "Paste a JSON array of objects — the usual shape of an API list response.",
        "Choose a delimiter: comma, semicolon, tab or pipe. Semicolon is safer in locales where the comma is the decimal separator.",
        "Keep Flatten nested objects on to turn nested keys into dotted columns.",
        "Copy the CSV or download it as a file and open it in Excel, Numbers or Google Sheets.",
      ],
      method: {
        title: "How the table is built",
        paragraphs: [
          "Every record's keys are collected into an ordered union, which becomes the header. Each record is then written against that header, so rows stay aligned even when records have different fields.",
          "Cells are quoted only when necessary: when they contain the delimiter, a double quote, a line break, or leading or trailing spaces. Embedded quotes are doubled, which is what RFC 4180 requires and what Excel expects.",
          "Nested objects are walked depth-first and their leaves are written as parent.child. Arrays stay as their JSON text, because flattening them would either lose data or invent columns.",
        ],
        formula: 'cell = value.replace(/"/g, \'""\') wrapped in quotes when it contains , " or a newline',
      },
      examples: [
        {
          title: "A list of users",
          steps: ["Paste [{\"name\":\"Ada\",\"age\":36},{\"name\":\"Grace\",\"age\":45}].", "Keep the comma delimiter.", "Download the CSV and open it in a spreadsheet."],
          result: "name,age\nAda,36\nGrace,45",
        },
        {
          title: "Nested customer records",
          steps: ["Paste records shaped like {\"customer\":{\"name\":\"Ada\"}}.", "Leave flattening enabled.", "Find the customer.name column in the header."],
          result: "customer.name\nAda",
        },
      ],
      limitations: [
        "Only the first level of arrays is handled as rows; an array of arrays becomes a single “value” column.",
        "Objects inside arrays are kept as inline JSON text rather than expanded into extra rows.",
        "Excel may reinterpret long digit strings as numbers. Prefix such values with an apostrophe if they are identifiers.",
      ],
      faqs: [
        {
          q: "Does it work with a single object, not an array?",
          a: "Yes. A lone object becomes a one-row table. Column-oriented JSON such as {\"name\":[...],\"age\":[...]} is also understood.",
        },
        {
          q: "Why is my file showing one long line in Excel?",
          a: "Excel expects the system list separator. On machines set to a comma decimal separator that is usually a semicolon, so choose the semicolon delimiter.",
        },
        {
          q: "Are commas inside text handled?",
          a: "Yes. Any cell containing the delimiter is wrapped in double quotes, and quotes inside it are doubled.",
        },
        {
          q: "Is the JSON uploaded?",
          a: "No. Conversion happens in your browser, which is what makes it safe for customer exports.",
        },
      ],
    },
  },
  {
    slug: "csv-to-json-converter",
    name: "CSV to JSON Converter",
    category: "developer",
    tagline: "Convert CSV into a clean JSON array with quoted fields and type inference.",
    intent: "convert csv to json",
    keywords: [
      "csv to json",
      "csv to json converter",
      "convert csv to json online",
      "csv parser",
      "excel to json",
      "csv json array",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 88,
    addedAt: "2025-02-05",
    seoTitle: "CSV to JSON Converter — Quoted Fields and Type Inference",
    seoDescription:
      "Parse CSV into a JSON array in your browser. Handles quoted fields, doubled quotes, CRLF line endings and a UTF-8 BOM, with optional number and boolean conversion.",
    content: {
      intro: [
        "Splitting on commas breaks the moment a field contains one — an address, a name with a suffix, a quoted description. This parser follows RFC 4180 properly, so quoted cells, doubled quotes and embedded newlines all survive.",
        "The first row becomes the key names unless you turn that off, and values that look like numbers or booleans are converted so the JSON is ready to use rather than full of strings.",
      ],
      howTo: [
        "Paste CSV, or copy it straight out of a spreadsheet.",
        "Pick the delimiter your file actually uses.",
        "Leave “First row contains names” on for normal spreadsheets, or off to get arrays of arrays.",
        "Choose indentation, then copy the JSON or download it as a .json file.",
      ],
      method: {
        title: "Parsing rules",
        paragraphs: [
          "The reader walks the file character by character, tracking whether it is inside a quoted field. Inside quotes, the delimiter and line breaks are literal text; a doubled quote becomes a single quote.",
          "A UTF-8 byte-order mark is stripped, because Excel writes one and it would otherwise end up glued to the first header name. Rows with fewer cells than the header are padded with empty strings and reported, so nothing silently shifts.",
          "Type inference is deliberately narrow: integers and decimals become numbers, true and false become booleans, null becomes null. Anything else stays a string, which avoids mangling postcodes, phone numbers and IDs such as 007.",
        ],
        formula: 'cell value → number if it matches ^-?(0|[1-9]\\d*)(\\.\\d+)?$',
      },
      examples: [
        {
          title: "A three-row spreadsheet",
          steps: ["Paste name,age rows.", "Keep comma as the delimiter.", "Copy the resulting array of objects."],
          result: '[{"name":"Ada","age":36},{"name":"Grace","age":45}]',
        },
        {
          title: "Fields containing commas",
          steps: ["Paste \"Hopper, Grace\",1944.", "Parse with the comma delimiter.", "Check that the name is one field, not two."],
          result: '{"column_1":"Hopper, Grace","column_2":1944}',
        },
      ],
      limitations: [
        "There is no type schema: a column with one empty cell becomes a mix of numbers and empty strings.",
        "Leading zeros are kept only when type inference is off — otherwise 007 becomes 7.",
        "Very large files are limited by tab memory; multi-million-row exports belong in a script.",
      ],
      faqs: [
        {
          q: "Why does my CSV produce a single column?",
          a: "The delimiter does not match. Files exported on European locales often use semicolons; choose that option and re-run.",
        },
        {
          q: "Can I keep every value as a string?",
          a: "Yes. Turn off “Convert numbers and booleans” and every cell is emitted as text, which is the safest choice for identifiers.",
        },
        {
          q: "Are duplicate column names a problem?",
          a: "They are kept, but in object output a later duplicate overwrites an earlier one. The tool warns you when it detects them.",
        },
        {
          q: "Is the file uploaded?",
          a: "No — parsing is local, so customer lists and internal exports stay on your device.",
        },
      ],
    },
  },
  {
    slug: "xml-formatter",
    name: "XML Formatter",
    category: "developer",
    tagline: "Indent and reflow XML while preserving declarations, comments and CDATA.",
    intent: "format xml",
    keywords: [
      "xml formatter",
      "xml beautifier",
      "pretty print xml",
      "format xml online",
      "indent xml",
      "xml viewer",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 84,
    addedAt: "2025-02-06",
    seoTitle: "XML Formatter — Pretty Print XML in Your Browser",
    seoDescription:
      "Format XML with two, four or eight space indentation. Attributes, comments and CDATA are preserved; malformed input is reported, not mangled.",
    content: {
      intro: [
        "One-line XML from a SOAP response or a Maven file is unreadable. This formatter re-indents it, keeping the document's meaning identical: attributes stay put, comments and CDATA sections keep their own lines, and short text elements stay inline.",
        "Formatting only runs after a well-formedness check, so you never get pretty output from a document that is actually broken.",
      ],
      howTo: [
        "Paste the XML.",
        "Choose an indent width.",
        "Leave “Keep short text inline” on if you prefer <title>Dune</title> on one line.",
        "Copy or download the formatted document.",
      ],
      method: {
        title: "How indentation is decided",
        paragraphs: [
          "The document is tokenised into declarations, comments, CDATA, opening tags, closing tags and text. Each opening tag increments the depth and each closing tag decrements it, so indentation follows nesting rather than the original whitespace.",
          "Whitespace-only text nodes are dropped, because they are what the re-indenter is replacing. Text that carries content is trimmed and written on its own line, unless the element is a simple open-text-close pair of fewer than eighty characters, which reads better inline.",
          "Because the output is generated from the tokens, comments and CDATA are preserved exactly rather than being reformatted as markup.",
        ],
      },
      examples: [
        {
          title: "A compact SOAP envelope",
          steps: ["Paste the single-line envelope.", "Choose two-space indentation.", "Copy the formatted result back into your client."],
          result: "<Envelope>\n  <Body>\n    <GetPriceResponse>…",
        },
        {
          title: "A Maven POM with comments",
          steps: ["Paste pom.xml.", "Format with two spaces.", "Confirm the comments are still on their own lines."],
          result: "Comments and nesting preserved, indentation normalised",
        },
      ],
      limitations: [
        "The text content of an element is trimmed, so significant leading or trailing spaces inside an element are normalised.",
        "Mixed content such as <p>Hello <b>world</b> again</p> is expanded across lines, which changes whitespace inside the paragraph.",
        "CDATA blocks are copied verbatim, including any indentation already inside them.",
      ],
      faqs: [
        {
          q: "Will formatting break my XML signature?",
          a: "Yes, it can. XML digital signatures cover the exact byte sequence, so re-indenting a signed document invalidates the signature. Keep the original bytes for anything signed.",
        },
        {
          q: "Why did it refuse to format?",
          a: "The document is not well formed — usually a mismatched or unclosed tag. Use the XML Validator tool for a precise explanation.",
        },
        {
          q: "Does it reorder attributes?",
          a: "No. Attribute order is preserved exactly as written.",
        },
        {
          q: "Is the document sent anywhere?",
          a: "No. Tokenising and indenting happen in the page, so internal configuration and API payloads stay local.",
        },
      ],
    },
  },
  {
    slug: "xml-validator",
    name: "XML Validator",
    category: "developer",
    tagline: "Check XML well-formedness and see which tag breaks the document.",
    intent: "validate xml",
    keywords: [
      "xml validator",
      "validate xml online",
      "xml well formed checker",
      "xml syntax checker",
      "xml error finder",
      "check xml tags",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 78,
    addedAt: "2025-02-06",
    seoTitle: "XML Validator — Check Well-Formedness and Tag Balance",
    seoDescription:
      "Validate XML syntax in your browser: unmatched tags, unquoted attributes, duplicate attributes, multiple roots and stray angle brackets are all reported with a reason.",
    content: {
      intro: [
        "“Malformed XML” from a parser is rarely enough to find the problem. This validator names the exact fault — an unclosed element, a closing tag that does not match, an attribute value without quotes — and reports the line and column.",
        "It checks well-formedness only, which is the question almost every debugging session actually starts with. Schema or DTD validation requires the schema itself and is not attempted here.",
      ],
      howTo: [
        "Paste the XML document.",
        "Read the verdict: well formed, or the first problem found.",
        "Fix the reported issue and paste it again — the tool reports one fault at a time, in document order.",
        "Use the element and depth counts to sanity-check large generated documents.",
      ],
      method: {
        title: "What is checked",
        paragraphs: [
          "The scanner reads tags in order, maintaining a stack of open elements. A closing tag must match the top of the stack; if it does not, that mismatch is reported along with the element it collides with. At the end, any remaining entries on the stack are unclosed elements.",
          "Attributes are parsed properly: each one needs a name, an equals sign and a quoted value, and duplicates within a tag are rejected. A bare “<” in text, an unterminated comment or CDATA block, a second root element and text outside the root are all errors.",
          "Entity references are not expanded, so &amp; and friends are accepted as text without needing a DTD.",
        ],
      },
      examples: [
        {
          title: "Mismatched closing tag",
          steps: ["Paste <a><b></a></b>.", "Read the message about </a> not matching <b>.", "Fix the order and validate again."],
          result: "</a> does not match the open element <b>",
        },
        {
          title: "Unquoted attribute",
          steps: ["Paste <book id=b-1>.", "The validator reports that the attribute must be quoted.", "Change it to id=\"b-1\"."],
          result: "Attribute “id” must be quoted in <book>",
        },
      ],
      limitations: [
        "Schema, DTD and XSD validation are not performed — a well-formed document can still violate your contract.",
        "Namespaces are compared as literal prefixes, so <a:x> must be closed with </a:x> even if the URI matches a different prefix.",
        "Entity declarations inside a DOCTYPE are not resolved.",
      ],
      faqs: [
        {
          q: "What is the difference between well formed and valid?",
          a: "Well formed means the syntax is legal. Valid means it also obeys a specific schema. This tool checks the first.",
        },
        {
          q: "Why is my XML with two roots rejected?",
          a: "XML documents must have exactly one root element. Wrap multiple siblings in a single container element.",
        },
        {
          q: "Can it handle a DOCTYPE?",
          a: "A DOCTYPE declaration is accepted as a token, but its internal subset is not interpreted.",
        },
        {
          q: "Does it upload my document?",
          a: "No. Everything is scanned in the page.",
        },
      ],
    },
  },
  {
    slug: "html-formatter",
    name: "HTML Formatter",
    category: "developer",
    tagline: "Indent messy HTML into a readable, consistently structured document.",
    intent: "format html",
    keywords: [
      "html formatter",
      "html beautifier",
      "pretty print html",
      "format html online",
      "indent html",
      "html beautify",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 87,
    addedAt: "2025-02-07",
    seoTitle: "HTML Formatter — Beautify and Indent HTML",
    seoDescription:
      "Format minified or badly indented HTML with configurable indentation and optional line wrapping. Tags, attributes and text content are preserved in the browser.",
    content: {
      intro: [
        "Pasted HTML often arrives as a single 4,000-character line. This formatter rebuilds the indentation from the tag structure, so nested elements step inwards and the document becomes navigable again.",
        "Everything runs on the page — useful when the markup is a customer email template or an internal dashboard you would rather not paste into a server-side formatter.",
      ],
      howTo: [
        "Paste the HTML.",
        "Choose indentation: two spaces, four spaces or tabs.",
        "Set line wrapping if you want long attribute lists broken up.",
        "Copy the formatted markup or download it.",
      ],
      method: {
        title: "How the re-indenter works",
        paragraphs: [
          "The beautifier is a tolerant tokeniser: it recognises tags, attributes, text and comments, and tracks how deeply elements are nested. It does not parse the document into a DOM, so it will not silently drop tags it does not understand.",
          "Whitespace between block elements is normalised, while the contents of pre, textarea, script and style are treated as opaque text and copied verbatim — reformatting inline script would change its meaning.",
        ],
      },
      examples: [
        {
          title: "A minified page",
          steps: ["Paste <div><h1>Hi</h1><p>Text</p></div>.", "Format with two-space indentation.", "Copy the nested result."],
          result: "<div>\n  <h1>Hi</h1>\n  <p>Text</p>\n</div>",
        },
        {
          title: "An email template",
          steps: ["Paste a table-based template.", "Format with tabs to reduce the file size.", "Check that the <style> block is untouched."],
          result: "Structure indented, CSS block preserved verbatim",
        },
      ],
      limitations: [
        "Formatting changes whitespace between inline elements, which can alter spacing in text. Check inline-link layouts after copying.",
        "Attribute values containing “>” are respected, but malformed markup can confuse the tokeniser.",
        "The output is not a validator: broken nesting is indented, not repaired.",
      ],
      faqs: [
        {
          q: "Does it change my HTML?",
          a: "Only whitespace between elements. Tags, attributes and text stay the same, with the exception of spacing around inline elements, which is inherent to re-indenting.",
        },
        {
          q: "Will it touch scripts and styles?",
          a: "No. The contents of script, style, pre and textarea are copied exactly.",
        },
        {
          q: "Can it format JSX or PHP templates?",
          a: "Partially. Mixed template syntax may confuse the tokeniser; it is designed for plain HTML.",
        },
        {
          q: "Is the markup uploaded?",
          a: "No. Formatting is local, which matters for templates under NDA.",
        },
      ],
    },
  },
  {
    slug: "css-formatter",
    name: "CSS Formatter",
    category: "developer",
    tagline: "Turn compressed CSS into readable rules with consistent indentation.",
    intent: "format css",
    keywords: [
      "css formatter",
      "css beautifier",
      "pretty print css",
      "format css online",
      "css indent",
      "css viewer",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 82,
    addedAt: "2025-02-07",
    seoTitle: "CSS Formatter — Beautify Minified Stylesheets",
    seoDescription:
      "Format CSS with your preferred indentation. Each declaration and selector gets its own line, media queries nest properly, and values are never altered.",
    content: {
      intro: [
        "Minified CSS is great to ship and terrible to debug. This formatter expands it into one declaration per line with selectors on their own lines, so you can find the rule that is winning.",
        "Comments are preserved — they are often the only documentation a stylesheet has — and values are copied exactly, including calc() expressions and custom properties.",
      ],
      howTo: [
        "Paste the stylesheet.",
        "Choose an indent width.",
        "Formatting runs as you type; copy the result or download it.",
        "Paste it into your editor to compare against the source.",
      ],
      method: {
        title: "Formatting rules",
        paragraphs: [
          "The stylesheet is tokenised by braces, semicolons and selectors. Depth increases after an opening brace and decreases before a closing one, which is what produces nesting for media queries, @supports and @layer blocks.",
          "Values are never rewritten: a minified calc(100%-10px) stays as it is, even though it is invalid CSS, because the formatter's job is layout rather than repair.",
        ],
      },
      examples: [
        {
          title: "Un-minifying a vendor stylesheet",
          steps: ["Paste a 40 KB single-line file.", "Format with two spaces.", "Search for the rule you need."],
          result: "One declaration per line, media queries nested",
        },
        {
          title: "Reviewing a diff-friendly stylesheet",
          steps: ["Paste your own CSS.", "Format with four spaces.", "Copy into the repository."],
          result: "Consistent indentation, comments preserved",
        },
      ],
      limitations: [
        "Nesting is inferred from braces, so malformed CSS can indent incorrectly.",
        "At-rules with unusual syntax may be treated as plain blocks.",
        "The output is not validated: unknown properties and typos survive untouched.",
      ],
      faqs: [
        {
          q: "Does it reorder properties?",
          a: "No. Order is preserved, because reordering shorthand properties such as `background` and `background-color` changes which one wins.",
        },
        {
          q: "Can it format Tailwind output?",
          a: "Yes, though generated utility classes are often easier to read minified. Formatting is most useful for hand-written or vendored stylesheets.",
        },
        {
          q: "What about SCSS or Less?",
          a: "Nested syntax is indented correctly because it also uses braces, but variables and mixins are left as plain text.",
        },
        {
          q: "Is the CSS uploaded?",
          a: "No, it is formatted in the page.",
        },
      ],
    },
  },
  {
    slug: "javascript-formatter",
    name: "JavaScript Formatter",
    category: "developer",
    tagline: "Beautify JavaScript with consistent braces, indentation and line breaks.",
    intent: "format javascript",
    keywords: [
      "javascript formatter",
      "js beautifier",
      "pretty print javascript",
      "format js online",
      "javascript beautify",
      "js indentation",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 89,
    addedAt: "2025-02-08",
    seoTitle: "JavaScript Formatter — Beautify Minified JS",
    seoDescription:
      "Pretty-print JavaScript in your browser. Choose indentation, brace style and whether to break method chains; strings, regex literals and template text are untouched.",
    content: {
      intro: [
        "A stack trace pointing at line 1, column 8,412 is a puzzle. Reformatting the bundle turns that position into something you can read, and this version runs locally so proprietary code never leaves the machine.",
        "The beautifier understands enough JavaScript to avoid the classic traps: it does not break inside strings, template literals, regex literals or comments.",
      ],
      howTo: [
        "Paste minified or messy JavaScript.",
        "Choose indentation.",
        "Pick a brace style — K&R keeps the opening brace on the same line, Allman puts it on its own.",
        "Optionally break method chains so each .map() starts a new line, then copy the result.",
      ],
      method: {
        title: "What the formatter can see",
        paragraphs: [
          "The tokeniser tracks string quotes, template literal backticks, regex literals after operators, and both comment forms. That is why a URL containing // inside a string is not treated as a comment.",
          "Indentation is derived from bracket depth, with special cases for control flow and chained calls. Nothing is renamed and no code is removed — this is purely a layout pass, so the behaviour of the program cannot change.",
        ],
      },
      examples: [
        {
          title: "Reading a minified bundle",
          steps: ["Paste a single-line function.", "Format with two spaces.", "Locate the reported column in the pretty output."],
          result: "function total(items, tax) {\n  return items.reduce(…)",
        },
        {
          title: "Matching a house style",
          steps: ["Paste working code.", "Choose four spaces and Allman braces.", "Copy the reformatted file back."],
          result: "Braces on their own lines, four-space indentation",
        },
      ],
      limitations: [
        "This is a beautifier, not a compiler: it does not detect syntax errors and will happily indent broken code.",
        "Automatic semicolon insertion means removing line breaks could change meaning, so the formatter preserves statement boundaries.",
        "TypeScript annotations and JSX are tokenised best-effort rather than parsed.",
      ],
      faqs: [
        {
          q: "Does formatting change how the code runs?",
          a: "It should not. Only whitespace outside strings and comments changes, and the formatter avoids joining lines in ways that would trigger ASI surprises.",
        },
        {
          q: "Can it un-minify variable names?",
          a: "No. Minifiers rename variables to single letters and that information is lost. Use a source map if you need the originals.",
        },
        {
          q: "Will it fix semicolons?",
          a: "No. It does not insert or remove them — use a linter with --fix for that.",
        },
        {
          q: "Is my code uploaded?",
          a: "No. Formatting happens in this tab, which is the point for client code under contract.",
        },
      ],
    },
  },
  {
    slug: "css-minifier",
    name: "CSS Minifier",
    category: "developer",
    tagline: "Strip comments and whitespace from CSS, safely.",
    intent: "minify css",
    keywords: [
      "css minifier",
      "minify css",
      "compress css",
      "css minify online",
      "reduce css size",
      "css compressor",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 85,
    addedAt: "2025-02-08",
    seoTitle: "CSS Minifier — Compress CSS Without Breaking It",
    seoDescription:
      "Minify CSS in the browser: comments removed, whitespace collapsed, optional trailing semicolons dropped. Strings, url() values and calc() spacing are preserved.",
    content: {
      intro: [
        "Whitespace and comments are most of a hand-written stylesheet's bytes. This minifier removes them while respecting the places where CSS genuinely needs a space — inside calc(), between media-query keywords, and around descendant selectors.",
        "It is deliberately conservative: no rule merging, no property reordering and no rewriting of colours. Those optimisations can change cascade order, and silent visual regressions are worse than a slightly larger file.",
      ],
      howTo: [
        "Paste the stylesheet.",
        "Read the byte saving in the footer.",
        "Copy the output, or download it as styles.min.css.",
        "Serve the minified file with gzip or Brotli enabled — minification and compression stack.",
      ],
      method: {
        title: "What is removed, and what is kept",
        paragraphs: [
          "Comments are dropped, runs of whitespace collapse to one space, and spaces around braces, semicolons, commas and combinators disappear. The semicolon before a closing brace is optional in CSS and is removed.",
          "Whitespace is kept wherever it is semantically required: between two words (as in a descendant selector or `1px solid red`), inside calc() around + and -, and inside attribute selectors. Strings and url() payloads are copied character for character so that escaped quotes survive.",
        ],
        formula: "output = input − comments − redundant whitespace − optional semicolons",
      },
      examples: [
        {
          title: "Compressing a component stylesheet",
          steps: ["Paste 6 KB of indented CSS.", "Minify.", "Read the saving and copy the output."],
          result: "6.2 KB → 3.9 KB · 37% smaller",
        },
        {
          title: "Keeping a calc() valid",
          steps: ["Paste width: calc(100% - 2rem).", "Minify.", "Confirm the spaces around the minus sign survive."],
          result: "calc(100% - 2rem) preserved exactly",
        },
      ],
      limitations: [
        "No structural optimisation: identical rules and duplicate declarations are left alone.",
        "Custom property values are treated as text, so a comment inside a custom property value is still removed.",
        "Source maps are not generated — keep your unminified source for debugging.",
      ],
      faqs: [
        {
          q: "Is it safe to paste production CSS?",
          a: "Yes, everything runs locally. Keep a copy of the original, though, because minified output is much harder to edit by hand.",
        },
        {
          q: "Why is my output only slightly smaller?",
          a: "If the file was already minified by a build tool, there is little left to remove. The remaining wins come from compression, not minification.",
        },
        {
          q: "Does it handle nested CSS?",
          a: "Braces are tracked generally, so CSS nesting syntax is preserved in structure, though values are not rewritten.",
        },
      ],
    },
  },
  {
    slug: "javascript-minifier",
    name: "JavaScript Minifier",
    category: "developer",
    tagline: "Shrink JavaScript with a real parser, not a regex.",
    intent: "minify javascript",
    keywords: [
      "javascript minifier",
      "minify js",
      "js minifier",
      "compress javascript",
      "uglify js online",
      "javascript compressor",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 88,
    addedAt: "2025-02-09",
    seoTitle: "JavaScript Minifier — Safe, Parser-Based Minification",
    seoDescription:
      "Minify JavaScript in your browser with Terser. Comments and whitespace are removed, expressions compressed, and optional name mangling shortens local variables.",
    content: {
      intro: [
        "Regex-based JavaScript minifiers are a classic way to break a production build: one division sign read as a regex start and the whole file is corrupted. This tool uses Terser, the same parser-based minifier used by mainstream bundlers.",
        "It runs on your machine, so unreleased code and internal modules can be minified without uploading anything.",
      ],
      howTo: [
        "Paste JavaScript — a snippet, a module body or a whole bundle.",
        "Leave compression on to fold constants and remove dead branches.",
        "Enable mangling only if you do not need readable stack traces.",
        "Copy or download app.min.js, then serve it with compression enabled.",
      ],
      method: {
        title: "What compression and mangling do",
        paragraphs: [
          "The input is parsed into an abstract syntax tree, so the minifier knows what every token is. Compression then applies semantics-preserving rewrites: folding constant expressions, dropping unreachable statements, shortening boolean returns and removing comments.",
          "Mangling renames local variables and function parameters to the shortest available identifiers. It is off by default because it makes stack traces meaningless without a source map; turn it on for the final artefact.",
          "Syntax errors are reported with the offending position instead of producing output, which is how a minifier should fail.",
        ],
      },
      examples: [
        {
          title: "Minifying a utility module",
          steps: ["Paste a 4 KB module.", "Keep compression on and mangling off.", "Download and inspect the output."],
          result: "4.1 KB → 2.6 KB with original function names kept",
        },
        {
          title: "Smallest possible bundle",
          steps: ["Paste the code.", "Enable mangling.", "Copy the output and keep the unminified source for debugging."],
          result: "Local variables renamed, comments removed",
        },
      ],
      limitations: [
        "No source map is produced, so minified stack traces cannot be traced back automatically.",
        "Dynamic code such as eval or with can defeat compression; Terser will warn rather than guess.",
        "Very large bundles take a few seconds — the parser runs in this tab, not on a server.",
      ],
      faqs: [
        {
          q: "Is the output production-ready?",
          a: "It is valid, semantics-preserving JavaScript, and it is the same engine mainstream bundlers use. For deploys, still run your own build so the version is pinned and reproducible.",
        },
        {
          q: "Should I enable mangling?",
          a: "For shipped bundles, usually yes. For anything you might have to debug in a hurry, leave it off or keep a source map from your build tool.",
        },
        {
          q: "Does it remove console.log?",
          a: "Compression can drop calls it proves have no side effects, but treat console removal as a build-tool decision rather than a minifier setting.",
        },
        {
          q: "Is my code uploaded?",
          a: "No. Terser is downloaded to the page and runs locally.",
        },
      ],
    },
  },
  {
    slug: "html-minifier",
    name: "HTML Minifier",
    category: "developer",
    tagline: "Shrink HTML by removing comments and collapsing inter-tag whitespace.",
    intent: "minify html",
    keywords: [
      "html minifier",
      "minify html",
      "compress html",
      "html minify online",
      "reduce html size",
      "html compressor",
    ],
    status: "live",
    actions: ["copy", "download"],
    effort: "instant",
    popularity: 80,
    addedAt: "2025-02-09",
    seoTitle: "HTML Minifier — Remove Comments and Whitespace Safely",
    seoDescription:
      "Minify HTML in your browser. Comments and redundant whitespace are removed, while pre, textarea, script and style content is preserved byte for byte.",
    content: {
      intro: [
        "Between nested tags, indentation is pure decoration; browsers collapse it anyway. This minifier deletes comments, collapses whitespace inside text and drops the gaps between block-level elements.",
        "The risky parts of HTML minification are exactly where naive tools break pages: whitespace inside pre, JSON inside a script tag, CSS with // in a URL, and spacing between inline elements. Those cases are handled explicitly here.",
      ],
      howTo: [
        "Paste the HTML.",
        "Minify and read the byte saving.",
        "Preview the result in your browser before shipping it.",
        "Copy or download the minified file.",
      ],
      method: {
        title: "Rules applied",
        paragraphs: [
          "HTML comments are removed unless they are conditional comments for legacy browsers. Runs of whitespace in text collapse to a single space, and whitespace-only text between two block-level elements is dropped entirely.",
          "The contents of pre, textarea, script and style are copied byte for byte. Whitespace inside a script changes nothing semantically, but inside pre it is the content, and inside a JSON script block whitespace is data.",
          "Whitespace between inline elements is preserved as a single space, because removing it would join words together visually.",
        ],
      },
      examples: [
        {
          title: "A commented template",
          steps: ["Paste a page with indentation and comments.", "Minify.", "Check that the byte saving is reported and the markup still renders."],
          result: "Comments removed, indentation collapsed, pre blocks untouched",
        },
        {
          title: "A page with inline script",
          steps: ["Paste a page containing a script tag.", "Minify.", "Confirm the script body is byte-identical."],
          result: "Script copied verbatim; surrounding whitespace removed",
        },
      ],
      limitations: [
        "Whitespace inside inline elements is normalised to one space, which can shift spacing slightly in tightly typeset text.",
        "Attribute quoting and tag casing are left unchanged.",
        "No CSS or JS inside the page is minified — use the dedicated tools for that.",
      ],
      faqs: [
        {
          q: "Will minifying break my page?",
          a: "Not if it is valid HTML with block-level structure. Check inline layouts and any whitespace-sensitive elements after copying.",
        },
        {
          q: "Why keep whitespace between inline elements?",
          a: "Because <a>A</a> <a>B</a> renders with a gap. Removing the space would join the two link labels.",
        },
        {
          q: "Does it remove conditional comments?",
          a: "No, they are preserved because they are instructions to older Internet Explorer rather than documentation.",
        },
        {
          q: "Is the HTML uploaded?",
          a: "No, all processing happens in the page.",
        },
      ],
    },
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    category: "developer",
    tagline: "Test a regular expression against your own text, with live highlights.",
    intent: "test regex online",
    keywords: [
      "regex tester",
      "regular expression tester",
      "regex online",
      "test regex",
      "regex match finder",
      "regex debugger",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 93,
    addedAt: "2025-02-10",
    seoTitle: "Regex Tester — Test Regular Expressions With Live Matches",
    seoDescription:
      "Write a regular expression and see every match highlighted as you type. Flags, capture groups, match indexes and preset patterns are included; nothing runs on a server.",
    content: {
      intro: [
        "Regex bugs are usually visible the moment you see the matches on real text. This tester highlights every match as you type, lists the indexes and capture groups, and reports invalid patterns with the engine's own message.",
        "It uses your browser's regex engine — the same one your JavaScript will use in production, including named groups, lookbehind and Unicode property escapes where supported.",
      ],
      howTo: [
        "Type the pattern without the surrounding slashes.",
        "Toggle flags: global, ignore case, multiline, dotall or unicode.",
        "Paste the text you want to test in the lower box.",
        "Read the highlighted matches, the index table and the captured groups.",
      ],
      method: {
        title: "How matching is executed",
        paragraphs: [
          "The pattern is compiled once with your flags plus the global flag, so every occurrence is found rather than just the first. Each match records its index, its text and its capture groups.",
          "Zero-length matches such as a bare \b would loop forever under a naive global exec, so the lastIndex is advanced by one whenever an empty match is found. That is why word-boundary patterns terminate instead of hanging the tab.",
          "The match list is capped at a few hundred rows: enough to debug, not enough to lock up on a pattern that matches every character of a megabyte file.",
        ],
      },
      examples: [
        {
          title: "Finding email addresses",
          steps: ["Paste [\\w.+-]+@[\\w-]+\\.[a-z]{2,}.", "Enable the global and ignore-case flags.", "Read the highlighted addresses and their indexes."],
          result: "2 matches at indexes 8 and 39",
        },
        {
          title: "Debugging a greedy quantifier",
          steps: ["Try <.+> on a page of HTML.", "Notice it matches from the first < to the last >.", "Change it to <.+?> and compare."],
          result: "One giant match becomes many small ones",
        },
      ],
      limitations: [
        "The tester never modifies the browser's engine, so behaviour that requires the sticky or unicode-sets flags is only available where the browser supports it.",
        "Catastrophic backtracking is still possible: a pathological pattern can freeze the tab. The tool caps results, not CPU time.",
        "Replacement strings are out of scope here — this tool matches, it does not substitute.",
      ],
      faqs: [
        {
          q: "Do I include the slashes?",
          a: "No. Enter the pattern itself and set the flags separately; /abc/g is written as abc with the g flag enabled.",
        },
        {
          q: "Why does my pattern match nothing?",
          a: "Usually an anchor: ^ and $ apply to the whole string unless multiline is on, and . does not cross line breaks unless dotall is enabled.",
        },
        {
          q: "Are named groups supported?",
          a: "Yes, in every browser that supports them natively; the match table lists the captured values in order.",
        },
        {
          q: "Is my text sent anywhere?",
          a: "No. Matching happens in the page, which is the reason this tool is safe for logs and customer data.",
        },
      ],
    },
  },
  {
    slug: "regex-explainer",
    name: "Regex Explainer",
    category: "developer",
    tagline: "Read a regular expression piece by piece, in plain English.",
    intent: "explain regular expression",
    keywords: [
      "regex explainer",
      "explain regex",
      "regex meaning",
      "understand regular expression",
      "regex cheat sheet",
      "what does this regex do",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 76,
    addedAt: "2025-02-11",
    seoTitle: "Regex Explainer — Understand Any Regular Expression",
    seoDescription:
      "Break a regular expression into its parts and read what each one means: classes, groups, lookarounds, quantifiers and anchors, with a cheat sheet alongside.",
    content: {
      intro: [
        "Regular expressions are compact by design, which is exactly why inherited ones are dangerous. This tool walks the pattern left to right and labels each token — a start anchor, a character class, a lazy quantifier, a named group — with the reasoning behind it.",
        "Groups are indented so nesting is visible, and the whole explanation updates as you type, making it a tool for learning as well as auditing.",
      ],
      howTo: [
        "Paste a pattern, without the surrounding slashes.",
        "Set the flags so anchor and dot behaviour is described correctly.",
        "Read the parts list top to bottom; nested groups are indented.",
        "Use the cheat sheet at the bottom for tokens you do not recognise.",
      ],
      method: {
        title: "How the walk works",
        paragraphs: [
          "A small parser reads the pattern character by character, consuming multi-character constructs as a unit: escapes such as \d or \p{L}, character classes including negation, group openers including lookbehind and named groups, and quantifiers including lazy and possessive forms.",
          "Depth is tracked so that alternatives and nested groups line up visually. The pattern is also compiled by the browser afterwards; if that fails, the engine's error message is shown, because a pattern that cannot compile cannot be trusted however well it reads.",
        ],
      },
      examples: [
        {
          title: "Understanding an email pattern",
          steps: ["Paste [a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}.", "Read the two character classes and the literal @.", "Note the escaped dot and the {2,} quantifier."],
          result: "Explained as: class, one or more, literal @, class, literal dot, 2+ letters",
        },
        {
          title: "Auditing a password rule",
          steps: ["Paste ^(?=.*[A-Z])(?=.*\\d).{8,}$.", "See the start anchor.", "Read the two lookaheads as conditions rather than consumed characters."],
          result: "Requires an uppercase letter, a digit and at least eight characters",
        },
      ],
      limitations: [
        "Descriptions are literal: the explainer does not attempt to prove what a pattern matches in all cases.",
        "Backtracking behaviour and performance characteristics are not modelled.",
        "Flavour-specific syntax outside JavaScript (such as atomic groups) may be described as literal text.",
      ],
      faqs: [
        {
          q: "Does it work with PCRE or Python patterns?",
          a: "Mostly. The common syntax is shared, but constructs unique to other engines are not interpreted the way that engine would.",
        },
        {
          q: "What is a lookahead?",
          a: "A condition about what comes next that does not consume characters. (?=.*[A-Z]) means “there is an uppercase letter later in the string”.",
        },
        {
          q: "Why is my pattern reported as invalid?",
          a: "The browser's engine rejected it — commonly an unclosed group or character class. The exact message is shown above the explanation.",
        },
      ],
    },
  },
  {
    slug: "unix-timestamp-generator",
    name: "Unix Timestamp Generator",
    category: "developer",
    tagline: "Get the current Unix time, or generate a sequence of timestamps.",
    intent: "unix timestamp now",
    keywords: [
      "unix timestamp generator",
      "current unix timestamp",
      "epoch time now",
      "generate timestamps",
      "unix time sequence",
      "epoch converter",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 83,
    addedAt: "2025-02-11",
    seoTitle: "Unix Timestamp Generator — Current Epoch Time and Sequences",
    seoDescription:
      "See the current Unix timestamp in seconds and milliseconds, copy ISO 8601 forms, and generate evenly spaced timestamp sequences for tests and fixtures.",
    content: {
      intro: [
        "Fixtures full of hand-typed timestamps are a reliable source of broken tests. This generator produces a live reading of the current epoch time and, more usefully, a sequence of evenly spaced timestamps from any starting point.",
        "Everything is computed from your device's clock, so it works offline and there is no timezone server to disagree with you.",
      ],
      howTo: [
        "Read the current Unix time at the top; it updates every second.",
        "Copy seconds, milliseconds or the ISO 8601 form with one click.",
        "For a sequence, choose a start time, an interval in seconds and how many rows you need.",
        "Copy the column of seconds straight into a fixture or a test file.",
      ],
      method: {
        title: "The arithmetic",
        paragraphs: [
          "Unix time is the number of seconds since 1970-01-01T00:00:00Z, ignoring leap seconds. JavaScript's Date.now() returns milliseconds, so seconds are that value divided by a thousand and floored.",
          "Sequences add index × interval × 1000 milliseconds to the start and format each result in ISO 8601 and in your local time zone, which makes it obvious when a fixture straddles a daylight-saving change.",
        ],
        formula: "timestamp(n) = floor((start + n × interval) / 1000)",
      },
      examples: [
        {
          title: "Hourly fixtures for a day",
          steps: ["Set the start to today at midnight.", "Set the interval to 3600 and the count to 24.", "Copy the seconds column."],
          result: "24 timestamps, one hour apart",
        },
        {
          title: "Checking a token expiry",
          steps: ["Read the current timestamp.", "Note the exp claim from your JWT.", "Compare to see how long is left."],
          result: "exp minus now, in seconds",
        },
      ],
      limitations: [
        "Your device clock is the source of truth here; a machine with the wrong time will generate wrong timestamps.",
        "Unix time cannot represent leap seconds, which is why some systems drift by a second over decades.",
        "Timestamps beyond year 2038 are fine in JavaScript, but not in 32-bit systems that still store signed 32-bit time.",
      ],
      faqs: [
        {
          q: "Is a Unix timestamp in seconds or milliseconds?",
          a: "Traditionally seconds. JavaScript uses milliseconds, which is why a JavaScript timestamp is ten digits longer than a Unix one.",
        },
        {
          q: "Does it handle time zones?",
          a: "Timestamps themselves are UTC. The local-time column is formatted in your browser's zone so you can check the offset.",
        },
        {
          q: "Can I generate timestamps in the past?",
          a: "Yes. Set any start date — the sequence works forwards from it, including dates before 1970, which produce negative values.",
        },
      ],
    },
  },
  {
    slug: "hex-to-rgb-converter",
    name: "HEX to RGB Converter",
    category: "developer",
    tagline: "Convert a hex colour into rgb(), hsl() and channel values with a live swatch.",
    intent: "hex to rgb",
    keywords: [
      "hex to rgb",
      "hex to rgb converter",
      "convert hex color to rgb",
      "hex to hsl",
      "color converter",
      "hex color to rgba",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 86,
    addedAt: "2025-02-12",
    seoTitle: "HEX to RGB Converter — With HSL and Contrast Ratios",
    seoDescription:
      "Convert a hex colour to rgb(), rgba() and hsl() instantly. See the swatch, the individual channels and the contrast ratio against white and black.",
    content: {
      intro: [
        "Hex is compact for stylesheets and opaque when you need to know whether a colour can carry white text. This converter shows the same colour as rgb(), rgba(), hsl() and separate channels, plus contrast ratios against white and black.",
        "The swatch uses the real CSS value, so what you copy is exactly what you see — including alpha.",
      ],
      howTo: [
        "Type or paste a hex colour with or without the leading #.",
        "Short forms such as #abc are expanded automatically.",
        "Copy whichever notation your code needs.",
        "Check the contrast figures before setting text on top of the colour.",
      ],
      method: {
        title: "The conversion",
        paragraphs: [
          "A six-digit hex colour is three byte pairs: red, green and blue from 00 to ff. Each pair is parsed as base 16, giving the decimal channels used by rgb().",
          "HSL is derived geometrically from those channels: hue from which channel dominates, saturation from how far the colour is from grey, and lightness from the average of the largest and smallest channels. Contrast ratios use the WCAG relative-luminance formula with a gamma correction of 2.4.",
        ],
        formula: "relative luminance = 0.2126R + 0.7152G + 0.0722B (after sRGB linearisation)",
      },
      examples: [
        {
          title: "Converting a brand colour",
          steps: ["Paste #3366cc.", "Read rgb(51, 102, 204) and hsl(220 60% 50%).", "Check the contrast against white."],
          result: "rgb(51, 102, 204) · hsl(220 60% 50%) · 5.1:1 on white",
        },
        {
          title: "Adding transparency",
          steps: ["Paste an eight-digit hex such as #3366cc80.", "Read the rgba() output with alpha 0.5.", "Copy the rgba value."],
          result: "rgba(51, 102, 204, 0.502)",
        },
      ],
      limitations: [
        "Only hex input is parsed here; use RGB to HEX for the other direction.",
        "HSL is not perceptually uniform, so equal lightness steps may look uneven — use OKLCH for palette work.",
        "Contrast ratios are calculated against pure white and pure black only.",
      ],
      faqs: [
        {
          q: "What is the difference between hex and rgb()?",
          a: "Nothing but notation. Both describe the same sRGB colour; rgb() is easier to compute with, hex is shorter.",
        },
        {
          q: "How do I convert to rgba()?",
          a: "Add an alpha pair or use the rgba() output shown here. Eight-digit hex is supported, so #ff000080 is 50% red.",
        },
        {
          q: "Why is HSL useful?",
          a: "Because you can adjust lightness while keeping the hue, which makes hover and disabled states predictable.",
        },
      ],
    },
  },
  {
    slug: "rgb-to-hex-converter",
    name: "RGB to HEX Converter",
    category: "developer",
    tagline: "Turn RGB channels into hex, with sliders and a live preview.",
    intent: "rgb to hex",
    keywords: [
      "rgb to hex",
      "rgb to hex converter",
      "convert rgb to hex",
      "rgba to hex",
      "color converter rgb",
      "rgb hexadecimal",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 84,
    addedAt: "2025-02-12",
    seoTitle: "RGB to HEX Converter — Sliders, Preview and Copyable Values",
    seoDescription:
      "Convert rgb() and rgba() values to hex in real time. Drag the channel sliders or paste any colour, then copy the hex, hsl() or rgb() form.",
    content: {
      intro: [
        "Copying colours out of a design tool often gives you rgb() or rgba(), while your stylesheet wants hex. This converter goes both ways, with sliders for the channels and a preview that updates as you drag.",
        "You can also paste an existing colour in any common notation — hex, hsl(), rgb() or a CSS colour name — and the channels load from it.",
      ],
      howTo: [
        "Set red, green and blue between 0 and 255, by typing or with the sliders.",
        "Adjust alpha if you need transparency.",
        "Copy the hex value, or the six-digit hex without alpha.",
        "To start from another colour, paste it in the box at the bottom and press Load channels.",
      ],
      method: {
        title: "How the hex is built",
        paragraphs: [
          "Each channel is clamped to the 0–255 range and converted to two hexadecimal digits. Joining the three pairs gives the six-digit hex colour; if alpha is below 1, a fourth pair encodes alpha as a 0–255 byte.",
          "The CSS colour preview is a real style on a real element, so the browser's own colour management is what you see, not an approximation drawn by the page.",
        ],
        formula: "hex = '#' + toHex(r) + toHex(g) + toHex(b) + (a < 1 ? toHex(round(a × 255)) : '')",
      },
      examples: [
        {
          title: "Converting a design token",
          steps: ["Type 51, 102 and 204.", "Read #3366CC.", "Copy the hex into your stylesheet."],
          result: "#3366cc",
        },
        {
          title: "Starting from an hsl() value",
          steps: ["Paste hsl(220 60% 50%).", "Press Load channels.", "Copy the resulting hex."],
          result: "Channels 51, 102, 204 → #3366cc",
        },
      ],
      limitations: [
        "Out-of-range values are clamped rather than wrapping, which is what CSS does too.",
        "Alpha is quantised to 256 steps when written as eight-digit hex.",
        "Named colours are limited to the standard CSS list; vendor-specific names are not recognised.",
      ],
      faqs: [
        {
          q: "How many digits is a hex colour?",
          a: "Six for RGB — two per channel — or eight when alpha is included. Three-digit shorthand works only when every channel is a repeated pair.",
        },
        {
          q: "Does the order matter?",
          a: "Yes: red, then green, then blue. Swapping them gives a different colour, which is why pasting the wrong notation produces strange results.",
        },
        {
          q: "Can I get the HSL value too?",
          a: "Yes, the conversion list under the preview includes hsl() alongside rgb() and hex.",
        },
      ],
    },
  },
  {
    slug: "css-gradient-generator",
    name: "CSS Gradient Generator",
    category: "developer",
    tagline: "Design a linear, radial or conic gradient and copy the CSS.",
    intent: "css gradient generator",
    keywords: [
      "css gradient generator",
      "linear gradient generator",
      "radial gradient css",
      "conic gradient",
      "css background gradient",
      "gradient maker",
    ],
    status: "live",
    actions: ["copy"],
    effort: "quick",
    popularity: 87,
    addedAt: "2025-02-13",
    seoTitle: "CSS Gradient Generator — Linear, Radial and Conic",
    seoDescription:
      "Build CSS gradients visually: multiple colour stops, adjustable angle, radial and conic modes, optional repeating. Preview updates live and the CSS is one click away.",
    content: {
      intro: [
        "Gradients are easy to imagine and fiddly to write by hand — especially with five stops and a specific angle. This generator gives you the controls and produces the exact CSS you need, with no vendor prefixes because none are required today.",
        "The preview is the real background value, not a canvas approximation, so the colours you see are the colours the browser will paint.",
      ],
      howTo: [
        "Choose linear, radial or conic.",
        "Set the angle: 0° points up, 90° points right, 180° points down.",
        "Add or remove colour stops and set each one's position as a percentage.",
        "Copy the CSS rule and paste it into your stylesheet.",
      ],
      method: {
        title: "What gets emitted",
        paragraphs: [
          "Stops are sorted by position before being printed, so the output cannot contain an out-of-order stop list — a common cause of gradients that look wrong despite valid syntax.",
          "Radial gradients use `circle at 50% 50%`, and conic gradients use `from <angle> at 50% 50%`, which matches the most common design pattern for each type. The repeating variant prefixes the function name rather than duplicating the stop list.",
        ],
        formula: "background: linear-gradient(135deg, #ff4b00 0%, #ffb347 100%);",
      },
      examples: [
        {
          title: "A two-colour hero background",
          steps: ["Pick linear.", "Set the angle to 135°.", "Choose two stops and copy the rule."],
          result: "linear-gradient(135deg, #ff4b00 0%, #ffb347 100%)",
        },
        {
          title: "A three-stop candy gradient",
          steps: ["Add a third stop.", "Place it at 50%.", "Copy the value into a card style."],
          result: "linear-gradient(120deg, #f6d365 0%, #fda085 50%, #a18cd1 100%)",
        },
      ],
      limitations: [
        "Hard colour stops (two stops at the same position) are allowed but not flagged visually.",
        "Gradient interpolation happens in sRGB; for perceptually even blends, modern CSS supports interpolation hints that this tool does not generate.",
        "The preview is a rectangle — real elements with text may need a scrim over the gradient for contrast.",
      ],
      faqs: [
        {
          q: "Do gradients need vendor prefixes?",
          a: "No. Standard CSS gradients have been supported without prefixes for years; adding them only bloats the file.",
        },
        {
          q: "How do I animate a gradient?",
          a: "You cannot transition between two gradients directly, but you can animate the background-position of an oversized gradient or use @property on custom properties.",
        },
        {
          q: "Why does my gradient look banded?",
          a: "With few colours across a large area, 8-bit channels band visibly. Adding intermediate stops or a subtle noise overlay reduces it.",
        },
      ],
    },
  },
  {
    slug: "box-shadow-generator",
    name: "Box Shadow Generator",
    category: "developer",
    tagline: "Layer up to four shadows visually and copy the CSS.",
    intent: "box shadow generator",
    keywords: [
      "box shadow generator",
      "css box shadow",
      "shadow generator css",
      "inset shadow",
      "multiple box shadows",
      "css shadow maker",
    ],
    status: "live",
    actions: ["copy"],
    effort: "quick",
    popularity: 85,
    addedAt: "2025-02-13",
    seoTitle: "CSS Box Shadow Generator — Multiple Layers, Live Preview",
    seoDescription:
      "Create CSS box shadows with up to four layers. Adjust offset, blur, spread, colour and inset, preview against any background, and copy border-radius too.",
    content: {
      intro: [
        "Convincing depth usually needs two or three shadows: a tight dark one and a wide soft one. This generator lets you layer them, toggle inset, and see the result on a card against a background you choose.",
        "The preview also carries a border radius, so shadows read correctly on rounded cards rather than square boxes.",
      ],
      howTo: [
        "Adjust X and Y offsets, blur and spread for the first layer.",
        "Add a second layer for depth — a larger blur with low opacity works well.",
        "Pick colours with the picker or paste an rgba() value so the shadow keeps transparency.",
        "Copy the generated box-shadow and border-radius rules.",
      ],
      method: {
        title: "Reading the values",
        paragraphs: [
          "Each layer prints as `[inset] x y blur spread colour`. Positive X moves the shadow right, positive Y moves it down, blur softens the edge, and spread grows or shrinks the shadow before blurring.",
          "Layers are ordered as written and painted back to front, so the first line is drawn on top. Layers with all-zero geometry are skipped, since they would only tint the element invisibly.",
          "Transparent colours — rgba() or eight-digit hex — are what make shadows look natural on non-white backgrounds. A solid grey shadow is the most common giveaway of a shadow written by hand.",
        ],
        formula: "box-shadow: 0 1px 2px rgba(0,0,0,.16), 0 8px 24px -4px rgba(0,0,0,.18);",
      },
      examples: [
        {
          title: "A subtle card shadow",
          steps: ["Keep layer one at 0 1px 2px.", "Set layer two to 0 8px 24px with -4 spread.", "Copy both rules."],
          result: "Two-layer shadow that reads as soft depth",
        },
        {
          title: "An inset field",
          steps: ["Remove the second layer.", "Enable inset on the first.", "Use a dark colour at 10% opacity."],
          result: "box-shadow: inset 0 1px 2px rgba(20,20,15,.1);",
        },
      ],
      limitations: [
        "Shadows are painted outside the element and do not affect layout, so they can overlap neighbours.",
        "Performance: very large blurs on many elements can cost paint time on low-end devices.",
        "The preview is a fixed card — real elements with different sizes will need their own blur tuning.",
      ],
      faqs: [
        {
          q: "What does spread do?",
          a: "It expands the shadow before blurring. Positive values grow it, negative values shrink it, which is how you keep a large shadow from bleeding past a card's edges.",
        },
        {
          q: "Why are my shadows invisible?",
          a: "The colour is probably opaque black behind a dark element, or the blur is zero with zero offset. Use a transparent colour and check the offsets.",
        },
        {
          q: "Can I animate a box shadow?",
          a: "Yes, box-shadow is animatable, and it is far cheaper to animate than filter: drop-shadow on large elements.",
        },
        {
          q: "Do I need a border-radius rule too?",
          a: "Only if the element is rounded; the copied CSS includes it because the preview uses it.",
        },
      ],
    },
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    category: "developer",
    tagline: "Create a QR code for any text or URL and download it as a PNG.",
    intent: "generate qr code",
    keywords: [
      "qr code generator",
      "create qr code",
      "qr code png",
      "url to qr code",
      "free qr code",
      "qr code maker",
    ],
    status: "live",
    actions: ["download", "copy"],
    effort: "instant",
    popularity: 92,
    addedAt: "2025-02-14",
    seoTitle: "QR Code Generator — Free PNG, No Expiry, No Account",
    seoDescription:
      "Generate a QR code for a URL or any text in your browser. Choose size, error correction and colours, then download a PNG. No sign-up, no expiring redirect.",
    content: {
      intro: [
        "Most free QR generators route every scan through their own short link, which lets them expire, track, or stop working. This one encodes your content directly into the image, so the code works forever and includes nothing you did not type.",
        "It handles URLs, plain text, Wi-Fi strings and email addresses, with control over size, error correction and colours.",
      ],
      howTo: [
        "Type or paste the content. A URL is usually what you want, but any text works.",
        "Choose an error-correction level: higher survives smudges and low-quality printing but holds less data.",
        "Set the size in pixels and, if you like, the dark and light colours.",
        "Download the PNG and test it with your phone before printing.",
      ],
      method: {
        title: "What the settings mean",
        paragraphs: [
          "QR error correction stores redundant data so a damaged code still decodes: L recovers about 7% of the symbol, M 15%, Q 25% and H 30%. More correction means fewer characters fit in the same image, which is why long URLs and level H make dense codes.",
          "The quiet zone — the light margin around the code — is not decoration. Scanners need it to find the symbol's edges, so keep at least two modules and prefer four for print.",
          "Dark-on-light is required for reliable scanning; an inverted code fails on many readers. If you customise colours, keep strong contrast and test on a real device.",
        ],
      },
      examples: [
        {
          title: "A link for a poster",
          steps: ["Paste the page URL.", "Set error correction to Q and size to 640.", "Download the PNG, then scan it from a printed proof."],
          result: "A 640 px QR code that survives print damage",
        },
        {
          title: "Wi-Fi credentials",
          steps: ["Enter WIFI:T:WPA;S:NetworkName;P:password;;", "Use level M.", "Print and test with a phone camera."],
          result: "A code that joins the network when scanned",
        },
      ],
      limitations: [
        "There is no logo in the middle: overlaying one eats error-correction capacity and often breaks scanning.",
        "Capacity is finite — a few thousand characters at best, far less at level H.",
        "Dynamic, editable QR codes require a redirect service, which this tool deliberately does not use.",
      ],
      faqs: [
        {
          q: "Do these codes expire?",
          a: "No. The data is encoded in the image itself, with no redirect in between, so it works as long as the destination exists.",
        },
        {
          q: "Can I use it commercially?",
          a: "Yes. Generate and print as many as you like; there is no account, watermark or licence fee.",
        },
        {
          q: "Why does my code look blurry when zoomed?",
          a: "PNG pixels are fixed. For large prints, generate at the largest size and scale down in your layout rather than enlarging a small export.",
        },
        {
          q: "Is my content uploaded?",
          a: "No. Encoding happens on a canvas in this page.",
        },
      ],
    },
  },
  {
    slug: "qr-code-reader",
    name: "QR Code Reader",
    category: "developer",
    tagline: "Decode a QR code from an image, entirely on your device.",
    intent: "read qr code from image",
    keywords: [
      "qr code reader",
      "decode qr code",
      "qr code scanner online",
      "read qr code from image",
      "qr code decoder",
      "scan qr code screenshot",
    ],
    status: "live",
    actions: ["copy"],
    effort: "instant",
    popularity: 81,
    addedAt: "2025-02-14",
    seoTitle: "QR Code Reader — Decode an Image Without Uploading It",
    seoDescription:
      "Decode a QR code from a screenshot or photo in your browser. Works offline, shows the version and mode, and never sends the image to a server.",
    content: {
      intro: [
        "Scanning a screenshot should not mean handing the image to a stranger's server. This reader decodes the code on your device, showing exactly what was encoded before you decide to follow any link.",
        "It also reports the symbol version and encoding mode, which is useful when you are generating codes yourself and want to confirm the output.",
      ],
      howTo: [
        "Drop a screenshot or photo of a QR code onto the drop zone, or choose a file.",
        "Wait for the decoded text to appear.",
        "Read the content before clicking anything — a QR code is just data and can point anywhere.",
        "Copy the text, or open the link if you trust it.",
      ],
      method: {
        title: "How decoding works",
        paragraphs: [
          "The image is drawn to a canvas and read pixel by pixel. jsQR locates the three finder patterns, rectifies the perspective distortion, reads the format and version information, and reconstructs the payload — including error correction if part of the code is damaged.",
          "Both normal and inverted codes are attempted, because some designs print light symbols on dark backgrounds. The result includes the QR version, which tells you how dense the symbol was, and the encoding mode.",
        ],
      },
      examples: [
        {
          title: "Checking a printed code",
          steps: ["Photograph the printed QR code.", "Drop the photo here.", "Read the decoded URL before opening it."],
          result: "Decoded URL plus the QR version used",
        },
        {
          title: "Verifying your own generator",
          steps: ["Download a code from the generator.", "Load it here.", "Compare the decoded text with the input."],
          result: "Identical text, confirming the export is valid",
        },
      ],
      limitations: [
        "Very small, blurry or heavily cropped codes may not decode; aim for at least a few hundred pixels across.",
        "There is no live camera mode — this tool works from images, which avoids a camera permission prompt.",
        "The image is decoded in memory only and is not stored after you leave the page.",
      ],
      faqs: [
        {
          q: "Does it need camera access?",
          a: "No. It reads image files, so no permission prompt appears and nothing is captured.",
        },
        {
          q: "Can it read a QR code from a screenshot?",
          a: "Yes — screenshots are the most reliable input, since they have no perspective distortion or blur.",
        },
        {
          q: "Is it safe to scan unknown codes here?",
          a: "Yes for the decoding itself: nothing is fetched or opened automatically. Treat any link you then open with normal caution.",
        },
        {
          q: "Does it support other barcodes?",
          a: "No, this reader is QR-specific. It handles the standard QR symbol, not Data Matrix or PDF417.",
        },
      ],
    },
  },
];
