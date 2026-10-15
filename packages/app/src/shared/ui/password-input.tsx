import * as React from 'react';
import { useLingui } from '@lingui/react/macro';
import { Eye, EyeOff } from 'lucide-react';

import { cn } from '@shared/lib/utils';
import { Input } from '@shared/ui/input';

/** Password input with an eye button that shows or hides what was typed. */
const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<'input'>, 'type'>
>(({ className, disabled, ...props }, ref) => {
  const { t } = useLingui();
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        disabled={disabled}
        className={cn('pr-10', className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        aria-label={visible ? t`Hide password` : t`Show password`}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
