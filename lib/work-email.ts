const PERSONAL_DOMAINS = [
	"gmail.com",
	"yahoo.com",
	"hotmail.com",
	"outlook.com",
	"live.com",
	"msn.com",
	"icloud.com",
	"me.com",
	"aol.com",
	"mail.com",
	"protonmail.com",
	"zoho.com",
	"yandex.com",
];

/** True when the address belongs to a company domain (not a free provider). */
export function isWorkEmail(email: string): boolean {
	const domain = email.split("@")[1]?.toLowerCase();
	return !!domain && !PERSONAL_DOMAINS.includes(domain);
}
