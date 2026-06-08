export type KnowledgeSeed = {
  id: string;
  title: string;
  category: string;
  content: string;
};

export const knowledgeSeeds: KnowledgeSeed[] = [
  {
    id: "shipping-india",
    title: "Domestic shipping policy",
    category: "shipping",
    content:
      "AuroraMart ships across India. Standard delivery takes 3 to 6 business days. Orders above INR 999 qualify for free standard shipping. Orders below INR 999 have a flat INR 79 shipping fee."
  },
  {
    id: "shipping-international",
    title: "International shipping policy",
    category: "shipping",
    content:
      "AuroraMart currently ships internationally to the USA, UK, Canada, UAE, Singapore, and Australia. International delivery usually takes 7 to 14 business days. Customs duties or import taxes are paid by the customer."
  },
  {
    id: "returns",
    title: "Return policy",
    category: "returns",
    content:
      "Customers can return unused products within 14 days of delivery. Products must be in original packaging with tags and invoice. Personalized items, opened skincare, and damaged-by-customer products are not eligible for return."
  },
  {
    id: "refunds",
    title: "Refund policy",
    category: "refunds",
    content:
      "Refunds are initiated after the returned item passes quality inspection. Approved refunds are processed to the original payment method within 5 to 7 business days. Cash-on-delivery orders are refunded through bank transfer or store credit."
  },
  {
    id: "support-hours",
    title: "Customer support hours",
    category: "support",
    content:
      "AuroraMart customer support is available Monday to Saturday, 10 AM to 7 PM IST. Support is closed on Sundays and major public holidays. Customers can email support@auroramart.example for complex issues."
  },
  {
    id: "order-tracking",
    title: "Order tracking",
    category: "orders",
    content:
      "Customers receive a tracking link by email and SMS after the order is shipped. Tracking information can take up to 24 hours to update after dispatch. If a tracking link has not arrived within 48 hours, the customer should contact support."
  },
  {
    id: "payments",
    title: "Payment methods",
    category: "payments",
    content:
      "AuroraMart accepts UPI, credit cards, debit cards, net banking, wallets, and cash on delivery for eligible Indian pin codes. International orders must be prepaid by card."
  }
];

