import { Basket } from "../models/basket";

const USD_FORMATTER = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

const INR_TO_USD_RATE = 0.012;
const RECENTLY_VIEWED_KEY = "recently_viewed_products";

export function getBasketFromLocalStorage():Basket | null{
    const storedBasket = localStorage.getItem('basket');
    if (storedBasket){
        try{
            const parsedBasket: Basket = JSON.parse(storedBasket);
            return parsedBasket;
        }
        catch(error){
            console.error('Error Parsing basket from local storage: ', error);
            return null;
        }
    }
    return null;
}

export function formatCurrency(amount: number): string {
    return USD_FORMATTER.format(amount * INR_TO_USD_RATE);
}

export function extractImageName(item: { pictureUrl?: string | null }): string | null {
    if (item?.pictureUrl) {
        const parts = item.pictureUrl.split('/');
        if (parts.length > 0) {
            return parts[parts.length - 1];
        }
    }

    return null;
}

export function buildProductImagePath(item: { pictureUrl?: string | null }): string {
    return `/images/products/${extractImageName(item) ?? "babolat.png"}`;
}

export function recordRecentlyViewedProduct(productId: number) {
    const currentIds = getRecentlyViewedProductIds().filter(id => id !== productId);
    const updatedIds = [productId, ...currentIds].slice(0, 6);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updatedIds));
}

export function getRecentlyViewedProductIds(): number[] {
    const storedIds = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!storedIds) {
        return [];
    }

    try {
        const parsedIds = JSON.parse(storedIds) as number[];
        return Array.isArray(parsedIds)
            ? parsedIds.filter((id): id is number => typeof id === "number")
            : [];
    } catch (error) {
        console.error("Error parsing recently viewed product ids:", error);
        return [];
    }
}
