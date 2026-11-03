"use client";

import { FormTool, num, str } from "@/components/tools/form-tool";
import { determinant, invert, matrixAdd, matrixMultiply, transpose, type Matrix } from "@/lib/math";
import { formatNumber } from "@/lib/utils";

function parseMatrix(input: string): Matrix | null {
  const rows = input
    .trim()
    .split(/[\n;]+/)
    .map((row) => row.split(/[\s,]+/).filter(Boolean).map(Number));
  if (rows.length === 0 || rows.some((row) => row.some((value) => !Number.isFinite(value)))) return null;
  const width = rows[0].length;
  if (width === 0 || rows.some((row) => row.length !== width)) return null;
  return rows;
}

const render = (matrix: Matrix) =>
  matrix.map((row) => `[ ${row.map((value) => formatNumber(value, 6).padStart(7)).join("  ")} ]`).join("\n");

export default function MatrixCalculator() {
  return (
    <FormTool
      spec={{
        columns: 2,
        fields: [
          { kind: "textarea", id: "a", label: "Matrix A", value: "1, 2\n3, 4", rows: 5, hint: "One row per line — numbers separated by commas or spaces", span: 2 },
          { kind: "textarea", id: "b", label: "Matrix B", value: "5, 6\n7, 8", rows: 5, hint: "Same shape as A for + and −; rows of B must match columns of A for ×", span: 2 },
          {
            kind: "select",
            id: "op",
            label: "Operation",
            value: "multiply",
            options: [
              { value: "multiply", label: "A × B" },
              { value: "add", label: "A + B" },
              { value: "subtract", label: "A − B" },
              { value: "determinant", label: "det(A)" },
              { value: "inverse", label: "A⁻¹" },
              { value: "transpose", label: "Aᵀ" },
            ],
          },
        ],
        compute: (values) => {
          const a = parseMatrix(str(values, "a"));
          const b = parseMatrix(str(values, "b"));
          const op = str(values, "op");
          if (!a) return { error: "Matrix A is not rectangular — every row needs the same number of values." };
          if (["multiply", "add", "subtract"].includes(op) && !b) {
            return { error: "Matrix B is missing or not rectangular. Both matrices need equal row lengths." };
          }

          if (op === "determinant") {
            const value = determinant(a);
            if (value === null) return { error: "The determinant needs a square matrix (same rows and columns)." };
            return {
              label: "det(A)",
              value: formatNumber(value, 8),
              sub: "A non-zero determinant means the matrix is invertible and its rows are linearly independent.",
              stats: [
                { label: "Size", value: `${a.length}×${a[0].length}` },
                { label: "Invertible", value: value === 0 ? "no" : "yes" },
                { label: "Trace", value: formatNumber(a.reduce((sum, row, index) => sum + (row[index] ?? 0), 0), 8) },
              ],
              output: { label: "Matrix A", text: render(a) },
              note: "For 3×3 matrices the determinant expands along the first row using 2×2 minors.",
            };
          }

          if (op === "inverse") {
            const result = invert(a);
            if (!result) return { error: "Only 2×2 matrices with a non-zero determinant can be inverted here." };
            return {
              label: "A⁻¹",
              value: `${formatNumber(result[0][0], 6)}, ${formatNumber(result[0][1], 6)} …`,
              sub: "Multiply A by this result and you get the identity matrix.",
              output: { label: "Inverse matrix", text: render(result) },
              stats: [
                { label: "det(A)", value: formatNumber(determinant(a) ?? NaN, 8) },
                { label: "Size", value: "2×2" },
              ],
              note: "A⁻¹ = (1/det) × [[d, −b], [−c, a]].",
            };
          }

          if (op === "transpose") {
            return {
              label: "Aᵀ",
              value: `${transpose(a).length}×${transpose(a)[0].length}`,
              sub: "Rows and columns swap places.",
              output: { label: "Transposed matrix", text: render(transpose(a)) },
            };
          }

          if (op === "add" || op === "subtract") {
            const result = matrixAdd(a, b as Matrix, op === "add" ? 1 : -1);
            if (!result) return { error: "Matrices must have the same shape to be added or subtracted." };
            return {
              label: op === "add" ? "A + B" : "A − B",
              value: `${result.length}×${result[0].length}`,
              sub: "Element by element.",
              output: { label: "Result", text: render(result) },
            };
          }

          const result = matrixMultiply(a, b as Matrix);
          if (!result) {
            return {
              error: `Cannot multiply: A is ${a.length}×${a[0].length} and B is ${(b as Matrix).length}×${(b as Matrix)[0].length}. The columns of A must equal the rows of B.`,
            };
          }
          return {
            label: "A × B",
            value: `${result.length}×${result[0].length}`,
            sub: "Each entry is the dot product of a row from A and a column from B.",
            output: { label: "Product matrix", text: render(result) },
            stats: [
              { label: "Shape", value: `${result.length}×${result[0].length}` },
              { label: "det(A×B)", value: determinant(result) === null ? "not square" : formatNumber(determinant(result) as number, 8) },
              { label: "det(A)·det(B)", value: determinant(a) !== null && determinant(b as Matrix) !== null ? formatNumber((determinant(a) as number) * (determinant(b as Matrix) as number), 8) : "—" },
            ],
            note: "Matrix multiplication is not commutative: A×B and B×A usually differ, and B×A may not even exist.",
          };
        },
        footnote: "Determinants and inverses are exact for 2×2 matrices; larger inverses are not offered because this tool does not do full row reduction.",
      }}
    />
  );
}
