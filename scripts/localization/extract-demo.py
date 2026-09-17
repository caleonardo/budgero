#!/usr/bin/env python3
"""Create a fresh SQLite fixture containing only the supplied Demo budget.

Never publish an original backup: other budgets, history and credentials may
share the same file. A fresh database avoids remnants in unused SQLite pages.
"""
import argparse
import sqlite3
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', type=Path)
parser.add_argument('output', type=Path)
parser.add_argument('--space-id', required=True, help='The disposable capture workspace ID')
args = parser.parse_args()
if args.output.exists():
    raise SystemExit('Output already exists; choose a new path.')
source = sqlite3.connect(args.source.resolve().as_uri() + '?mode=ro', uri=True)
if source.execute("SELECT ID FROM budgets WHERE Name = 'Demo'").fetchall() != [(37,)]:
    raise SystemExit('Expected the year-long Demo fixture (budget 37).')
target = sqlite3.connect(args.output)
try:
    schema = source.execute("""
        SELECT sql FROM sqlite_master
        WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%'
        ORDER BY CASE type WHEN 'table' THEN 0 ELSE 1 END
    """).fetchall()
    for (sql,) in schema:
        target.execute(sql)
    conditions = {
        'schema_migrations': '1',
        'budgets': 'ID = 37',
        **{table: 'BudgetID = 37' for table in [
            'category_groups', 'categories', 'accounts', 'transactions',
            'assignments', 'payees', 'labels', 'currency_rates',
        ]},
        'goals': 'CategoryID IN (SELECT ID FROM categories WHERE BudgetID = 37)',
    }
    for table in ['transaction_splits', 'account_revaluations']:
        columns = [row[1] for row in source.execute(f'PRAGMA table_info("{table}")')]
        key = next((key for key in ['TransactionID', 'ParentTransactionID', 'AccountID'] if key in columns), None)
        if key:
            parent = 'accounts' if key == 'AccountID' else 'transactions'
            conditions[table] = f'{key} IN (SELECT ID FROM {parent} WHERE BudgetID = 37)'
    for table, where in conditions.items():
        # Explicit columns exclude SQLite generated columns such as Month.
        columns = ','.join(f'"{row[1]}"' for row in source.execute(f'PRAGMA table_info("{table}")'))
        rows = source.execute(f'SELECT {columns} FROM "{table}" WHERE {where}').fetchall()
        if rows:
            placeholders = ','.join('?' for _ in rows[0])
            target.executemany(f'INSERT INTO "{table}" ({columns}) VALUES ({placeholders})', rows)
    target.execute('UPDATE budgets SET SpaceID = ?', (args.space_id,))
    if target.execute('PRAGMA foreign_key_check').fetchall():
        raise RuntimeError('Demo fixture has unresolved references.')
    target.commit()
    target.execute('VACUUM')
finally:
    target.close()
    source.close()
args.output.chmod(0o600)
print(f'Created Demo-only fixture: {args.output}')
