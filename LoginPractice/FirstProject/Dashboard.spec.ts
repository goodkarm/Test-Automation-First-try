import { test, expect } from '@playwright/test';
import { LoginPage } from './login';
import { ScreenshotHelper } from './Screenshothelper';


test('Dashboard', async ({ page }, testInfo) => {

    const shot = new ScreenshotHelper(page, testInfo);
    const login = new LoginPage(page);

    await login.login('standard_user', 'secret_sauce');

    await test.step('Verify that user is directed to Swag Labs inventory page', async () => {
        await expect.soft(page).toHaveURL('https://www.saucedemo.com/inventory.html');
        await shot.capture('User directed to inventory page');
    });
    await test.step('Verify that the burger menu is displayed on the dashboard', async () => {
        await expect.soft(page.getByRole('button', { name: 'Open Menu' })).toBeVisible();
    });

    await test.step('Verify that the shopping cart is visible on the dashboard', async () => {
        await expect.soft(page.locator('[data-test="shopping-cart-link"]')).toBeVisible();
    });
    await test.step('Verify that the inventory page is displayed successfully.', async () => {
        await expect.soft(page.getByText('Products')).toBeVisible();
    });

    await test.step('Verify that the filter dropdown is visible on the dashboard', async () => {
        await expect.soft(page.locator('[data-test="product-sort-container"]')).toBeVisible();
        await expect.soft(page.locator('[data-test="product-sort-container"]')).toHaveText('Name (A to Z)Name (Z to A)Price (low to high)Price (high to low)');

    });
    await test.step('Verify that the products are displayed on the dashboard', async () => {
        await expect.soft(page.locator('[data-test="inventory-item-description"]').first()).toBeVisible();
        await expect.soft(page.locator('[data-test="inventory-item-description"]').nth(1)).toBeVisible();
        await expect.soft(page.locator('[data-test="inventory-item-description"]').nth(2)).toBeVisible();
        await expect.soft(page.locator('[data-test="inventory-item-description"]').nth(3)).toBeVisible();
        await expect.soft(page.locator('[data-test="inventory-item-description"]').nth(4)).toBeVisible();
        await expect.soft(page.locator('[data-test="inventory-item-description"]').nth(5)).toBeVisible();
    });
});


test('Add to Cart and Remove from Cart', async ({ page }, testInfo) => {

    var cartCount = 0;
    const login = new LoginPage(page);
    const shot = new ScreenshotHelper(page, testInfo);
    await login.login('standard_user', 'secret_sauce');

    await test.step('Verify that the products are displayed on the dashboard', async () => {
        await expect.soft(page.locator('[data-test="inventory-item-description"]').first()).toBeVisible();
        await expect.soft(page.locator('[data-test="inventory-item-description"]').nth(1)).toBeVisible();
        await expect.soft(page.locator('[data-test="inventory-item-description"]').nth(2)).toBeVisible();
        await expect.soft(page.locator('[data-test="inventory-item-description"]').nth(3)).toBeVisible();
        await expect.soft(page.locator('[data-test="inventory-item-description"]').nth(4)).toBeVisible();
        await expect.soft(page.locator('[data-test="inventory-item-description"]').nth(5)).toBeVisible();
    });

    await test.step('Add the first product to the cart', async () => {
        await page.locator('[data-test="inventory-item-description"]').nth(1).getByRole('button', { name: 'Add to Cart' }).click();
        cartCount++;
    });
    await test.step('Verify that User can add more than one product to the cart', async () => {
        await page.locator('[data-test="inventory-item-description"]').nth(2).getByRole('button', { name: 'Add to Cart' }).click();
        cartCount++;
        await shot.capture('Products added to cart with cart counter at ' + cartCount);
    });
    await test.step('Verify that the shopping cart badge shows the correct number of items added', async () => {
        await expect.soft(page.locator('.shopping_cart_badge')).toHaveText(cartCount.toString());
    }); 

    await test.step('Verify that items are correctly added to the cart', async () => {
        await page.locator('[data-test="shopping-cart-link"]').click();
        await expect.soft(page.locator('.cart_item')).toHaveCount(cartCount);
        await shot.capture('Cart page shows correct list of items added to cart');
    });

    await test.step('Verify that clicking the remove button removes the item from the cart', async () => {
        await page.locator('.cart_item').first().getByRole('button', { name: 'Remove' }).click();
        cartCount--;
        await shot.capture('Product removed from cart with cart counter at ' + cartCount);
    });
    await test.step('Verify that the shopping cart badge updates correctly after removing an item', async () => {
        await expect.soft(page.locator('.shopping_cart_badge')).toHaveText(cartCount.toString());
    });
    await test.step('Verify that the cart is empty after removing all items', async () => {
        await page.locator('.cart_item').last().getByRole('button', { name: 'Remove' }).click();
        cartCount--;
        await expect.soft(page.locator('.cart_item')).toHaveCount(0);
        await shot.capture('All products removed from cart with cart counter at ' + cartCount);
    });
    await test.step('Verify that removed items can be added back to the cart', async () => {
        await page.getByRole('button', { name: 'Continue Shopping' }).click();
        await shot.capture('Removed items can be added back to the cart');
    });
});

test('Checking burger menu and its options', async ({ page }, testInfo) => {

    const login = new LoginPage(page);
    const shot = new ScreenshotHelper(page, testInfo);
    await login.login('standard_user', 'secret_sauce');

    await test.step('Verify that the burger menu is displayed on the dashboard', async () => {
        await expect(page.getByRole('button', { name: 'Open Menu' })).toBeVisible();
    });
    await test.step('Verify that the burger menu can be opened and closed', async () => {
        await page.getByRole('button', { name: 'Open Menu' }).click();
        await expect(page.locator('.bm-menu-wrap')).toBeVisible();
        await shot.captureFullPage('Burger menu opened');
        await page.getByRole('button', { name: 'Close Menu' }).click();
        await expect(page.locator('.bm-menu-wrap')).not.toBeVisible();
        await shot.capture('Burger menu closed');
    });
    await test.step('Verify that the burger menu options are displayed correctly', async () => {
        await page.getByRole('button', { name: 'Open Menu' }).click();
        await expect(page.getByRole('link', { name: 'All Items' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
        await page.getByRole('link', { name: 'About' }).click();
        await expect(page).toHaveURL('https://saucelabs.com/');
        await page.goBack();
        await page.getByRole('button', { name: 'Open Menu' }).click();
        await expect.soft(page.getByRole('link', { name: 'Logout' })).toBeVisible();
        await expect.soft(page.getByRole('link', { name: 'Reset App State' })).toBeVisible();
        await page.getByRole('link', { name: 'Logout' }).click();
        await expect.soft(page).toHaveURL('https://www.saucedemo.com/');
        await shot.captureFullPage('Successful logout');
    });
});