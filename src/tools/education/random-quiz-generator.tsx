"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Callout, Field, ResultCard, Select, StatGrid, TextArea, ToolPanel } from "@/components/ui";
import { buildQuiz, parseFlashcards, type Flashcard } from "@/lib/education";

const SAMPLE = `Capital of France | Paris
Largest planet | Jupiter
Chemical symbol for gold | Au
Speed of light | 299,792,458 m/s
Author of Hamlet | Shakespeare
Largest ocean | Pacific`;

export default function RandomQuizGenerator() {
  const [input, setInput] = useState(SAMPLE);
  const [count, setCount] = useState("5");
  const [choices, setChoices] = useState("4");
  const [seed, setSeed] = useState(11);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);

  const cards: Flashcard[] = useMemo(() => parseFlashcards(input).cards, [input]);
  const quiz = useMemo(() => buildQuiz(cards, { count: Number(count), choices: Number(choices), seed }), [cards, count, choices, seed]);

  useEffect(() => {
    setAnswers({});
    setChecked(false);
  }, [seed, count, choices, input]);

  const score = quiz.reduce((total, question, index) => total + (answers[index] === question.answer ? 1 : 0), 0);

  return (
    <ToolPanel>
      <Field label="Question bank" htmlFor="quiz-input" hint="One fact per line, split by a pipe, tab, colon or “ - ”.">
        <TextArea id="quiz-input" value={input} onChange={(event) => setInput(event.target.value)} rows={8} className="font-mono text-[0.8rem]" spellCheck={false} />
      </Field>

      <div className="mt-4 grid gap-3 sm:grid-cols-[7rem_9rem_1fr]">
        <Field label="Questions" htmlFor="quiz-count">
          <Select id="quiz-count" value={count} onChange={(event) => setCount(event.target.value)}>
            {[3, 5, 8, 10, 15, 20].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Choices" htmlFor="quiz-choices">
          <Select id="quiz-choices" value={choices} onChange={(event) => setChoices(event.target.value)}>
            {[2, 3, 4, 5].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex items-end">
          <Button onClick={() => setSeed((value) => value + 1)}>Shuffle questions</Button>
        </div>
      </div>

      <div className="mt-6">
        {quiz.length ? (
          <>
            <ResultCard
              label="Quiz"
              value={`${quiz.length} questions`}
              sub={checked ? `Score: ${score} / ${quiz.length}` : "Pick an answer for each question, then check"}
              tone="brand"
              actions={
                <Button size="sm" onClick={() => setChecked(true)} disabled={Object.keys(answers).length !== quiz.length}>
                  Check answers
                </Button>
              }
            >
              <StatGrid
                columns={3}
                items={[
                  { label: "Answered", value: `${Object.keys(answers).length}/${quiz.length}` },
                  { label: "Correct", value: checked ? String(score) : "—" },
                  { label: "Bank size", value: String(cards.length) },
                ]}
              />

              <ol className="mt-4 space-y-4">
                {quiz.map((question, index) => {
                  const chosen = answers[index];
                  return (
                    <li key={`${question.prompt}-${index}`}>
                      <p className="text-sm font-medium text-[var(--text)]">
                        {index + 1}. {question.prompt}
                      </p>
                      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                        {question.options.map((option, optionIndex) => {
                          const isChosen = chosen === optionIndex;
                          const isAnswer = checked && optionIndex === question.answer;
                          const isWrong = checked && isChosen && !isAnswer;
                          return (
                            <label
                              key={option}
                              className={[
                                "flex cursor-pointer items-start gap-2 border p-2 text-sm transition-colors",
                                isAnswer
                                  ? "border-[var(--accent-text)] text-[var(--accent-text)]"
                                  : isWrong
                                    ? "border-[#c0392b] text-[#8d2f22] dark:text-[#ff9a8a]"
                                    : isChosen
                                      ? "border-[var(--text)] text-[var(--text)]"
                                      : "border-[var(--border)] text-[var(--text-muted)]",
                              ].join(" ")}
                            >
                              <input
                                type="radio"
                                name={`question-${index}`}
                                className="mt-1 size-3.5 shrink-0 accent-[var(--ring)]"
                                checked={isChosen}
                                onChange={() => setAnswers((current) => ({ ...current, [index]: optionIndex }))}
                              />
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </ResultCard>
            {checked && score === quiz.length ? <Callout tone="success">All correct. Add harder facts to the bank, or raise the question count.</Callout> : null}
          </>
        ) : (
          <Callout tone="info">Add at least two facts to the bank — one is needed as the answer and another as a distractor.</Callout>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--text-subtle)]">
        Distractors are drawn from the other answers in your own bank, so the quiz tests discrimination between the facts
        you actually gave it. The shuffle is seeded, which means reloading with the same seed reproduces the same quiz —
        useful when you want to hand the same version to a class.
      </p>
    </ToolPanel>
  );
}
