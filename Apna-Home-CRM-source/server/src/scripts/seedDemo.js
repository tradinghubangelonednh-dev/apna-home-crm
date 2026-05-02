import { connectDatabase } from '../config/db.js';
import { env } from '../config/env.js';
import { Household } from '../models/Household.js';
import { Notification } from '../models/Notification.js';
import { RecurringExpense } from '../models/RecurringExpense.js';
import { Settlement } from '../models/Settlement.js';
import { User } from '../models/User.js';
import { Expense } from '../models/Expense.js';
import { AuditLog } from '../models/AuditLog.js';
import { buildNextRecurringDate } from '../services/recurringService.js';
import { prepareExpensePayload } from '../services/expenseService.js';

async function seed() {
  await connectDatabase(env.mongodbUri);

  const existingUsers = await User.countDocuments();
  if (existingUsers > 0) {
    console.log('Database already has users. Skipping seed.');
    process.exit(0);
  }

  const household = await Household.create({
    name: 'Apna Home CRM Household',
    description: 'Demo household for five flatmates'
  });

  const memberData = [
    { name: 'Aarav Sharma', email: 'aarav@example.com', password: 'welcome123', role: 'admin', avatarColor: '#3d7b80' },
    { name: 'Diya Patel', email: 'diya@example.com', password: 'welcome123', role: 'member', avatarColor: '#97c8a8' },
    { name: 'Kabir Singh', email: 'kabir@example.com', password: 'welcome123', role: 'member', avatarColor: '#ea866f' },
    { name: 'Meera Nair', email: 'meera@example.com', password: 'welcome123', role: 'member', avatarColor: '#d9ae5f' },
    { name: 'Rohan Gupta', email: 'rohan@example.com', password: 'welcome123', role: 'member', avatarColor: '#5e7ce2' }
  ];

  const users = await User.create(
    memberData.map((member) => ({
      ...member,
      household: household._id
    }))
  );

  household.createdBy = users[0]._id;
  household.members = users.map((user) => user._id);
  await household.save();

  const expenseInputs = [
    {
      title: 'May rent',
      amount: 60000,
      paidBy: users[0]._id,
      participants: users.map((user) => user._id),
      splitType: 'equal',
      category: 'rent',
      date: new Date(),
      notes: 'Monthly apartment rent'
    },
    {
      title: 'Electricity bill',
      amount: 7250,
      paidBy: users[3]._id,
      participants: users.map((user) => user._id),
      splitType: 'equal',
      category: 'electricity',
      date: new Date(),
      notes: 'Power bill for the month'
    },
    {
      title: 'Weekly groceries',
      amount: 5480,
      paidBy: users[1]._id,
      participants: [users[0]._id, users[1]._id, users[2]._id, users[4]._id],
      splitType: 'exact',
      exactSplits: [
        { user: users[0]._id, value: 1400 },
        { user: users[1]._id, value: 1380 },
        { user: users[2]._id, value: 1500 },
        { user: users[4]._id, value: 1200 }
      ],
      category: 'food',
      date: new Date(),
      notes: 'Groceries and kitchen stock-up'
    }
  ];

  for (const payload of expenseInputs) {
    await Expense.create(
      prepareExpensePayload({
        household: {
          _id: household._id,
          members: household.members
        },
        actorId: users[0]._id,
        payload
      })
    );
  }

  await Settlement.create({
    household: household._id,
    fromUser: users[2]._id,
    toUser: users[0]._id,
    amount: 3000,
    status: 'pending',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    notes: 'Partial rent settlement',
    createdBy: users[0]._id
  });

  await RecurringExpense.create({
    household: household._id,
    title: 'Monthly rent',
    amount: 60000,
    paidBy: users[0]._id,
    participants: users.map((user) => user._id),
    splitType: 'equal',
    category: 'rent',
    notes: 'Auto-add rent on the 1st of each month',
    dayOfMonth: 1,
    nextRunAt: buildNextRecurringDate(1),
    createdBy: users[0]._id
  });

  await Notification.insertMany([
    {
      household: household._id,
      user: users[1]._id,
      type: 'expense',
      title: 'Weekly groceries added',
      message: 'Diya logged groceries and split the cost among four members.'
    },
    {
      household: household._id,
      user: users[2]._id,
      type: 'reminder',
      title: 'Rent settlement reminder',
      message: 'You still have a pending rent payment to complete.'
    }
  ]);

  await AuditLog.create({
    household: household._id,
    user: users[0]._id,
    entityType: 'household',
    entityId: household._id,
    action: 'create',
    after: {
      seeded: true
    }
  });

  console.log('Demo data created.');
  console.log('Admin login: aarav@example.com / welcome123');
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  });
