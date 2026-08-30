/**
 * "YNAB" tab of CreateBudgetForm: import a YNAB ZIP export as a new budget.
 */

import type { ChangeEvent, RefObject } from 'react';
import type { YNABImportPreview } from '@budgero/core/browser';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Label } from '@shared/ui/label';
import { Field } from '@shared/ui/field';
import { AlertTriangle, Loader2, Upload } from 'lucide-react';
import { CurrencySelector } from '@features/currencies/ui/CurrencySelector';
import { IconPicker } from '@features/budget-management/ui/IconPicker';
import { FormatSelector } from '@features/budget-management/ui/FormatSelector';
import { YnabExportGuide } from './YnabExportGuide';

interface YnabImportTabProps {
  budgetName: string;
  onBudgetNameChange: (value: string) => void;
  currency: string;
  onCurrencyChange: (value: string) => void;
  numberFormat: string;
  onNumberFormatChange: (value: string) => void;
  importBadgeIcon: string;
  onImportBadgeIconChange: (value: string) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  file: File | null;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  preview: YNABImportPreview | null;
  isInspecting: boolean;
  isImporting: boolean;
  onReset: () => void;
  onImport: () => void;
}

export function YnabImportTab({
  budgetName,
  onBudgetNameChange,
  currency,
  onCurrencyChange,
  numberFormat,
  onNumberFormatChange,
  importBadgeIcon,
  onImportBadgeIconChange,
  fileInputRef,
  file,
  onFileChange,
  preview,
  isInspecting,
  isImporting,
  onReset,
  onImport,
}: YnabImportTabProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <Field label={<span className="text-xs sm:text-sm">Budget Name</span>} htmlFor="importName">
        <Input
          id="importName"
          value={budgetName}
          onChange={(e) => onBudgetNameChange(e.target.value)}
          placeholder="Enter a name for your imported budget"
          disabled={isImporting}
          className="h-8 sm:h-9"
        />
      </Field>

      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-1.5">
          <CurrencySelector value={currency} onValueChange={onCurrencyChange} label="Currency" />
          <p className="text-xs text-muted-foreground">
            The currency shown on amounts. This is for display only and can be changed anytime.
          </p>
        </div>

        <div className="space-y-1.5">
          <FormatSelector
            value={numberFormat}
            currency={currency}
            onValueChange={onNumberFormatChange}
            label="Number Format"
          />
          <p className="text-xs text-muted-foreground">
            How numbers and decimals are displayed throughout the app.
          </p>
        </div>

        <div className="space-y-1.5">
          <IconPicker
            value={importBadgeIcon}
            onValueChange={onImportBadgeIconChange}
            label="Budget Icon"
          />
          <p className="text-xs text-muted-foreground">
            A small icon shown next to your budget name. Handy when you have multiple budgets.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="importFile" className="text-xs sm:text-sm">
          YNAB Export File (ZIP)
        </Label>
        {/* Native file input is visually hidden and driven by the button
            below so we can show an Upload icon and the chosen filename. */}
        <Input
          id="importFile"
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={onFileChange}
          disabled={isImporting || isInspecting}
          className="sr-only"
        />
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isImporting || isInspecting}
            onClick={() => fileInputRef.current?.click()}
            className="h-8 sm:h-9 shrink-0 text-xs sm:text-sm"
          >
            <Upload className="h-4 w-4" />
            Choose file
          </Button>
          <span className="min-w-0 break-words text-xs sm:text-sm text-muted-foreground">
            {file ? file.name : 'No file chosen'}
          </span>
        </div>
        {isInspecting && (
          <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Inspecting accounts, categories, and split transactions…
          </div>
        )}
        {preview && (
          <div className="space-y-3 rounded-md border bg-muted/20 p-3 text-xs">
            <p className="font-medium text-foreground">Detected in this export</p>
            <p className="text-muted-foreground">
              {preview.accountCount.toLocaleString()}{' '}
              {preview.accountCount === 1 ? 'account' : 'accounts'} ·{' '}
              {preview.categoryCount.toLocaleString()}{' '}
              {preview.categoryCount === 1 ? 'category' : 'categories'} ·{' '}
              {preview.registerRowCount.toLocaleString()} register{' '}
              {preview.registerRowCount === 1 ? 'row' : 'rows'}
            </p>

            <div className="flex items-start gap-2 rounded-md border border-amber-300/70 bg-amber-50 p-2.5 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div>
                <p className="font-medium">Review account types after import</p>
                <p className="mt-0.5 text-[11px] opacity-90">
                  YNAB does not reliably export account types. Budgero recognizes credit cards where
                  possible and imports other accounts as Checking, so verify every account before
                  budgeting.
                </p>
              </div>
            </div>

            {preview.missingCategories.length > 0 && (
              <div className="rounded-md border border-amber-300/70 bg-amber-50 p-2.5 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100">
                <p className="font-medium">
                  {preview.missingCategories.length} register categor
                  {preview.missingCategories.length === 1 ? 'y is' : 'ies are'} missing from
                  Plan.csv
                </p>
                <p className="mt-1 text-[11px] opacity-90">
                  Budgero will create{' '}
                  {preview.missingCategories
                    .map((category) => `${category.categoryGroup} › ${category.category}`)
                    .join(', ')}
                  .
                </p>
              </div>
            )}

            {preview.splitTransactions.length > 0 && (
              <div className="rounded-md border p-2.5">
                <p className="font-medium text-foreground">
                  {preview.splitTransactions.length} split transaction
                  {preview.splitTransactions.length === 1 ? '' : 's'} detected
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Budgero will import complete Split (1/n)…Split (n/n) sequences as split
                  transactions automatically.
                </p>
              </div>
            )}
          </div>
        )}
        <YnabExportGuide />
      </div>

      <div className="pt-2">
        <div className="flex gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            disabled={isImporting || isInspecting}
            className="flex-1 h-8 sm:h-9"
          >
            Reset
          </Button>

          <Button
            type="button"
            onClick={onImport}
            disabled={!file || !budgetName.trim() || isImporting || isInspecting || !preview}
            className="flex-1 h-8 sm:h-9"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                <span className="text-xs sm:text-sm">Importing...</span>
              </>
            ) : (
              <>
                <Upload className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Import</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
