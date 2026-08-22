const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full border-b border-oxblood/40 bg-oxblood px-4 py-2 text-center text-sm text-papyrus-light">
        Membership checkout is not configured for this build yet.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="label w-full border-b border-ink/25 bg-bronze/20 px-4 py-2 text-center text-ink">
        Payments in the preview are in test mode.{" "}
        <a
          href="https://docs.lovable.dev/features/payments#test-and-live-environments"
          target="_blank"
          rel="noopener noreferrer"
          className="link-underline"
        >
          Read more
        </a>
      </div>
    );
  }
  return null;
}
