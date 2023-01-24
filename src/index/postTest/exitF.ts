import { either, task } from 'fp-ts';
import { flow } from 'fp-ts/function';
import type { IO } from 'fp-ts/IO';
import type { TaskEither } from 'fp-ts/TaskEither';

import type { SuiteResult, TestPassResult } from '../type';

export type Env = { readonly process: Pick<typeof process, 'exit'> };

export const exitF = (env: {
  readonly process: { readonly exit: (exitCode: number | undefined) => IO<void> };
}): ((
  res: TaskEither<SuiteResult.Left, readonly TestPassResult[]>
) => TaskEither<SuiteResult.Left, readonly TestPassResult[]>) =>
  task.chainFirstIOK(
    flow(
      either.match(
        () => 1,
        () => 0
      ),
      env.process.exit
    )
  );
