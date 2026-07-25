import LegalLayout, { LegalSection } from "../components/LegalLayout";

// DRAFT — reflects LevelCode's actual practices, but NOT legal advice. Have counsel review and
// confirm sub-processors, retention periods, and regional-rights disclosures before relying on it.
export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="July 9, 2026"
      intro={
        <>
          This policy explains what LevelCode collects, how we use it, and who we share it with when you use
          the LevelCode editor and LevelCode Cloud (levelcode.ai). The most important thing to know: to
          generate AI responses, we send your prompts and selected code to third-party model providers.
        </>
      }
    >
      <LegalSection id="collect" heading="1. What we collect">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-[var(--c-text)]">Account</strong> — your email and basic profile, and the
            authentication tokens the editor uses to talk to the service.
          </li>
          <li>
            <strong className="text-[var(--c-text)]">Prompts &amp; code</strong> — the prompts and code you submit to the
            AI gateway, so we can generate responses and meter usage.
          </li>
          <li>
            <strong className="text-[var(--c-text)]">Usage &amp; billing</strong> — model used, token counts, timestamps,
            plan, and spend, used to meter your allowance and support billing. Payments are handled by Stripe;
            we do not receive or store your full card number.
          </li>
          <li>
            <strong className="text-[var(--c-text)]">Technical</strong> — IP address, device/browser info, and server
            logs, used for security and to operate the Service.
          </li>
        </ul>
        <p>
          Product telemetry in the editor is off by default. If you use bring-your-own-key (BYOK), those
          requests go directly to your provider and your prompts and code do not pass through our gateway.
        </p>
      </LegalSection>

      <LegalSection id="use" heading="2. How we use it">
        <p>
          To provide, secure, and improve the Service — including generating AI responses, metering your
          usage against your plan, processing subscriptions, providing support, preventing abuse, and meeting
          legal obligations. We do not sell your personal information, and we do not use the content of your
          prompts or code to advertise to you.
        </p>
      </LegalSection>

      <LegalSection id="share" heading="3. Who we share it with">
        <p>We share information only with service providers that help us run LevelCode:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-[var(--c-text)]">AI model providers &amp; routing</strong> — your prompts and selected
            code are sent to the AI provider(s) that generate your response, via our routing partner. They
            process this content to return a result and under their own terms and privacy policies.
          </li>
          <li>
            <strong className="text-[var(--c-text)]">Payments</strong> — Stripe, to process subscriptions and payments.
          </li>
          <li>
            <strong className="text-[var(--c-text)]">Hosting &amp; infrastructure</strong> — our cloud hosting provider,
            which stores and serves the Service on our behalf.
          </li>
        </ul>
        <p>
          We may also disclose information if required by law, to enforce our terms, or to protect the rights,
          safety, and security of LevelCode and its users. If we’re involved in a merger or acquisition, your
          information may transfer as part of that transaction.
        </p>
      </LegalSection>

      <LegalSection id="retention" heading="4. Retention">
        <p>
          We keep account and billing records for as long as your account is active and as needed to meet
          legal, tax, and security obligations. Prompts, code, and usage records are retained only as long as
          needed to operate the Service and support your account, after which they are deleted or anonymized.
          {" "}
          {/* TODO: counsel/ops to confirm concrete retention windows */}
        </p>
      </LegalSection>

      <LegalSection id="cookies" heading="5. Cookies">
        <p>
          We use strictly necessary cookies to keep you signed in and to operate the site. We do not use
          third-party advertising cookies. Your browser settings let you control cookies, though the Service
          may not work properly without the essential ones.
        </p>
      </LegalSection>

      <LegalSection id="security" heading="6. Security">
        <p>
          We use technical and organizational measures — including encryption in transit and access controls —
          to protect your information. No method of transmission or storage is perfectly secure, so we cannot
          guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection id="rights" heading="7. Your rights">
        <p>
          Depending on where you live (for example, under GDPR or the CCPA), you may have the right to access,
          correct, delete, or export your personal information, and to object to or restrict certain
          processing. To make a request, email us at the address below; we will respond as required by
          applicable law.
        </p>
      </LegalSection>

      <LegalSection id="children" heading="8. Children">
        <p>
          The Service is not directed to children under 13, and we do not knowingly collect their personal
          information. If you believe a child has provided us information, contact us and we will delete it.
        </p>
      </LegalSection>

      <LegalSection id="international" heading="9. International transfers">
        <p>
          We and our providers may process your information in countries other than yours. Where required, we
          rely on appropriate safeguards for such transfers.
        </p>
      </LegalSection>

      <LegalSection id="changes" heading="10. Changes">
        <p>
          We may update this policy from time to time. Material changes will be reflected in the date above
          and, where appropriate, communicated to you.
        </p>
      </LegalSection>

      <LegalSection id="contact" heading="11. Contact">
        <p>
          Privacy questions or requests? Email{" "}
          <a href="mailto:privacy@levelcode.ai" className="text-[var(--c-accent)] hover:underline">
            privacy@levelcode.ai
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
