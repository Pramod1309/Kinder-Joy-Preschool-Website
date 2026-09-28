import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const enquiries=sqliteTable('enquiries',{
 id:text('id').primaryKey(),name:text('name').notNull(),email:text('email').notNull(),phone:text('phone').notNull(),program:text('program').notNull(),visitDate:text('visit_date'),message:text('message').notNull().default(''),status:text('status').notNull().default('new'),consent:integer('consent').notNull(),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull()
},table=>[index('idx_enquiries_created_at').on(table.createdAt),index('idx_enquiries_email_created_at').on(table.email,table.createdAt)]);
