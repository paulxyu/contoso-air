import { test, expect, Page } from '@playwright/test';

// Helper to select a flight by flight number.
async function pickFlight(page: Page, flightNumber: string) {
  const btn = page.getByRole('button', { name: new RegExp(`^${flightNumber} `) }).first();
  await expect(btn).toBeVisible();
  await btn.click();
}

async function waitForPurchaseEnabled(page: Page) {
  const purchase = page.getByRole('button', { name: 'Purchase' });
  await expect(purchase).toBeVisible();
  await expect(purchase).toBeEnabled();
  return purchase;
}

test.describe('End-to-end booking flow', () => {
  test('user can login and book two trips', async ({ page }) => {
    await page.goto('/');

    // Go to login
    await page.getByRole('link', { name: 'Login' }).click();

    // Fill credentials (auth provider accepts anything currently)
    await page.getByLabel('Username').fill('User');
    await page.getByLabel('Password').fill('123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Wait for greeting (ensures auth context updated)
    await expect(page.getByRole('button', { name: /Hi, / })).toBeVisible();

    // After login redirect start booking
    await page.goto('/book');

    // First trip LAX -> HNL
    await page.getByLabel('From').selectOption('LAX');
    await page.getByLabel('To', { exact: true }).selectOption('HNL');
    await page.getByLabel('Depart date').fill('2025-09-09');
    await page.getByLabel('Return date').fill('2025-09-26');
    await page.getByRole('button', { name: 'Find flights' }).click();
    // Wait for flights to render
    await expect(page.getByRole('button', { name: /^CA123 / })).toBeVisible();

    // Pick outbound (CA123) and return (CA789)
    await pickFlight(page, 'CA123');
    await pickFlight(page, 'CA789');
    await page.getByRole('button', { name: 'Continue' }).click();
    const purchase1 = await waitForPurchaseEnabled(page);
    await purchase1.click();

    // Ensure booking is confirmed
    await expect(page.getByText('Booking confirmed')).toBeVisible();

    // Go to booked list
    await page.getByRole('link', { name: 'My Booked' }).click();

    // Back home via brand link
    await page.getByRole('link', { name: 'Contoso Air Home' }).click();

    // Second trip LAX -> CDG (these labels differ slightly on landing hero component)
    // Hero uses aria-label Departure date / Return date
    await page.getByLabel('From').selectOption('LAX');
    await page.getByLabel('To', { exact: true }).selectOption('CDG');
    await page.getByLabel('Departure date').fill('2025-09-30');
    await page.getByLabel('Return date').fill('2025-10-10');
    await page.getByRole('button', { name: 'Search Flights' }).click();
    await expect(page.getByRole('button', { name: /^CA202 / })).toBeVisible();

    await pickFlight(page, 'CA202');
    await pickFlight(page, 'CA101');
    await page.getByRole('button', { name: 'Continue' }).click();
    const purchase2 = await waitForPurchaseEnabled(page);
    await purchase2.click();

    await page.getByRole('link', { name: 'My Booked' }).click();

    // Assert greeting shows user (desktop navbar)
    await expect(page.getByRole('button', { name: /Hi, User|Hi, Traveler/ })).toBeVisible();
  });
});
