import datetime

def parse_date(date):
    if date is None:
        return None
    else:
        return datetime.strptime(date, '%Y-%m-%d').date()