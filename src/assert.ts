import { either as E, option as O, taskEither as TE } from 'fp-ts';
import type { Either } from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import type { Option } from 'fp-ts/Option';
import type { Task } from 'fp-ts/Task';
import type { TaskEither } from 'fp-ts/TaskEither';

import type { Assert } from './type';

export const equal =
  <T>(expected: T) =>
  (actual: T): Assert.Equal => ({ assert: 'Equal', expected, actual });

export const equalW =
  (expected: unknown) =>
  (actual: unknown): Assert.Equal => ({ assert: 'Equal', expected, actual });

export const equalOption =
  <T>(expected: Option<T>) =>
  (actual: Option<T>): Assert.Equal => ({ assert: 'Equal', expected, actual });

export const equalEither =
  <L, R>(expected: Either<L, R>) =>
  (actual: Either<L, R>): Assert.Equal => ({ assert: 'Equal', expected, actual });

export const equalArray =
  <T>(expected: readonly T[]) =>
  (actual: readonly T[]): Assert.Equal => ({ assert: 'Equal', expected, actual });

export const numberArraySortedAsc = (actual: readonly number[]): Assert.NumberArraySortedAsc => ({
  assert: 'NumberArraySortedAsc',
  actual,
});

const unexpectedLeft = (left: unknown): Assert.UnexpectedLeft => ({
  assert: 'UnexpectedLeft',
  value: left,
});

const unexpectedRight = (left: unknown): Assert.UnexpectedLeft => ({
  assert: 'UnexpectedLeft',
  value: left,
});

const unexpectedNone: Assert.UnexpectedNone = { assert: 'UnexpectedNone' };

export const option =
  <A>(toAssert: (r: A) => Assert.Type) =>
  (e: Option<A>): Assert.Type =>
    pipe(
      e,
      O.match(() => unexpectedNone, toAssert)
    );

export const either =
  <L, R>(toAssert: (r: R) => Assert.Type) =>
  (e: Either<L, R>): Assert.Type =>
    pipe(e, E.match(unexpectedLeft, toAssert));

export const eitherLeft =
  <L, R>(toAssert: (r: L) => Assert.Type) =>
  (e: Either<L, R>): Assert.Type =>
    pipe(e, E.swap, E.match(unexpectedRight, toAssert));

export const taskEither =
  <L, R>(toAssert: (r: R) => Assert.Type) =>
  (e: TaskEither<L, R>): Task<Assert.Type> =>
    pipe(e, TE.match(unexpectedLeft, toAssert));

export const taskEitherLeft =
  <L, R>(toAssert: (l: L) => Assert.Type) =>
  (e: TaskEither<L, R>): Task<Assert.Type> =>
    pipe(e, TE.swap, TE.match(unexpectedRight, toAssert));
