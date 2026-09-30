import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { publicTourismService } from "@/services/tourismService";
import type { CaptchaData } from "@/types/tourism";
import "@/styles/public-tourism.css";

const INTEREST_OPTIONS = ["Pandal Hopping","Cultural Rituals","Photography","Food & Street Food","Heritage Tours","Shopping","Nightlife","Family Activities"];
const PUJA_PREF_OPTIONS = ["Mahalaya","Shashthi","Saptami","Ashtami","Navami","Dashami","Bisarjan"];

export function PublicTourismEnquiryPage() {
  const location = useLocation();
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [enquiryCode, setEnquiryCode] = useState("");

  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", country: "India", city: "",
    numberOfTravellers: 1, startDate: "", endDate: "",
    durationPreference: "", preferredCircuits: [] as string[],
    interests: [] as string[], stayPreference: "", transportPreference: "",
    pujaPreferences: [] as string[], specialRequirements: "",
    consentGiven: false, preferredLanguage: "en",
    _hp: "",
  });

  useEffect(() => {
    publicTourismService.captcha.get().then(setCaptcha).catch(() => {});
    const plannerPref = (location.state as any)?.plannerPref;
    if (plannerPref) {
      setForm((prev) => ({
        ...prev,
        ...plannerPref,
      }));
    }
  }, [location.state]);

  const toggleArr = (field: "interests" | "pujaPreferences", value: string) => {
    setForm((prev) => {
      const arr = prev[field];
      return { ...prev, [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consentGiven) { setError("Please agree to the privacy policy to proceed."); return; }
    if (!captchaAnswer.trim()) { setError("Please answer the security question."); return; }
    setSubmitting(true); setError("");
    try {
      const result = await publicTourismService.enquiries.create({
        ...form,
        captchaToken: captcha?.token ?? "",
        captchaAnswer,
      });
      setEnquiryCode(result.enquiryCode);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Submission failed. Please check your details and try again.");
    } finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <div className="tourism-enquiry">
        <div className="tourism-enquiry__card">
          <div className="tourism-enquiry__success">
            <div className="tourism-enquiry__success-icon">✅</div>
            <h2>Enquiry Submitted!</h2>
            <p>Your enquiry reference is: <strong>{enquiryCode}</strong></p>
            <p>Our concierge team will contact you within 24-48 hours with a personalised plan.</p>
            <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center", flexWrap: "wrap" }}>
              <Link to={ROUTES.PUBLIC_TOURISM_CONCIERGE} className="btn btn--primary">Back to Concierge</Link>
              <Link to={ROUTES.PUBLIC_TRIP_PLANNER} className="btn btn--outline">Try Trip Planner</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tourism-enquiry">
      <Link to={ROUTES.PUBLIC_TOURISM_CONCIERGE} style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", fontSize: "0.9rem", fontWeight: "600", color: "var(--colour-brand)", textDecoration: "none", marginBottom: "var(--space-4)" }}>
        Back to Tourism Concierge
      </Link>
      <div className="tourism-enquiry__card">
        <h1 className="tourism-enquiry__title">Tourism Enquiry</h1>
        <p className="tourism-enquiry__subtitle">Tell us about your trip and our concierge team will create a personalised plan for you.</p>
        <form onSubmit={handleSubmit}>
          {/* Hidden honeypot */}
          <input type="text" name="_hp" value={form._hp} onChange={(e) => setForm((p) => ({ ...p, _hp: e.target.value }))} style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

          <div className="tourism-enquiry__grid">
            <div className="tourism-enquiry__field">
              <label>Full Name <span>*</span></label>
              <input type="text" required value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="Your full name" />
            </div>
            <div className="tourism-enquiry__field">
              <label>Email <span>*</span></label>
              <input type="email" required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="you@email.com" />
            </div>
            <div className="tourism-enquiry__field">
              <label>Phone <span>*</span></label>
              <input type="tel" required value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
            <div className="tourism-enquiry__field">
              <label>Country <span>*</span></label>
              <input type="text" required value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} placeholder="India" />
            </div>
            <div className="tourism-enquiry__field">
              <label>City / State</label>
              <input type="text" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} placeholder="Mumbai" />
            </div>
            <div className="tourism-enquiry__field">
              <label>Number of Travellers <span>*</span></label>
              <input type="number" required min={1} max={100} value={form.numberOfTravellers} onChange={(e) => setForm((p) => ({ ...p, numberOfTravellers: parseInt(e.target.value) || 1 }))} />
            </div>
            <div className="tourism-enquiry__field">
              <label>Preferred Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
            </div>
            <div className="tourism-enquiry__field">
              <label>Preferred End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
            </div>
            <div className="tourism-enquiry__field">
              <label>Stay Preference</label>
              <select value={form.stayPreference} onChange={(e) => setForm((p) => ({ ...p, stayPreference: e.target.value }))}>
                <option value="">Select preference</option>
                <option>Budget</option>
                <option>Mid-Range</option>
                <option>Premium</option>
                <option>WBTDC / Government</option>
              </select>
            </div>
            <div className="tourism-enquiry__field">
              <label>Transport Preference</label>
              <select value={form.transportPreference} onChange={(e) => setForm((p) => ({ ...p, transportPreference: e.target.value }))}>
                <option value="">Select preference</option>
                <option>Public Transport</option>
                <option>Private Car</option>
                <option>Auto / Taxi</option>
                <option>Mix of All</option>
              </select>
            </div>
            <div className="tourism-enquiry__field">
              <label>Preferred Language</label>
              <select value={form.preferredLanguage} onChange={(e) => setForm((p) => ({ ...p, preferredLanguage: e.target.value }))}>
                <option value="en">English</option>
                <option value="bn">Bengali</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            <div className="tourism-enquiry__field tourism-enquiry__field--full">
              <label>Interests (select all that apply)</label>
              <div className="tourism-enquiry__checkbox-group">
                {INTEREST_OPTIONS.map((opt) => (
                  <label key={opt} className="tourism-enquiry__checkbox-label">
                    <input type="checkbox" checked={form.interests.includes(opt)} onChange={() => toggleArr("interests", opt)} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div className="tourism-enquiry__field tourism-enquiry__field--full">
              <label>Which Puja days are you interested in?</label>
              <div className="tourism-enquiry__checkbox-group">
                {PUJA_PREF_OPTIONS.map((opt) => (
                  <label key={opt} className="tourism-enquiry__checkbox-label">
                    <input type="checkbox" checked={form.pujaPreferences.includes(opt)} onChange={() => toggleArr("pujaPreferences", opt)} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div className="tourism-enquiry__field tourism-enquiry__field--full">
              <label>Special Requirements or Questions</label>
              <textarea rows={3} value={form.specialRequirements} onChange={(e) => setForm((p) => ({ ...p, specialRequirements: e.target.value }))} placeholder="Wheelchair access, dietary needs, specific pandals you want to visit..." />
            </div>
          </div>

          {captcha && (
            <div className="tourism-enquiry__captcha">
              <span className="tourism-enquiry__captcha-question">Security check: {captcha.question}</span>
              <input type="text" className="tourism-enquiry__field tourism-enquiry__captcha-input" value={captchaAnswer} onChange={(e) => setCaptchaAnswer(e.target.value)} placeholder="Answer" required style={{ padding: "8px 12px", border: "1px solid var(--colour-border)", borderRadius: "var(--radius-md)", fontSize: "0.9rem", width: "120px" }} />
            </div>
          )}

          <div className="tourism-enquiry__consent">
            <input type="checkbox" id="consent" checked={form.consentGiven} onChange={(e) => setForm((p) => ({ ...p, consentGiven: e.target.checked }))} required />
            <label htmlFor="consent">I agree to the privacy policy and consent to being contacted by the Durga Puja Global Concierge team regarding my enquiry. <span style={{ color: "var(--colour-danger)" }}>*</span></label>
          </div>

          {error && <p style={{ color: "var(--colour-danger)", fontSize: "0.9rem", marginBottom: "var(--space-4)" }}>{error}</p>}

          <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
            <Link to={ROUTES.PUBLIC_TOURISM_CONCIERGE} className="btn btn--outline">Cancel</Link>
            <button type="submit" className="btn btn--primary" disabled={submitting}>{submitting ? "Submitting..." : "Submit Enquiry"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
