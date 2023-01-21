import { either, readonlyArray, string, task } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import type { IO } from 'fp-ts/IO';
import type { Task } from 'fp-ts/Task';
import * as c from 'picocolors';
import { match } from 'ts-pattern';

import type { AssertionResult, SuiteResult, TestResult } from './type';

const skipped = (name: string) => `  ${c.dim(c.gray('↓'))} ${name}`;

const failed = (name: string) => `  ${c.red('×')} ${name}`;

const passed = (name: string) => `  ${c.green('✓')} ${name}`;

const assertionResultToStr = (assertionResult: AssertionResult): readonly string[] =>
  pipe(
    assertionResult,
    either.match(
      ({ name, error }) =>
        match(error)
          .with({ code: 'Skipped' }, () => [skipped(name)])
          .otherwise(() => [failed(name)]),
      ({ name }) => [passed(name)]
    )
  );

const testResultToStr = (testResult: TestResult): readonly string[] =>
  pipe(
    testResult,
    either.match(
      ({ name, error }) =>
        match(error)
          .with({ code: 'Skipped' }, () => [skipped(name)])
          .with({ code: 'MultipleAssertionError' }, ({ results }) =>
            pipe(
              results,
              readonlyArray.chain(assertionResultToStr),
              readonlyArray.map((x) => `  ${x}`),
              readonlyArray.prepend(failed(name))
            )
          )
          .otherwise(() => [failed(name)]),
      ({ name }) => [passed(name)]
    )
  );

export const logTestsNameAndResultsF = (env: {
  readonly console: { readonly log: (str: string) => IO<void> };
}): ((res: Task<SuiteResult>) => Task<SuiteResult>) =>
  task.chainFirstIOK(
    flow(
      either.match(
        (suiteError) => (suiteError.type === 'TestError' ? suiteError.results : []),
        readonlyArray.map(either.right)
      ),
      readonlyArray.chain(testResultToStr),
      readonlyArray.intercalate(string.Monoid)('\n'),
      env.console.log
    )
  );