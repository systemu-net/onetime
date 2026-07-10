import LegalLayout, { LegalSection } from "../components/LegalLayout";

// DRAFT — reflects LevelCode's actual practices, but NOT legal advice. Have counsel review and
// fill in the operating entity + governing-law jurisdiction (marked below) before relying on it.
export default function TermsPage() {
  return (
    <LegalLayout
      eyebrow="09 · legal"
      title="Terms of Service"
      updated="July 9, 2026"
      intro={
        <>
          These Terms govern your use of LevelCode — the LevelCode editor and the LevelCode Cloud service
          at levelcode.ai (together, the “Service”). By creating an account or using the Service, you agree
          to these Terms and to our{" "}
          <a href="/privacy" className="underline decoration-rule underline-offset-4 hover:text-ink">
            Privacy Policy
          </a>
          .
        </>
      }
    >
      <LegalSection heading="1. The Service">
        <p>
          LevelCode is an AI-native code editor and a metered AI gateway. On a paid plan or the free tier,
          the editor sends your prompts and selected code to our gateway, which routes them to third-party
          AI model providers to generate responses. You may also use your own provider API key
          (“bring-your-own-key” / BYOK); in that mode requests go directly to your provider and do not run
          through our gateway or metering.
        </p>
      </LegalSection>

      <LegalSection heading="2. Eligibility & accounts">
        <p>
          You must be at least 13 years old (and, if under the age of majority where you live, have your
          parent or guardian’s consent) to use the Service. You are responsible for your account and for
          keeping your credentials and API keys secure. Notify us promptly of any unauthorized use.
        </p>
      </LegalSection>

      <LegalSection heading="3. Plans, billing & usage limits">
        <p>
          Paid plans are subscriptions billed in advance through our payment processor (Stripe) and renew
          automatically each period until canceled. You can cancel anytime; cancellation takes effect at the
          end of the current billing period, and, except where required by law, payments are non-refundable.
        </p>
        <p>
          Each plan includes a monthly usage allowance, expressed as approximate model “turns.” To keep the
          Service reliable, that allowance is metered and may be made available progressively over the
          billing cycle rather than all at once (rolling usage windows) — heavy use may be paced or, on some
          plans, temporarily served by a lighter model until more of your allowance becomes available or the
          period renews. We show your current usage and when more becomes available in your account. We may
          change plans, prices, allowances, or limits prospectively, with notice for existing subscribers.
        </p>
      </LegalSection>

      <LegalSection heading="4. Your content and code">
        <p>
          You retain all rights to the code, prompts, and other content you submit (“Your Content”). You grant
          us a limited license to process, transmit, and store Your Content solely to operate and improve the
          Service — including sending it to the AI model providers needed to generate responses. We do not
          claim ownership of Your Content or of the outputs generated for you.
        </p>
        <p>
          You are responsible for having the rights to submit Your Content and for ensuring your use complies
          with any licenses that apply to code you work on.
        </p>
      </LegalSection>

      <LegalSection heading="5. AI output — no warranty">
        <p>
          AI-generated code and text may be inaccurate, insecure, or unsuitable for your purpose, and similar
          outputs may be generated for other users. You are responsible for reviewing, testing, and deciding
          whether to use any output. The Service is not a substitute for professional judgment, and outputs
          are not legal, financial, security, or other professional advice.
        </p>
      </LegalSection>

      <LegalSection heading="6. Acceptable use">
        <p>You agree not to use the Service to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>break the law or infringe others’ rights;</li>
          <li>generate malware, or content intended to harm, harass, defraud, or deceive;</li>
          <li>abuse, overload, reverse-engineer, or circumvent the gateway, metering, or usage limits;</li>
          <li>resell or provide the Service to third parties except as expressly permitted; or</li>
          <li>violate the terms of the underlying AI providers or other third-party services.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="7. Third-party services">
        <p>
          The Service relies on third parties — including the AI model providers and routing partner behind
          our gateway, our payment processor, and our hosting provider. Your use of the Service through these
          providers is also subject to their terms, and we are not responsible for their acts or omissions.
        </p>
      </LegalSection>

      <LegalSection heading="8. Intellectual property & open source">
        <p>
          The LevelCode name, site, and service are owned by us or our licensors. The editor is built on
          open-source software, which remains governed by its own licenses; nothing here restricts your
          rights under those licenses. Except for those open-source components and Your Content, you may not
          copy, modify, or create derivative works of the Service without permission.
        </p>
      </LegalSection>

      <LegalSection heading="9. Disclaimers & limitation of liability">
        <p>
          The Service is provided “as is” and “as available,” without warranties of any kind to the fullest
          extent permitted by law. To the extent permitted by law, we are not liable for indirect,
          incidental, or consequential damages, and our total liability for any claim relating to the Service
          will not exceed the amount you paid us for the Service in the twelve months before the claim.
        </p>
      </LegalSection>

      <LegalSection heading="10. Termination">
        <p>
          You may stop using the Service at any time. We may suspend or terminate access if you violate these
          Terms or to protect the Service or other users. Sections that by their nature should survive
          termination (for example, ownership, disclaimers, and limitations of liability) will survive.
        </p>
      </LegalSection>

      <LegalSection heading="11. Changes to these Terms">
        <p>
          We may update these Terms from time to time. If we make material changes we will update the date
          above and, where appropriate, notify you. Your continued use of the Service after changes take
          effect means you accept the updated Terms.
        </p>
      </LegalSection>

      <LegalSection heading="12. Governing law">
        <p>
          These Terms are governed by the laws of [governing-law jurisdiction], without regard to conflict-of-laws
          rules, and any disputes will be resolved in the courts located there. {/* TODO: counsel to set entity + jurisdiction */}
        </p>
      </LegalSection>

      <LegalSection heading="13. Contact">
        <p>
          Questions about these Terms? Email{" "}
          <a href="mailto:legal@levelcode.ai" className="underline decoration-rule underline-offset-4 hover:text-ink">
            legal@levelcode.ai
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
