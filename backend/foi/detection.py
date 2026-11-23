from dataclasses import dataclass, field


@dataclass
class Check:
    points: int
    label: str
    phrases: list[str]


POSITIVE_CHECKS = [
    Check(4, 'Mentions FOI or the Act', ['foi', 'freedom of information', 'under the act', 'request for information']),
    Check(
        2,
        'Asks for recorded information',
        ['copies of', 'documents', 'emails', 'records', 'report', 'minutes', 'spreadsheet', 'data', 'contract'],
    ),
    Check(
        2,
        'Asks for figures or statistics',
        ['how many', 'how much', 'number of', 'total', 'cost of', 'spent', 'per year'],
    ),
    Check(2, 'Mentions the 20-day deadline', ['20 working days', 'within the statutory time']),
    Check(1, 'Covers a time period', ['between', 'since 20', 'in the last', 'each year', 'for each year']),
    Check(
        1,
        'Asks about how the council works',
        ['spending', 'decision', 'procurement', 'policy', 'performance', 'staff numbers', 'consultants'],
    ),
    Check(
        1,
        'Uses formal request wording',
        ['please provide', 'please send', 'i would like to request', 'can you tell me'],
    ),
    Check(1, 'Sender is press or a researcher', ['journalist', 'for an article', 'researcher', 'campaign']),
]

EXPLICIT_FOI_MENTION = POSITIVE_CHECKS[0]

ASKS_FOR_OWN_DATA = Check(
    -2, "Asks for the sender's own data", ['my records', 'my file', 'data you hold about me', 'subject access']
)
SUPPLIER_OR_ADMIN_MAIL = Check(-3, 'Supplier or admin mail', ['invoice attached', 'purchase order', 'remittance'])

NEGATIVE_CHECKS = [
    Check(
        -2,
        'Routine service question',
        ['when is my bin', 'opening times', 'status of my application', 'report a missed bin'],
    ),
    ASKS_FOR_OWN_DATA,
    SUPPLIER_OR_ADMIN_MAIL,
    Check(-1, 'Asks for opinion or new work', ['why did you', 'do you think', 'please investigate']),
]

HIGH_THRESHOLD = 5
MEDIUM_THRESHOLD = 3
UNCLEAR_THRESHOLD = 1


@dataclass
class DetectionResult:
    score: int
    confidence: str
    reasons: list[str] = field(default_factory=list)
    suggest_sar: bool = False


def _matched_checks(text: str, checks: list[Check]) -> list[Check]:
    return [check for check in checks if any(phrase in text for phrase in check.phrases)]


def score_item(subject: str, message: str) -> DetectionResult:
    text = f'{subject} {message}'.lower()

    positive_matches = _matched_checks(text, POSITIVE_CHECKS)
    negative_matches = _matched_checks(text, NEGATIVE_CHECKS)
    score = sum(check.points for check in positive_matches) + sum(check.points for check in negative_matches)

    explicit_mention = EXPLICIT_FOI_MENTION in positive_matches
    supplier_mail = SUPPLIER_OR_ADMIN_MAIL in negative_matches

    if supplier_mail and not explicit_mention:
        confidence = 'not_flagged'
    elif score >= HIGH_THRESHOLD:
        confidence = 'high'
    elif score >= MEDIUM_THRESHOLD or explicit_mention:
        confidence = 'medium'
    elif score >= UNCLEAR_THRESHOLD:
        confidence = 'unclear'
    else:
        confidence = 'not_flagged'

    reasons = [check.label for check in positive_matches + negative_matches] if confidence != 'not_flagged' else []

    return DetectionResult(
        score=score,
        confidence=confidence,
        reasons=reasons,
        suggest_sar=ASKS_FOR_OWN_DATA in negative_matches,
    )
