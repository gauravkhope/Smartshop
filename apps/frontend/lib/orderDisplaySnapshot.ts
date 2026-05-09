export type OrderDisplaySnapshotItem = {
  orderProductId?: number;
  sourceProductId?: number;
  name?: string;
  brand?: string;
  image?: string;
  quantity?: number;
  price?: number;
};

const ORDER_DISPLAY_PREFIX = "order_display_";

const toNumberOrUndefined = (value: unknown): number | undefined => {
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const normalizeText = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const normalizeSnapshotItems = (value: unknown): OrderDisplaySnapshotItem[] => {
  if (!Array.isArray(value)) return [];

  return value.map((item) => ({
    orderProductId: toNumberOrUndefined((item as any)?.orderProductId),
    sourceProductId: toNumberOrUndefined((item as any)?.sourceProductId),
    name: typeof (item as any)?.name === "string" ? (item as any).name : undefined,
    brand: typeof (item as any)?.brand === "string" ? (item as any).brand : undefined,
    image: typeof (item as any)?.image === "string" ? (item as any).image : undefined,
    quantity: toNumberOrUndefined((item as any)?.quantity),
    price: toNumberOrUndefined((item as any)?.price),
  }));
};

export const saveOrderDisplaySnapshot = (
  orderId: number,
  items: OrderDisplaySnapshotItem[]
): void => {
  if (typeof window === "undefined") return;

  const key = `${ORDER_DISPLAY_PREFIX}${orderId}`;
  const payload = JSON.stringify(items);

  localStorage.setItem(key, payload);
  sessionStorage.setItem(key, payload);
};

export const readOrderDisplaySnapshot = (orderId: number): OrderDisplaySnapshotItem[] => {
  if (typeof window === "undefined") return [];

  const key = `${ORDER_DISPLAY_PREFIX}${orderId}`;
  const localRaw = localStorage.getItem(key);
  if (localRaw) {
    try {
      return normalizeSnapshotItems(JSON.parse(localRaw));
    } catch {
      // Fall through to session storage fallback.
    }
  }

  const sessionRaw = sessionStorage.getItem(key);
  if (!sessionRaw) return [];

  try {
    const parsed = normalizeSnapshotItems(JSON.parse(sessionRaw));
    if (parsed.length > 0) {
      localStorage.setItem(key, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return [];
  }
};

export const matchDisplaySnapshotItem = (
  items: OrderDisplaySnapshotItem[],
  orderItem: {
    productId: number;
    price?: number;
    quantity?: number;
    product?: { name?: string };
  },
  usedIndexes?: Set<number>
): OrderDisplaySnapshotItem | undefined => {
  if (!Array.isArray(items) || items.length === 0) return undefined;

  const isUnused = (index: number) => !usedIndexes || !usedIndexes.has(index);
  const markUsed = (index: number, item: OrderDisplaySnapshotItem) => {
    if (usedIndexes) usedIndexes.add(index);
    return item;
  };

  const productId = Number(orderItem.productId);

  for (let i = 0; i < items.length; i += 1) {
    if (!isUnused(i)) continue;
    if (Number(items[i]?.orderProductId) === productId) {
      return markUsed(i, items[i]);
    }
  }

  for (let i = 0; i < items.length; i += 1) {
    if (!isUnused(i)) continue;
    if (Number(items[i]?.sourceProductId) === productId) {
      return markUsed(i, items[i]);
    }
  }

  const targetName = normalizeText(orderItem.product?.name);
  const targetPrice = toNumberOrUndefined(orderItem.price);
  const targetQty = toNumberOrUndefined(orderItem.quantity);

  for (let i = 0; i < items.length; i += 1) {
    if (!isUnused(i)) continue;
    const candidateName = normalizeText(items[i]?.name);
    if (!targetName || !candidateName || candidateName !== targetName) continue;

    const candidatePrice = toNumberOrUndefined(items[i]?.price);
    const candidateQty = toNumberOrUndefined(items[i]?.quantity);

    const samePrice =
      targetPrice === undefined ||
      candidatePrice === undefined ||
      Math.abs(targetPrice - candidatePrice) < 0.01;
    const sameQty = targetQty === undefined || candidateQty === undefined || candidateQty === targetQty;

    if (samePrice && sameQty) {
      return markUsed(i, items[i]);
    }
  }

  for (let i = 0; i < items.length; i += 1) {
    if (!isUnused(i)) continue;
    if (items[i]?.image || items[i]?.name || items[i]?.brand) {
      return markUsed(i, items[i]);
    }
  }

  return undefined;
};
