import { test, expect } from '@playwright/test';

test.describe('Welcome Page', () => {
  test('should display the hero section and login button', async ({ page }) => {
    await page.goto('/');

    // Check heading
    const heading = page.locator('h1', { hasText: 'Bem-vindo ao Sistema de Cursos' });
    await expect(heading).toBeVisible();

    // Check descriptive text
    await expect(page.locator('p', { hasText: 'Assista cursos, acesse canais exclusivos e gerencie seu aprendizado.' })).toBeVisible();

    // Check login button
    const loginButton = page.getByRole('button', { name: 'Fazer Login' });
    await expect(loginButton).toBeVisible();

    // We can test if clicking the login button redirects to /login/google
    // Wait for the navigation to happen
    const [request] = await Promise.all([
      page.waitForRequest(req => req.url().includes('/login/google')),
      loginButton.click()
    ]);
    
    expect(request.url()).toContain('/login/google');
  });
});
