import {
  mysqlTable,
  char,
  varchar,
  datetime,
  mysqlEnum,
  decimal,
  tinyint,
  boolean,
  index,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { relations, sql } from 'drizzle-orm';

export const users = mysqlTable(
  'users',
  {
    id: char('id', { length: 36 }).primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    email: varchar('email', { length: 190 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    status: mysqlEnum('status', ['active', 'inactive'])
      .notNull()
      .default('active'),
    createdAt: datetime('created_at', { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updatedAt: datetime('updated_at', { fsp: 3 }).notNull(),
    deletedAt: datetime('deleted_at', { fsp: 3 }),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_key').on(table.email),
  }),
);

export const categories = mysqlTable(
  'categories',
  {
    id: char('id', { length: 36 }).primaryKey(),
    userId: char('user_id', { length: 36 }),
    type: mysqlEnum('type', ['income', 'expense']).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    icon: varchar('icon', { length: 50 }),
    color: varchar('color', { length: 20 }),
    sortOrder: decimal('sort_order', { precision: 10, scale: 0 })
      .notNull()
      .default('0'),
    isActive: boolean('is_active').notNull().default(true),
    isSystem: boolean('is_system').notNull().default(false),
    createdAt: datetime('created_at', { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updatedAt: datetime('updated_at', { fsp: 3 }).notNull(),
    deletedAt: datetime('deleted_at', { fsp: 3 }),
  },
  (table) => ({
    userIdIdx: index('idx_categories_user_id').on(table.userId),
    typeIdx: index('idx_categories_type').on(table.type),
  }),
);

export const couples = mysqlTable(
  'couples',
  {
    id: char('id', { length: 36 }).primaryKey(),
    createdBy: char('created_by', { length: 36 }).notNull(),
    name: varchar('name', { length: 120 }),
    status: mysqlEnum('status', ['active', 'inactive'])
      .notNull()
      .default('active'),
    createdAt: datetime('created_at', { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updatedAt: datetime('updated_at', { fsp: 3 }).notNull(),
  },
  (table) => ({
    createdByIdx: index('idx_couples_created_by').on(table.createdBy),
  }),
);

export const coupleMembers = mysqlTable(
  'couple_members',
  {
    id: char('id', { length: 36 }).primaryKey(),
    coupleId: char('couple_id', { length: 36 }).notNull(),
    userId: char('user_id', { length: 36 }).notNull(),
    role: mysqlEnum('role', ['owner', 'member']).notNull().default('member'),
    joinedAt: datetime('joined_at', { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (table) => ({
    userIdIdx: index('idx_couple_members_user_id').on(table.userId),
    coupleUserUnique: uniqueIndex('couple_members_couple_id_user_id_key').on(
      table.coupleId,
      table.userId,
    ),
  }),
);

export const movements = mysqlTable(
  'movements',
  {
    id: char('id', { length: 36 }).primaryKey(),
    userId: char('user_id', { length: 36 }).notNull(),
    coupleId: char('couple_id', { length: 36 }),
    categoryId: char('category_id', { length: 36 }).notNull(),
    type: mysqlEnum('type', ['income', 'expense']).notNull(),
    amount: decimal('amount', { precision: 19, scale: 4 }).notNull(),
    description: varchar('description', { length: 255 }),
    movementDate: datetime('movement_date', { fsp: 3 }).notNull(),
    createdAt: datetime('created_at', { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updatedAt: datetime('updated_at', { fsp: 3 }).notNull(),
    deletedAt: datetime('deleted_at', { fsp: 3 }),
  },
  (table) => ({
    userIdIdx: index('idx_movements_user_id').on(table.userId),
    coupleIdIdx: index('idx_movements_couple_id').on(table.coupleId),
    categoryIdIdx: index('idx_movements_category_id').on(table.categoryId),
    typeDateIdx: index('idx_movements_type_date').on(
      table.type,
      table.movementDate,
    ),
  }),
);

export const debts = mysqlTable(
  'debts',
  {
    id: char('id', { length: 36 }).primaryKey(),
    userId: char('user_id', { length: 36 }).notNull(),
    coupleId: char('couple_id', { length: 36 }),
    title: varchar('title', { length: 150 }).notNull(),
    description: varchar('description', { length: 255 }),
    initialAmount: decimal('initial_amount', {
      precision: 19,
      scale: 4,
    }).notNull(),
    currentAmount: decimal('current_amount', {
      precision: 19,
      scale: 4,
    }).notNull(),
    interestRate: decimal('interest_rate', { precision: 10, scale: 4 })
      .notNull()
      .default('0'),
    minimumPayment: decimal('minimum_payment', { precision: 19, scale: 4 })
      .notNull()
      .default('0'),
    dueDay: tinyint('due_day'),
    priority: mysqlEnum('priority', ['low', 'medium', 'high'])
      .notNull()
      .default('medium'),
    status: mysqlEnum('status', ['pending', 'paid', 'overdue'])
      .notNull()
      .default('pending'),
    startDate: datetime('start_date', { fsp: 3 }),
    endDate: datetime('end_date', { fsp: 3 }),
    createdAt: datetime('created_at', { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updatedAt: datetime('updated_at', { fsp: 3 }).notNull(),
    deletedAt: datetime('deleted_at', { fsp: 3 }),
  },
  (table) => ({
    userIdIdx: index('idx_debts_user_id').on(table.userId),
    coupleIdIdx: index('idx_debts_couple_id').on(table.coupleId),
    statusIdx: index('idx_debts_status').on(table.status),
  }),
);

export const debtPayments = mysqlTable(
  'debt_payments',
  {
    id: char('id', { length: 36 }).primaryKey(),
    debtId: char('debt_id', { length: 36 }).notNull(),
    userId: char('user_id', { length: 36 }).notNull(),
    amount: decimal('amount', { precision: 19, scale: 4 }).notNull(),
    paymentDate: datetime('payment_date', { fsp: 3 }).notNull(),
    notes: varchar('notes', { length: 255 }),
    createdAt: datetime('created_at', { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (table) => ({
    debtIdIdx: index('idx_debt_payments_debt_id').on(table.debtId),
    userIdIdx: index('idx_debt_payments_user_id').on(table.userId),
  }),
);

export const coupleInvitations = mysqlTable(
  'couple_invitations',
  {
    id: char('id', { length: 36 }).primaryKey(),
    coupleId: char('couple_id', { length: 36 }).notNull(),
    invitedEmail: varchar('invited_email', { length: 190 }).notNull(),
    status: mysqlEnum('status', ['pending', 'accepted', 'declined', 'expired'])
      .notNull()
      .default('pending'),
    expiresAt: datetime('expires_at', { fsp: 3 }).notNull(),
    createdAt: datetime('created_at', { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updatedAt: datetime('updated_at', { fsp: 3 }).notNull(),
  },
  (table) => ({
    coupleIdIdx: index('idx_invitations_couple_id').on(table.coupleId),
  }),
);

export const refreshTokens = mysqlTable(
  'refresh_tokens',
  {
    id: char('id', { length: 36 }).primaryKey(),
    userId: char('user_id', { length: 36 }).notNull(),
    expiresAt: datetime('expires_at', { fsp: 3 }).notNull(),
    revoked: boolean('revoked').notNull().default(false),
    createdAt: datetime('created_at', { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updatedAt: datetime('updated_at', { fsp: 3 }).notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_refresh_tokens_user_id').on(table.userId),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  categories: many(categories),
  createdCouples: many(couples),
  coupleMembers: many(coupleMembers),
  movements: many(movements),
  debts: many(debts),
  debtPayments: many(debtPayments),
  goalContributions: many(goalContributions),
  refreshTokens: many(refreshTokens),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  movements: many(movements),
}));

export const coupleGoals = mysqlTable(
  'couple_goals',
  {
    id: char('id', { length: 36 }).primaryKey(),
    coupleId: char('couple_id', { length: 36 }).notNull(),
    title: varchar('title', { length: 150 }).notNull(),
    targetAmount: decimal('target_amount', {
      precision: 19,
      scale: 4,
    }).notNull(),
    currentAmount: decimal('current_amount', { precision: 19, scale: 4 })
      .notNull()
      .default('0'),
    deadline: datetime('deadline', { fsp: 3 }),
    status: mysqlEnum('status', ['active', 'completed', 'cancelled'])
      .notNull()
      .default('active'),
    createdBy: char('created_by', { length: 36 }).notNull(),
    createdAt: datetime('created_at', { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
    updatedAt: datetime('updated_at', { fsp: 3 }).notNull(),
    deletedAt: datetime('deleted_at', { fsp: 3 }),
  },
  (table) => ({
    coupleIdIdx: index('idx_couple_goals_couple_id').on(table.coupleId),
    statusIdx: index('idx_couple_goals_status').on(table.status),
    createdByIdx: index('idx_couple_goals_created_by').on(table.createdBy),
  }),
);

export const goalContributions = mysqlTable(
  'goal_contributions',
  {
    id: char('id', { length: 36 }).primaryKey(),
    goalId: char('goal_id', { length: 36 }).notNull(),
    userId: char('user_id', { length: 36 }).notNull(),
    amount: decimal('amount', { precision: 19, scale: 4 }).notNull(),
    notes: varchar('notes', { length: 255 }),
    date: datetime('date', { fsp: 3 }).notNull(),
    createdAt: datetime('created_at', { fsp: 3 })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP(3)`),
  },
  (table) => ({
    goalIdIdx: index('idx_goal_contributions_goal_id').on(table.goalId),
    userIdIdx: index('idx_goal_contributions_user_id').on(table.userId),
  }),
);

export const couplesRelations = relations(couples, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [couples.createdBy],
    references: [users.id],
  }),
  members: many(coupleMembers),
  invitations: many(coupleInvitations),
  movements: many(movements),
  debts: many(debts),
  goals: many(coupleGoals),
}));

export const coupleInvitationsRelations = relations(
  coupleInvitations,
  ({ one }) => ({
    couple: one(couples, {
      fields: [coupleInvitations.coupleId],
      references: [couples.id],
    }),
  }),
);

export const coupleMembersRelations = relations(coupleMembers, ({ one }) => ({
  couple: one(couples, {
    fields: [coupleMembers.coupleId],
    references: [couples.id],
  }),
  user: one(users, {
    fields: [coupleMembers.userId],
    references: [users.id],
  }),
}));

export const movementsRelations = relations(movements, ({ one }) => ({
  user: one(users, {
    fields: [movements.userId],
    references: [users.id],
  }),
  couple: one(couples, {
    fields: [movements.coupleId],
    references: [couples.id],
  }),
  category: one(categories, {
    fields: [movements.categoryId],
    references: [categories.id],
  }),
}));

export const debtsRelations = relations(debts, ({ one, many }) => ({
  user: one(users, {
    fields: [debts.userId],
    references: [users.id],
  }),
  couple: one(couples, {
    fields: [debts.coupleId],
    references: [couples.id],
  }),
  payments: many(debtPayments),
}));

export const debtPaymentsRelations = relations(debtPayments, ({ one }) => ({
  debt: one(debts, {
    fields: [debtPayments.debtId],
    references: [debts.id],
  }),
  user: one(users, {
    fields: [debtPayments.userId],
    references: [users.id],
  }),
}));

export const coupleGoalsRelations = relations(coupleGoals, ({ one, many }) => ({
  couple: one(couples, {
    fields: [coupleGoals.coupleId],
    references: [couples.id],
  }),
  createdBy: one(users, {
    fields: [coupleGoals.createdBy],
    references: [users.id],
  }),
  contributions: many(goalContributions),
}));

export const goalContributionsRelations = relations(
  goalContributions,
  ({ one }) => ({
    goal: one(coupleGoals, {
      fields: [goalContributions.goalId],
      references: [coupleGoals.id],
    }),
    user: one(users, {
      fields: [goalContributions.userId],
      references: [users.id],
    }),
  }),
);
