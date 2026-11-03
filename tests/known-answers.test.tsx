// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import PercentageCalculator from "../src/tools/calculators/percentage-calculator";
import VatCalculator from "../src/tools/calculators/vat-calculator";
import BmiCalculator from "../src/tools/everyday/bmi-calculator";
import Base64Tool from "../src/tools/developer/base64-encoder-decoder";
import RomanTool from "../src/tools/education/roman-numeral-converter";
import TextReverser from "../src/tools/text/text-reverser";
import WordCounter from "../src/tools/text/word-counter";
import HashGenerator from "../src/tools/developer/hash-generator";
import UnitConverter from "../src/tools/everyday/unit-converter";
import JsonFormatter from "../src/tools/developer/json-formatter";

/**
 * Known-answer checks through the real UI.
 *
 * The logic tests prove the maths; these prove the component is wired to it —
 * that the field a visitor types into reaches the function, and that its answer
 * reaches the screen. One or two tools per interaction style (live card, form
 * with a shared rate, two-way converter, async digest).
 */

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }),
  });
});

afterEach(() => cleanup());

const type = (element: HTMLInputElement | HTMLTextAreaElement, value: string) =>
  fireEvent.change(element, { target: { value } });

describe("known answers through the UI", () => {
  it("percentage: 25% of 200 is 50", () => {
    const { container } = render(<PercentageCalculator />);
    type(container.querySelector<HTMLInputElement>("#pc-of-percent")!, "25");
    type(container.querySelector<HTMLInputElement>("#pc-of-value")!, "200");
    expect(container.textContent).toContain("25% of 200");
    expect(container.textContent).toContain("50");
  });

  it("VAT: 100 net at 20% is 120 gross", () => {
    const { getByLabelText, container } = render(<VatCalculator />);
    type(getByLabelText(/amount excluding vat/i) as HTMLInputElement, "100");
    expect(container.textContent).toMatch(/120/);
  });

  it("BMI: 70 kg at 175 cm is 22.9", () => {
    const { getByLabelText, container } = render(<BmiCalculator />);
    type(getByLabelText(/weight \(kg\)/i) as HTMLInputElement, "70");
    type(getByLabelText(/height \(cm\)/i) as HTMLInputElement, "175");
    expect(container.textContent).toContain("22.9");
  });

  it("base64: Hello encodes to SGVsbG8=", () => {
    const { getByLabelText, container } = render(<Base64Tool />);
    type(getByLabelText(/text to encode/i) as HTMLTextAreaElement, "Hello");
    expect(container.textContent).toContain("SGVsbG8=");
  });

  it("Roman numerals: 1994 is MCMXCIV", () => {
    const { getByLabelText, container } = render(<RomanTool />);
    type(getByLabelText(/number \(1–3999\)/i) as HTMLInputElement, "1994");
    expect(container.textContent).toContain("MCMXCIV");
  });

  it("text reverser: characters, words and lines all answer", () => {
    const { getByLabelText, container } = render(<TextReverser />);
    type(getByLabelText(/original text/i) as HTMLTextAreaElement, "Hello World");
    expect(container.textContent).toContain("dlroW olleH");
    expect(container.textContent).toContain("World Hello");
  });

  it("word counter: counts five words and twenty-four characters", () => {
    const { container } = render(<WordCounter />);
    type(container.querySelector<HTMLTextAreaElement>("#wc-input")!, "One two three four five.");
    expect(container.textContent).toContain("Words5");
    expect(container.textContent).toContain("Characters24");
  });

  it("unit converter: 1 kilogram is 2.2046 pounds", () => {
    const { container } = render(<UnitConverter />);
    const mass = Array.from(container.querySelectorAll("button")).find((button) =>
      /^mass$/i.test((button.textContent ?? "").trim()),
    )!;
    fireEvent.click(mass);
    type(container.querySelector<HTMLInputElement>("#uc-value")!, "1");
    fireEvent.change(container.querySelector<HTMLSelectElement>("#uc-from")!, { target: { value: "kg" } });
    fireEvent.change(container.querySelector<HTMLSelectElement>("#uc-to")!, { target: { value: "lb" } });
    expect(container.textContent).toContain("2.20462262");
  });

  it("JSON formatter: pretty-prints valid input and rejects invalid input", () => {
    const { container } = render(<JsonFormatter />);
    const input = container.querySelector<HTMLTextAreaElement>("#json-input")!;
    type(input, '{"b":2,"a":1}');
    expect(container.textContent).toContain('"a": 1');
    type(input, '{"broken":');
    expect(container.textContent).toMatch(/invalid|expected|error/i);
  });

  it("hash generator: SHA-256 of abc matches the published digest", async () => {
    const { getByLabelText, container } = render(<HashGenerator />);
    type(getByLabelText(/text to hash/i) as HTMLTextAreaElement, "abc");
    await waitFor(() =>
      expect(container.textContent).toContain(
        "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
      ),
    );
  });
});
