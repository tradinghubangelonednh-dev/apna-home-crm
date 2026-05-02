import { StatusCodes } from 'http-status-codes';

import { ApiError } from './apiError.js';

function toCents(value) {
  return Math.round(Number(value) * 100);
}

function fromCents(value) {
  return Number((value / 100).toFixed(2));
}

export function buildExpenseSplits({
  amount,
  participants,
  splitType,
  exactSplits = [],
  percentageSplits = []
}) {
  const totalCents = toCents(amount);
  const participantIds = participants.map((participant) => participant.toString());

  if (!participantIds.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'At least one participant is required');
  }

  if (splitType === 'equal') {
    const baseShare = Math.floor(totalCents / participantIds.length);
    const remainder = totalCents - baseShare * participantIds.length;

    return participantIds.map((userId, index) => ({
      user: userId,
      amount: fromCents(baseShare + (index < remainder ? 1 : 0))
    }));
  }

  if (splitType === 'exact') {
    const exactMap = new Map(exactSplits.map((split) => [split.user.toString(), toCents(split.value)]));
    const sum = [...exactMap.values()].reduce((accumulator, current) => accumulator + current, 0);

    if (sum !== totalCents) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Exact split values must add up to the total expense amount'
      );
    }

    return participantIds.map((userId) => {
      if (!exactMap.has(userId)) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Each participant must have an exact amount for exact splits'
        );
      }

      return {
        user: userId,
        amount: fromCents(exactMap.get(userId))
      };
    });
  }

  if (splitType === 'percentage') {
    const percentageMap = new Map(
      percentageSplits.map((split) => [split.user.toString(), Number(split.value)])
    );
    const percentageTotal = [...percentageMap.values()].reduce(
      (accumulator, current) => accumulator + current,
      0
    );

    if (Math.abs(percentageTotal - 100) > 0.001) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Percentage split values must total 100'
      );
    }

    const entries = participantIds.map((userId) => {
      if (!percentageMap.has(userId)) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          'Each participant must have a percentage for percentage splits'
        );
      }

      const percentage = percentageMap.get(userId);
      const rawCents = (totalCents * percentage) / 100;
      return {
        user: userId,
        percentage,
        flooredCents: Math.floor(rawCents),
        fractional: rawCents - Math.floor(rawCents)
      };
    });

    const flooredTotal = entries.reduce((accumulator, current) => accumulator + current.flooredCents, 0);
    let remainder = totalCents - flooredTotal;

    entries.sort((left, right) => right.fractional - left.fractional);

    const adjusted = entries.map((entry, index) => ({
      ...entry,
      cents: entry.flooredCents + (index < remainder ? 1 : 0)
    }));

    return adjusted
      .sort((left, right) => participantIds.indexOf(left.user) - participantIds.indexOf(right.user))
      .map((entry) => ({
        user: entry.user,
        percentage: entry.percentage,
        amount: fromCents(entry.cents)
      }));
  }

  throw new ApiError(StatusCodes.BAD_REQUEST, 'Unsupported split type');
}
