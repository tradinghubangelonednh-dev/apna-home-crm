function round(amount) {
  return Number(amount.toFixed(2));
}

function toId(value) {
  return value?.toString?.() || value;
}

export function calculateNetBalances({ members, expenses, settlements }) {
  const netByUser = new Map(members.map((member) => [toId(member._id || member.id), 0]));

  for (const expense of expenses) {
    const payerId = toId(expense.paidBy?._id || expense.paidBy);
    netByUser.set(payerId, round((netByUser.get(payerId) || 0) + Number(expense.amount)));

    for (const split of expense.splits) {
      const userId = toId(split.user?._id || split.user);
      netByUser.set(userId, round((netByUser.get(userId) || 0) - Number(split.amount)));
    }
  }

  for (const settlement of settlements.filter((entry) => entry.status === 'completed')) {
    const fromId = toId(settlement.fromUser?._id || settlement.fromUser);
    const toIdValue = toId(settlement.toUser?._id || settlement.toUser);

    netByUser.set(fromId, round((netByUser.get(fromId) || 0) + Number(settlement.amount)));
    netByUser.set(toIdValue, round((netByUser.get(toIdValue) || 0) - Number(settlement.amount)));
  }

  return members.map((member) => ({
    user: {
      id: toId(member._id || member.id),
      name: member.name,
      email: member.email,
      role: member.role,
      avatarColor: member.avatarColor
    },
    net: round(netByUser.get(toId(member._id || member.id)) || 0)
  }));
}

export function simplifyDebts(netBalances) {
  const creditors = netBalances
    .filter((entry) => entry.net > 0.009)
    .map((entry) => ({ ...entry }))
    .sort((left, right) => right.net - left.net);
  const debtors = netBalances
    .filter((entry) => entry.net < -0.009)
    .map((entry) => ({ ...entry, net: Math.abs(entry.net) }))
    .sort((left, right) => right.net - left.net);

  const transactions = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const amount = Number(Math.min(creditor.net, debtor.net).toFixed(2));

    transactions.push({
      from: debtor.user,
      to: creditor.user,
      amount
    });

    creditor.net = Number((creditor.net - amount).toFixed(2));
    debtor.net = Number((debtor.net - amount).toFixed(2));

    if (creditor.net < 0.01) {
      creditorIndex += 1;
    }

    if (debtor.net < 0.01) {
      debtorIndex += 1;
    }
  }

  return transactions;
}

export function sumAmounts(items, selector) {
  return Number(
    items.reduce((accumulator, item) => accumulator + Number(selector(item) || 0), 0).toFixed(2)
  );
}

export function groupExpensesByMonth(expenses) {
  const grouped = new Map();

  for (const expense of expenses) {
    const date = new Date(expense.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleString('en-US', {
      month: 'short',
      year: 'numeric'
    });

    const existing = grouped.get(key) || { label, amount: 0 };
    existing.amount = round(existing.amount + Number(expense.amount));
    grouped.set(key, existing);
  }

  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, value]) => value);
}
