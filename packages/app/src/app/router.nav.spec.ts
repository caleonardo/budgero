import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as registry from '@shared/model/nav-registry';

const router = readFileSync(resolve(__dirname, 'router.tsx'), 'utf8');
const navItems = Object.values(registry)
  .filter(Array.isArray)
  .flat()
  .filter((item): item is registry.NavRouteItem => typeof item?.to === 'string');

describe('nav registry routes', () => {
  it.each(navItems.filter((item) => !item.devOnly).map((item) => item.to))(
    '%s has a route that also exists in production builds',
    (to) => {
      const route = router.split('\n').find((line) => line.includes(`path="${to}"`));
      expect(route, `no <Route path="${to}"> in router.tsx`).toBeDefined();
      expect(route).not.toContain('import.meta.env.DEV');
    }
  );
});
