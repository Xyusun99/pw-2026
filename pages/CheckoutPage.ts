import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {

    readonly page: Page;

    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly postalCodeInput: Locator;

    readonly continueButton: Locator;
    readonly finishButton: Locator;

    readonly completeMessage: Locator;

    constructor(page: Page) {

        this.page = page;

        this.firstNameInput = page.locator('[data-test="firstName"]');
        this.lastNameInput = page.locator('[data-test="lastName"]');
        this.postalCodeInput = page.locator('[data-test="postalCode"]');

        this.continueButton = page.locator('[data-test="continue"]');

        this.finishButton = page.locator('[data-test="finish"]');

        this.completeMessage = page.locator('.complete-header');
    }


    async fillInformation(
        firstName: string,
        lastName: string,
        postalCode: string
    ) {

        await this.firstNameInput.fill(firstName);

        await this.lastNameInput.fill(lastName);

        await this.postalCodeInput.fill(postalCode);

        await this.continueButton.click();
    }


    async finishPurchase() {

        await this.finishButton.click();
    }


    async expectPurchaseComplete() {

        await expect(this.page).toHaveURL(/checkout-complete/);

        await expect(this.completeMessage).toContainText(
            'Thank you for your order'
        );
    }
}