/** Shared dimensions. Everything else references these so joins stay consistent. */

export const SALESPEOPLE = [
  { user: "hasan.ni@boxtech.ai", name: "Hasan Nisar", territory: "UAE" },
  { user: "ancela.sa@boxtech.ai", name: "Ancela Sanchez", territory: "Saudi Arabia" },
  { user: "frohar.ha@boxtech.ai", name: "Frohar Hameed", territory: "UAE" },
  { user: "moiz.ah@boxtech.ai", name: "Moiz Ahmed", territory: "Qatar" },
  { user: "aneez.ch@boxtech.ai", name: "Aneez Chaudhry", territory: "Oman" },
];

export const TERRITORIES = ["UAE", "Saudi Arabia", "Qatar", "Kuwait", "Oman"];

/** Categories come from Leads.category in the schema. */
export const CATEGORIES = [
  "GPS Devices",
  "Video Telematics",
  "Sensors",
  "Platform/ Software",
  "IoT Solutions",
];

export const MANUFACTURERS = [
  "Teltonika",
  "Queclink",
  "Ruptela",
  "Howen",
  "Streamax",
  "Concox",
];

/** UTM sources for the standard Lead funnel. */
export const LEAD_SOURCES = [
  "Website",
  "Exhibition",
  "Referral",
  "Cold Outreach",
  "LinkedIn",
  "Existing Customer",
];

export const COMPANIES = [
  "AlphaTrack", "Arabian Telematics Co. (ATC)", "Tracking Plus", "Arabian Merge",
  "Future Mobility LLC", "Gulf Fleet Systems", "Desert Logistics", "Nexa Telematics",
  "Emirates Trackers", "Al Noor Transport", "Red Sea Logistics", "Sandstorm Fleet",
  "Oasis Connect", "Falcon Tracking", "Dune Systems", "Marina Fleet Services",
  "Sahara Telematics", "Pearl Logistics", "Zenith Transport", "Vertex Fleet",
  "Corniche Motors", "Palm Logistics", "Skyline Telematics", "Horizon Fleet",
  "Aster Mobility", "Bluewave Tracking", "Cedar Transport", "Delta Fleet Co.",
  "Everest Logistics", "Frontier Telematics", "Gateway Fleet", "Harbour Systems",
  "Iris Mobility", "Jade Transport", "Kite Logistics", "Lumen Fleet",
  "Meridian Tracking", "Nova Transport", "Orbit Telematics", "Prime Fleet Group",
];

export const CONTACT_ROLES = [
  "CEO / Owner / Managing Director",
  "CTO / Technical Head / Engineering Head",
  "Sales Director / BD Head",
  "Operations Manager / Deployment Head",
  "Finance Head",
  "Procurement / Purchasing",
  "Key Contact",
  "Technician / Installer",
];

export const byUser = Object.fromEntries(SALESPEOPLE.map((s) => [s.user, s]));
