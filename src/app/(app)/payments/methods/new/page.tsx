import { redirect } from "next/navigation";

export default function NewPaymentMethodLegacyPage() {
  redirect("/profile/payment-methods?action=add");
}
