from datetime import date, timedelta

# England and Wales bank holidays, source: https://www.gov.uk/bank-holidays.json
BANK_HOLIDAYS = {
    date(2025, 1, 1),
    date(2025, 4, 18),
    date(2025, 4, 21),
    date(2025, 5, 5),
    date(2025, 5, 26),
    date(2025, 8, 25),
    date(2025, 12, 25),
    date(2025, 12, 26),
    date(2026, 1, 1),
    date(2026, 4, 3),
    date(2026, 4, 6),
    date(2026, 5, 4),
    date(2026, 5, 25),
    date(2026, 8, 31),
    date(2026, 12, 25),
    date(2026, 12, 28),
    date(2027, 1, 1),
    date(2027, 3, 26),
    date(2027, 3, 29),
    date(2027, 5, 3),
    date(2027, 5, 31),
    date(2027, 8, 30),
    date(2027, 12, 27),
    date(2027, 12, 28),
}

# Scotland and Northern Ireland holidays are not excluded, so a deadline can only come out earlier
# than the legal one, never later.
LAST_COVERED_DATE = date(2027, 12, 31)

FOI_RESPONSE_WORKING_DAYS = 20


def is_working_day(day: date) -> bool:
    return day.weekday() < 5 and day not in BANK_HOLIDAYS


def next_working_day(day: date) -> date:
    while not is_working_day(day):
        day += timedelta(days=1)

    return day


def calculate_deadline(received_date: date | None) -> date | None:
    """The 20th working day after receipt, or None if the date is unknown or beyond the holiday list."""
    if received_date is None or received_date > LAST_COVERED_DATE:
        return None

    due_date = next_working_day(received_date)

    for _ in range(FOI_RESPONSE_WORKING_DAYS):
        due_date = next_working_day(due_date + timedelta(days=1))

    return due_date if due_date <= LAST_COVERED_DATE else None
